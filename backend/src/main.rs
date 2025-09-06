// src/main.rs

use axum::{
    body::Bytes,
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{Html, IntoResponse, Json, Response},
    routing::get,
    Router,
};
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;

const SETTINGS_FILE: &str = "settings.json";

// --- Configuration Structs ---
#[derive(Debug, Deserialize)]
struct Config {
    // If a whole section is missing in YAML, use the struct default
    #[serde(default)]
    server: ServerConfig,
    #[serde(default)]
    storage: StorageConfig,
    #[serde(default)]
    defaults: DefaultsConfig,
}

#[derive(Debug, Deserialize)]
struct ServerConfig {
    // Use field-level defaults when keys are missing in YAML
    #[serde(default = "default_host")]
    host: String,
    #[serde(default = "default_port")]
    port: u16,
    #[serde(default = "default_base_path")]
    base_path: String,
}

#[derive(Debug, Deserialize)]
struct StorageConfig {
    #[serde(default = "default_files_dir")]
    files_dir: String,
}

#[derive(Debug, Deserialize, Clone)]
struct DefaultsConfig {
    #[serde(default = "default_theme")]
    theme: String,
    #[serde(default = "default_font_size")]
    font_size: u32,
}

// ---- Default providers for serde ----
fn default_host() -> String {
    "127.0.0.1".to_string()
}
fn default_port() -> u16 {
    6556
}
fn default_base_path() -> String {
    "/".to_string()
}
fn default_files_dir() -> String {
    "files".to_string()
}
fn default_theme() -> String {
    "ace/theme/monokai".to_string()
}
fn default_font_size() -> u32 {
    20
}

// Optional: Default impls for when we fall back entirely
impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: default_host(),
            port: default_port(),
            base_path: default_base_path(),
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            files_dir: default_files_dir(),
        }
    }
}

impl Default for DefaultsConfig {
    fn default() -> Self {
        Self {
            theme: default_theme(),
            font_size: default_font_size(),
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            server: ServerConfig::default(),
            storage: StorageConfig::default(),
            defaults: DefaultsConfig::default(),
        }
    }
}

// --- API and Asset Structs ---
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
#[folder = "../web/"]
struct Assets;

#[derive(Clone)]
struct AppState {
    config: Arc<Config>,
}

