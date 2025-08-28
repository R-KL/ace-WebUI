
# (Made as a joke with Gemini, ChatGPT , Co-Pilot ) but works...
# Rust Ace Editor Web UI

A high-performance, standalone, self-hosted code editor application powered by a Rust backend and a modern web component frontend. The entire application compiles into a single binary for easy deployment.


## About The Project

This project is a complete, full-stack web application that provides a code editing environment in the browser. It was built from the ground up to be a lightweight and portable alternative to heavier IDEs for quick server-side file editing. The backend is written in Rust using the Axum framework for speed and safety, while the frontend uses the Ace Editor and a modern, dependency-free Web Component for the file tree.

The entire set of web assets (HTML, CSS, JavaScript) is embedded into the Rust executable at compile time, meaning you only need to deploy a single file to your server.

## Features

- 🚀 **High-Performance Backend:** Written in Rust with Axum and Tokio for asynchronous, non-blocking I/O.
- 📦 **Single Binary Deployment:** All web assets are embedded. Just copy one file and run it.
- 📁 **Asynchronous File Tree:** A modern sidebar shows the server's file system, loading subdirectories on demand for efficiency.
- 💻 **Powerful Code Editor:** Integrated with the feature-rich Ace Editor.
- ↔️ **Two-Way File Operations:**
    - Load and save files directly on the server's file system.
    - Upload files from your local PC to the editor.
    - Download files from the editor to your local PC.
- ⚙️ **External Configuration:** All settings are managed via a simple `config.yaml` file, no need to recompile to change settings.
- 💅 **Modern UI:** A clean, dark-themed, two-panel layout that's fully responsive.

## Tech Stack

* **Backend:**
    * [Rust](https://www.rust-lang.org/)
    * [Axum](https://github.com/tokio-rs/axum) (Web Framework)
    * [Tokio](https://tokio.rs/) (Async Runtime)
    * [Serde](https://serde.rs/) (Serialization/Deserialization)
    * [Rust-Embed](https://github.com/pyrossh/rust-embed) (Asset Embedding)
* **Frontend:**
    * HTML5 / CSS3 / Vanilla JavaScript
    * [Ace Editor](https://ace.c9.io/)
    * [File Tree Web Component](https://www.cssscript.com/file-tree-web-component/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development or on a server for production.

### Prerequisites

You will need the Rust toolchain and standard build tools installed.

1.  **Install Rust:**
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf [https://sh.rustup.rs](https://sh.rustup.rs) | sh
    ```
2.  **Install Build Essentials (for Debian/Ubuntu):**
    ```bash
    sudo apt update
    sudo apt install build-essential
    ```

### Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YourUsername/rust-ace-editor.git](https://github.com/YourUsername/rust-ace-editor.git)
    cd rust-ace-editor
    ```

2.  **Configure the application:**
    The application is configured using a `config.yaml` file. Create a new file named `config.yaml` and add the following content, adjusting as needed:
    ```yaml
    #any part of this yaml file or the entire yaml file can be ommited to use default values
    server:
      host: "127.0.0.1" #default value
      port: 6556 #default value
      base_path: "/" #default value

    storage:
      files_dir: "my_files" # The app will create and serve files from this directory

    defaults:
      theme: "ace/theme/chrome"
      font_size: 14
    ```

3.  **Build the application for release:**
    This command compiles the code with optimizations and embeds all the web assets.
    ```bash
    cargo build --release
    ```

4.  **Run the application:**
    The final binary will be in the `target/release/` directory.
    ```bash
    ./target/release/ace-editor-rust
    ```
    Or you can use a production grade process manager like pm2 to run this in background easily (assuming node.js is installed in the server
    else download npm and node.js first for easy deployment)
    ```bash
    npm install pm2 -g
    cd target/release
    pm2 start ace-editor
    ```

6.  **Access the Web UI:**
    Open your web browser and navigate to `http://127.0.0.1:8080/` (or the host , port  and base_path you specified in your config ).

## Configuration

All settings are managed in the `config.yaml` file.

| Section         | Key             | Type     | Description                                                                 |
| --------------- | --------------- | -------- | --------------------------------------------------------------------------- |
| `server`        | `host`          | `String` | The IP address to bind the server to. `127.0.0.1` for local, `0.0.0.0` for public. |
| `server`        | `port`          | `Number` | The network port the server will listen on.                                 |
| `server`        | `base_path`     | `string` | Useful when reverse_proxying the website under subpath (eg website/base_path). |
| `storage`       | `files_dir`     | `String` | The path to the directory where user files will be stored and served from.  |
| `defaults`      | `theme`         | `String` | The default Ace Editor theme for first-time users (e.g., `ace/theme/monokai`). |
| `defaults`      | `font_size`     | `Number` | The default font size for first-time users.                                 |

## License

Not Lisensed at all
