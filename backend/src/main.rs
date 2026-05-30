use axum::{
    Router, extract::{Json, State}, http::StatusCode, response::{self, IntoResponse}, routing::{get, post, put}
};

use log::{debug, info, warn, LevelFilter};

use std::io::Write;
use std::path::Path;
use std::sync::Arc;

use tokio::signal;
use tower_http::services::ServeDir;

mod definitions;
use definitions::{Config, EditorConfig, EditorVfs, ReDb};

struct AppState {
    config: Arc<definitions::Config>,
    fs: Arc<definitions::EditorFs>,
}
//////////////////////
// Helper Functions //
//////////////////////
async fn shutdown() {
    signal::ctrl_c()
        .await
        .expect("Couldnt listen to ctrl-c event");
    info!("Recived shutdown signal, shutting down server gracefully...(wait...)");
}
async fn get_file_tree(
    State(app_state): State<Arc<AppState>>,
    Json(req): Json<definitions::FileTreeRequest>,
) -> Result<response::Json<definitions::FileHandle>, String> {
    if let Some(path) = req.path {
        let root_path = match app_state.fs.vfs.root().join(path) {
            Ok(path) => path, 
            Err(e) => {
                warn!("Could not read the root directory due to {}, using default root",e);
                app_state.fs.vfs.root()
            }
        };
        let file_handle: definitions::FileHandle =
            match app_state.fs.vfs.make_filehandle_tree(&root_path).await {
                Ok(handle) => handle,
                Err(e) => {
                    warn!("Error generating file tree: {}", e);
                    definitions::FileHandle::default()
                }
            };
        let file_handle_json = response::Json(file_handle);
        Ok(file_handle_json)
    } else {
        Err("Error: path is required for get_file_tree operation".to_string())
    }
}
  ///////////////////////////
 //     Axum Handlers     //
///////////////////////////
async fn fs_write_handler(
    State(app_state): State<Arc<AppState>>,
    Json(req): Json<definitions::FileRequest>,
) {
    if let Some(content) = req.content {
        let capacity =  content.len();
        let path = req.path.clone();
        match app_state.fs.vfs.write(req.path, content).await {
            Ok(success) => {
                if success {
                    info!("Wrote {} bytes to {}",capacity, &path);
                } else {
                    warn!("Couldn't write to {}", &path);
                }
            },
            Err(e) => {
                warn!("Could not write to {} due to an error: {}", path, e);
            }
        }
    } else {
        warn!("Error: content is required for write operation");
    }
}
async fn fs_read_handler(State(app_state): State<Arc<AppState>>,Json(req): Json<definitions::FileRequest>) -> impl IntoResponse {
    match app_state.fs.vfs.read(req.path.clone()).await {
        Ok(content) => {
            return (StatusCode::OK, content);
        },
        Err(e) => {
            warn!("{}",e);
            return (StatusCode::NOT_FOUND, "Error 404".to_string());
        }
    } 
}

/////////////////////////////////////////////////////////////////////////////
// Settings.yaml and editor-state.json(for editor) parsing code begin here //
/////////////////////////////////////////////////////////////////////////////
async fn read_config() -> definitions::Config {
    let Ok(config_str) = tokio::fs::read_to_string("settings.yaml").await else {
        warn!("Cannot read or find settings.yaml file using default settings");
        return Config::default();
    };
    let Ok(parsed) = serde_yaml::from_str(&config_str) else {
        warn!("Cannot parse settings.yaml file or settings.yaml is malformed");
        return Config::default();
    };
    parsed
}
async fn write_editor_state(State(app_state): State<Arc<AppState>>, Json(req): Json<EditorConfig>) {
    match app_state.fs.db.write(req) {
        Ok(_) => info!("Wrote user config to database"),
        Err(e) => {
            warn!("Could not write to database due to error: {}",e);
        }
    }
}
async fn read_editor_state(State(app_state):State<Arc<AppState>>) -> Json<EditorConfig> {
    let Some(editor_state) = app_state.fs.db.read(app_state.config.editor.clone()) else {
        return Json(EditorConfig::default());
    };
    Json(editor_state)
}
////////////////////////////////////////////
// The backend WebServer code begins here //
////////////////////////////////////////////
async fn server(config: Config) {
    let app_state = Arc::new(AppState {
        fs: Arc::new(
            definitions::EditorFs { vfs: EditorVfs::new(&config.storage.project_folder.as_deref().unwrap()) , db: ReDb::new() }
        ),
        config: Arc::new(config),
    });
    let editor: Router<Arc<AppState>> = Router::<Arc<AppState>>::new()
        .route("/read",
            get(read_editor_state))
        .route("/write",put(write_editor_state));
    let file_system: Router<Arc<AppState>> = Router::<Arc<AppState>>::new()
        .route( "/read", post(fs_read_handler))
        .route( "/write", post(fs_write_handler))
        .route(
            "/get_root",
            post(|State(app_state): State<Arc<AppState>>| async move {
                app_state.fs.vfs.root().as_str().to_owned()
            }),
        )
        .route("/get_file_tree", post(get_file_tree));
    let api = Router::<Arc<AppState>>::new()
        .nest("/fs", file_system)
        .nest("/editor", editor);
    let app: Router = Router::<Arc<AppState>>::new()
        .route("/hello", get(|| async { "Hi, This is AceWebUI" }))
        .nest_service("/", ServeDir::new("../web/dist"))
        .nest("/api", api)
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
    env_logger::Builder::new()
        .filter_level(LevelFilter::Info) // Set your baseline filter
        .format(|buf, record| {
            // 1. Get default env_logger components
            let ts = buf.timestamp(); // Default timestamp
            let level_style = buf.default_level_style(record.level()); // Default color style
            let level = record.level(); // Default level string

            // 2. Extract your custom short filename (e.g., "vfs.rs")
            let full_path = record.file().unwrap_or("unknown.rs");
            let filename = Path::new(full_path)
                .file_name()
                .and_then(|os_str| os_str.to_str())
                .unwrap_or(full_path);

            // 3. Assemble: [default format till level] + filename + [default rest]
            writeln!(
                buf,
                "[{ts} {level_style}{level:<5}{level_style:#}] [{filename}] {}",
                record.args() // Log payload
            )
        })
        .init();
    info!("Starting editor webserver");
    info!("Reading config from settings.yaml...");
    let config: definitions::Config = read_config().await;
    debug!("Config loaded successfully: {:#?}\n", &config);
    info!("Starting a new server at {}", &config.server.get_addr());
    server(config).await;
}
