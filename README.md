#  Ace-Editor Web-UI Built in Rust

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
  - Or direct file editing ( in alpha version )
- ⚙️ **External Configuration:** Settings managed via a simple `config.yaml` file.
- 💅 **Modern UI:** Clean, dark-themed, responsive two-panel layout.
- **Sharing Features ( alpha version ):** The ace WebUI has option to share the code has url. [for example click me](https://r-kl.github.io/ace-WebUI/#PwYw9gJgpgvAYgEQQUQIIElUGtkBcDuc+AQgEYCKAsgOwAWUqtA5gJr4DSpT7mAtgAwhUATibJqTBAEcA8qgBKAV1TswAYQDKqCAHEAntXLsArAC9aAQyzEATKko2mxUwBVF8vUW0APdACl8PWJiJgA7Wm9UHQBmBFpiGQQACSTkABYAdTS-MAAFVGJcgFUAB2jiACcNEtQAOQsWKABLXMpaaKwAZzUMzrBUfgAtJup8UwAONNRUGWN2DShcHSleNQArWjSdOBY1dAAbCgB6JKasP0VyYlp2clRcVZYrOHZ2Qfw0mygXcgydtJASVQaWMlCYAGo9AhQgA1DS5PR+Cy4NRfArINQIGHEPQFIS5FwIYyoNT8B5gTroULsEAo0zkEqUXIsGQyShkyimBD9FT8JhqCx8tQgdBODToHBNKJTJgAN06TXBJPYazGnVItQAjEwSSV0LJaDI0nFwUlvGo-H4YTJyLU-Fh+EliEUwZRaiU0rc4CEwGBaBBEAx0GlrlgpLQjvsQAA2fZwJgADVopj8gxqcCS6DWcEoYBACCmcAsIEGqHGuTWg2QwdLinm5EIyHwtE6+fG8h06AsCCw7HkxEG8g47EoTVYyHIaUo9jgejULiYFgsqF4yCwehAWHQtHk7DgLnQpHQLFq5G7YBK2JKKCY+HwqBYCeQyFCAOQTWjNtCajU5HIYH4GRNT0XgNCaBNwV3DQEwTe5iHwTVeCwXJQnBGwYXQdBKHwI41CwI4NxsFx8CkAAZHUkj8Ip41IXY-AgZBNQQJhOlImEoAyfByB-FxcgqLAdXYEkiiYOwkMEO5ZR0WhwWQOA6wTRQ1lQAAzYheGjCpjFI3J8CZJ1cGA4QMgsI5yB0EgdGmbDxn4dAMg0EA4HItZSE6aZomYVBSIkUjSIgWVNTSQYoH4WooAQaMVNYNQpHGaYVN42UVOzI5UAQKBozgbS0tlaINAqWoVNQNY0gqdA4HStRkDctJFCaBA4GQFTQnGaLiHkNIqFQO4EG8UxSFoX4tFPJC4G8KEoCKbxwxYUi0jQFwZBKTpQIGIEEBEixaD0WpnSSEp5CwXBUDAUg4R0LAGykHQmHITVKGrPsbATc4RIXVMoHwaMXEoTVpnGWgmXIDQQbUMAmH4XgmCKQZ+GiGFyBkPwHMUZcQEu0j5DkMq1hHMAMiYFpkJWphLFqaIbCKTjVqwaKMmmHRCYTNROiKNImHkIp4I0NRubSDRkEoOBamQbxSFQOB5A0DRiCwFxkFlXJ0CgbwNH4UghFQVJjFCMBKBhQZEb-KR2AsKBanvLBBiCIF0BAHUYCdgAyXhIFgEo9FwWgwFCZ3vagXhYAsXhSCaCxQhAKAgA). Also here is another [example](https://r-kl.github.io/ace-WebUI/#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-hkwgYQBIoLA0NtAeEiI-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-VMkwhuYSAjowxdBrSYR4g+MwR-ttAExvcC6p89QkA67L8zEBCCwCo4PKAVBQoSwjl0h2uIA9hEMChU8E1+gMA9g2DGR+ApXcQZQQBYrnh0geABp8A6hKBt1vQjk02vB140ByChhZz8pgJdsYNQgQB8A5jL4AQ6T+dLDmASBjBAZmhsnzqyAdOoA6gkB9wgq6gq0KlvbtBRAqODkmgN5YQwtucSKkM6SaA69thjFi0wBCeoBvihD2AD0bcfkyAZQVBaamADEh52BWAL3thOA1Yqx6lvQIAsBkzcQdfnTIwmAPAlV0XOAhI4B206xRBgIMBsAeAUBLgYS2sbj1AEADkHe6BHFYN8AUAggPxjAPJ5B8B9hI8mggh5xfnuLjYghm4FfRfoN8wwTsAqxl3K11ANp+w0Aj5mB0gqUia7fr9XQwBHBWUVAFeEAehjQgGDyas0w0BWQg2kA4QrM4RBMq-vtvsS-brbq4RSwoBjBVg6hHBLONA7yyB515BCptCMd4hs-vTDO3Q8gvKUgvAwAehyE0AmBT7WBth-uwOZY+NjQlT7GcAPAehu5ZAQukZhGcBdUzJookjlh7i2eIA6hBB4hjA1q-hfhWvYwIecALYCACgkPAW5o2hCeQEwgsBhBooTAD8GMiUA5hPguuD8EoEmQfhiaZkOfhAB4JhASAmSdQKyH1Ig1fAvzUas10nRuBY27vc1tICwD0B3oMoOAOhEFIXhgonBbQBjACjLRNgitBvm4AUAyJ+cGwFEBYDMawFtqA7JgFEFLKSBBAO+bOD3DcCd44AQwbPhuECRfApw8YG0NLABDc1OAA7GgG4F2wbh0gPzNAOoA9hcVBAdYO1NnCGDHREgk1DKDrFkBeAmANALYKyGMCOAhgHgMIIeVZD2ReA+mMIJYTKw0BGA+YLACAAW5VEEAuKegb4B4Awhngs5TaGMx6A4Ri4hbDcNoFoLGBOgqIAlLN0KTVpJoFiTbCalEBKB3qoFMqjSHiCiB6AwmSgPqgV6H5dWUQluOkGhgmIiB1wEdiGlIFvVvqfWY1uABsiOIyq0KZ9BNxoDXB6Amgb6p2CgD7YEAguNZmpSCDqAhg7KKsAgA3TxAi6sgPIEXF0DbBCglqCwG4DKqJRGI-MT6sIEigpAQChcD2OQlIAQBfAUQbwroFKJ0AbkCVOWNgC7Y4coQ3oZ4MIGMAbAQs7oCwNVzpSsBUhizSgLC2kFfByy6rVUAeEihgYXUvwXAjtzpToxVuFgAoOMxQCRQQqF0eAjukTyKAOA9gOMkoAgBWIwgEeRcsYAPgoBzYeGSYIaFehhB1A8QM2BuF0ApAnsZ-eoNa37C0IIA+ANALsAwC-B-A1ITmOoCyiVBtgLKb0CAGkjMpP6+0dGiQBs73Jng8QKkFEAQAfh+YZ6AkLdDkgjULyWAegvbTqCsIJu2yZjMYkNgfhvQugFQCDFkB1BtI6QidD4iZ71A7QEAHgLPHUqdtb8jga9LxQ8CnFdAQwVCiuBwBhA60vwXCvlgiaQ4QAglXfvVA3AfgJ6imQQOUggBDBIkxWKnlVnd6sB4gIopgDCnoAiiIAIINABAHxrARkcDDHIKIE5FKBtgA0G2jQBQA1JpAn9KqIGFEBwUbWTgRAOrk7byNV+ebdIBPXoGi5C2NAYCPOJFK7Ik8ExVkD0H4QkANwGAQQEuhkz6RWQbgJQLoB07qAakdhCwJFC7TqgaslgZAlJQE46VDgPAMYt6GaqZwggA5NwFADrQgAlgTALAP91MqrF5ALnDANsCn4pp1SJAbuoqNBKQpWQeQD2PeAsQUptA1tfAPygoBhpfA0gQWD5RejNIKUXaXoJFGySsg4wywD4KASYDqhvQKgD7EJWRhqxdAPE46EjDIB1wUAZiJ5HBRgyihOQKPPYIIGVGshfm3ob0MHXWBNAY6uSMAAmmWHPBZA35NwJvVhGyE563oFsPEHkSzhIgxgBsUcOOIyZ4xC4djqagVCL1EgywIIJQAXj+hlgXwHJsknIz6xZA0QVFukH4ofhmqnYbEumOWBDAQqKxVoSAAn5hBKAmQX6DwEGKDEgwOsEbI4FYDBDwCVNV6EuEcBYAmATPYuHIzCJKAm0AWZYFxHC5uAKIjgOAPQGECKoaAhcJwk0ATC8hUYPCTUH50ZBBAqsbIMmBgC+B5AdSYHRMP0A3CTFti3pMCWsjqDdQUgslCwFABYAbQQEMYHAGwAUIBIZQTQb0FFhEpuAc49sYQHC3dQfgogazJySACCDMcCQrINIHEQUL+CCcqbF0MqOoCRp5gYNbakEH+j4ATh6QUzr8FMlWjpUbECAJ+nRZRAlwrmXzORSYBwAjIcQdUioC5DeY841pW6poHA5jJRE2gf3mBIBw-TkwpOZYSihtA9AFaIsZYBY2Aj0gDp0DZqqyBwD+SQAugAJFECQ70UUUSlWNmlGKL0AaAggTbE1CBRaM4AogCAHoG36ZkJCD2YyKWEEDehUqjiU8lAD2BPMWcUAa6CAQDEsQDYNAQSW2CWqtEtJtwbzIxDB4RoyAuo1WXdJtLxAmETQFIOoBhDqkHsH4F-MsD2DoB74VWFuNEj64I4B+3odGH8mHTGBzgrAGrqbPAA9AiBcLe2GQFFyBNtgvYysCW0EDqAde3uCCDKCwDYlvQUQFQJoG16iA-kfXBdo9LyDegSorYHQMJiCAvUZGAqfibeXURaNZAUQQYEwFvZLgPwmIIIKLhMnPiSA6QR-H4zlkfBwQeHHgN6EwzbTTkEeGcG+PP5QFEg2wb0Lb0EmK5RAUAIZHRBSCC0cmlAL4KaCgBBBng5kratIC7YIBr58cZBN6CgDllgIQwKIKwDileBLcrGN0DkyGSsB0g7UczNtTqAvRVo4fCAHUSxgg0cABSbSd6FEDDpQOFAGoLeGfkvR4gP0mRo+3kCORNARWRBhXM7YIzvQw6QQNmlIoAiJuK0H8RAA3BwA12eCn+T3XcRuAxBPFKdCADog8ANw3obuHXmLLSLEkuOFznQGAhxQUgA+Web4MghA9NQ6QOMeIURTyBWpeIHgL8CGAZRMIkUZmKIH9QX9yi8ggzvcF-D5wCU9eRxIsFZB7AcspdVLEMEPySZT6sVAUiQB+KOFOCayJQPSD4BJAeAUAeQKwHtBYwcAkUXuFjnNhWYLo2wC-Cqx-kRRIgVWWykuEii2jI6fsuoEoGoB4hZ0rQXeKIASbALLMNAMccBFZCaA9gWEPCSRTKrQiNSugUQPIA1QqAwJR9b0GpUzIsB32eQEWvrR6ChNSAOWYQFgCfL1kGw784iH8EeCUBHe1YPfruBIDUAihXgb0NpEcCMp+gSANfujhADbBbqi9S8WADPJ3gz+hRA6cYCBgsg4y8QM+rJRREZ9NgOAdWecD+waAUAaGBAIxDbQrZBoRge8S8XpYBhfAd0QRCkCXQHwNSx+CUvIARS5Ab5z-K0BHJbrIwwAbzPcNSNtDLQo0YAcAO6ynh7ZRABsdIMhLrCxIqsR4CiEMDXyqA9MhyUQLZXuxCRXg2gZqqwEJ5CUAh7vEvragsBYAzAEAbSayFZAq8rEFBeQJ8HSBuAbwvjY+munqlRBFkiAh0FFn5gIAjQvwYHPwByxuByINrGTjQHwQoovgPQCTFAAgCTBSsJUmOOGm2qzJ75ewHNN8ywDCAPwQwK2M8HZhLKhIbpL4PASYD4BKAnEYXokKxIGzFwiVJABxX4QLSK63oU1pHOHQJVimaSWGtJh24LRucugeglBSCQ6YUS-gnAEOnoaL0jcGoBFHKFcRgAvgVYRICkH7A6h4gywAzpFCGAxVvyxwegF5mVE153UU+dIAckGBq8wCg3cUH6rtgpKoAZ1OoHLihEgB1VewYMd6qoGZ4Ji7sa3PDAb5RYU444HAHAFbZVAlubyZvJmXkyqqHG+4BuHRGu47NIKSgdYaCjtpuBWKusaQIkEEx6KEAYRAHm0HErCAawoxIoN9XDBKBTMpRORJkjxqHREgFgNSsYo8BZjPR2wIBv6xpRT8B1CrP5FgDaXbAtYi9cyN6ANbsAzWE84chLifJwT9OLkKyB9VEAPY18HlN4GgFBBkpTUcuNEMMmlKsAUgzwQQMYBQC7xD8notpHwE0BtdruBshSByE+DSb5GMoEPnUzE7CBx0+AQQK2WkD6RRqVNWppfj0VNBk4yLaTOnOwXeQ9A2wa-HSU0A4BKaESfAMTB1pYAjUKgbEmaFJWaAnE2gDFqlCuRmIRV6gXLuoFbbc4ymUQYdIV3UCT0JwmgIkq6QIjIKpMRxdmIGhky-BLIJtXQMoB-lGLVs05WQNSRlDu4Wm2wdIOKDgAkQu6rIYKsgsjRMQuoI0MOejDoArzEojgZ0t5gYhYa66XMdyrdTvhD4JRGcrAIFDUBoAxZGckCkEywqaAaAGUSxN7HUAxgDMSScdW7AnlBBCujaCBpyI+AjQAwKgV5C7AkD2RYIQTOACAF8FeIasqMN0njGXDkJ0gJAJEh0Bew0BYqG4JgJkUohfBomQwYMNcyGBxTa0FSMsDLkhQdTWyugeQB4BOwM1Baq0kAHkGB785UCsQIfKeGeDhc3gJAJCOcir6NVA5GUuDsYARYBy4SjEDwBrDB5BUeAUGbwkSi2CyhpMsgTmALolDulh80kRlFwoQC-dbqPydEXwDgDyA-GX1CeHAxC7aB6AdTS6Imxq4YAzGMoctG70ZgextAe-PkfGQuQuBmtd-OAPNNPLjoVq6urAL4CIpwVwN+RJyuGniCQCbY9eOGFR1-CPs6A66sIKB3uA0jRedQJoKoT94xwOoCAGAPHoABkXg6ADAFTg+DKAIAY+BBAT1uFXEsACAOZwHLaBjAQAA) that shows the javascript code used to build this 
  > Note that this method encodes the entire code in url and for larger codes, the url will be ugly long,
  >  but works for atleast 22,000 lines of code
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

| Issue                              | Solution                                                                                               |
|-------------------------------------|---------------------------------------------------------------------------------------------------    |
| `config.yaml` not loading properly  | Ensure the template matches the expected format and that `config.yaml` is in the working directory.   |
| Website appears offline             | Verify firewall settings allow traffic on the configured port in `config.yaml` (or the default port). |
| Settings not saved persistently     | Confirm the working directory has write permissions.                                                  |

## Configuration

All settings are managed in the `config.yaml` file.

| Section    | Key         | Type     | Description                                                                           |
|------------|-------------|----------|-----------------------------------------------------------------------------          |
| `server`   | `host`      | String   | The IP address to bind the server to. `127.0.0.1` for local, `0.0.0.0` for public.    |
| `server`   | `port`      | Number   | The network port the server will listen on.                                           |
| `server`   | `base_path` | String   | Useful when reverse proxying the website under a subpath (e.g., website/base_path).   |
| `storage`  | `files_dir` | String   | The path to the directory where user files will be stored and served from.            |
| `defaults` | `theme`     | String   | The default Ace Editor theme for first-time users (e.g., `ace/theme/monokai`).        |
| `defaults` | `font_size` | Number   | The default font size for first-time users.                                           |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Third-Party Licenses

This project uses the following open-source components:

| Component    | License         | Notes                                                                                                          |
|--------------|-----------------|-----------------------------------------------------------------------                                         |
| [Ace Editor](https://ace.c9.io/) | BSD-3-Clause    | Embedded in `web/ace/ace.js`. License headers are preserved in source files.               |
| [Rust-Embed](https://git.sr.ht/~pyrossh/rust-embed) | MIT/Apache-2.0 | Used to embed static assets into the Rust binary.                        |

> **Note:** All third-party licenses are respected. No modifications have removed or altered their original license notices.