// --- The main function ---
// --- The main function ---
#[tokio::main]
async fn main() {
    env_logger::init();
    let config = load_config().await;

    if let Err(e) = fs::create_dir_all(&config.storage.files_dir).await {
        log::error!(
            "Failed to create files directory '{}': {}",
            &config.storage.files_dir,
            e
        );
        return;
    }

    let app_state = AppState {
        config: Arc::new(config),
    };

    // --- CORRECTED ROUTER LOGIC STARTS HERE ---

    // 1. Define API routes WITHOUT state initially.
    let api_routes = Router::new()
        .route("/settings", get(get_settings).post(post_settings))
        .route("/file", get(get_file).post(post_file));

    // 2. Handle the configurable base_path.
    let mut base_path = app_state.config.server.base_path.clone();
    if base_path.is_empty() {
        base_path = "/".to_string();
    }
    if !base_path.starts_with('/') {
        base_path.insert(0, '/');
    }
    if base_path.len() > 1 && base_path.ends_with('/') {
        base_path.pop();
    }

    // 3. Combine routes, then apply fallback and state ONCE at the end.
    let app = if base_path == "/" {
        Router::new().merge(api_routes)
    } else {
        Router::new().nest(&base_path, api_routes)
    }
    .fallback(static_handler)
    .with_state(app_state.clone());

    // --- CORRECTED ROUTER LOGIC ENDS HERE ---

    // --- Start the server ---
    // Use the host and port from the loaded config
    let host: IpAddr = app_state
        .config
        .server
        .host
        .parse()
        .expect("Invalid host in config.yaml");
    let addr = SocketAddr::from((host, app_state.config.server.port));

    if base_path == "/" {
        log::info!("Ace Editor server listening on http://{}", addr);
    } else {
        log::info!(
            "Ace Editor server listening on http://{}{}",
            addr,
            base_path
        );
    }
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// --- Static File Handler ---
async fn static_handler(uri: axum::http::Uri, State(state): State<AppState>) -> impl IntoResponse {
    // Get the base path from the config to correctly handle nested routes.
    let base_path = &state.config.server.base_path;
    let mut path = uri.path().trim_start_matches('/').to_string();
    let base_path_trimmed = base_path.trim_matches('/').to_string();
    if path == base_path_trimmed {
        path = "index.html".to_string();
    } else if path.starts_with(&base_path_trimmed) {
        path = path
            .strip_prefix(&format!("{}/", base_path_trimmed))
            .unwrap_or(&path)
            .to_string();
    }

    if path.is_empty() {
        path = "index.html".to_string();
    }

    match Assets::get(&path) {
        Some(content) => {
            let mime_type = mime_guess::from_path(&path).first_or_octet_stream();

            // Special case: index.html → inject <base>
            if path == "index.html" {
                let mut html = String::from_utf8(content.data.to_vec()).unwrap();

                // --- FIX: Get base_href from the config, don't hardcode it ---
                let mut base_href = state.config.server.base_path.clone();
                if !base_href.ends_with('/') {
                    base_href.push('/');
                }
                let tag = format!(r#"<base href="{}">"#, base_href);

                // Insert <base> right after <head>
                if !html.contains("<base href") {
                    html = html.replacen("<head>", &format!("<head>\n    {}", tag), 1);
                }

                return Response::builder()
                    .header(header::CONTENT_TYPE, mime_type.as_ref())
                    .body(html.into())
                    .unwrap();
            }

            // Other files unchanged
            Response::builder()
                .header(header::CONTENT_TYPE, mime_type.as_ref())
                .body(content.data.into())
                .unwrap()
        }
        None => (StatusCode::NOT_FOUND, Html("<h1>404 Not Found</h1>")).into_response(),
    }
}
// --- Settings Handlers ---
async fn get_settings(State(state): State<AppState>) -> Response {
    match fs::read_to_string(SETTINGS_FILE).await {
        Ok(data) => {
            let mut headers = HeaderMap::new();
            headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());
            (StatusCode::OK, headers, data).into_response()
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
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
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            (StatusCode::NOT_FOUND, "File not found").into_response()
        }
        Err(e) => {
            log::error!("Failed to read file '{}': {}", query.name, e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Could not read file").into_response()
        }
    }
}

// State<AppState> to get access to the config
async fn post_file(
    State(state): State<AppState>,
    Query(query): Query<FileQuery>,
    body: Bytes,
) -> Response {
    let safe_filename = match PathBuf::from(&query.name).file_name() {
        Some(name) => name.to_string_lossy().into_owned(),
        None => return (StatusCode::BAD_REQUEST, "Invalid file name").into_response(),
    };
    //  Use the files_dir from the loaded config
    let file_path = PathBuf::from(&state.config.storage.files_dir).join(safe_filename);
    match fs::write(&file_path, body).await {
        Ok(_) => {
            log::info!("Saved file: {}", file_path.display());
            (
                StatusCode::OK,
                Json(serde_json::json!({"status": "file saved"})),
            )
                .into_response()
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
        Ok(content) => match serde_yaml::from_str::<Config>(&content) {
            Ok(cfg) => cfg,
            Err(e) => {
                // Malformed YAML: log and fall back to full defaults
                log::error!("config.yaml is malformed: {}. Using default settings.", e);
                Config::default()
            }
        },
        Err(e) => {
            // File missing or unreadable: log and fall back to full defaults
            log::warn!(
                "config.yaml not found/unreadable ({}). Using default settings.",
                e
            );
            Config::default()
        }
    }
}
