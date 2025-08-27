// src/main.rs

use axum::{
    body::Bytes,
    extract::{Query, State}, // CHANGED: Re-added State
    http::{header, HeaderMap, StatusCode},
    response::{Html, IntoResponse, Json, Response},
    routing::get,
    Router,
};
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::net::IpAddr;
use std::path::PathBuf;
use std::sync::Arc; // CHANGED: Added Arc for state sharing
use tokio::fs;

// REMOVED: const FILES_DIR is no longer needed, it comes from config now.
const SETTINGS_FILE: &str = "settings.json";

// --- Configuration Structs (Your code was perfect here) ---
#[derive(Debug, Deserialize)]
struct Config {
    server: ServerConfig,
    storage: StorageConfig,
    defaults: DefaultsConfig,
}

#[derive(Debug, Deserialize)]
struct ServerConfig {
    host: String, // CHANGED: Added host for more control
    port: u16,
}

#[derive(Debug, Deserialize)]
struct StorageConfig {
    files_dir: String,
}

#[derive(Debug, Deserialize, Clone)] // CHANGED: Added Clone
struct DefaultsConfig {
    theme: String,
    font_size: u32,
}

// --- API and Asset Structs (Unchanged) ---
#[derive(Debug, Serialize, Deserialize, Clone)]
struct Settings {
    theme: String,
    #[serde(rename = "fontSize")]
    font_size: u32,
}

#[derive(Debug, Deserialize)]
struct FileQuery {
    name: String,
}

#[derive(RustEmbed)]
#[folder = "web/"]
struct Assets;

// CHANGED: This struct will hold our application's shared state.
#[derive(Clone)]
struct AppState {
    config: Arc<Config>,
}

// --- The `main` function ---
#[tokio::main]
async fn main() {
    env_logger::init();
    let config = load_config().await;

    // CHANGED: Use the files_dir from the loaded config
    if let Err(e) = fs::create_dir_all(&config.storage.files_dir).await {
        log::error!("Failed to create files directory '{}': {}", &config.storage.files_dir, e);
        return;
    }

    // CHANGED: Create the application state
    let app_state = AppState {
        config: Arc::new(config),
    };

    // --- Define the application routes ---
    let app = Router::new()
        .route("/settings", get(get_settings).post(post_settings))
        .route("/file", get(get_file).post(post_file))
        .with_state(app_state.clone()) // CHANGED: Clone app_state for router
        .fallback(static_handler);

    // --- Start the server ---
    // CHANGED: Use the host and port from the loaded config
    let host: IpAddr = app_state.config.server.host.parse().expect("Invalid host in config.yaml");
    let addr = SocketAddr::from((host, app_state.config.server.port));

    log::info!("Ace Editor server listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// --- Static File Handler (Unchanged) ---
async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    // ... same as before
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }
    match Assets::get(&path) {
        Some(content) => {
            let mime_type = mime_guess::from_path(path).first_or_octet_stream();
            Response::builder()
                .header(header::CONTENT_TYPE, mime_type.as_ref())
                .body(content.data.into())
                .unwrap()
        }
        None => (StatusCode::NOT_FOUND, Html("<h1>404 Not Found</h1>")).into_response(),
    }
}

// --- Settings Handlers ---
// CHANGED: Added State<AppState> to get access to the config
async fn get_settings(State(state): State<AppState>) -> Response {
    match fs::read_to_string(SETTINGS_FILE).await {
        Ok(data) => {
            let mut headers = HeaderMap::new();
            headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());
            (StatusCode::OK, headers, data).into_response()
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            // CHANGED: Use the defaults from the loaded config
            let default_settings = Settings {
                theme: state.config.defaults.theme.clone(),
                font_size: state.config.defaults.font_size,
            };
            Json(default_settings).into_response()
        }
        Err(e) => {
            log::error!("Failed to read settings: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read settings").into_response()
        }
    }
}

// post_settings is fine, it doesn't need config access
async fn post_settings(Json(payload): Json<Settings>) -> Response {
    // ... same as before
    match serde_json::to_string_pretty(&payload) {
        Ok(data) => match fs::write(SETTINGS_FILE, data).await {
            Ok(_) => (StatusCode::OK, Json(serde_json::json!({"status": "ok"}))).into_response(),
            Err(e) => {
                log::error!("Failed to save settings: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Failed to save settings").into_response()
            }
        },
        Err(e) => {
            log::error!("Failed to serialize settings: {}", e);
            (StatusCode::BAD_REQUEST, "Invalid settings format").into_response()
        }
    }
}

// --- File I/O Handlers ---
// CHANGED: Added State<AppState> to get access to the config
async fn get_file(State(state): State<AppState>, Query(query): Query<FileQuery>) -> Response {
    let safe_filename = match PathBuf::from(&query.name).file_name() {
        Some(name) => name.to_string_lossy().into_owned(),
        None => return (StatusCode::BAD_REQUEST, "Invalid file name").into_response(),
    };
    // CHANGED: Use the files_dir from the loaded config
    let file_path = PathBuf::from(&state.config.storage.files_dir).join(safe_filename);
    match fs::read(file_path).await {
        Ok(data) => {
            let mut headers = HeaderMap::new();
            headers.insert(header::CONTENT_TYPE, "text/plain".parse().unwrap());
            (StatusCode::OK, headers, data).into_response()
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => (StatusCode::NOT_FOUND, "File not found").into_response(),
        Err(e) => {
            log::error!("Failed to read file '{}': {}", query.name, e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Could not read file").into_response()
        }
    }
}

// CHANGED: Added State<AppState> to get access to the config
async fn post_file(State(state): State<AppState>, Query(query): Query<FileQuery>, body: Bytes) -> Response {
    let safe_filename = match PathBuf::from(&query.name).file_name() {
        Some(name) => name.to_string_lossy().into_owned(),
        None => return (StatusCode::BAD_REQUEST, "Invalid file name").into_response(),
    };
    // CHANGED: Use the files_dir from the loaded config
    let file_path = PathBuf::from(&state.config.storage.files_dir).join(safe_filename);
    match fs::write(&file_path, body).await {
        Ok(_) => {
            log::info!("Saved file: {}", file_path.display());
            (StatusCode::OK, Json(serde_json::json!({"status": "file saved"}))).into_response()
        }
        Err(e) => {
            log::error!("Failed to save file '{}': {}", query.name, e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Could not save file").into_response()
        }
    }
}

// --- Helper function to load config ---
async fn load_config() -> Config {
    match fs::read_to_string("config.yaml").await {
        Ok(content) => serde_yaml::from_str(&content).expect("config.yaml is malformed"),
        Err(_) => {
            log::warn!("config.yaml not found, using default settings.");
            // CHANGED: Provide defaults for all new fields
            Config {
                server: ServerConfig {
                    host: "127.0.0.1".to_string(),
                    port: 8080,
                },
                storage: StorageConfig {
                    files_dir: "files".to_string(),
                },
                defaults: DefaultsConfig {
                    theme: "ace/theme/monokai".to_string(),
                    font_size: 16,
                },
            }
        }
    }
}