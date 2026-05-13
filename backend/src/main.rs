use axum::{
    Router, 
    extract::{Json, State}, 
    response, 
    routing::{get, post, put}
};

use std::path::{Path, PathBuf};
use std::sync::Arc;
use tower_http::services::ServeDir;
use tokio::signal;
mod structs;
use structs::{EditorConfig, Config};

struct AppState {
    filesystem: Arc<structs::FileSystem>,
    config: Arc<structs::Config>,
}
  //////////////////////
 // Helper Functions //
//////////////////////
fn info(str: &str) -> () {
    println!("Info: {}", str);
}
fn warn(str: &str) -> () {
    println!("Warning: {}", str);
}


async fn write_handler(
    State(app_state): State<Arc<AppState>>,
    Json(req): Json<structs::FileRequest>,
) -> String {
    if let Some(content) = req.content {
        let content_str = app_state.filesystem.write_file(&req.path, &content).await;
        info(format!("Wrote {} to {}",&content.capacity(),&req.path).as_str());
         return content_str;
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
    Json(req): Json<structs::FileTreeRequest>,
) -> Result<response::Json<structs::FileHandle>, String> {
    if let Some(path) = req.path {
        let root_path: PathBuf = Path::new(&path).to_path_buf();
        let file_handle: structs::FileHandle = app_state.filesystem.make_filehandle_tree(&root_path).await;
        let file_handle_json = response::Json(file_handle);
        Ok(file_handle_json)
    } else {
        Err("Error: path is required for get_file_tree operation".to_string())
    }
}
async fn shutdown() {
    signal::ctrl_c().await.expect("Couldnt listen to ctrl-c event");
}
/////////////////////////////////////////////////////////////////////////////
// Settings.yaml and editor-state.json(for editor) parsing code begin here //
/////////////////////////////////////////////////////////////////////////////
fn read_config() -> structs::Config {
    let Ok(config_str) = std::fs::read_to_string("settings.yaml") else {
        warn("Cannot read or find settings.yaml file using default settings");
        return Config::default();
    };
    let Ok(parsed) = serde_yaml::from_str(&config_str) else {
        warn("Cannot parse settings.yaml file or settings.yaml is malformed");
        return Config::default();
    };
    return parsed;
}
async fn write_editor_state(State(app_state): State<Arc<AppState>>, Json(req): Json<EditorConfig>) {
    let Ok(content) = serde_json::to_string(&req) else {
        warn("Cannot parse the Editor State sent by client, aborting editor state save routine");
        return;
    };
    let Some(path) = app_state.config.storage.editor_state.as_ref() else {
        warn("Cannot read editor_state file,using default one");
        return;
    };
    app_state.filesystem.write_file(path.as_str(),content.as_str()).await;
}
////////////////////////////////////////////
// The backend WebServer code begins here //
////////////////////////////////////////////
async fn server() {
    let app_state = Arc::new(AppState {
        filesystem: Arc::new(structs::FileSystem::new(
            read_config()
                .storage
                .project_folder
                .as_deref()
                .unwrap(),
        )),
        config: Arc::new(read_config()),
    });
    let editor: Router<Arc<AppState>> = Router::<Arc<AppState>>::new()
        .route("/read",
            get(|State(app_state):State<Arc<AppState>>| async move {
                app_state.filesystem.read_file(app_state.config.storage.editor_state.as_ref().expect("Cannot Read editor_state file").as_str()).await
            }))
        .route("/write",put(write_editor_state));
    let file_system: Router<Arc<AppState>> = Router::<Arc<AppState>>::new()
        .route(
            "/read",
            post(
                |State(app_state): State<Arc<AppState>>, Json(req): Json<structs::FileRequest>| async move {
                    app_state.filesystem.read_file(&req.path).await
                },
            ),
        )
        .route("/write", post(write_handler))
        .route(
            "/get_root",
            post(|State(app_state): State<Arc<AppState>>| async move {
                app_state.filesystem.get_root().await
            }),
        )
        .route("/get_file_tree", post(get_file_tree));

    let app: Router = Router::<Arc<AppState>>::new()
        .route("/hello", get(|| async { "Hello World" }))
        .nest("/fs", file_system)
        .nest_service("/", ServeDir::new("../web/dist"))
        .nest("/editor", editor)
        .with_state(app_state.clone());
    let lister = tokio::net::TcpListener::bind(app_state.as_ref().config.server.get_addr())
        .await
        .expect("Error: unable to bind to TCP socket");
    axum::serve(lister, app)
        .with_graceful_shutdown(shutdown())
        .await
        .expect("Error: Unable to start the server");
}

//////////////////////////////////////////////
/// This is the entry point of the program ///
//////////////////////////////////////////////
#[tokio::main]
async fn main() {
    println!("Reading config from settings.yaml...");
    let config: structs::Config = read_config();
    println!("Config loaded successfully: {:#?}\n", config);
    println!("Starting a new server at {}", config.server.get_addr());
    server().await;
}
