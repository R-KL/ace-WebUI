#  Ace-Editor Web-UI Built in Rust
## This is the Beta (I know its saying Alpha, thats my mistake) Branch . The Entire fontend is being rewritten in Alpine.js and tailwindcss for better UI/UX features and to add more functionality in future releases.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/R-KL/ace-WebUI)]()
A high-performance, standalone, self-hosted code editor powered by a Rust backend and a modern web component frontend. The entire application compiles into a single binary for easy deployment.

## About The Project

Ace-Editor Web-UI is a full-stack web application providing a browser-based code editing environment. Designed to be lightweight and portable, it offers a fast alternative to heavier IDEs for quick client-side file editing. The backend uses [Axum](https://github.com/tokio-rs/axum) for speed and safety, while the frontend features [Ace Editor](https://ace.c9.io/) and a dependency-free Web Component for the file tree.

All web assets (HTML, CSS, JavaScript) are embedded into the Rust executable at compile time, so deployment is as simple as copying a single file.

## To Do
- [ ] **Add File System API**
- [ ] **Add Terminal  Functionality**
- [ ] **Add File Tree**
- [ ] **Add Renderer for Markdown Files**
- [ ] **Maybe Add Latex and Typst Support**
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

## More details will be added when this is complete.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the following open-source components:

| Component    | License         | Notes                                                                                                          |
|--------------|-----------------|-----------------------------------------------------------------------                                         |
| [Ace Editor](https://ace.c9.io/) | BSD-3-Clause    | Embedded in `web/ace/ace.js`. License headers are preserved in source files.               |
| [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed) | MIT/Apache-2.0 | Used to embed static assets into the Rust binary.                        |

> **Note:** All third-party licenses are respected. No modifications have removed or altered their original license notices.

