use async_recursion::async_recursion;
use serde::{Deserialize,Serialize};

use tokio::fs;

use std::path::Path;
use std::path::PathBuf;

static HOST: &str = "0.0.0.0"; 
static PORT: &str = "8080"; 
static ROOT: &str = "../backend"; 
const EDITOR_STATE_FILE: &str = "editor-state.json";
use super::clean_path;
///////////////////////////////////
//Editor Config code begins here //
///////////////////////////////////
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub(crate) enum SoftWrap {
    Off,
    View,
    Margin,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub(crate) enum Overscroll {
    None,
    Half,
    Full,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub(crate) enum UndoDeltas {
    Always,
    Never,
    Timed,
}

#[derive(Deserialize, Serialize,Default, Debug)]
pub(crate) struct ServerConfig {
    pub(crate) host: Option<String>,
    pub(crate) port: Option<String>,
    pub(crate) base_path: Option<String>,
}

impl ServerConfig {
    pub(crate) fn get_addr(&self) -> String {
        self.host.as_deref().unwrap_or(HOST).to_string()
            + ":"
            + self.port.as_deref().unwrap_or(PORT)
    }
}
fn default_editor_state() -> Option<String> {
    Some(EDITOR_STATE_FILE.to_string())
}
#[derive(Deserialize, Serialize,Default, Debug)]
pub(crate) struct StorageConfig {
    pub(crate) project_folder: Option<String>,
    #[serde(default = "default_editor_state")]
    pub(crate) editor_state: Option<String>,
}

#[derive(Deserialize, Serialize, Default, Debug)]
pub(crate) struct EditorConfig {
    pub(crate) theme: Option<String>,
    pub(crate) mode: Option<String>,
    pub(crate) key_binding: Option<String>,
    pub(crate) font_size: Option<u8>,
    pub(crate) soft_wrap: Option<SoftWrap>,
    pub(crate) cursor: Option<String>,
    pub(crate) folding: Option<bool>,
    pub(crate) soft_tabs: Option<i32>,
    pub(crate) overscroll: Option<Overscroll>,
    pub(crate) atomic_soft_tabs: Option<bool>,
    pub(crate) enable_behaviours: Option<bool>,
    pub(crate) wrap_with_quotes: Option<bool>,
    pub(crate) auto_indent: Option<bool>,
    pub(crate) full_line_selection: Option<bool>,
    pub(crate) highlight_active_line: Option<bool>,
    pub(crate) show_invisibles: Option<bool>,
    pub(crate) show_indent_guides: Option<bool>,
    pub(crate) hightlight_indent_guides: Option<bool>,
    pub(crate) persistent_scrollbar: Option<bool>,
    pub(crate) animate_scrolling: Option<bool>,
    pub(crate) show_gutter: Option<bool>,
    pub(crate) show_line_numbers: Option<bool>,
    pub(crate) relative_line_numbers: Option<bool>,
    pub(crate) fixed_gutter_width: Option<bool>,
    pub(crate) print_margin: Option<i32>,
    pub(crate) indented_soft_wrap: Option<bool>,
    pub(crate) highlight_selected_word: Option<bool>,
    pub(crate) fade_fold_widgets: Option<bool>,
    pub(crate) use_textarea_for_ime: Option<bool>,
    pub(crate) merge_undo_deltas: Option<UndoDeltas>,
    pub(crate) read_only: Option<bool>,
    pub(crate) copy_without_selection: Option<bool>,
    pub(crate) live_autocomplete: Option<bool>,
    pub(crate) custom_scrollbar: Option<bool>,
    pub(crate) use_svg_gutterlines: Option<bool>,
    pub(crate) annotate_folded_lines: Option<bool>,
    pub(crate) keyboard_accessibility: Option<bool>,
    pub(crate) gutter_tooltip_follows_mouse: Option<bool>,
}

#[derive(Deserialize, Serialize,Default, Debug)]
pub(crate) struct Config {
    pub(crate) server: ServerConfig,
    pub(crate) editor: EditorConfig,
    pub(crate) storage: StorageConfig,
}

////////////////////////////////////
//FileSystem API code begins here //
////////////////////////////////////
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum Kind {
    File,
    Directory,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct FileHandle {
    pub(crate) name: String,
    pub(crate) kind: Kind,
    pub(crate) path: Option<String>,
    pub(crate) children: Option<Vec<FileHandle>>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct FileRequest {
    pub(crate) path: String,
    pub(crate) content: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct FileTreeRequest {
    pub(crate) path: Option<String>,
}

pub(crate) struct FileSystem {
    pub(crate) root: String,
}

//This struct will try to map the FileSystemAPI found in OPFS web, so that the same file tree can be used for this too.
impl FileSystem {
    pub(crate) fn new(root: &str) -> Self {
        Self {
            root: root.to_string(),
        }
    }
    pub(crate) async fn get_root(&self) -> String {
        return self.root.clone();
    }
    pub(crate) async fn read_file(&self, path: &str) -> String {
        let new_path: PathBuf;
        if !path.starts_with(&self.root) {
            new_path = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        } else {
            new_path = Path::new(path).to_path_buf();
        }
        match fs::read_to_string(&new_path).await {
            Ok(content) => content,
            Err(e) => format!("Error Reading File: {}", e),
        }
    }
    pub(crate) async fn write_file(&self, path: &str, content: &str) -> String {
        let new_path = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        match fs::write(&new_path, content).await {
            Ok(_) => "Success".to_string(),
            Err(e) => format!("Error Writing to File: {}", e),
        }
    }
    #[async_recursion]
    pub(crate) async fn make_filehandle_tree(&self, path: &PathBuf) -> FileHandle {
        let new_path: PathBuf = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        let handle_name: String = new_path
            .clone()
            .file_name()
            .unwrap()
            .to_os_string()
            .into_string()
            .ok()
            .unwrap();
        let handle_kind: Kind;
        //    println!("Making file handle for path: {:?}", new_path);
        if new_path.clone().metadata().ok().unwrap().is_dir() {
            handle_kind = Kind::Directory;
            let mut entries: fs::ReadDir = fs::read_dir(new_path.clone()).await.unwrap();
            let mut handle_children: Vec<FileHandle> = Vec::new();
            while let Some(entry) = entries.next_entry().await.unwrap() {
                let sub_filepath: PathBuf =
                    entry.path().strip_prefix(&self.root).unwrap().to_path_buf();
                let children: FileHandle = self.make_filehandle_tree(&sub_filepath).await;
                handle_children.push(children);
            }
            return FileHandle {
                name: handle_name,
                kind: handle_kind,
                path: Some(clean_path(&new_path)),
                children: Some(handle_children),
            };
        } else {
            handle_kind = Kind::File;
        }
        let filehandle: FileHandle = FileHandle {
            name: handle_name,
            kind: handle_kind,
            path: Some(clean_path(&new_path)),
            children: None,
        };
        return filehandle;
    }
}
