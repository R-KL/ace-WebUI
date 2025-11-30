import './style.css'
import Alpine from 'alpinejs'
import lz from 'lz-string';
window.Alpine = Alpine;
const iconCache = new Map();
Alpine.store('ace', {
    editor: null,
    decOpacity: false,
    isUrl: false,
    save: false,
    excc: null,
    openfile: false,
    isFsapi: false,
    fileHandle: null,
});
Alpine.store('marked', {
    markedPreviewOpen: false,
    previewButton: false,
});
Alpine.store('bottomBar', {
    move: false,
})
Alpine.data('AceApp', () => ({
    menuCloseButton: false,
    languageSelected: null,
    init() {
        const editor = ace.edit("editor");
        this.editor = Alpine.raw(editor);
        Alpine.store('ace').editor = Alpine.raw(editor);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/text");
        this.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
        this.editor.setFontSize(17);
        this.initSettingsMenu();
        this.editor.on("changeMode", () => {
            this.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
            this.markDownMode();
        });
        Alpine.store('ace').excc = (excc) => {
            excc("editor", {
                app: this,
                editor: this.editor,
                version() { return "0.0.7" },
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
        if (this.$store.ace.isFsapi) {
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
    async save(filename=null) {
        if (this.$store.ace.isUrl) {
            const userContent = this.editor.getValue();
            const compressedCode = lz.compressToBase64(userContent);
            const mode = this.editor.session.$modeId.replace('ace/mode/', '');
            const theme = this.editor.getTheme().replace('ace/theme/', '');
            const code = '?code=' + compressedCode + '&mode=' + mode + '&theme=' + theme;
            const compressed = lz.compressToEncodedURIComponent(code);
            console.log({ compressed, compressedCode, code, mode, theme });
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
        }
        if (this.$store.ace.isFsapi) {
            if (!this.$store.ace.fileHandle) {
                alert("No file is opened to save. Please open a file first.");
                return;
            }
            try {
                const writable = await this.$store.ace.fileHandle.createWritable();
                await writable.write(this.editor.getValue());
                await writable.close();
                alert("File saved successfully using File System Access API.");
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
        if(!filename || filename === 'Enter here...') {
            alert(" Using default filename: download.txt");
        }
        a.download = filename || 'download.txt';
        a.click();
        URL.revokeObjectURL(url);
        this.$store.ace.save = false;
    },
    readFromUrl() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;
        const urlParams = new URLSearchParams(hash);
        const url = urlParams.get('url');
        const mode = urlParams.get('mode') || 'markdown';
        const theme = urlParams.get('theme') || 'monokai';
        if (url) {
            fetch(url).then(res => res.text()).then(data => {
                this.editor.setValue(data, -1);
            });
            try {
                this.editor.session.setMode(`ace/mode/${mode}`);
                this.editor.setTheme(`ace/theme/${theme}`);
            }
            catch (e) {
                console.error("Failed to set mode or theme from URL:", e);
            }
            return;
        }
        try {
            const decoded = lz.decompressFromEncodedURIComponent(hash);
            const [, encodedcode, mode, theme] = decoded.match(/\?code=([^&]*)&mode=([^&]*)&theme=([^&]*)/);
            const code = lz.decompressFromBase64(encodedcode);
            console.log({ decoded, encodedcode, code, mode, theme });
            if (decoded !== null) {
                this.editor.setValue(code, -1);
                this.editor.session.setMode(`ace/mode/${mode}`);
                this.editor.setTheme(`ace/theme/${theme}`);
            } else {
                console.warn("Invalid or corrupted encoded content");
            }
        } catch (e) {
            console.error("Failed to decompress content from URL:", e);
        }
    },
    markDownMode() { // this includes both markdown and html since hey they both can use the marked preview
        if (this.languageSelected === 'markdown' || this.languageSelected === 'html') {
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
        this.$watch('languageSelected', (newVal) => {
            this.updateIcon(newVal);
        });
        if (this.languageSelected) {
            this.updateIcon(this.languageSelected);
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
        const response = await fetch(`ace-WebUI/icons/${language.toLowerCase()}.svg`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let svgText = await response.text();
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
    }
}));
Alpine.data('terminal', () => ({
    term: null,
    initialized: false,
    bh: 0,
    async init() {
        if (this.initialized) return;
        const { Terminal } = await import('@xterm/xterm');
        await import('@xterm/xterm/css/xterm.css');
        const { nl, ParseInput: prsin, execCommand: excc } = await import('./terminal.js');
        this.initialized = true;
        const container = this.$refs.terminal;
        const term = new Terminal({
            cursorBlink: true,
            overflow: true,
            theme: {
                background: '#000000',
            }
        });
        this.term = term;
        term.open(container);
        term.focus();
        term.write(nl('Welcome to Ace-WebUI\r\n\r\nType help for more info'));
        term.onData(data => {
            const output = prsin(data);
            term.write(output);
        });
        const aceExcc = Alpine.store('ace').excc;
        aceExcc(excc); //passing a reference of excc
        excc("clear", () => {
            term.reset();
            return '';
        });
        excc("help", () => {
            return nl(`Available Commands:\r\n
- help    Show this help message\r\n
- clear    Clear the terminal\r\n
- exit    Exit the Terminal\r\n
\r\n
Related the Editor:\r\n
\r\n
 Usage: editor [options] [arguments]\r\n
 
   options:\r\n
     - version    Print out the current version\r\n
     - openSettings    Another way to open the terminal\r\n
     - prompt    opens a prompt box built-in to ace\r\n
     - :n (goto)    goto line number n. eg: :4, or :10\r\n
`)
        })
        excc("exit", () => {
            term.write(nl('\r\nExiting terminal...'));
            setTimeout(() => {
                this.$store.bottomBar.move = false;
            }, 500);
            return '';
        })
    },
}));
Alpine.data('markedPreview', () => ({
    markedInstance: null,
    dompurify: null,
    async init() {
        // await import('github-markdown-css/github-markdown.css');
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
                    return this.dompurify.sanitize(hljs.highlightAuto(code).value); // auto-detect
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
    async fetchPreviewHtml() {
        const template = await fetch('/src/preview.html').then(res => res.text());
        const content = this.renderedMarkdown;
        let previewHtml = template.replace('<!-- CONTENT -->', content);
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }

}));
Alpine.start();