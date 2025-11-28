import './style.css'
import 'github-markdown-css/github-markdown.css';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { Marked, marked as mkd } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';
import lz from 'lz-string';
import { nl, ParseInput as prsin, execCommand as excc } from './terminal.js';
import Alpine from 'alpinejs'
window.Alpine = Alpine;
const iconCache = new Map();
Alpine.store('ace', {
    editor: null,
    decOpacity: false,
    isUrl: false,
    save: false,
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
        this.editor = Alpine.store('ace').editor = ace.edit("editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/markdown");
        this.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
        this.editor.setFontSize(17);
        this.initSettingsMenu();
        this.editor.on("changeMode", () => {
            this.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
            this.markDownMode();
        });
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
    prompts() {
        const prompt = this.editor.prompt(this.editor, "Default value", {
            placeholder: "Enter text...",
            onAccept: (data) => console.log(data.value)
        });
    },
    initStatusBar() {
        const StatusBarObject = ace.require("ace/ext/statusbar").StatusBar;
        new StatusBarObject(this.editor, this.$el);
    },

    openSettingsMenu() {
        this.editor.showSettingsMenu();
        // this.menuCloseButton = true;
        const self = this;
        const clsapnd = document.getElementById("ace_settingsmenu");
    },
    async save() {
        if (this.$store.ace.isUrl) {
            const userContent =this.editor.getValue();
            const compressedCode = lz.compressToBase64(userContent);
            const mode = this.editor.session.$modeId.replace('ace/mode/', '');
            const theme = this.editor.getTheme().replace('ace/theme/', '');
            const code = '?code=' + compressedCode + '&mode=' + mode + '&theme=' + theme;
            const compressed = lz.compressToEncodedURIComponent(code);
            console.log({compressed,compressedCode, code, mode, theme });
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
    },
    readFromUrl() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        try {
            const decoded = lz.decompressFromEncodedURIComponent(hash);
            const [,encodedcode, mode, theme] = decoded.match(/\?code=([^&]*)&mode=([^&]*)&theme=([^&]*)/);
            const code = lz.decompressFromBase64(encodedcode);
            console.log({decoded,encodedcode, code, mode, theme });
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
    markDownMode() {
        if (this.languageSelected === 'markdown') {
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
        const response = await fetch(`/src/assets/icons/${language.toLowerCase()}.svg`);
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
    init() {
        if (this.initialized) return;
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
    init() {
        this.markedInstance = new Marked(
            markedHighlight({
                emptyLangClass: 'hljs',
                langPrefix: 'hljs language-',
                highlight(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        return hljs.highlight(code, { language: lang }).value;
                    }
                    return hljs.highlightAuto(code).value; // auto-detect
                }
            })
        );
    },
    get renderedMarkdown() {
        const editor = Alpine.store('ace').editor;
        if (editor.getValue().trim() === '') {
            return '<p><em>No content to preview.</em></p>';
        }
        return this.markedInstance.parse();
    }
}));
Alpine.start();