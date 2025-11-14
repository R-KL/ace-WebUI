import './style.css'
import Alpine from 'alpinejs'
import PubSub from 'pubsub-js'
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';
window.PubSub = PubSub;
window.Alpine = Alpine;
Alpine.data('AceApp', () => ({
    menuCloseButton: true,
    languageSelected: null,
    // --- LIFECYCLE METHOD ---
    init() {
        this.editor = ace.edit("editor");
        this.editor.PubSub = PubSub;
        window.editor = this.editor;
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/javascript");
        this.languageSelected = "javascript";
        this.editor.setFontSize(17);
        this.initSettingsMenu();
        PubSub.subscribe('ace:settingsMenu:closed', () => {
            this.menuCloseButton = false;
            PubSub.publish('statusbar:update', 'Settings menu closed');
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
        PubSub.subscribe('statusbar:update', () => {
            this.languageSelected = this.editor.session.$modeId.replace('ace/mode/', '');
        });
    },
    // --- METHODS ---
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

    openSettingsMenu() {
        // 'this.editor' is safe to use here
        this.editor.showSettingsMenu();
        this.menuCloseButton = true;
        this.CreateNewButtonIn("ace_settingsmenu", "Close Menu", "ace:settingsMenu:close");
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
        fakeFontInput.oninput = function () {
            PubSub.publish("ace:fontsize:set", this.value);
            fonsizeinput.value = this.value;
        };
        parentElement.insertBefore(fontContainer, parentElement.firstChild);
        parentElement.insertBefore(fakeFontInput, parentElement.firstChild);
        fontContainer.appendChild(buttonDecrement);
        fontContainer.appendChild(fonsizeinput);
        fontContainer.appendChild(buttonIncrement);
        OverlayScrollbars(document.getElementById("ace_settingsmenu"), {
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
    CreateNewButtonIn(divId, buttonText, PublishTopic = null) {//working adder
        const div = document.getElementById(divId);
        const button = document.createElement("button");
        button.innerText = buttonText;
        button.classList = "bg-[2b2b2b] hover:bg-gray-500 shadow-lg rounded-xl p-2 w-full m-1";
        button.id = buttonText.replace(/\s+/g, '-').toLowerCase() + '-button';
        button.className = "ace_optionsMenuEntry";
        div.insertBefore(button, div.firstChild);
        //   document.body.appendChild(div);
        button.addEventListener("click", () => {
            if (PublishTopic) {
                PubSub.publish(PublishTopic, "");
            }
            this.menuCloseButton = false;
        });

    },
    CreateNewCheckBoxInMoreControls(labelText, PublishTopic = null) {//working adder
        const table = document.getElementById("more-controls");
        const row = table.insertRow(0);
        row.className = "ace_optionsMenuEntry";
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const label = document.createElement("label");
        label.setAttribute("for", labelText);
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        label.appendChild(checkbox);
        cell1.appendChild(document.createTextNode(labelText));
        cell2.appendChild(label);
        checkbox.addEventListener("change", () => {
            if (PublishTopic) {
                PubSub.publish(PublishTopic, checkbox.checked);
            }
        });
    }

}));
Alpine.data('AceStatusBar', () => ({
    init() {
        const StatusBarObject = ace.require("ace/ext/statusbar").StatusBar;
        new StatusBarObject(this.editor, document.getElementById("status-bar-ace"), "status-bar-ace");
    }
}));
Alpine.start();