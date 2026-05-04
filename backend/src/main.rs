
use async_recursion::async_recursion;
use axum::{
    extract::{Json, State},
    response,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Arc;
use tokio::fs;
use tower_http::services::ServeDir;

static ADDR: &str = "0.0.0.0:8080";
static ROOT: &str = "../backend";
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
        let new_path = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        if !new_path.starts_with(&self.root) {
            panic!("Error: path must be within the root directory");
        }
        fs::read_to_string(&new_path)
            .await
            .unwrap_or_else(|_| "File not found".into())
    }
    async fn write_file(&self, path: &str, content: &str) -> String {
        let new_path = Path::new(&self.root).join(path.strip_prefix("/").unwrap_or(path));
        match fs::write(&new_path, content).await {
            Ok(_) => "Success".to_string(),
            Err(e) => format!("Error Writing to File: {}", e),
        }
    }
    #[async_recursion]
    async fn make_filehandle_tree(&self, path: &std::path::PathBuf) -> FileHandle {
        let new_path: std::path::PathBuf =
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
                let sub_filepath: std::path::PathBuf =
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

async fn write_handler(State(fs): State<Arc<FileSystem>>, Json(req): Json<FileRequest>) -> String {
    if let Some(content) = req.content {
        fs.write_file(&req.path, &content).await
    } else {
        "Error: content is required for write operation".to_string()
    }
}

fn clean_path(path: &std::path::PathBuf) -> String {
    path.components()
    .map(|c| c.as_os_str().to_string_lossy().to_string())
    .collect::<Vec<_>>()
    .join("/") //bascially converted the path from pathbuf to a string.

}
async fn get_file_tree(
    State(fs): State<Arc<FileSystem>>,
    Json(req): Json<FileTreeRequest>,
) -> Result<response::Json<FileHandle>, String> {
    if let Some(path) = req.path {
        let root_path: std::path::PathBuf = Path::new(&path).to_path_buf();
        let file_handle: FileHandle = fs.make_filehandle_tree(&root_path).await; 
        let file_handle_json = response::Json(file_handle);
        Ok(file_handle_json)
    } else {
        Err("Error: path is required for get_file_tree operation".to_string())
    }
}
async fn server() {
    let my_fs = Arc::new(FileSystem::new(ROOT));
    let file_system: Router<Arc<FileSystem>> = Router::<Arc<FileSystem>>::new()
        .route(
            "/read",
            post(
                |State(fs): State<Arc<FileSystem>>, Json(req): Json<FileRequest>| async move {
                    fs.read_file(&req.path).await
                },
            ),
        )
        .route("/write", post(write_handler))
        .route(
            "/get_root",
            post(|State(fs): State<Arc<FileSystem>>| async move { fs.get_root().await }),
        )
        .route("/get_file_tree", post(get_file_tree));

    let app: Router = Router::<Arc<FileSystem>>::new()
        .route("/hello", get(|| async { "Hello World" }))
        .nest("/fs", file_system)
        .nest_service("/", ServeDir::new("../web/dist"))
        .with_state(my_fs);
    let lister = tokio::net::TcpListener::bind(ADDR)
        .await
        .expect("Error: unable to bind to TCP socket");
    axum::serve(lister, app)
        .await
        .expect("Error: Unable to start the server");
}

#[tokio::main]
async fn main() {
    println!("Staring a new server at {}", ADDR);
    server().await;
}
