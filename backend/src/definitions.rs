use vfs::async_vfs::{AsyncPhysicalFS, AsyncVfsPath};
use vfs::error::VfsErrorKind;
use vfs::{VfsError, VfsResult};

use redb;
use redb::{Database, ReadableDatabase, TableDefinition, Value};

use rkyv;

use std::io::Error;
use std::io::ErrorKind;

use futures::AsyncWriteExt;
use futures::io::AsyncReadExt;
use futures::StreamExt;

use log::{error, info, warn};

use serde::{Deserialize, Serialize};

use serde_with::skip_serializing_none;

use async_recursion::async_recursion;

static HOST: &str = "0.0.0.0";
static PORT: &str = "8080";
static PROJECT_ROOT: &str = "files";
const APP_DB: &str = "app_db.redb";
const EDITOR_CONFIG_NAME: &str = "editor_config";

pub trait Db: Value + 'static + for<'a> Value<SelfType<'a> = Self> {
    fn name() -> String;
    fn table(&self) -> TableDefinition<'static, String, Self>
    where
        Self: Sized;
}

macro_rules! impl_db {
    ($type:ident) => {
        impl Value for $type {
            type SelfType<'a>
                = $type
            where
                Self: 'a;
            type AsBytes<'a>
                = Vec<u8>
            where
                Self: 'a;
            fn as_bytes<'a, 'b: 'a>(value: &'a Self::SelfType<'b>) -> Self::AsBytes<'a>
            where
                Self: 'b,
            {
                match rkyv::to_bytes::<rkyv::rancor::Error>(value) {
                    Ok(bytes) => bytes.into_vec(),
                    Err(e) => {
                        warn!("Error serializing {}: {}", stringify!($type), e);
                        Vec::new()
                    }
                }
            }
            fn from_bytes<'a>(data: &'a [u8]) -> Self::SelfType<'a>
            where
                Self: 'a,
            {
                let aligned_data = data.to_vec();
                match rkyv::from_bytes::<$type, rkyv::rancor::Error>(&aligned_data) {
                    Ok(editor_struct) => editor_struct,
                    Err(e) => {
                        warn!("Error deserializing {}: {}", stringify!($type), e);
                        $type::default()
                    }
                }
            }
            fn fixed_width() -> Option<usize> {
                None
            }
            fn type_name() -> redb::TypeName {
                return redb::TypeName::new(stringify!($type));
            }
        }
        impl Db for $type {
            fn name() -> String {
                Self::NAME.to_string()
            }
            fn table(&self) -> TableDefinition<'static, String, Self> {
                TableDefinition::new(stringify!($type))
            }
        }
    };
}

///////////////////////////////////
//Editor Config code begins here //
///////////////////////////////////
#[derive(
    Deserialize, Serialize, Clone, Debug, rkyv::Archive, rkyv::Serialize, rkyv::Deserialize,
)]
#[serde(rename_all = "lowercase")]
pub(crate) enum Folding {
    Manual,
    Markbegin,
    Markbeginend,
}

#[derive(
    Deserialize, Serialize, Clone, Debug, rkyv::Archive, rkyv::Serialize, rkyv::Deserialize,
)]
#[serde(rename_all = "lowercase")]
pub(crate) enum SoftWrap {
    Off,
    View,
    Margin,
}

#[derive(
    Deserialize, Serialize, Clone, Debug, rkyv::Archive, rkyv::Serialize, rkyv::Deserialize,
)]
#[serde(rename_all = "lowercase")]
pub(crate) enum Overscroll {
    None,
    Half,
    Full,
}

#[derive(
    Deserialize, Serialize, Clone, Debug, rkyv::Archive, rkyv::Serialize, rkyv::Deserialize,
)]
#[serde(rename_all = "lowercase")]
pub(crate) enum UndoDeltas {
    Always,
    Never,
    Timed,
}

#[derive(Deserialize, Serialize, Default, Debug)]
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
fn default_app_db() -> Option<String> {
    Some(format!("./{}", APP_DB))
}
fn default_project_folder() -> Option<String> {
    Some(format!("./{}", PROJECT_ROOT))
}
#[derive(Deserialize, Serialize, Default, Debug)]
pub(crate) struct StorageConfig {
    #[serde(default = "default_project_folder")]
    pub(crate) project_folder: Option<String>,
    #[serde(default = "default_app_db")]
    pub(crate) db_path: Option<String>,
}

