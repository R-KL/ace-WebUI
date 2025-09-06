# !!! This branch is for porting the Ace-Editor into Vue.js as of now no changes have been done to README except this message!
#   Ace-Editor Web-UI Built in Rust

A high-performance, standalone, self-hosted code editor powered by a Rust backend and a modern web component frontend. The entire application compiles into a single binary for easy deployment.

## About The Project

Ace-Editor Web-UI is a full-stack web application providing a browser-based code editing environment. Designed to be lightweight and portable, it offers a fast alternative to heavier IDEs for quick server-side file editing. The backend uses [Axum](https://github.com/tokio-rs/axum) for speed and safety, while the frontend features [Ace Editor](https://ace.c9.io/) and a dependency-free Web Component for the file tree.

All web assets (HTML, CSS, JavaScript) are embedded into the Rust executable at compile time, so deployment is as simple as copying a single file.

## Features

- 🚀 **High-Performance Backend:** Rust + Axum + Tokio for asynchronous, non-blocking I/O.
- 📦 **Single Binary Deployment:** All web assets embedded; just copy and run.
- 📁 **Asynchronous File Tree:** Sidebar shows the server's file system, loading subdirectories on demand.
- 💻 **Powerful Code Editor:** Integrated Ace Editor.
- ↔️ **Two-Way File Operations:**
  - Load and save files directly on the server.
  - Upload files from your PC.
  - Download files to your PC.
- ⚙️ **External Configuration:** Settings managed via a simple `config.yaml` file.
- 💅 **Modern UI:** Clean, dark-themed, responsive two-panel layout.

## Tech Stack

**Backend:**
- [Rust](https://www.rust-lang.org/)
- [Axum](https://github.com/tokio-rs/axum)
- [Tokio](https://tokio.rs/)
- [Serde](https://serde.rs/)
- [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed)

**Frontend:**
- HTML5 / CSS3 / Vanilla JavaScript
- [Ace Editor](https://ace.c9.io/)

## Getting Started

Follow these steps to set up the project locally or on a server.

### Prerequisites

Install the Rust toolchain and standard build tools.

1. **Install Rust:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
2. **Install Build Essentials (Debian/Ubuntu):**
   ```bash
   sudo apt update
   sudo apt install build-essential
   ```

### Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/R-KL/ace-WebUI.git rust-ace-editor
   cd rust-ace-editor
   ```
   *(You can use any folder name; scripts assume execution from the cloned directory.)*

2. **Configure the application:**
   Create a `config.yaml` file (optional; defaults used if omitted):
   ```yaml
   server:
     host: "127.0.0.1"
     port: 6556
     base_path: "/"

   storage:
     files_dir: "my_files"

   defaults:
     theme: "ace/theme/chrome"
     font_size: 14
   ```
   Or generate a template via terminal (from the current working directory):
   ```bash
   echo "# any part of this yaml file or the entire yaml file can be omitted to use default values
   server:
     host: \"127.0.0.1\" # default value
     port: 6556 # default value
     base_path: \"/\" # default value

   storage:
     files_dir: \"my_files\" # The app will create and serve files from this directory

   defaults:
     theme: \"ace/theme/monokai\"
     font_size: 14
   " > config.yaml
   ```

3. **Build the application for release:**

   Prebuilt binaries are not available due to dependency differences. It's best to build from source. You can delete everything except the `target` folder after building. This command compiles the code with optimizations and embeds all the web assets.
   ```bash
   cargo build --release
   ```

4. **Run the application:**

   - **Option 1:**  
     The final binary will be in the `target/release/` directory. Run it as:
     ```bash
     ./target/release/ace-editor
     ```

   - **Option 2:**  
     Optionally, use a production-grade process manager like pm2 or systemd to run this in the background.

     **Using systemd**  
     (Assuming you're running a Linux distribution like Debian/Ubuntu that uses systemd by default. For other distros, refer to their docs or use the method above.)
     The below code should be run from the cloned directory (`rust-ace-editor`). If you move the binary, **edit the WorkingDirectory and ExecStart path in the service file** to the new absolute path.
     ```bash
     sudo tee /etc/systemd/system/ace-editor.service > /dev/null <<EOF
     [Unit]
     Description=Rust Ace Editor Web UI
     After=network.target

     [Service]
     Type=simple
     User=$(whoami)
     WorkingDirectory=$(pwd)
     ExecStart=$(pwd)/target/release/ace-editor
     Restart=on-failure
     Environment=RUST_LOG=info

     [Install]
     WantedBy=multi-user.target
     EOF
     sudo systemctl daemon-reload
     sudo systemctl enable ace-editor.service
     sudo systemctl start ace-editor.service
     ```

     **Using PM2**  
     (Assuming Node.js is installed. If not, install npm and Node.js first.)
     pm2 is primarily meant for Node applications but can generally run any kind of process.
     ```bash
     npm install pm2 -g
     pm2 start ./target/release/ace-editor
     ```
     If you move the binary, update the path in PM2:
     ```bash
     pm2 delete ace-editor
     pm2 start /new/path/to/ace-editor
     ```
     Also, change the directory of `config.yaml` as the binary checks its current working directory only.

5. **Access the Web UI:**
   Open your web browser and navigate to `http://127.0.0.1:6556/` (or the host, port, and base_path you specified in your config).

## Issues

Some common issues and solutions:

| Issue                              | Solution                                                                                          |
|-------------------------------------|---------------------------------------------------------------------------------------------------|
| `config.yaml` not loading properly  | Ensure the template matches the expected format and that `config.yaml` is in the working directory.|
| Website appears offline             | Verify firewall settings allow traffic on the configured port in `config.yaml` (or the default port).|
| Settings not saved persistently     | Confirm the working directory has write permissions.                                               |

## Configuration

All settings are managed in the `config.yaml` file.

| Section    | Key         | Type     | Description                                                                 |
|------------|-------------|----------|-----------------------------------------------------------------------------|
| `server`   | `host`      | String   | The IP address to bind the server to. `127.0.0.1` for local, `0.0.0.0` for public. |
| `server`   | `port`      | Number   | The network port the server will listen on.                                 |
| `server`   | `base_path` | String   | Useful when reverse proxying the website under a subpath (e.g., website/base_path). |
| `storage`  | `files_dir` | String   | The path to the directory where user files will be stored and served from.  |
| `defaults` | `theme`     | String   | The default Ace Editor theme for first-time users (e.g., `ace/theme/monokai`). |
| `defaults` | `font_size` | Number   | The default font size for first-time users.                                 |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the following open-source components:

| Component    | License         | Notes                                                                 |
|--------------|-----------------|-----------------------------------------------------------------------|
| [Ace Editor](https://ace.c9.io/) | BSD-3-Clause    | Embedded in `web/ace/ace.js`. License headers are preserved in source files if any as is   |
| [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed) | MIT/Apache-2.0 | Used to embed static assets into the Rust binary.                        |
| [Icons](https://pictogrammers.com/) | MIT/Apache-2.0 | Icons used from Pictogrammers.com                                   |
> **Note:** All third-party licenses are respected. No modifications have removed or altered their original license notices.

