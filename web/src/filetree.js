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
let fileTree = {children: []};
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
	if(typeof parentElement === "string") {
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
/**
 * Clear the file tree container ( needs to be done before each rendring manually)
 * @param container - The HTML element  that holds the file-tree ( defaults to "file-tree")
 * @return {void} 
 */
function ftClear(container=null) {
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
function init(id=null, callback, icon = false) {
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
		console.log("CLICK event fired")
		const target = e.target.closest("[data-path]");
		if (!target) return;
		const path = target.dataset.path;
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
		callback(path,kind);
	});

}
export { render, init, ftClear };

