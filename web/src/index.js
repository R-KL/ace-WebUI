import './style.css';
import Alpine from 'alpinejs';
import lz from 'lz-string';
import { mkdir } from './opfs.js';
window.Alpine = Alpine;
const iconCache = new Map();
Alpine.store('ace', {
    editor: null,
    decOpacity: false,
    isUrl: false,
    save: false,
    excc: null,
    openfile: false,
    openMode: 'fileinput',
    fileHandle: null,
    languageSelected: null,
});
Alpine.store('marked', {
    markedPreviewOpen: false,
    previewButton: false,
    ack: false,
});
Alpine.store('bottomBar', {
    move: false,
})
Alpine.store('opfs', {
    currentDir: '/',
    path: '',
    opfs: null,
    initialized: false,
    ftjs: null,
    async init() {
        this.opfs = await import('./opfs.js');
        this.initialized = true;
    },
    getPath(name) {
        if (name.startsWith('/')) return name;
        const base = this.currentDir.endsWith('/') ? this.currentDir : this.currentDir + '/';
        return (base + name).replace(/\/+/g, '/');
    },
    async ls(path=null) {
        if (!path) path = this.currentDir;
        const entries = await this.opfs.listDir(path);
        return entries;
    },
    async cd(path) {
        let segments = this.currentDir.split('/').filter(Boolean);
        path.split('/').filter(Boolean).forEach(part => {
            if (part === '..') segments.pop();
            else if (part !== '.') segments.push(part);
        });

        const target = '/' + segments.join('/');
        const exists = await this.opfs.dirExists(target);
        if (exists) {
            this.currentDir = target;
        } else {
            console.warn("Path not found:", target);
        }
    },

    async mkdir(name = 'NewFolder') {
        const fullPath = this.getPath(name);
        await this.opfs.mkdir(fullPath);
        console.log("Created directory at:", fullPath);
    },
    async touch( name = null,path=this.currentDir, content = '') {
        const fullPath = this.getPath(path) + '/' + (name || 'NewFile.txt');
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
        } catch(e) {
            console.warn("[FS] Error: " + e);
        }
    },
    async writeFile(name = 'NewFile.txt', content = '') {
        const fullPath = this.getPath(name);
        await this.opfs.writeFile(fullPath, content);
        console.log("File saved to:", fullPath);
    },
    async readFile(path = null, name = null) {
        if (!path) {
            const fullPath = this.getPath(name)
            path = fullPath;
        }
        const content = await this.opfs.readFile(path);
        return content;

    },
    async getTreeJson(dirHandle = null, currentPath = '') {
        // If no handle provided, start at root
        if (!dirHandle) {
            dirHandle = await this.opfs.getRoot();
        }

        const children = [];

        // Iterate over all entries in this directory
        for await (const [name, handle] of dirHandle.entries()) {
            const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;

            const node = {
                name: name,
                kind: handle.kind, // 'file' or 'directory'
                path: fullPath,
            };

            if (handle.kind === 'directory') {
                // Recursively build children for directories
                node.children = await this.getTreeJson(handle, fullPath);
            }

            children.push(node);
        }

        // Optional: Sort folders first, then files
        return children.sort((a, b) => {
            if (a.kind === b.kind) return a.name.localeCompare(b.name);
            return a.kind === 'directory' ? -1 : 1;
        });
    },
    exec(excc) {
        const store = Alpine.store('opfs');
        excc("fs",{
            async help() {
                return "\r\nfs is a crude implementation of Linux file system commands for OPFS\r\n"+
                "Available commands:\r\n"+
                '   fs cd <path> - Change directory to <path>\r\n'+
                '   fs ls [path] - List files in [path] or current directory\r\n'+
                '   fs mkdir <name> - Create a new directory with <name>\r\n'+
                '   fs rm <path> [-r] - Remove file or directory at <path>, use -r for recursive delete\r\n'+
                '   fs touch [path] [name] - Create a new empty file with [name] in [path] or current directory\r\n';
            },
            async cd(path) {
                await store.cd(path);
                return path;   
            },
            async ls(path) {
                const entries = await store.ls(path);
                if (!entries || entries.length === 0) return 'Empty directory';
                return entries
                .map(item => {
                    const icon = item.kind === 'directory' ? '📁' : '📄';
                    return `${icon} ${item.name}`;
                })
                .join('\r\n'); 
            },
            async mkdir(name) {
                await store.mkdir(name);
                return name;
            },
            async rm(path,r) {
                if(!path) return;
                if(r === '-r') r = true;
                else r = false;
                await store.rm(path,r);
                return path + " removed";
            },
            async touch(name=null,path=this.currentDir,content='') {
                await store.touch(name,path,content);
                return name ? name : 'NewFile.txt';
            }
        });
    }, 
    async drawOPFSFileTree(container = null) {
        if (!this.initialized) {
            await this.init();
        }

        // 1. Generate the JSON structure from actual OPFS data
        // We wrap it in a root object if your filetree.js expects a single root node
        const children = await this.getTreeJson();

        const treeJson = {
            name: 'root',
            kind: 'directory',
            path: '/',
            children: children
        };
        console.log("Generated OPFS file tree JSON:", treeJson);
        console.log("Container element:", container);
        // 2. Import your renderer
        try {
            if (!this.ftjs) {
                this.ftjs = await import('./filetree.js');
                console.log("accquired filetree.js")
            }
        }
        catch (e) {
            console.error("Failed to load filetree.js:", e);
            return;
        }
        if (!container) container = document.getElementById('file-tree');
        this.ftjs.init(container, this.onDblClick.bind(this), true);
        this.ftjs.ftClear();
        this.ftjs.render(treeJson, container);

    },
    async onDblClick(path) {
        window.dispatchEvent(new CustomEvent('update-msg',{ detail: { msg: `[OPFS] Opening file: ${path}` },bubbles: true}));
        let content = await this.readFile(path);
        Alpine.store('ace').editor.setValue(content, -1);
        Alpine.store('ace').editor.session.setMode(ace.require("ace/ext/modelist").getModeForPath(path).mode);
        Alpine.store('ace').openMode = "opfs";
        this.currentDir = path.substring(0, path.lastIndexOf('/'));
        this.path = path;
    }
});
Alpine.store('ft', {
    move: false,
    open() {
        this.move = !this.move;
        //const ft = document.getElementById("file-tree-container");
    }
})
Alpine.data('AceApp', () => ({
    menuCloseButton: false,

    init() {
        const editor = ace.edit("editor");
        this.editor = Alpine.raw(editor);
        Alpine.store('ace').editor = Alpine.raw(editor);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/text");
        this.$store.ace.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
        this.editor.setFontSize(17);
        this.initSettingsMenu();
        this.editor.on("changeMode", () => {
            this.$store.ace.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
            this.$dispatch('update-msg', { msg: `Using language "${this.$store.ace.languageSelected}"` });
            this.markDownMode();
        });
        Alpine.store('ace').excc = (excc) => {
            excc("editor", {
                app: this,
                editor: this.editor,
                help() {
                    const helpText =
                        'Editor Commands:\r\n' +
                        'version - Show the current version of the editor\r\n' +
                        'prompt - Open the prompt dialog\r\n' +
                        'openSettings - Open the settings menu\r\n' +
                        ':<line_number> - Go to the specified line number (e.g., :10 to go to line 10)';
                    return helpText;
                },
                version() { return "0.0.8" },
                prompt() {
                    this.app.prompts()
                    return '';
                },
                openSettings() {
                    this.app.openSettingsMenu();
                    return 'opened settings menu';
                },
                ':'(lineNum) {
                    if (!isNaN(lineNum)) {
                        this.editor.scrollToLine(lineNum - 1, true, true, () => { });
                        this.editor.gotoLine(lineNum, 0, true);
                    }
                }
            });
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
                readOnly: true
            });


        });
    },
    async openFile() {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.editor.setValue(content, -1);
        };
        if (this.$store.ace.openMode === 'fsapi') {
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
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '*/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            this.$dispatch('update-msg', { msg: ` ${file.name}`, timeout: 0 });
            reader.readAsText(file);
            const modelist = ace.require("ace/ext/modelist");
            const mode = modelist.getModeForPath(file.name).mode;
            console.log(`Setting editor mode to: ${mode}`);
            this.editor.session.setMode(mode);
            document.body.removeChild(fileInput)
        });
        fileInput.click();
    },
    prompts() {
        prompt = ace.require("ace/ext/prompt");
        console.log(prompt);
        prompt.modes(this.editor);
    },
    initStatusBar() {
        const StatusBarObject = ace.require("ace/ext/statusbar").StatusBar;
        new StatusBarObject(this.editor, this.$el);
    },

    openSettingsMenu() {
        this.editor.showSettingsMenu();
    },
    async save(filename = null) {
        if (this.$store.ace.isUrl) {
            const userContent = this.editor.getValue();
            const compressedCode = lz.compressToBase64(userContent);
            const mode = this.editor.session.$modeId.replace('ace/mode/', '');
            const theme = this.editor.getTheme().replace('ace/theme/', '');
            const code = '?code=' + compressedCode + '&mode=' + mode + '&theme=' + theme;
            const compressed = lz.compressToEncodedURIComponent(code);
            console.log({ compressed, compressedCode, code, mode, theme });
            this.$dispatch('update-msg', { msg: `URL Generated  for sharing...`, timeout: 2000 });
            const newUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;
            try {
                await navigator.clipboard.writeText(newUrl).then(() => {
                    alert('URL copied to clipboard! Warning: Large content may not work properly due to URL length limitations. length of url rises along with code length');
                    this.$store.ace.isUrl = false;
                    this.$store.ace.save = false;
                })
            } catch {
                alert("Couldnt Copy the url try this", newUrl)
            }
            return;
        }
        if (this.$store.ace.openMode === 'opfs') {
            await Alpine.store('opfs').writeFile(Alpine.store('opfs').path, this.editor.getValue());
            this.$dispatch('update-msg', { msg: `File saved to OPFS as ${Alpine.store('opfs').path}` });
            this.$store.ace.save = false;
            return;
        }
        if (this.$store.ace.openMode === 'fsapi') {
            if (!this.$store.ace.fileHandle) {
                this.$dispatch('update-msg', { msg: "No file is opened to save. Please open a file first." });
                return;
            }
            try {
                const writable = await this.$store.ace.fileHandle.createWritable();
                await writable.write(this.editor.getValue());
                await writable.close();
                this.$dispatch('update-msg', { msg: "File saved successfully using File System Access API.", timeout: 3000 });
                this.$store.ace.save = false;
            } catch (e) {
                console.error("Error saving file:", e);
                alert("Failed to save the file. See console for details.");
            }
            return;
        }
        const blob = new Blob([this.editor.getValue()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        if  (!filename || filename === 'Enter here...') {
            this.$dispatch('update-msg', { msg: " Using default filename: download.txt", timeout: 3000 });
        }
        a.download = filename || 'download.txt';
        a.click();
        URL.revokeObjectURL(url);
        this.$store.ace.save = false;
    },
    readFromUrl() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;
        try {
            const decoded = lz.decompressFromEncodedURIComponent(hash);
            const [, encodedcode, mode, theme] = decoded.match(/\?code=([^&]*)&mode=([^&]*)&theme=([^&]*)/);
            const code = lz.decompressFromBase64(encodedcode);
            console.log({ decoded, encodedcode, code, mode, theme });
            if (decoded !== null) {
                this.editor.setValue(code, -1);
                this.editor.session.setMode(`ace/mode/${mode}`);
                this.editor.setTheme(`ace/theme/${theme}`);
                setTimeout(() => {
                    this.$dispatch('update-msg', { msg: `Decompresing #${hash.slice(0, 20)}...`, timeout: 4000 });
                }, 200);
            } else {
                console.warn("Invalid or corrupted encoded content");
            }
        } catch (e) {
            console.warn("Failed to decompress content from URL:", e);
        }
    },
    markDownMode() { // this includes both markdown and html since hey they both can use the marked preview
        if (this.$store.ace.languageSelected === 'markdown' || this.$store.ace.languageSelected === 'html') {
            this.$store.marked.previewButton = true;
        } else {
            this.$store.marked.previewButton = false;
            this.$store.marked.markedPreviewOpen = false;
            this.$store.ace.decOpacity = false;
        }

    },
}));
Alpine.data('statusBar', () => ({
    currentIcon: '',
    languageColors: {},
    init() {
        // Initialize colors
        this.languageColors = {
            javascript: '#f7df1e', typescript: '#2f74c0', json: '#cb3837',
            html: '#e44d26', css: '#2965f1', python: '#3572a5', java: '#b07219',
            c_cpp: '#00599c', markdown: '#083fa1', plain_text: '#666666',
            text: '#666666', default: '#888888'
        };
        this.$watch('$store.ace.languageSelected', (newVal) => {
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
            throw new Error('Network response was not ok');
        }
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('image/svg+xml')) {
            throw new Error('Invalid content type for SVG:', contentType);
        }
        let svgText = await response.text();
        if (typeof svgText !== 'string' || svgText.trim() === '') {
            throw new Error('Empty SVG content');
        }
        if (!svgText.includes('fill=')) {
            svgText = svgText.replace('<svg ', '<svg fill="#ffffff" ');
        }
        const b64 = btoa(unescape(encodeURIComponent(svgText)));
        const out = `data:image/svg+xml;base64,${b64}`;

        return out;
    },
    generateFallbackIcon(key) {
        if (typeof document === 'undefined') return '';

        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        const color = this.languageColors[key] || this.languageColors.default;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = key.trim().charAt(0).toUpperCase() || 'T';
        ctx.fillText(initial, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    },
}));
Alpine.data('terminal', () => ({
    term: null,
    fitAddon: null,
    initialized: false,
    async init() {
        if (this.initialized) return;
        const [{ Terminal }, { FitAddon }] = await Promise.all([
            import('@xterm/xterm'),
            import('@xterm/addon-fit')
        ]);
        this.fitAddon = new FitAddon();
        await import('@xterm/xterm/css/xterm.css');
        const { nl, ParseInput: prsin, execCommand: excc } = await import('./terminal.js');
        this.initialized = true;
        const container = this.$refs.terminal;
        const term = new Terminal({
            cursorBlink: true,
            scrollback: 1000,
            theme: {
                background: '#000000',
            }
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
        term.write(nl('Welcome to Ace-WebUI\r\n\r\nType help for more info'));
        term.onData(async data => {
            const output = await prsin(data);
            term.write(output);
        });
        const aceExcc = Alpine.store('ace').excc;
        const fsExcc = Alpine.store('opfs').exec;
        aceExcc(excc); //passing a reference of excc
        excc("init", () => {
            return '\x1bcWelcome to Ace-WebUI\r\n\r\nType help for more info';
        })
        fsExcc(excc); //passing a refernce of excc
        excc("clear", () => {
            return '\x1bc';
        });

        excc("help", () => {
            return 'Available commands:\r\n' +
                '   help - Show this help message\r\n' +
                '   init - Initialize the terminal\r\n' +
                '   clear - Clear the terminal screen\r\n' +
                '   exit - Exit the terminal interface\r\n' +
                '   editor - Access editor commands (type "editor help" for more info)\r\n'+
                '   fs - Access OPFS file system commands (type "fs help" for more info)\r\n';
        });
        excc("exit", () => {
            term.write(nl('\r\nExiting terminal...'));
            setTimeout(() => {
                this.$store.bottomBar.move = false;
            }, 500);
            return '';
        });
    },
}));
Alpine.data('markedPreview', () => ({
    markedInstance: null,
    dompurify: null,
    async init() {
        // await import('github-markdown-css/github-markdown.css');
        if (this.markedInstance) return;
        const self = this;
        const { Marked, marked: mkd } = await import('marked');
        const { markedHighlight } = await import('marked-highlight');
        const hljs = (await import('highlight.js')).default;
        this.dompurify = (await import('dompurify')).default;
        this.markedInstance = new Marked(
            markedHighlight({
                emptyLangClass: 'hljs',
                langPrefix: 'hljs language-',
                highlight(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        return hljs.highlight(code, { language: lang }).value;
                    }
                    return self.dompurify.sanitize(hljs.highlightAuto(code).value); // auto-detect
                }
            })
        );
    },
    get renderedMarkdown() {
        const code = Alpine.store('ace').editor.getValue();
        if (!this.markedInstance) return '<p><em>Loading preview...</em></p>';
        if (code.trim() === '') {
            return '<p><em>No content to preview.</em></p>';
        }
        return this.dompurify.sanitize(this.markedInstance.parse(code));
    },
    get renderedHTML() {
        const code = Alpine.store('ace').editor.getValue();
        if (code.trim() === '') {
            return '<p><em>No content to preview.</em></p>';
        }
        return code;
    },
    async fetchPreviewHtml() {
        if (this.$store.ace.languageSelected === 'html') {
            const content = this.renderedHTML;
            const BlobContent = new Blob([content], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(BlobContent);
            if (!this.$store.marked.ack) {
            this.$store.marked.ack = confirm("Beware: This preview renders and executes all HTML, CSS, and JavaScript code directly in the browser. \n\n"+
                "Ensure that the content is from a trusted source to avoid potential security risks. Do not run random code on internet!\n\n"+
                "This prompt will only appear once per session.");
            }
            this.$store.marked.ack ? window.open(blobUrl, '_blank') : null; 
            return;
        }
        const template = await fetch('preview.html').then(res => res.text());
        const content = this.renderedMarkdown;
        let previewHtml = template.replace('<!-- CONTENT -->', content);
        const highlightCss = await import ('highlight.js/styles/atom-one-dark.min.css?inline').then(mod => {
            console.log(mod.default);
        previewHtml = previewHtml.replace('<!-- STYLES -->','<style>' + mod.default + '</style>');
        });
        console.log(highlightCss);
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }

}));
Alpine.start();