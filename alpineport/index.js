import './style.css'
import Alpine from 'alpinejs'
import PubSub from 'pubsub-js'
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';
window.PubSub = PubSub;
window.Alpine = Alpine;
Alpine.data('aceApp', () => ({

    editor: null,
    menuCloseButton: true,
    // --- LIFECYCLE METHOD ---
    init() {
        this.editor = ace.edit("editor");
        this.editor.PubSub = PubSub;
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/javascript");
        this.editor.setFontSize(17);
        this.initSettingsMenu();
        PubSub.subscribe('ace:settingsMenu:closed', () => {
            this.menuCloseButton = false;
        })
        PubSub.subscribe('ace:settingsMenu:opened', () => {
            this.menuCloseButton = true;
        })
        PubSub.subscribe('ace:fontsize:increment', () => {
            this.editor.setFontSize(this.editor.getFontSize() + 1);
        });
        PubSub.subscribe('ace:fontsize:decrement', () => {
            this.editor.setFontSize(this.editor.getFontSize() - 1);
        });
        PubSub.subscribe('ace:fontsize:set', (_, data) => {
            this.editor.setFontSize(parseInt(data));
        });
    },
    languageSelected: "Text",
    // --- METHODS ---
    initSettingsMenu() {
        const editorInstance = this.editor;

        ace.config.loadModule("ace/ext/settings_menu", (module) => {
            module.init(editorInstance);
            editorInstance.commands.addCommand({
                name: "showSettingsMenu",
                bindKey: { win: "F1", mac: "F1" },
                exec: () => {
                    this.openSettingsMenu();
                },
                readOnly: true
            });
        });
    },

    openSettingsMenu() {
        // 'this.editor' is safe to use here
        this.editor.showSettingsMenu();
        this.menuCloseButton = true;
        this.CreatNewButtonIn("ace_settingsmenu");
    },
    CreatNewButtonIn(divId) {
        const div = document.getElementById(divId);
        const button = document.createElement("button");
        button.innerText = "Close Menu";
        button.classList = "bg-[2b2b2b] hover:bg-gray-500 shadow-lg rounded-xl p-2 w-full m-1";
        button.id = "close-menu-button";
        button.className = "ace_optionsMenuEntry";
        div.insertBefore(button, div.firstChild);
     //   document.body.appendChild(div);
        button.addEventListener("click", () => {
            PubSub.publish("ace:settingsMenu:close", "");
            this.menuCloseButton = false;
            div.removeChild(button);
        });
    const fonsizeinput = document.getElementById("-fontSize");
    if (!fonsizeinput) {
        console.log("Font size input not found");
        return;
    }
    fonsizeinput.className = "w-8!";
    const buttonIncrement = document.createElement("button");
    buttonIncrement.innerText = " + ";
    buttonIncrement.id = "increment-fontsize";
    buttonIncrement.className = "bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl p-1 text-center! m-0.5 hover:bg-[#444]  w-6!"; // Simplified classes
    
    const buttonDecrement = document.createElement("button");
    buttonDecrement.innerText = " - ";
    buttonDecrement.id = "decrement-fontsize";
    buttonDecrement.className = "bg-[#1e1e1e] border border-neutral-700 text-white rounded-xl p-1 text-center! mr-0.5 hover:bg-[#444]  w-6!"; 
    const parentElement = fonsizeinput.parentNode;
    const fontContainer = document.createElement("div");
    fontContainer.className = "flex items-center";
    buttonIncrement.addEventListener("click", () => {
        fonsizeinput.value = parseInt(fonsizeinput.value) + 1;
        PubSub.publish("ace:fontsize:increment", "");   
    });

    buttonDecrement.addEventListener("click", () => {
        fonsizeinput.value = parseInt(fonsizeinput.value) - 1;
        PubSub.publish("ace:fontsize:decrement", "");
    });
    const fakeFontInput = document.createElement("input");
    fakeFontInput.type = "number";
    fakeFontInput.id = "-NeededToFakeThisToWorkWithButtonsGivenBelow-Ace-Dont_HardCodeFirstChild";
    fakeFontInput.value = this.editor.getFontSize();
    fakeFontInput.className = "hidden";
    fakeFontInput.disabled = true;
    fakeFontInput.oninput = function() {
        PubSub.publish("ace:fontsize:set", this.value);
        fonsizeinput.value = this.value;
    };
    parentElement.insertBefore(fontContainer, parentElement.firstChild);
    parentElement.insertBefore(fakeFontInput, parentElement.firstChild);  
    fontContainer.appendChild(buttonDecrement); 
    fontContainer.appendChild(fonsizeinput);   
    fontContainer.appendChild(buttonIncrement);

     
        div.setAttribute("data-overlayscrollbars-initialized", "");
        OverlayScrollbars(div, {
            className: "os-theme-dark", 
            scrollbars: {
                autoHide: "leave",
                clickScroll: true,
                },
            overflow: {
                x: "hidden",
                y: "scroll",
            }
        });
    },
}));
Alpine.start();