#[skip_serializing_none]
#[derive(
    Deserialize, Serialize, Clone, Default, Debug, rkyv::Archive, rkyv::Serialize, rkyv::Deserialize,
)]
pub(crate) struct EditorConfig {
    pub(crate) theme: Option<String>,
    pub(crate) mode: Option<String>,
    pub(crate) key_binding: Option<String>,
    pub(crate) font_size: Option<u8>,
    pub(crate) soft_wrap: Option<SoftWrap>,
    pub(crate) cursor: Option<String>,
    pub(crate) folding: Option<Folding>,
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
    pub(crate) highlight_indent_guides: Option<bool>,
    pub(crate) persistent_hscrollbar: Option<bool>,
    pub(crate) persistent_vscrollbar: Option<bool>,
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
    pub(crate) live_autocompletion: Option<bool>,
    pub(crate) custom_scrollbar: Option<bool>,
    pub(crate) use_svg_gutterlines: Option<bool>,
    pub(crate) annotate_folded_lines: Option<bool>,
    pub(crate) keyboard_accessibility: Option<bool>,
    pub(crate) gutter_tooltip_follows_mouse: Option<bool>,
}
impl EditorConfig {
    pub const NAME: &'static str = EDITOR_CONFIG_NAME;
}
#[derive(Deserialize, Serialize, Default, Debug)]
pub(crate) struct Config {
    pub(crate) server: ServerConfig,
    pub(crate) editor: EditorConfig,
    pub(crate) storage: StorageConfig,
}

////////////////////////////////////
//FileSystem API code begins here //
////////////////////////////////////
#[derive(Deserialize, Serialize, Default)]
#[serde(rename_all = "lowercase")]
pub(crate) enum Kind {
    File,
    Directory,
    #[default]
    None,
}

#[derive(Deserialize, Serialize, Default)]
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


impl_db!(EditorConfig);
pub(crate) struct ReDb {
    db: Database,
}
impl ReDb {
    pub(crate) fn new() -> Self {
        let Ok(db) = Database::create(APP_DB) else {
            error!("Could not create database, paniking");
            panic!();
        };
        Self { db: db }
    }
    pub(crate) fn write<T: Db + 'static>(&self, data: T) -> redb::Result<(), redb::Error> {
        let write_transaction = match self.db.begin_write() {
            Ok(txn) => txn,
            Err(e) => {
                warn!("Failed to begin write transaction");
                return Err(e.into());
            }
        };
        {
            let mut table = match write_transaction.open_table(data.table()) {
                Ok(table) => table,
                Err(e) => {
                    warn!("Failed to open editor_state table");
                    return Err(e.into());
                }
            };
            match table.insert(T::name(), data) {
                Ok(_) => info!("Successfully wrote \"{}\" to database", T::name()),
                Err(e) => warn!("Failed to write \"{}\" to database: {}", T::name(), e),
            };
        }
        if let Err(e) = write_transaction.commit() {
            warn!("Failed to commit transaction: {}", e);
            return Err(e.into());
        } else {
            Ok(())
        }
    }
    pub(crate) fn read<T: Db + 'static>(&self, key: T) -> Option<T> {
        let Ok(read_transaction) = self.db.begin_read() else {
            warn!("Cannot read from database, aborting operation");
            return None;
        };
        let Ok(table) = read_transaction.open_table(key.table()) else {
            warn!("Cannot open from table, aborting operation");
            return None;
        };
        match table.get(T::name()) {
            Ok(Some(data)) => Some(data.value()),
            Ok(None) => None,
            Err(_) => {
                warn!("Could not read the key {}", T::name());
                return None;
            }
        }
    }
}

