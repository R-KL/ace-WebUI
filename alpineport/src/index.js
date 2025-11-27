import './style.css'
import 'github-markdown-css/github-markdown.css';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { Marked, marked as mkd } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';
import { nl, ParseInput as prsin, execCommand as excc } from './terminal.js';
import Alpine from 'alpinejs'
window.Alpine = Alpine;
const iconCache = new Map();
Alpine.store('ace', {
    editor: null,
    decOpacity: false,
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
        document.addEventListener('acePrompts', (e) => {
            this.acePrompts(e.detail);
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
    markDownMode() {
        if (this.languageSelected === 'markdown') {
            this.$store.marked.previewButton = true;
        } else {
            this.$store.marked.previewButton = false;
            this.$store.marked.markedPreviewOpen = false;
            this.$store.ace.decOpacity = false;
        }

    }
}));
Alpine.data('statusBar', () => ({
    init() {
        this.languageColors = {
            javascript: '#f7df1e',
            typescript: '#2f74c0',
            json: '#cb3837',
            html: '#e44d26',
            css: '#2965f1',
            python: '#3572a5',
            java: '#b07219',
            c_cpp: '#00599c',
            markdown: '#083fa1',
            plain_text: '#666666',
            text: '#666666',
            default: '#888888',
        }
    },
    generateIcon(key, label) {
        if (typeof document === 'undefined') {
            return ''
        }
        if (iconCache.has(key)) {
            return iconCache.get(key)
        }

        const canvas = document.createElement('canvas')
        canvas.width = 48
        canvas.height = 48
        const ctx = canvas.getContext('2d')
        const color = this.languageColors[key] ?? this.languageColors.default

        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 26px "Segoe UI", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const initial = label.trim().charAt(0).toUpperCase() || 'T'
        ctx.fillText(initial, canvas.width / 2, canvas.height / 2)

        const dataUrl = canvas.toDataURL('image/png')
        iconCache.set(key, dataUrl)
        return dataUrl
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
        term.write(nl('Welcome to Ace-WebUI'));
        term.onData(data => {
            const output = prsin(data);
            term.write(output);
        });
        excc("clear", () => {
            term.reset();
            return '';
        });
        excc("exit",() => {
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
        return this.markedInstance.parse(editor.getValue());
    }
}));
Alpine.start();