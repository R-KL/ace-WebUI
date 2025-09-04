document.addEventListener("DOMContentLoaded", () => {
    const editor = ace.edit("editor");
    const modelist = ace.require("ace/ext/modelist");
    editor.session.setMode("ace/mode/text");
    editor.setOptions({
            enableBasicAutocompletion: true,  // <--- for keywords and snippets
            enableLiveAutocompletion: true,   // <--- shows popup while typing
            enableSnippets: true               // <--- optional, if you use snippet completions
        });

    let currentFile = null;
    let currentSource = null; 


    let isDirty = false;
    const statusBar = document.getElementById("status-bar");
    let statusTimeout;


    if (!statusBar) {
        console.error("FATAL: UI element #status-bar not found. Please check your index.html file.");
        alert("Error: UI is not configured correctly. Status bar is missing.");
        return; 
    }



    // Sets the message in the status bar. It can fade after a delay.
    function showStatus(message, duration = 4000) {
        clearTimeout(statusTimeout);
        statusBar.innerText = message;
        statusBar.style.opacity = 1;

        // If duration is 0, the message stays until the next update.
        if (duration > 0) {
            statusTimeout = setTimeout(() => {
                updateFileStatus(); // Revert to showing the filename
            }, duration);
        }
    }
    // Automatically sets the editor mode based on the file extension.
    function setEditorMode(filename) {
        const mode = modelist.getModeForPath(filename).mode;
        console.log(`Setting editor mode to: ${mode}`);
        editor.session.setMode(mode);
    }
    // Updates the status bar to show the current file and its "dirty" state.
    function updateFileStatus() {
        if (currentFile) {
            statusBar.innerText = `File: ${currentFile}${isDirty ? ' *' : ''}`;
        } else {
            statusBar.innerText = "No file loaded";
        }
        statusBar.style.opacity = 1;
    }
    
    // Call it once on startup
    updateFileStatus();


    editor.session.on('change', () => {
        // Only mark as dirty if it's not already, to avoid running this on every keystroke
        if (!isDirty) {
            isDirty = true;
            updateFileStatus();
        }
    });

    // --- Settings ---
    const settingsUrl = new URL("settings", document.baseURI);
    fetch(settingsUrl)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Could not fetch settings.");
        })
        .then(state => {
            if (state.theme) editor.setTheme(state.theme);
            if (state.fontSize) editor.setFontSize(state.fontSize);
        }).catch(err => console.warn("Could not load settings:", err));

    function saveSettings() {
        const state = {
            theme: editor.getTheme(),
            fontSize: editor.getFontSize()
        };
        fetch("./settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state)
        }).catch(err => console.error("Save settings failed:", err));
    }
    window.addEventListener("beforeunload", saveSettings);

    // --- Settings Menu  ---
    ace.config.loadModule("ace/ext/settings_menu", function (module) {
        module.init(editor);
        document.getElementById("settings-button").onclick = () => {
            saveSettings();
            editor.showSettingsMenu();
        };
        editor.commands.addCommand({
            name: "showSettingsMenu",
            bindKey: { win: "F1", mac: "F1" },
            exec: () => document.getElementById("settings-button").click(),
            readOnly: true
        });
    });

    // --- File Handling  ---
    const dropdownContainer = document.querySelector('.dropdown-container');
    const loadButton = document.getElementById("load-button");
    const serverButton = document.getElementById("load-server");
    const pcButton = document.getElementById("load-pc");
    const uploadButton = document.getElementById("upload-button");
    const fileInput = document.getElementById("file-input");

    // Dropdown menu logic 
    loadButton.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContainer.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
        if (!dropdownContainer.contains(e.target)) {
            dropdownContainer.classList.remove("open");
        }
    });
    const closeDropdown = () => dropdownContainer.classList.remove("open");

    // Load from server
    serverButton.onclick = async () => {
        closeDropdown();
        const name = prompt("Enter filename to load from server:");
        if (!name) return;
        showStatus(`Loading "${name}" from server...`, 0); // Permanent message until loaded
        try {
            const res = await fetch("./file?name=" + encodeURIComponent(name));
            if (!res.ok) throw new Error(`Server returned ${res.status}: ${await res.text()}`);
            const text = await res.text();
            
          
            editor.setValue(text, -1);
            currentFile = name;
            setEditorMode(name);
            currentSource = "server";
            isDirty = false;
            updateFileStatus();

        } catch (err) {
            // Replaced alert with status bar message
            showStatus(`Error loading file: ${err.message}`);
        }
    };

    // Load from PC
    pcButton.onclick = () => {
        closeDropdown();
        fileInput.click();
    };

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        showStatus(`Loading "${file.name}" from PC...`, 0);
        const text = await file.text();
        
        //  Set state and UI
        editor.setValue(text, -1);
        currentFile = file.name;
        setEditorMode(file.name);
        currentSource = "pc";
        isDirty = false;
        updateFileStatus();

        e.target.value = '';
    };

    // Save
    uploadButton.onclick = async () => {
        const content = editor.getValue();
        if (!currentFile) {
            // Replaced alert with status bar message
            showStatus("Error: No file is loaded to save.");
            return;
        }

        showStatus(`Saving "${currentFile}"...`, 0);

        if (currentSource === "pc") {
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = currentFile;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // UPDATED: Set state and UI on successful save
            isDirty = false;
            showStatus(`Saved "${currentFile}" to your PC.`);

        } else if (currentSource === "server") {
            try {
                const res = await fetch("./file?name=" + encodeURIComponent(currentFile), {
                    method: "POST",
                    headers: { "Content-Type": "text/plain" },
                    body: content
                });
                if (!res.ok) throw new Error(`Server returned ${res.status}: ${await res.text()}`);
                
                // UPDATED: Set state and UI on successful save
                isDirty = false;
                showStatus(`Saved "${currentFile}" to the server.`);

            } catch (err) {
                // UPDATED: Replaced alert with status bar message
                showStatus(`Error saving file: ${err.message}`);
            }
        }
    };
});