//This struct will try to map the FileSystemAPI used with OPFS , so that the same file tree can be used for this too. 
pub(crate) struct EditorVfs {
    root: AsyncVfsPath,
}
impl EditorVfs {
    pub(crate) fn new(root: &str) -> Self {
        Self {
            root: AsyncPhysicalFS::new(root).into(),
        }
    }
    pub(crate) fn root(&self) -> AsyncVfsPath {
        self.root.clone()
    }
    #[allow(dead_code)]
    pub(crate) async fn exists(&self, path: Option<String>) -> std::result::Result<bool, VfsError> {
        let vpath = match path {
            Some(path) => self.root.join(path)?,
            None => self.root.clone(),
        };
        match vpath.exists().await {
            Ok(true) => {
                info!("Virtual Filesystem accessable at {}", self.root.as_str());
                Ok(true)
            }
            Ok(false) => {
                let msg = format!(
                    "Unable to create Virtual Filesystem at {}",
                    self.root.as_str()
                );
                warn!("{}", msg);
                Err(VfsError::from(Error::new(ErrorKind::NotFound, msg)))
            }
            Err(e) => {
                error!("OS denied access to check VFS root: {}", e);
                Err(e)
            }
        }
    }
    #[allow(dead_code)]
    pub(crate) async fn mk(&self, path: String) -> std::result::Result<bool, VfsError> {
        let file = match self.root.join(&path) {
            Ok(file) => file,
            Err(e) => {
                warn!(
                    "Could not make a new file at {} due to error: {}",
                    self.root.as_str(),
                    e
                );
                if self.exists(Some(path)).await? {
                    return Err(VfsError::from(VfsErrorKind::FileExists));
                } else {
                    return Err(VfsError::from(VfsErrorKind::InvalidPath));
                }
            }
        };
        match file.create_file().await {
            Ok(_) => {
                info!("Created a file at {}", self.root.as_str());
                Ok(true)
            }
            Err(e) => {
                warn!(
                    "Could not make a file at {} due to error: {}",
                    self.root.as_str(),
                    e
                );
                Err(e)
            }
        }
    }
    #[allow(dead_code)]
    pub(crate) async fn mkdir(&self, path: String) -> std::result::Result<bool, VfsError> {
        let dir = match self.root.join(path) {
            Ok(dir) => dir,
            Err(e) => {
                warn!("Could not make a new directory at {} due to error: {}",self.root.as_str(),e);
                return Err(e)            
            }
        };
        match dir.create_dir().await {
            Ok(_) => {
                info!("Created a new directory at {}",self.root.as_str());
                Ok(true)
            },
            Err(e) => {
                warn!("Could not make a new directory at {} due to error {}",self.root.as_str(),e);
                Err(e)
            }
        }
    }
    pub(crate) async fn read(&self, file_path: String) -> std::result::Result<String, VfsError> {
        let file = match self.root.join(&file_path) {
            Ok(file) => file,
            Err(e) => {
                warn!("Could not read the file {} due to error: {}",file_path,e);
                return Err(e);
            }
        };
        let mut result = String::new();
        file.open_file().await?.read_to_string(&mut result).await?;
        Ok(result)
    }
    pub(crate) async fn write(&self, file_path: String, content: String ) -> std::result::Result<bool, VfsError> {
        let file = match self.root.join(&file_path) {
            Ok(file) => file,
            Err(e) => {
                warn!("Could not write the file {} due to error {}",file_path,e);
                return Err(e);
            }
        };
        match file.create_file().await?.write_all(&content.into_bytes()).await {
            Ok(_) => Ok(true),
            Err(e) => {
                warn!("Could not write to {}  due to the error: {}", file_path,e);
                return Err(VfsError::from(e));
            }
        }
    }
    // fn clean_path(&self, path: &Path) -> String {
    //     path.components()
    //         .map(|c| c.as_os_str().to_string_lossy().to_string())
    //         .collect::<Vec<_>>()
    //         .join("/") //bascially converted the path from pathbuf to a string.
    // }
    #[async_recursion]
    pub(crate) async fn make_filehandle_tree(&self, path: &AsyncVfsPath) -> VfsResult<FileHandle> {
        let handle_name: String = path.filename();
        //    println!("Making file handle for path: {:?}", path);
        let handle_kind: Kind = if path.is_dir().await? {
            Kind::Directory
        } else {
            Kind::File
        };
        let mut handle_children: Vec<FileHandle> = Vec::new();
        if path.is_dir().await? {
            let mut entries = path.read_dir().await?;
            while let Some(entry) = entries.next().await {
                //let sub_filepath: AsyncVfsPath = entry.parent();
                let children: FileHandle = self.make_filehandle_tree(&entry).await?;
                handle_children.push(children);
            }
        }
        Ok(FileHandle {
            name: handle_name,
            kind: handle_kind,
            path: Some(path.as_str().to_string()),
            children: Some(handle_children),
        })
    }
}
pub(crate) struct EditorFs {
    pub(crate) vfs: EditorVfs,
    pub(crate) db: ReDb,
}