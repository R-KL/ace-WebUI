
/**
 * File tree renderer.
 *
 * Accepts multiple JSON shapes, for example:
 * - { type: 'directory', name: 'root', children: [...] }
 * - { kind: 'directory', name: 'root', children: [...] }
 * - { name: 'root', children: [...] } // inferred directory
 */

const DEFAULT_EXTENSION_TO_LANGUAGE = {
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	ts: 'typescript',
	tsx: 'typescript',
	json: 'json',
	html: 'html',
	htm: 'html',
	css: 'css',
	md: 'markdown',
	markdown: 'markdown',
	py: 'python',
	rs: 'rust',
	toml: 'toml',
	yml: 'yaml',
	yaml: 'yaml',
	xml: 'xml',
	svg: 'svg',
	sql: 'sql',
	sh: 'powershell',
	ps1: 'powershell',
};

function normalizeNode(node) {
	if (!node || typeof node !== 'object') {
		return { kind: 'file', name: 'unknown', children: undefined, meta: {} };
	}

	const rawKind = node.kind || node.type;
	const hasChildren = Array.isArray(node.children);
	const kind = rawKind === 'directory' || hasChildren ? 'directory' : 'file';
	const name = typeof node.name === 'string' && node.name.trim() ? node.name : 'unknown';

	return {
		kind,
		name,
		children: hasChildren ? node.children : undefined,
		meta: node,
	};
}

function getExtension(fileName) {
	const idx = fileName.lastIndexOf('.');
	if (idx === -1) return '';
	return fileName.slice(idx + 1).toLowerCase();
}

function defaultLanguageForNode(node, extensionToLanguage) {
	if (node.kind !== 'file') return 'text';
	const ext = getExtension(node.name);
	if (!ext) return 'text';
	return extensionToLanguage[ext] || ext || 'text';
}

function el(tag, className, attrs) {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (attrs) {
		for (const [k, v] of Object.entries(attrs)) {
			if (v === undefined || v === null) continue;
			if (k === 'text') element.textContent = String(v);
			else if (k === 'html') element.innerHTML = String(v);
			else element.setAttribute(k, String(v));
		}
	}
	return element;
}

/**
 * Create a DOM element (root <ul>) containing the file tree.
 *
 * @param {object} treeJson input JSON describing a directory/file tree.
 * @param {object} [options]
 * @param {boolean} [options.showIcons=true]
 * @param {string} [options.iconBasePath='icons'] e.g. 'icons' (served from /public/icons)
 * @param {Record<string,string>} [options.extensionToLanguage]
 * @param {(node: any, path: string) => void} [options.onFileClick]
 * @param {(node: any, path: string) => void} [options.onDirectoryClick]
 * @param {(node: any, path: string) => string|null|undefined} [options.iconResolver]
 * @param {(node: any, path: string) => boolean} [options.isInitiallyExpanded]
 * @returns {HTMLElement}
 */
export function createFileTreeElement(treeJson, options = {}) {
	const {
		showIcons = true,
		iconBasePath = 'icons',
		extensionToLanguage = DEFAULT_EXTENSION_TO_LANGUAGE,
		onFileClick,
		onDirectoryClick,
		iconResolver,
		isInitiallyExpanded,
	} = options;

	const rootNode = normalizeNode(treeJson);

	const root = el('ul', 'select-none text-neutral-200 text-sm', { role: 'tree' });

	const build = (rawNode, parentPath) => {
		const node = normalizeNode(rawNode);
		const path = parentPath ? `${parentPath}/${node.name}` : node.name;
		const li = el('li', 'leading-6', { role: 'treeitem' });

		const row = el(
			'div',
			'flex items-center gap-2 px-2 rounded hover:bg-neutral-800 cursor-pointer',
		);

		const isDir = node.kind === 'directory';
		const disclosure = el(
			'span',
			'inline-flex w-4 justify-center text-neutral-400',
			{ 'aria-hidden': 'true', text: isDir ? '▸' : '' }
		);

		const iconWrap = el('span', 'inline-flex w-4 h-4 items-center justify-center');
		if (showIcons) {
			let iconName = null;
			if (typeof iconResolver === 'function') {
				iconName = iconResolver(node.meta, path);
			} else if (!isDir) {
				iconName = defaultLanguageForNode(node, extensionToLanguage);
			} else {
				iconName = 'space';
			}

			if (iconName) {
				const img = el('img', 'w-4 h-4 object-contain', {
					src: `${iconBasePath}/${String(iconName).toLowerCase()}.svg`,
					alt: iconName,
					loading: 'lazy',
				});
				img.addEventListener('error', () => {
					img.remove();
				}, { once: true });
				iconWrap.appendChild(img);
			}
		}

		const label = el('span', 'truncate', { text: node.name });
		row.appendChild(disclosure);
		row.appendChild(iconWrap);
		row.appendChild(label);
		li.appendChild(row);

		if (isDir) {
			const children = Array.isArray(node.children) ? node.children : [];
			const ul = el('ul', 'ml-4 border-l border-neutral-800 pl-2', { role: 'group' });

			const expanded =
				typeof isInitiallyExpanded === 'function'
					? !!isInitiallyExpanded(node.meta, path)
					: parentPath === '' || parentPath == null; // expand root by default

			ul.hidden = !expanded;
			disclosure.textContent = expanded ? '▾' : '▸';

			for (const child of children) {
				ul.appendChild(build(child, path));
			}

			const toggle = () => {
				ul.hidden = !ul.hidden;
				disclosure.textContent = ul.hidden ? '▸' : '▾';
			};

			row.addEventListener('click', (e) => {
				e.preventDefault();
				toggle();
				if (typeof onDirectoryClick === 'function') onDirectoryClick(node.meta, path);
			});

			li.appendChild(ul);
		} else {
			row.addEventListener('click', (e) => {
				e.preventDefault();
				if (typeof onFileClick === 'function') onFileClick(node.meta, path);
			});
		}

		return li;
	};

	root.appendChild(build(rootNode.meta, ''));
	return root;
}

/**
 * Render a tree into a container element.
 *
 * @param {HTMLElement|string} container element or CSS selector
 * @param {object} treeJson
 * @param {object} [options]
 * @returns {HTMLElement} root tree element
 */
export function renderFileTree(container, treeJson, options = {}) {
	const host = typeof container === 'string' ? document.querySelector(container) : container;
	if (!host) throw new Error('renderFileTree: container not found');

	const treeEl = createFileTreeElement(treeJson, options);
	host.innerHTML = '';
	host.appendChild(treeEl);
	return treeEl;
}
