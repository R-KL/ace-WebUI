/* filetree.js implementation
using HTML5 Detail and Summary Tag... no more div hell hehe (thanks UnoCSS for the idea)

for compatibility The input json structure is the same has bowser OPFS
obj={
		"name": "any_name",
		"kind": "directory" | "file",
		"path": "/path/to/any_name",
		"children": [obj_1,obj_2,obj_3], 
	}
*/
let container = null;
let fileTree = { children: [] };
let ftContextMenu = document.createElement("div");
let pathHistory = {
	current: "/",
	history: ["/"],
	index: 0
};
let currentPath = "/";
let icon_g = false;
/**
 * Render the file tree structure inside the global container
 * @param {object} node - The current node to render (default is the root fileTree).
 * @param {HTMLElement} parentElement - The parent HTML element to append the rendered nodes to (default is the global container).
 * @requires clear() to be called before each rendering
 * @returns {void}
 */
function render(node = fileTree, parentElement = container) {
	if (typeof parentElement === "string") {
		try {
			parentElement = document.getElementById(parentElement);
		} catch {
			console.warn("cannot get element with id:", parentElement);
			console.log("defaulting to container 'file-tree'");
			try {
				parentElement = document.getElementById("file-tree");
			} catch {
				console.warn("cannot get file-tree")
				return;
			}
		}
	}
	for (const item of node.children || []) {
		if (item.kind === "directory") {
			const details = document.createElement("details");
			details.className = "border-l ml-4 mb-2 border-neutral-700 cursor-pointer";
			const summary = document.createElement("summary");
			summary.textContent = "🗀" + item.name;
			summary.dataset.path = item.path;
			summary.dataset.kind = "directory";
			details.appendChild(summary);
			if (item.children && item.children.length > 0) {
				render({ children: item.children }, details);
			}
			parentElement.appendChild(details);
		}
		else if (item.kind === "file") {
			const fileElement = document.createElement("div");
			fileElement.innerText = "🖹" + item.name;
			fileElement.dataset.path = item.path;
			fileElement.dataset.kind = "file";
			fileElement.className = "ml-4 mb-2 cursor-pointer";
			parentElement.appendChild(fileElement);
		}
	}
}
function update(newTree) {
	fileTree = newTree;
	ftClear(container);
	render(newTree, container);
}
/**
 * Clear the file tree container ( needs to be done before each rendring manually)
 * @param container - The HTML element  that holds the file-tree ( defaults to "file-tree")
 * @return {void} 
 */
function ftClear(container = null) {
	if (!container) {
		try {
			const ft = document.getElementById("file-tree");
			container = ft;
		} catch {
			console.warn("cannot get file-tree")
			return;
		}
	}
	container.innerHTML = "";
}
/**
 * Initialize the file tree...By default start from root "/"
 * @param {string | HTMLElement} id - The HTML element or its ID (has a string) where the file tree will be rendered.
 * @param {function(string,string)} callback - The callback function to be executed when a file is double clicked. Arguments passed <path,kind>
 * 											 - path: The path of the double-clicked file or directory.
 *											 - kind: The kind of the item ("file" or "directory").
 * @param {boolean} icon - Add custom icons to files and folders ? ( need to give the icons first using iconCallback)
 * @returns {void}
 */
