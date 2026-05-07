
use async_recursion::async_recursion;
use axum::{
    extract::{Json, State},
    response,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::fs;
use tower_http::services::ServeDir;

////////////////////////////////////////
static HOST: &str = "0.0.0.0";       // 
static PORT: &str = "8080";         //
static ROOT: &str = "../backend";  //
////////////////////////////////////


  ///////////////////////////////////
 //Editor Config code begins here //
///////////////////////////////////
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
enum SoftWrap {
    Off,
    View,
    Margin,    
}
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
enum Overscroll {
    None,
    Half,
    Full,
}
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
enum UndoDeltas {
    Always,
    Never,
    Timed,
}

#[derive(Deserialize, Serialize, Debug)]
struct ServerConfig {
    host: Option<String>,
    port: Option<String>,
    base_path: Option<String>,
}
impl ServerConfig {
    fn get_addr(&self) -> String {
        self.host.as_deref().unwrap_or(HOST).to_string() + ":" + self.port.as_deref().unwrap_or(PORT)
    }
}

#[derive(Deserialize, Serialize, Debug)]
struct StorageConfig {
    project_folder: Option<String>,

}

#[derive(Deserialize, Serialize, Debug)]
struct EditorConfig {
    theme: Option<String>,
    mode: Option<String>,
    key_binding: Option<String>,
    font_size: Option<u8>,
    soft_wrap: Option<SoftWrap>,
    cursor: Option<String>,
    folding: Option<bool>,
    soft_tabs: Option<i32>,
    overscroll: Option<Overscroll>,
    atomic_soft_tabs: Option<bool>,
    enable_behaviours: Option<bool>,
    wrap_with_quotes: Option<bool>,
    auto_indent: Option<bool>,
    full_line_selection: Option<bool>,
    highlight_active_line: Option<bool>,
    show_invisibles: Option<bool>,
    show_indent_guides: Option<bool>,
    hightlight_indent_guides: Option<bool>,
    persistent_scrollbar: Option<bool>,
    animate_scrolling: Option<bool>,
    show_gutter: Option<bool>,
    show_line_numbers: Option<bool>,
    relative_line_numbers: Option<bool>,
    fixed_gutter_width: Option<bool>,
    print_margin: Option<i32>,
    indented_soft_wrap: Option<bool>,
    highlight_selected_word: Option<bool>,
    fade_fold_widgets: Option<bool>,
    use_textarea_for_ime: Option<bool>,
    merge_undo_deltas: Option<UndoDeltas>,
    read_only: Option<bool>,
    copy_without_selection: Option<bool>,
    live_autocomplete: Option<bool>,
    custom_scrollbar: Option<bool>,
    use_svg_gutterlines: Option<bool>,
    annotate_folded_lines: Option<bool>,
    keyboard_accessibility: Option<bool>,
    gutter_tooltip_follows_mouse: Option<bool>,

}
#[derive(Deserialize, Serialize, Debug)]
struct Config {
    server: ServerConfig,
    editor: EditorConfig,
    storage: StorageConfig,
}

  ////////////////////////////////////
 //FileSystem API code begins here //
////////////////////////////////////
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum Kind {
    File,
    Directory,
}

#[derive(Deserialize, Serialize)]
struct FileHandle {
    name: String,
    kind: Kind,
    path: Option<String>,
    children: Option<Vec<FileHandle>>,
}
#[derive(Deserialize, Serialize)]
struct FileRequest {
    path: String,
    content: Option<String>,
}
#[derive(Deserialize, Serialize)]
struct FileTreeRequest {
    path: Option<String>,
}
struct FileSystem {
    root: String,
} //This struct will try to map the FileSystemAPI found in OPFS web, so that the same file tree can be used for this too.
impl FileSystem {
    fn new(root: &str) -> Self {
        Self {
            root: root.to_string(),
        }
    }
    async fn get_root(&self) -> String {
        return self.root.clone();
    }
    async fn read_file(&self, path: &str) -> String {
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
    async fn write_file(&self, path: &str, content: &str) -> String {
        let new_path = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        match fs::write(&new_path, content).await {
            Ok(_) => "Success".to_string(),
            Err(e) => format!("Error Writing to File: {}", e),
        }
    }
    #[async_recursion]
    async fn make_filehandle_tree(&self, path: &PathBuf) -> FileHandle {
        let new_path: PathBuf =
            Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
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

async fn write_handler(State(app_state): State<Arc<AppState>>, Json(req): Json<FileRequest>) -> String {
    if let Some(content) = req.content {
        app_state.filesystem.write_file(&req.path, &content).await
    } else {
        "Error: content is required for write operation".to_string()
    }
}

fn clean_path(path: &PathBuf) -> String {
    path.components()
    .map(|c| c.as_os_str().to_string_lossy().to_string())
    .collect::<Vec<_>>()
    .join("/") //bascially converted the path from pathbuf to a string.

}
async fn get_file_tree(
    State(app_state): State<Arc<AppState>>,
    Json(req): Json<FileTreeRequest>,
) -> Result<response::Json<FileHandle>, String> {
    if let Some(path) = req.path {
        let root_path: PathBuf = Path::new(&path).to_path_buf();
        let file_handle: FileHandle = app_state.filesystem.make_filehandle_tree(&root_path).await; 
        let file_handle_json = response::Json(file_handle);
        Ok(file_handle_json)
    } else {
        Err("Error: path is required for get_file_tree operation".to_string())
    }
}
  /////////////////////////
 // Struct for AppState //
/////////////////////////
struct AppState {
    filesystem: Arc<FileSystem>,
    config: Arc<Config>,
}
  ////////////////////////////////////////////
 // The backend WebServer code begins here //
////////////////////////////////////////////
async fn server() {
    let app_state = Arc::new(AppState { 
        filesystem: Arc::new(FileSystem::new(read_config().storage.project_folder.as_deref().unwrap_or(ROOT))),
        config: Arc::new(read_config()),
    });
    let file_system: Router<Arc<AppState>> = Router::<Arc<AppState>>::new()
        .route(
            "/read",
            post(
                |State(app_state): State<Arc<AppState>>, Json(req): Json<FileRequest>| async move {
                    app_state.filesystem.read_file(&req.path).await
                },
            ),
        )
        .route("/write", post(write_handler))
        .route(
            "/get_root",
            post(|State(app_state): State<Arc<AppState>>| async move { app_state.filesystem.get_root().await }),
        )
        .route("/get_file_tree", post(get_file_tree));

    let app: Router = Router::<Arc<AppState>>::new()
        .route("/hello", get(|| async { "Hello World" }))
        .nest("/fs", file_system)
        .nest_service("/", ServeDir::new("../web/dist"))
        .with_state(app_state.clone());
    let lister = tokio::net::TcpListener::bind(app_state.clone().config.server.get_addr())
        .await
        .expect("Error: unable to bind to TCP socket");
    axum::serve(lister, app)
        .await
        .expect("Error: Unable to start the server");
}

  //////////////////////////////////////////////////////////////////////////
 // Settings.yaml and editor-state.json(for editor) parsing code begin here  //
//////////////////////////////////////////////////////////////////////////
fn read_config() -> Config {
    let config_str = std::fs::read_to_string("settings.yaml").expect("Error: Unable to load the file, using default settings");
    let parsed = serde_yaml::from_str(&config_str).expect("Error: Unable to parse the config file");
    return parsed;
}
#[allow(dead_code)] ////////////////////////////////////////// < IMPORTANT do this > /////////////////////////////////////////////////////////////////////////////
fn read_editor_config() -> EditorConfig {
    let config_str = std::fs::read_to_string("editor-state.json").expect("Info: No editor state found, making a new one");
    let parsed = serde_json::from_str(&config_str).expect("Error: Unable to parse the editor config file");
    return parsed;
}
  //////////////////////////////////////////////
 /// This is the entry point of the program ///
//////////////////////////////////////////////
#[tokio::main]
async fn main() {
    println!("Reading config from settings.yaml...");
    let config: Config = read_config();
    println!("Config loaded successfully: {:#?}\n", config);
    println!("Starting a new server at {}", config.server.get_addr());
    server().await;
}
