Ace WebUI: A Self-Hosted Code EditorAce WebUI is a lightweight, standalone web-based code editor powered by a robust Rust backend. It's designed to be a single, portable binary that you can run on any server to get a quick, browser-based interface for editing files. The frontend is built with modern, dependency-free Web Components, and the entire application is configurable via a simple YAML file.✨ FeaturesStandalone Binary: The entire application, including the web server and all frontend assets (HTML, CSS, JS), is compiled into a single executable. No external dependencies needed to run.Rust Backend: A fast, memory-safe, and asynchronous backend built with the axum web framework.Modern Frontend: A clean UI using the Ace Editor and a dependency-free Web Component for the file tree. No jQuery required!Dynamic File Tree: Asynchronously loads directory contents as you expand folders, ensuring a fast and efficient experience even with large directories.File I/O: Load files from the server, save changes back to the server, or download files to your local PC.Configurable: Easily change the server port, host, file storage directory, and default editor settings via a config.yaml file.Cross-Platform: Can be compiled for Linux, Windows, and macOS.📂 Project Structure.
├── .cargo/
│   └── config.toml      # (Optional) For cross-compilation
├── web/
│   ├── ace/             # The Ace Editor library
│   ├── file-tree.js     # The file tree web component
│   ├── index.html       # Main HTML file
│   ├── index.js         # Frontend application logic
│   └── style.css        # Styles for the UI
├── src/
│   └── main.rs          # The core Rust backend logic
├── .gitignore           # Specifies files for Git to ignore
├── Cargo.toml           # Rust project manifest and dependencies
└── config.yaml.example  # An example configuration file
🚀 Getting StartedPrerequisitesRust: You need to have the Rust toolchain installed. You can get it from rustup.rs.Build Tools: A C compiler is needed for some Rust dependencies.Linux (Debian/Ubuntu): sudo apt install build-essentialWindows: Install the "C++ build tools" from the Visual Studio Installer.macOS: The Xcode Command Line Tools should be sufficient.Installation & RunningClone the repository:git clone https://github.com/YourUsername/ace-WebUI.git
cd ace-WebUI
Configure the application:Create a config.yaml file in the root of the project. You can copy the example file to get started:cp config.yaml.example config.yaml
Now, edit config.yaml to your liking.server:
  host: "127.0.0.1" # Use 0.0.0.0 to allow access from other machines
  port: 8080

storage:
  files_dir: "my_files" # The directory to store and serve files from

defaults:
  theme: "ace/theme/chrome"
  font_size: 14
Build and run in development mode:This will run the application directly from the source.cargo run
Build a release binary:For deployment, create a highly optimized, standalone executable.cargo build --release
The final binary will be located at target/release/ace-WebUI. You can copy this binary and your config.yaml file to your server to deploy.🖥️ UsageStart the application.Open your web browser and navigate to the address shown in the terminal (e.g., http://127.0.0.1:8080).Use the file tree on the left to navigate your server's files (as defined by files_dir in your config).Click on a file to open it in the editor.Use the buttons in the top-right to save files, change settings, or load a file from your local computer.The status bar at the bottom will show the currently loaded file and indicate unsaved changes with an asterisk (*).