function init(id = null, callback, icon = false) {
	if (id instanceof HTMLElement) {
		container = id;
	}
	else if (id) {
		try {
			container = document.getElementById(id);
		} catch {
			console.warn("cannot get file-tree with id:", id)
			return;
		}
	}
	else {
		try {
			container = document.getElementById("file-tree");
		} catch {
			console.warn("cannot get file-tree with id: file-tree")
			return;
		}
	}
	icon_g = icon;
	container.innerHTML = "";
	render(fileTree, container);
	container.addEventListener("click", (e) => {
		//	console.log("CLICK event fired")
		const target = e.target.closest("[data-path]");
		if (!target) return;
		const path = target.dataset.path;
		//	console.log("clicked path:", path);
		if (path === currentPath) return;
		if (pathHistory.current !== currentPath) {
			pathHistory.history = pathHistory.history.slice(0, pathHistory.index + 1);
			pathHistory.history.push(currentPath);
			pathHistory.index++;
		}
		currentPath = path;
	})
	container.addEventListener("dblclick", (e) => {
		const el = e.target.closest("[data-path]");
		if (!el) return;

		const path = el.dataset.path;
		const kind = el.dataset.kind;
		if (!path && !kind) return;
		callback(path, kind);
	});

}
/**
 * Render Context Menu
 * @param {HTMLElement} el - The HTML element to which the context menu is attached.
 * @param {object} menuObject - The context menu object defining the menu structure and actions.
 * @param {number} x 
 * @param {number} y 
 * @param {object} targetData - The data of the target element that was right-clicked, containing 'path' and 'kind'.
 * @example
 * let menu = {
 *   "Open": function(path, kind){ console.log("Open", path, kind); },
 *   "Delete": function(path, kind){ console.log("Delete", path, kind); },
 *   "Copy": function(path, kind){ console.log("Copy", path, kind); },
 *   "Rename": function(path, kind){ console.log("Rename", path, kind); },
 *   "New": {
 *       "File": function(path, kind){ console.log("New File", path, kind); }
 *	   	 "Folder": function(path, kind){ console.log("New Folder", path, kind); }
 *   }
 *  }
 * renderContextMenu(menu,100,100); // This renders the context menu at position (100, 100)
 *  // this function is not supposed to be called directly... use contextMenu() instead
 * @returns {void}
 */
function renderContextMenu(el, menuObject, x, y, targetData) {
	// Clear existing menu if any
	ftClearContextMenu();

	ftContextMenu.id = "ft-context-menu";
	// Basic styling (Consider moving these to a CSS class)
	Object.assign(ftContextMenu.style, {
		position: "fixed", // Fixed is safer for coordinate-based placement
		top: `${y}px`,
		left: `${x}px`,
		backgroundColor: "#2d2d2d",
		color: "white",
		border: "1px solid #555",
		padding: "4px 0",
		zIndex: "1000",
		minWidth: "120px",
		fontSize: "14px",
		borderRadius: "4px"
	});

	for (const key in menuObject) {
		const item = document.createElement("div");
		item.textContent = key;
		Object.assign(item.style, {
			padding: "8px 12px",
			cursor: "pointer"
		});

		// Hover effect
		item.onmouseenter = () => item.style.backgroundColor = "#444";
		item.onmouseleave = () => item.style.backgroundColor = "transparent";

		if (typeof menuObject[key] === "function") {
			item.onclick = (e) => {
				e.stopPropagation();
				// Pass the path and kind of the file we right-clicked on
				menuObject[key](targetData.path, targetData.kind);
				ftClearContextMenu();
			};
		} else if (typeof menuObject[key] === "object") {
			item.textContent += " ▶";

		}

		ftContextMenu.appendChild(item);
	}

	el.appendChild(ftContextMenu);

	// Close logic
	setTimeout(() => {
		document.addEventListener("click", ftClearContextMenu, { once: true });
	}, 10);
}
/**
 * Clear existing context menu
 * @returns {void}
 */
function ftClearContextMenu() {
	const existing = document.getElementById("ft-context-menu");

	if (existing) {
		existing.innerHTML = "";
		existing.remove();
	}
}

/**
 * Context Menu function
 * @param {HTMLElement} listeningContainer - The HTML element to listen for context menu events.
 * @param {object} menuObject - The context menu object defining the menu structure and actions.
 * @returns {void}
 */
function contextMenu(listeningContainer, menuObject) {
	if (listeningContainer instanceof HTMLElement === false) {
		try {
			listeningContainer = document.getElementById(listeningContainer);
		} catch {
			console.warn("cannot get element with id:", listeningContainer);
			return;
		}
	}
	listeningContainer.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		const target = e.target.closest("[data-path]");
		if (!target) return;
		const targetData = {
			path: target.dataset.path,
			kind: target.dataset.kind
		};
		renderContextMenu(listeningContainer, menuObject, e.clientX, e.clientY, targetData);
	});
}
export { render, init, ftClear, renderContextMenu, contextMenu, update };

