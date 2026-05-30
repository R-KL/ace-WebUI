import "./style.css";
import Alpine from "alpinejs";
import lz from "lz-string";
window.Alpine = Alpine;
const iconCache = new Map();
Alpine.store("meta", {
  version: "0.0.10",
})
Alpine.store("ace", {
  editor: null,
  decOpacity: false,
  isUrl: false,
  save: false,
  excc: null,
  openfile: false,
  render: false,
  openMode: "fileinput",
  fileHandle: null,
  languageSelected: null,
});
Alpine.store("marked", {
  markedPreviewOpen: false,
  previewButton: false,
  ack: false,
});
Alpine.store("bottomBar", {
  move: false,
});
Alpine.store("ft", {
  move: false,
  mode: null,
  ftjs: null,
  async init() {
    if (this.ftjs) return;
    this.ftjs = await import("./filetree.js");
  },
  open() {
    this.move = !this.move;
    //const ft = document.getElementById("file-tree-container");
  },
});
Alpine.store("settingsMenu", {
  open: false,
  urlmode: false,
  MAP: { // Thanks ACE for the non-intutive naming convention used in ext-settings_menu.js....
    // Once with _ are mapping exceptions that has to be handled manually.
    theme: "_theme",
    mode: "_mode",
    key_binding: "KeyBinding",
    font_size: "fontSize",
    soft_wrap: "wrap",
    cursor: "cursorStyle",
    folding: "foldStyle",
    soft_tabs: "_tabSize",
    overscroll: "_scrollPastEnd",
    atomic_soft_tabs: "navigateWithinSoftTabs",
    enable_behaviours: "behavioursEnabled",
    wrap_with_quotes: "wrapBehavioursEnabled",
    auto_indent: "enableAutoIndent",
    full_line_selection: "_selectionStyle",
    highlight_active_line: "highlightActiveLine",
    show_invisibles: "showInvisibles",
    show_indent_guides: "displayIndentGuides",
    highlight_indent_guides: "highlightIndentGuides",
    persistent_hscrollbar: "hScrollBarAlwaysVisible",
    persistent_vscrollbar: "vScrollBarAlwaysVisible",
    animate_scrolling: "animatedScroll",
    show_gutter: "showGutter",
    show_line_numbers: "showLineNumbers",
    relative_line_numbers: "relativeLineNumbers",
    fixed_gutter_width: "fixedWidthGutter",
    print_margin: "_printMarginColumn",
    indented_soft_wrap: "indentedSoftWrap",
    highlight_selected_word: "highlightSelectedWord",
    fade_fold_widgets: "fadeFoldWidgets",
    use_textarea_for_ime: "useTextareaForIME",
    merge_undo_deltas: "_mergeUndoDeltas",
    read_only: "readOnly",
    copy_without_selection: "copyWithEmptySelection",
    live_autocompletion: "enableLiveAutocompletion",
    custom_scrollbar: "customScrollbar",
    use_svg_gutterlines: "useSvgGutterIcons",
    annotate_folded_lines: "showFoldedAnnotations",
    keyboard_accessibility: "enableKeyboardAccessibility",
    gutter_tooltip_follows_mouse: "tooltipFollowsMouse",
  },
  toDb() {
    const editor = Alpine.store("ace").editor;
    const Aceoptions = editor.getOptions();
    let dbObject = {};
    for (const [dbKey, aceKey] of Object.entries(this.MAP)) {
      if (!aceKey.startsWith("_")) {
        const value = Aceoptions[aceKey];
        dbObject[dbKey] = value;
      } else {
        if (aceKey === "_printMarginColumn") {
          if (Aceoptions.showPrintMargin) {
            dbObject["print_margin"] = Aceoptions.printMarginColumn;
          } else {
            dbObject["print_margin"] = 0;
          }
        } else if (aceKey === "_theme") {
          dbObject[dbKey] = Aceoptions.theme.replace("ace/theme/", "");
        } else if (aceKey === "_mode") {
          dbObject[dbKey] = Aceoptions.mode.replace("ace/mode/", "");
        } else if (aceKey === "tabSize") {
          dbObject[dbKey] = Aceoptions.useSoftTabs ? Aceoptions.tabSize : 0;
        } else if (aceKey === "_scrollPastEnd") {
          dbObject[dbKey] = Aceoptions.overscroll == 0 ? null : Aceoptions.overscroll == 0.5 ? "half" : "full"; // 0 for None, 0.5 for half, 1 for full screen, defaults to full, if other.
        } else if (aceKey === "_selectionStyle") {
          dbObject[dbKey] = Aceoptions.selectionStyle === "line" ? true : false; 
        } else if (aceKey === "_mergeUndoDeltas") {
          dbObject[dbKey] = Aceoptions.mergeUndoDeltas === "always" ? "always" : Aceoptions.mergeUndoDeltas === true ? "timed" : "never"; 
        }
    }

    }
    return dbObject;
  },
  toAce(dbObject) {
    const editor = Alpine.store("ace").editor;
    let aceOptions = {};
    for (const [dbKey, aceKey] of Object.entries(this.MAP)) {
      if (dbKey in dbObject) {
        if (!aceKey.startsWith("_")) {
          const value = dbObject[dbKey];
          aceOptions[aceKey] = value;
        } else {
          if (aceKey === "_printMarginColumn") {
            if (dbObject["print_margin"] > 0) {
              aceOptions["showPrintMargin"] = true;
              aceOptions["printMarginColumn"] = dbObject["print_margin"];
            } else {
              aceOptions["showPrintMargin"] = false;
            }
          } else if (aceKey === "_theme" && !this.urlmode) {
            aceOptions["theme"] = "ace/theme/" + dbObject[dbKey];
          } else if (aceKey === "_mode" && !this.urlmode) {
            aceOptions["mode"] = "ace/mode/" + dbObject[dbKey];
          } else if (aceKey === "tabSize") {
            aceOptions["tabSize"] = dbObject[dbKey] > 0 ? dbObject[dbKey] : 4; // Default to 4 
            aceOptions["useSoftTabs"] = dbObject[dbKey] > 0 ? true : false;
          } else if (aceKey === "_scrollPastEnd") {
            aceOptions["scrollPastEnd"] = dbObject[dbKey] === null ? 0 : dbObject[dbKey] === "half" ? 0.5 : 1;
          } else if (aceKey === "_selectionStyle") {
            aceOptions["selectionStyle"] = dbObject[dbKey] ? "line" : "text";
          } else if (aceKey === "_mergeUndoDeltas") {
            aceOptions["mergeUndoDeltas"] = dbObject[dbKey] === "always" ? "always" : dbObject[dbKey] === "timed" ? true : false;
          }
        }
      }
    }
    return aceOptions;
  },
  toggle() {
    this.open = !this.open;
  }
});
Alpine.store("opfs", {
  currentDir: "/",
  path: "",
  opfs: null,
  initialized: false,
  ftjs: null,
  async init() {
    this.opfs = await import("./opfs.js");
    this.initialized = true;
  },
  getPath(name) {
    if (name.startsWith("/")) return name;
    const base = this.currentDir.endsWith("/")
      ? this.currentDir
      : this.currentDir + "/";
    return (base + name).replace(/\/+/g, "/");
  },
  async ls(path = null) {
    if (!path) path = this.currentDir;
    const entries = await this.opfs.listDir(path);
    return entries;
  },
  async cd(path) {
    let segments = this.currentDir.split("/").filter(Boolean);
    path
      .split("/")
      .filter(Boolean)
      .forEach((part) => {
        if (part === "..") segments.pop();
        else if (part !== ".") segments.push(part);
      });

    const target = "/" + segments.join("/");
    const exists = await this.opfs.dirExists(target);
    if (exists) {
      this.currentDir = target;
    } else {
      console.warn("Path not found:", target);
    }
  },

  async mkdir(name = "NewFolder") {
    const fullPath = this.getPath(name);
    await this.opfs.mkdir(fullPath);
    console.log("Created directory at:", fullPath);
  },
  async touch(name = null, path = this.currentDir, content = "") {
    const fullPath = this.getPath(path) + "/" + (name || "NewFile.txt");
    await this.opfs.writeFile(fullPath, content);
    console.log("Created file at:", fullPath);
  },
  async rm(path, recursive = false) {
    const fullPath = this.getPath(path);
    try {
      if (await this.opfs.dirExists(fullPath)) {
        await this.opfs.deleteDir(fullPath, recursive);
        console.log("Deleted directory at:", fullPath);
      } else {
        await this.opfs.deleteFile(fullPath);
        console.log("Deleted file at:", fullPath);
      }
    } catch (e) {
      console.warn("[FS] Error: " + e);
    }
  },
  async writeFile(name = "NewFile.txt", content = "") {
    const fullPath = this.getPath(name);
    await this.opfs.writeFile(fullPath, content);
    console.log("File saved to:", fullPath);
  },
  async readFile(path = null, name = null) {
    if (!path) {
      const fullPath = this.getPath(name);
      path = fullPath;
    }
    const content = await this.opfs.readFile(path);
    return content;
  },
  async getTreeJson(dirHandle = null, currentPath = "") {
    // If no handle provided, start at root
    if (!dirHandle) {
      dirHandle = await this.opfs.getRoot();
    }

    const children = [];

    // Iterate over all entries in this directory
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath =
        currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;

      const node = {
        name: name,
        kind: handle.kind, // 'file' or 'directory'
        path: fullPath,
      };

      if (handle.kind === "directory") {
        // Recursively build children for directories
        node.children = await this.getTreeJson(handle, fullPath);
      }

      children.push(node);
    }

    // Optional: Sort folders first, then files
    return children.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === "directory" ? -1 : 1;
    });
  },
  exec(excc) {
    const store = Alpine.store("opfs");
    excc("fs", {
      async help() {
        return (
          "\r\nfs is a crude implementation of Linux file system commands for OPFS\r\n" +
          "Available commands:\r\n" +
          "   fs cd <path> - Change directory to <path>\r\n" +
          "   fs ls [path] - List files in [path] or current directory\r\n" +
          "   fs mkdir <name> - Create a new directory with <name>\r\n" +
          "   fs rm <path> [-r] - Remove file or directory at <path>, use -r for recursive delete\r\n" +
          "   fs touch [path] [name] - Create a new empty file with [name] in [path] or current directory\r\n"
        );
      },
      async cd(path) {
        await store.cd(path);
        return path;
      },
      async ls(path) {
        const entries = await store.ls(path);
        if (!entries || entries.length === 0) return "Empty directory";
        return entries
          .map((item) => {
            const icon = item.kind === "directory" ? "📁" : "📄";
            return `${icon} ${item.name}`;
          })
          .join("\r\n");
      },
      async mkdir(name) {
        await store.mkdir(name);
        return name;
      },
      async rm(path, r) {
        if (!path) return;
        if (r === "-r") r = true;
        else r = false;
        await store.rm(path, r);
        return path + " removed";
      },
      async touch(name = null, path = this.currentDir, content = "") {
        await store.touch(name, path, content);
        return name ? name : "NewFile.txt";
      },
    });
  },
  makeItRoot(inputPath) {
    return {
      name: "root",
      kind: "directory",
      path: "/",
      children: inputPath,
    };
  },
  async drawOPFSFileTree(container = null) {
    if (!this.initialized) {
      await this.init();
    }
    const children = await this.getTreeJson();
    const treeJson = this.makeItRoot(children);
    console.log("Generated OPFS file tree JSON:", treeJson);
    //   console.log("Container element:", container);
    try {
      if (!this.ftjs) {
        Alpine.store("ft").init();
        this.ftjs = Alpine.store("ft").ftjs;
        console.log("accquired filetree.js");
      }
    } catch (e) {
      console.error("Failed to load filetree.js:", e);
      return;
    }
    if (!container) container = document.getElementById("file-tree");
    this.ftjs.init(container, this.onDblClick.bind(this), true);
    this.ftjs.ftClear();
    this.ftjs.render(treeJson, container);
    this.contextMenuObject = {
      "New File": async (path) => {
        if (this.getPath(path)) {
          const fileName = prompt("Enter new File Name", "NewFile.txt");
          if (fileName) {
            this.touch(fileName, path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      "New Folder": async (path, _kind) => {
        if (this.getPath(this.currentDir)) {
          const folderName = prompt("Enter new Folder Name", "NewFolder");
          if (folderName) {
            this.opfs.mkdir(path + "/" + folderName).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      /*  "Cut": (path, kind) => {
                  if (kind === "directory") return; // Later add ability to cut entire directories
                  if (this.getPath(path)) {
                      if (this.opfs.exists(path)) {
                          const editor = Alpine.raw(Alpine.store('ace').editor);
                          const value = editor.getValue();
                          console.log("Cutting File:", value);
                          navigator.clipboard.writeText(value).then(() => {
                              console.log("File content copied to clipboard ( for now its same has copying )");
                          });
                      }
                  }
              }, */
      "Copy ": () => {
        alert(
          "Copying File ( this has not been implemented yet, will do it later",
        );
      },
      Paste: async () => {
        alert(
          "Pasting File ( this has not been implemented yet, will do it later",
        );
      },
      Rename: async (path, _kind) => {
        if (this.getPath(path)) {
          if (this.opfs.exists(path) || this.opfs.dirExists(path)) {
            const newValue = prompt("Enter new File Name");
            let last = path.split("/");
            last.pop();
            last = last.join("/");
            console.log(last + "/" + newValue, "\n");
            this.opfs.move(path, last + "/" + newValue).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      Delete: async (path, _kind) => {
        const part = path.split("/");
        const name = part.pop();
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        if (this.getPath(path)) {
          if (this.opfs.dirExists(path)) {
            ``;
            this.opfs.deleteDir(path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          } else if (this.opfs.exists(path)) {
            this.opfs.deleteFile(path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
    };
    this.ftjs.contextMenu(container, this.contextMenuObject);
  },
  async onDblClick(path, kind) {
    if (kind === "directory") {
      Alpine.store("opfs").currentDir = path;
      return;
    }
    const container = document.getElementById("file-tree");
    container.dispatchEvent(
      new CustomEvent("update-msg", {
        detail: { msg: `[OPFS] Opening file: ${path}` },
        bubbles: true,
      }),
    );
    let content = await this.readFile(path);
    Alpine.store("ace").editor.setValue(content, -1);
    Alpine.store("ace").editor.session.setMode(
      ace.require("ace/ext/modelist").getModeForPath(path).mode,
    );
    Alpine.store("ace").openMode = "opfs";
    this.currentDir = path.substring(0, path.lastIndexOf("/"));
    this.path = path;
  },
});
Alpine.store("backend", {
  ftjs: null,

  async init() {
    if (!this.ftjs) {
      try {
        await Alpine.store("ft").init();
        this.ftjs = Alpine.store("ft").ftjs;
      } catch (e) {
        console.warn("Failed to load filetree.js:", e);
      }
      this.initialized = true;
    }
  },
  async drawFileTree(container = null) {
    if (!this.ftjs) {
      await this.init();
    }
    const treeJson = await fetch("/api/fs/get_file_tree", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: "/" }),
    }).then((res) => res.json());
    console.log("Generated OPFS file tree JSON:", treeJson);
    console.log("Container element:", container);
    if (!container) container = document.getElementById("file-tree");
    this.ftjs.init(container, this.onDblClick.bind(this), true);
    this.ftjs.ftClear();
    this.ftjs.render(treeJson, container);
    this.contextMenuObject = {
      "New File": async (path) => {
        alert("I will implement this later");
        return;
        if (this.getPath(path)) {
          const fileName = prompt("Enter new File Name", "NewFile.txt");
          if (fileName) {
            this.touch(fileName, path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      "New Folder": async (path, _kind) => {
        alert("I will implement this later");
        return;
        if (this.getPath(this.currentDir)) {
          alert("_will implement later");
          return;
          const folderName = prompt("Enter new Folder Name", "NewFolder");
          if (folderName) {
            this.opfs.mkdir(path + "/" + folderName).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      /*  "Cut": (path, kind) => {
                  if (kind === "directory") return; // Later add ability to cut entire directories
                  if (this.getPath(path)) {
                      if (this.opfs.exists(path)) {
                          const editor = Alpine.raw(Alpine.store('ace').editor);
                          const value = editor.getValue();
                          console.log("Cutting File:", value);
                          navigator.clipboard.writeText(value).then(() => {
                              console.log("File content copied to clipboard ( for now its same has copying )");
                          });
                      }
                  }
              }, */
      "Copy ": () => {
        alert(
          "Copying File ( this has not been implemented yet, will do it later",
        );
      },
      Paste: async () => {
        alert(
          "Pasting File ( this has not been implemented yet, will do it later",
        );
      },
      Rename: async (path, _kind) => {
        alert("I will implement this later");
        if (this.getPath(path)) {
          if (this.opfs.exists(path) || this.opfs.dirExists(path)) {
            const newValue = prompt("Enter new File Name");
            let last = path.split("/");
            last.pop();
            last = last.join("/");
            console.log(last + "/" + newValue, "\n");
            this.opfs.move(path, last + "/" + newValue).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
      Delete: async (path, _kind) => {
        alert("I will implement this later");
        return;
        const part = path.split("/");
        const name = part.pop();
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        if (this.getPath(path)) {
          if (this.opfs.dirExists(path)) {
            return;
            this.opfs.deleteDir(path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          } else if (this.opfs.exists(path)) {
            this.opfs.deleteFile(path).then(async () => {
              this.ftjs.update(this.makeItRoot(await this.getTreeJson()));
            });
          }
        }
      },
    };
    this.ftjs.contextMenu(container, this.contextMenuObject);
  },
  async onDblClick(path, kind) {
    if (kind === "directory") {
      Alpine.store("backend").currentDir = path;
      return;
    }
    const container = document.getElementById("file-tree");
    container.dispatchEvent(
      new CustomEvent("update-msg", {
        detail: { msg: `[Backend] Opening file: ${path}` },
        bubbles: true,
      }),
    );
    let content = await fetch("/api/fs/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
    content = await content.text();
    Alpine.store("ace").editor.setValue(content, -1);
    Alpine.store("ace").editor.session.setMode(
      ace.require("ace/ext/modelist").getModeForPath(path).mode,
    );
    Alpine.store("ace").openMode = "backend";
    this.currentDir = path.substring(0, path.lastIndexOf("/") || "/");
    this.path = path;
  },
});
Alpine.data("AceApp", () => ({
  menuCloseButton: false,
  loading: true,
  async init() {
    const editor = ace.edit("editor");
    this.editor = Alpine.raw(editor);
    Alpine.store("ace").editor = Alpine.raw(editor);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/text");
    this.$store.ace.languageSelected = this.editor.session.$modeId.replace(
      "ace/mode/",
      "",
    );
    this.editor.setFontSize(17);
    this.initSettingsMenu();
    this.editor.on("changeMode", () => {
      this.$store.ace.languageSelected = this.editor.session.$modeId.replace(
        "ace/mode/",
        "",
      );
      this.$dispatch("update-msg", {
        msg: `Using language "${this.$store.ace.languageSelected}"`,
      });
      this.markDownMode();
    });
    Alpine.store("ace").excc = (excc) => {
      excc("editor", {
        app: this,
        editor: this.editor,
        help() {
          const helpText =
            "Editor Commands:\r\n" +
            "version - Show the current version of the editor\r\n" +
            "prompt - Open the prompt dialog\r\n" +
            "openSettings - Open the settings menu\r\n" +
            ":<line_number> - Go to the specified line number (e.g., :10 to go to line 10)";
          return helpText;
        },
        version() {
          return "0.0.10";
        },
        prompt() {
          this.app.prompts();
          return "";
        },
        openSettings() {
          this.app.openSettingsMenu();
          return "opened settings menu";
        },
        ":"(lineNum) {
          if (!isNaN(lineNum)) {
            this.editor.scrollToLine(lineNum - 1, true, true, () => { });
            this.editor.gotoLine(lineNum, 0, true);
          }
        },
      });
    };
  },
  async loadSettings() {
    try {
      const res = await fetch("/api/editor/read", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const settings = await res.json();
        const aceOptions = Alpine.store("settingsMenu").toAce(settings);
        Alpine.store("ace").editor.setOptions(aceOptions);
      }
    } catch (e) {
      console.warn("Response for editor settings is not ok, using local Storage. Error:", e);
      const localSettings = localStorage.getItem("editorSettings");
      if (localSettings) {
        const settings = JSON.parse(localSettings);
        const aceOptions = Alpine.store("settingsMenu").toAce(settings);
        Alpine.store("ace").editor.setOptions(aceOptions);
      } else {
        console.warn("No local settings found either, using defaults.");
      }
    }
  },
  initSettingsMenu() {
    const editorInstance = this.editor;
    ace.config.loadModule("ace/ext/settings_menu", (module) => {
      module.init(editorInstance);
      editorInstance.commands.addCommand({
        name: "showSettingsMenu",
        bindKey: { win: "Control-,", mac: "Command-," },
        exec: () => {
          this.openSettingsMenu();
        },
        readOnly: true,
      });
    });
    this.loadSettings();
  },
  async openFile() {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      this.editor.setValue(content, -1);
    };
    if (this.$store.ace.openMode === "fsapi") {
      const picker = await showOpenFilePicker();
      console.log(picker);
      if (!picker || picker.length === 0) return;
      console.log("Opening file using File System Access API");
      const fileHandle = picker[0];
      this.$store.ace.fileHandle = fileHandle;
      const file = await fileHandle.getFile();
      if (!file) return;
      reader.readAsText(file);
      const modelist = ace.require("ace/ext/modelist");
      const mode = modelist.getModeForPath(file.name).mode;
      console.log(`Setting editor mode to: ${mode}`);
      this.editor.session.setMode(mode);
      console.log(fileHandle);
      return;
    }
    console.log("Opening file using File Input");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "*/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;
      this.$dispatch("update-msg", { msg: ` ${file.name}`, timeout: 0 });
      reader.readAsText(file);
      const modelist = ace.require("ace/ext/modelist");
      const mode = modelist.getModeForPath(file.name).mode;
      console.log(`Setting editor mode to: ${mode}`);
      this.editor.session.setMode(mode);
      document.body.removeChild(fileInput);
    });
    fileInput.click();
  },
  prompts() {
    let Aceprompt = ace.require("ace/ext/prompt");
    console.log(Aceprompt);
    Aceprompt.modes(this.editor);
  },
  initStatusBar() {
    const StatusBarObject = ace.require("ace/ext/statusbar").StatusBar;
    new StatusBarObject(this.editor, this.$el);
  },

  openSettingsMenu() {
    Alpine.store("settingsMenu").open = !Alpine.store("settingsMenu").open;
  },
  async save(filename = null) {
    if (this.$store.ace.isUrl) {
      const userContent = this.editor.getValue();
      const compressedCode = lz.compressToBase64(userContent);
      const mode = this.editor.session.$modeId.replace("ace/mode/", "");
      const theme = this.editor.getTheme().replace("ace/theme/", "");
      const render = Alpine.store("ace").render;
      const content =
        "?code=" +
        compressedCode +
        "&mode=" +
        mode +
        "&theme=" +
        theme +
        "&render=" +
        render;
      const compressed = lz.compressToEncodedURIComponent(content);
      console.log({ compressed, compressedCode, content, mode, theme });
      this.$dispatch("update-msg", {
        msg: `URL Generated  for sharing...`,
        timeout: 2000,
      });
      const newUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;
      try {
        await navigator.clipboard.writeText(newUrl).then(() => {
          alert(
            "URL copied to clipboard! Warning: Large content may not work properly due to URL length limitations. length of url rises along with code length",
          );
          this.$store.ace.isUrl = false;
          this.$store.ace.save = false;
        });
      } catch {
        alert("Couldnt Copy the url try this", newUrl);
      }
      return;
    }
    if (this.$store.ace.openMode === "opfs") {
      await Alpine.store("opfs").writeFile(
        Alpine.store("opfs").path,
        this.editor.getValue(),
      );
      this.$dispatch("update-msg", {
        msg: `File saved to OPFS as ${Alpine.store("opfs").path}`,
      });
      this.$store.ace.save = false;
      return;
    }
    if (this.$store.ace.openMode === "fsapi") {
      if (!this.$store.ace.fileHandle) {
        this.$dispatch("update-msg", {
          msg: "No file is opened to save. Please open a file first.",
        });
        return;
      }
      try {
        const writable = await this.$store.ace.fileHandle.createWritable();
        await writable.write(this.editor.getValue());
        await writable.close();
        this.$dispatch("update-msg", {
          msg: "File saved successfully using File System Access API.",
          timeout: 3000,
        });
        this.$store.ace.save = false;
      } catch (e) {
        console.error("Error saving file:", e);
        alert("Failed to save the file. See console for details.");
      }
      return;
    }
    if (this.$store.ace.openMode === "backend") {
      try {
        const response = await fetch("/api/fs/write", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: Alpine.store("backend").path,
            content: this.editor.getValue(),
          }),
        });
      } catch (error) {
        console.error("Error saving file to backend:", error);
        this.$dispatch("update-msg", {
          msg: "Failed to save the file to the backend. See console for details.",
        });
      }
      this.$store.ace.save = false;
      return;
    }
    const blob = new Blob([this.editor.getValue()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    if (!filename || filename === "Enter here...") {
      this.$dispatch("update-msg", {
        msg: " Using default filename: download.txt",
        timeout: 3000,
      });
    }
    a.download = filename || "download.txt";
    a.click();
    URL.revokeObjectURL(url);
    this.$store.ace.save = false;
  },
  async readFromUrl() {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      this.loading = false;
      return;
    }
    try {
      this.loading = true;
      const decoded = lz.decompressFromEncodedURIComponent(hash);
      const [, encodedcode, mode, theme, render] = decoded.match(
        /\?code=([^&]*)&mode=([^&]*)&theme=([^&]*)&render=([^&]*)/,
      );
      const code = lz.decompressFromBase64(encodedcode);
      console.log({ decoded, encodedcode, code, mode, theme });
      if (decoded !== null) {
        this.editor.setValue(code, -1);
        Alpine.store("settingsMenu").urlmode = true;
        this.editor.session.setMode(`ace/mode/${mode}`);
        this.editor.setTheme(`ace/theme/${theme}`);
        if (render === "true" && confirm(
          "Render on loading enabled by the url creator. \r\n" +
          "Render the markdown  now?\r\n" +
          "\r\n" +
          "Markdown rendering is done safely."
        )) {
          const { createPreview, renderPreviewMarkdown } =
            await import("./preview-engine.js");
          createPreview("Markdown Preview", false);
          renderPreviewMarkdown(code);
        }
        this.loading = false;
        setTimeout(() => {
          this.$dispatch("update-msg", {
            msg: `Decompresing #${hash.slice(0, 20)}...`,
            timeout: 4000,
          });
        }, 200);
      } else {
        console.warn("Invalid or corrupted encoded content");
      }
    } catch (e) {
      console.warn("Failed to decompress content from URL:", e);
    }
    finally {
      this.loading = false;
    }
  },
  markDownMode() {
    // this includes both markdown and html since hey they both can use the marked preview
    if (
      this.$store.ace.languageSelected === "markdown" ||
      this.$store.ace.languageSelected === "html"
    ) {
      this.$store.marked.previewButton = true;
    } else {
      this.$store.marked.previewButton = false;
      this.$store.marked.markedPreviewOpen = false;
      this.$store.ace.decOpacity = false;
    }
  },
}));
Alpine.data("settingsMenu", () => ({
  ver: "0.0.0",
  async init() {
    try {
      const OptionPanel = await new Promise((resolve) => {
        ace.config.loadModule("ace/ext/options", (module) => {
          resolve(module.OptionPanel);
        });
      });
      const panel = new OptionPanel(Alpine.store("ace").editor);
      panel.render();
      this.ver = panel.container.querySelector("#controls").lastChild.lastChild.innerHTML.replace("version", "");
      console.log("Loaded Ace OptionPanel version:", this.ver);
      panel.container.querySelector("#controls").lastChild.remove();
      this.$refs.ace_settings.appendChild(panel.container);
      this.$watch("$store.settingsMenu.open", (newVal) => {
        if (!newVal) {
          this.saveSettings();
        }
      });
      
    } catch (e) {
      console.warn("Failed to load Ace OptionPanel module:", e);
      // Fallback if the file literally doesn't exist
      Alpine.store("ace").editor.showSettingsMenu(); 
    }
  },
  open() {
    this.isOpen = true;
  },
  async saveSettings() {
    const editor = Alpine.store("ace").editor;
    const options = editor.getOptions();
    const dbObject = Alpine.store("settingsMenu").toDb(options);
    try {
      fetch("/api/editor/write", {
        method: "PUT",
        body: JSON.stringify(dbObject),
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      console.warn("Failed to save settings to backend, saving to  localStorage. Error:", e);
      localStorage.setItem("editorSettings", JSON.stringify(dbObject));
    }
  },
}));
Alpine.data("statusbar", () => ({
  currentIcon: "",
  languageColors: {},
  message: '',
  oldMsg: '',
  timer: null,
  strtTime: 0,
  timeout: 0,
  queue: [],
  timeoutQueue: [],
  flash(msg, timeout = 3000) {
    if (this.timer) {
      this.queue.push({ msg, timeout });
      return;
    }
    this.oldMsg = this.message;
    this.message = msg;
    if (timeout === 0) {
      this.message = msg;
      return;
    }
    this.timer = setTimeout(() => {
      this.message = this.oldMsg;
      this.timer = null;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        this.flash(next.msg, next.timeout);
      }
    }, timeout);
  },
  init() {
    // Initialize colors
    this.languageColors = {
      javascript: "#f7df1e",
      typescript: "#2f74c0",
      json: "#cb3837",
      html: "#e44d26",
      css: "#2965f1",
      python: "#3572a5",
      java: "#b07219",
      c_cpp: "#00599c",
      markdown: "#083fa1",
      plain_text: "#666666",
      text: "#666666",
      default: "#888888",
    };
    this.$watch("$store.ace.languageSelected", (newVal) => {
      this.updateIcon(newVal);
    });
    if (this.$store.ace.languageSelected) {
      this.updateIcon(this.$store.ace.languageSelected);
    }
  },
  async updateIcon(key) {
    if (!key) return;
    if (iconCache.has(key)) {
      this.currentIcon = iconCache.get(key);
      return;
    }
    try {
      const dataUrl = await this.fetchIcon(key);
      iconCache.set(key, dataUrl);
      this.currentIcon = dataUrl;
    } catch (e) {
      console.warn(`Icon fetch failed for ${key}, using fallback.`);
      const fallbackUrl = this.generateFallbackIcon(key);
      this.currentIcon = fallbackUrl;
    }
  },
  async fetchIcon(language) {
    const response = await fetch(`icons/${language.toLowerCase()}.svg`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("image/svg+xml")) {
      throw new Error("Invalid content type for SVG:", contentType);
    }
    let svgText = await response.text();
    if (typeof svgText !== "string" || svgText.trim() === "") {
      throw new Error("Empty SVG content");
    }
    if (!svgText.includes("fill=")) {
      svgText = svgText.replace("<svg ", '<svg fill="#ffffff" ');
    }
    const b64 = btoa(unescape(encodeURIComponent(svgText)));
    const out = `data:image/svg+xml;base64,${b64}`;

    return out;
  },
  generateFallbackIcon(key) {
    if (typeof document === "undefined") return "";

    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    const color = this.languageColors[key] || this.languageColors.default;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = key.trim().charAt(0).toUpperCase() || "T";
    ctx.fillText(initial, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  },
}));
Alpine.data("terminal", () => ({
  term: null,
  fitAddon: null,
  initialized: false,
  async init() {
    if (this.initialized) return;
    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import("@xterm/xterm"),
      import("@xterm/addon-fit"),
    ]);
    this.fitAddon = new FitAddon();
    await import("@xterm/xterm/css/xterm.css");
    const {
      nl,
      ParseInput: prsin,
      execCommand: excc,
    } = await import("./terminal.js");
    this.initialized = true;
    const container = this.$refs.terminal;
    const term = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      theme: {
        background: "#000000",
      },
    });
    this.term = term;
    term.loadAddon(this.fitAddon);
    term.open(container);
    this.fitAddon.fit();
    term.focus();
    term.loadAddon(this.fitAddon);
    setTimeout(() => {
      if (this.fitAddon) {
        this.fitAddon.fit();
        this.term.scrollToBottom();
        this.term.focus();
      }
    }, 400);
    term.write(nl("Welcome to Ace-WebUI\r\n\r\nType help for more info"));
    term.onData(async (data) => {
      const output = await prsin(data);
      term.write(output);
    });
    const aceExcc = Alpine.store("ace").excc;
    const fsExcc = Alpine.store("opfs").exec;
    aceExcc(excc); //passing a reference of excc
    excc("init", () => {
      return "\x1bcWelcome to Ace-WebUI\r\n\r\nType help for more info";
    });
    fsExcc(excc); //passing a refernce of excc
    excc("clear", () => {
      return "\x1bc";
    });

    excc("help", () => {
      return (
        "Available commands:\r\n" +
        "   help - Show this help message\r\n" +
        "   init - Initialize the terminal\r\n" +
        "   clear - Clear the terminal screen\r\n" +
        "   exit - Exit the terminal interface\r\n" +
        '   editor - Access editor commands (type "editor help" for more info)\r\n' +
        '   fs - Access OPFS file system commands (type "fs help" for more info)\r\n'
      );
    });
    excc("exit", () => {
      term.write(nl("\r\nExiting terminal..."));
      setTimeout(() => {
        this.$store.bottomBar.move = false;
      }, 500);
      return "";
    });
  },
}));
Alpine.data("markedPreview", () => ({
  async fetchPreviewHtml() {
    try {
      if (this.$store.ace.languageSelected === "html") {
        const { createPreview, renderPreviewHTML } =
          await import("./preview-engine.js");
        createPreview("HTML Preview");
        const content = Alpine.store("ace").editor.getValue();
        renderPreviewHTML(content);
        return;
      }
      const { createPreview, renderPreviewMarkdown } =
        await import("./preview-engine.js");
      createPreview("Markdown Preview");
      const content = Alpine.store("ace").editor.getValue();
      renderPreviewMarkdown(content);
      this.$store.marked.ack = true;
      return;
    } catch (e) {
      console.warn("Error fetching preview HTML:", e);
      this.$store.marked.ack = false;
    }
  },
}));
Alpine.start();
