#  Ace-Editor Web-UI Built in Rust

> [!NOTE]
> This is the beta branch for the upcoming 0.1.0 release. Currently the entire project is been re-written from vanilla JS to ALpineJS+TailwindCSS for better performance and maintainability.

## Current Version: 0.0.10 Beta
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/R-KL/ace-WebUI)]()
A high-performance, standalone, self-hosted code editor powered by a Rust backend and a modern web component frontend. The entire application compiles into a single binary for easy deployment.

## About The Project

Ace-Editor Web-UI is a full-stack web application providing a browser-based code editing environment. Designed to be lightweight and portable, it offers a fast alternative to heavier IDEs for quick client-side file editing. The backend uses [Axum](https://github.com/tokio-rs/axum) for speed and safety, while the frontend features [Ace Editor](https://ace.c9.io/) and a dependency-free Web Component for the file tree.

All web assets (HTML, CSS, JavaScript) are embedded into the Rust executable at compile time, so deployment is as simple as copying a single file.

## To Do (0.1.0)
- [x] **Add File System API**
- [x] **Add Terminal  Functionality**
- [x] **Add File Tree**
- [x] **Add Renderer for Markdown Files**
- [x] ~**Maybe Add Latex and Typst Support**~ (For now, math can be rendered in markdown using LaTex syntax and the TeMML library)
- [ ] **Add the backend with the same features released last time**

## To Do Next Release (0.2.0)

- [ ] **Add SSH support**
- [ ] **Add add circuit rendering in markdown...**
- [ ] **Add multiple tabs using the ace createEditSession function.**
- [ ] **Add a few available compilers for client side code execution.**
- [ ] **Add Git...integration, either using ssh or pure JS libraries.**
- [ ] **User Auth and maybe code encryption using Web Crypto API.**
- [ ] **Try adding real time collaboration using WebRTC or WebSockets. (not Sure if Possible)**

## Tech Stack

**Backend:**
- [Rust](https://www.rust-lang.org/)
- [Axum](https://github.com/tokio-rs/axum)
- [Tokio](https://tokio.rs/)
- [Serde](https://serde.rs/)
- [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed)

**Frontend:**
- HTML5 / Tailwind CSS / Alpine.js
- [Ace Editor](https://ace.c9.io/)
- [Marked](https://marked.js.org/) for Markdown rendering
- [TeMML](https://temml.org/) for math rendering in markdown
- [xterm.js](https://xtermjs.org/) for terminal emulation


## More details will be added when this is complete.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the following open-source components:

| Component    | License         | Notes                                                                                                          |
|--------------|-----------------|-----------------------------------------------------------------------                                         |
| [Ace Editor](https://ace.c9.io/) | BSD-3-Clause    | Embedded in `web/ace/ace.js`. License headers are preserved in source files.               |
| [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed) | MIT/Apache-2.0 | Used to embed static assets into the Rust binary.                        |
| [Marked](https://marked.js.org/) | MIT             | Used for Markdown parsing and rendering.  |
| [TeMML](https://temml.org/) | MIT             | Used for rendering mathematical expressions in Markdown.  |
| [xterm.js](https://xtermjs.org/) | MIT             | Used for terminal emulation.  |

> **Note:** All third-party licenses are respected. No modifications have removed or altered their original license notices.

