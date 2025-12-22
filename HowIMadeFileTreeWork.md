# How the File Tree Implementation Works

This document explains the complete file tree implementation for the Ace WebUI project, covering the architecture, data flow, and key components.

## Overview

The file tree system consists of three main parts:

1. **`opfs.js`** - Origin Private File System (OPFS) operations
2. **`filetree.js`** - DOM tree rendering with icons and context menus
3. **`index.js`** - Alpine.js store integration and event handling

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  File Tree Panel (Alpine x-show)                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  #file-tree-container                       │    │    │
│  │  │  (rendered by createFileTreeElement)        │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     index.js                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Alpine.store('opfs')                                │    │
│  │  - currentDir: string                               │    │
│  │  - fileTreeOpen: boolean                            │    │
│  │  - currentOpenFile: {path, name} | null             │    │
│  │  - getTreeJson() → generates tree structure         │    │
│  │  - drawOPFSFileTree() → calls filetree.js           │    │
│  │  - saveCurrentFile() → saves editor content to OPFS │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│      filetree.js        │  │       opfs.js           │
│  - createFileTreeElement│  │  - readFile()           │
│  - showContextMenu()    │  │  - writeFile()          │
│  - renderFileTree()     │  │  - mkdir()              │
│                         │  │  - deleteFile()         │
│                         │  │  - deleteDir()          │
│                         │  │  - rename()             │
└─────────────────────────┘  └─────────────────────────┘
```

---

## Part 1: OPFS Operations (`opfs.js`)

### What is OPFS?

The **Origin Private File System (OPFS)** is a browser API that provides a private, sandboxed file system for each origin. Unlike localStorage or IndexedDB, it's designed for actual file operations with better performance.

### Core Functions

#### Path Utilities

```javascript
function splitPath(path) {
  return path.replace(/^\/+/, '').split('/').filter(Boolean);
}
```

Converts paths like `/folder/subfolder/file.txt` into `['folder', 'subfolder', 'file.txt']`.

#### Getting Handles

```javascript
async function getDirHandle(path, create = false) {
  const root = await getRoot();
  const parts = splitPath(path);
  let dir = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create });
  }
  return dir;
}
```

OPFS works with "handles" - references to files or directories. This function navigates through the path segments to get the directory handle.

#### File Operations

| Function | Purpose |
|----------|---------|
| `readFile(path, opts)` | Read file contents (text or binary) |
| `writeFile(path, data, opts)` | Create/update a file |
| `deleteFile(path)` | Remove a file |
| `fileSize(path)` | Get file size in bytes |
| `exists(path)` | Check if path exists |

#### Directory Operations

| Function | Purpose |
|----------|---------|
| `mkdir(path)` | Create directory (recursive) |
| `deleteDir(path, recursive)` | Remove directory |
| `listDir(path, recursive)` | List directory contents |
| `dirExists(path)` | Check if directory exists |

#### Move/Rename

```javascript
export async function rename(oldPath, newPath) {
  // Detects if it's a file or directory
  // For files: copy content, delete original
  // For directories: recursively copy all contents
}
```

---

## Part 2: File Tree Renderer (`filetree.js`)

### Purpose

Converts a JSON tree structure into interactive DOM elements with:
- Expandable/collapsible folders
- File/folder icons
- Right-click context menus
- Click handlers for files and directories

### Input JSON Structure

The renderer accepts flexible JSON formats:

```javascript
// Format 1: Explicit type
{ type: 'directory', name: 'root', children: [...] }

// Format 2: Explicit kind (preferred)
{ kind: 'directory', name: 'root', children: [...] }

// Format 3: Inferred from children
{ name: 'root', children: [...] } // inferred as directory
```

### Node Normalization

```javascript
function normalizeNode(node) {
  const rawKind = node.kind || node.type;
  const hasChildren = Array.isArray(node.children);
  const kind = rawKind === 'directory' || hasChildren ? 'directory' : 'file';
  
  return {
    kind,
    name,
    children: hasChildren ? node.children : undefined,
    meta: node,  // Original node for callbacks
  };
}
```

This ensures consistent handling regardless of input format.

### Extension to Language Mapping

```javascript
const DEFAULT_EXTENSION_TO_LANGUAGE = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  py: 'python',
  rs: 'rust',
  // ... more mappings
};
```

Used to determine which icon SVG to load for each file type.

### The `createFileTreeElement` Function

This is the main export. It creates a `<ul>` element containing the entire tree.

#### Options

```javascript
createFileTreeElement(treeJson, {
  showIcons: true,           // Show file/folder icons
  iconBasePath: 'icons',     // Path to icon SVGs
  extensionToLanguage: {},   // Custom extension mappings
  onFileClick: (node, path) => {},     // File click handler
  onDirectoryClick: (node, path) => {}, // Directory click handler
  iconResolver: (node, path) => {},     // Custom icon resolver
  isInitiallyExpanded: (node, path) => {}, // Control initial state
  onContextMenuAction: (action, node, path) => {}, // Context menu handler
});
```

#### The Build Function (Recursive)

```javascript
const build = (rawNode, parentPath) => {
  const node = normalizeNode(rawNode);
  const path = parentPath ? `${parentPath}/${node.name}` : node.name;
  
  // Create list item
  const li = el('li', 'leading-6', { role: 'treeitem' });
  
  // Create row with disclosure arrow, icon, and label
  const row = el('div', 'flex items-center gap-2 px-2 rounded hover:bg-neutral-800');
  
  // Add disclosure triangle (▸ or ▾)
  // Add icon (file type or folder)
  // Add label (file/folder name)
  
  if (isDir) {
    // Create nested <ul> for children
    // Add toggle behavior
    // Add context menu (New File, New Folder, Rename, Delete)
  } else {
    // Add click handler for files
    // Add context menu (Rename, Copy Path, Download, Delete)
  }
  
  return li;
};
```

### Folder Icons

Folders have dynamic icons that change based on expanded state:

```javascript
const updateFolderIcon = (expanded) => {
  if (folderIcon && isDir) {
    folderIcon.src = `${iconBasePath}/${expanded ? 'folder-open' : 'folder'}.svg`;
  }
};
```

### Context Menu System

The context menu is implemented as a singleton:

```javascript
let contextMenuEl = null;

function showContextMenu(x, y, items) {
  hideContextMenu(); // Remove existing menu
  
  contextMenuEl = el('div', 'fixed bg-neutral-800 ...');
  
  for (const item of items) {
    if (item.separator) {
      // Add separator line
    } else {
      // Add clickable menu item with icon and label
    }
  }
  
  document.body.appendChild(contextMenuEl);
  
  // Close on click outside
  document.addEventListener('click', hideContextMenu, { once: true });
}
```

#### Menu Items by Type

**Directory Context Menu:**
- New File
- New Folder
- (separator)
- Rename
- Copy Path
- (separator)
- Delete

**File Context Menu:**
- Rename
- Copy Path
- Download
- (separator)
- Delete

---

## Part 3: Alpine.js Integration (`index.js`)

### The OPFS Store

```javascript
Alpine.store('opfs', {
  currentDir: '/',
  opfs: null,
  initialized: false,
  fileTreeOpen: false,
  
  async init() { ... },
  async cd(path) { ... },
  async getTreeJson() { ... },
  async drawOPFSFileTree(container) { ... },
});
```

### Generating the Tree JSON

```javascript
async getTreeJson(dirHandle = null, currentPath = '') {
  if (!dirHandle) {
    dirHandle = await this.opfs.getRoot();
  }

  const children = [];
  
  for await (const [name, handle] of dirHandle.entries()) {
    const node = {
      name: name,
      kind: handle.kind,
      path: fullPath,
    };

    if (handle.kind === 'directory') {
      node.children = await this.getTreeJson(handle, fullPath);
    }

    children.push(node);
  }

  // Sort: directories first, then alphabetically
  return children.sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === 'directory' ? -1 : 1;
  });
}
```

### Drawing the File Tree

```javascript
async drawOPFSFileTree(container) {
  if (!this.initialized) await this.init();
  
  const children = await this.getTreeJson();
  
  const treeJson = {
    name: 'root',
    kind: 'directory',
    path: '/',
    children: children
  };
  
  const treeElement = createFileTreeElement(treeJson, {
    onFileClick: async (node) => {
      // Load file into Ace Editor
      const file = await this.opfs.readFile(node.path);
      Alpine.store('ace').editor.setValue(file, -1);
      // Set syntax mode based on extension
    },
    
    onContextMenuAction: async (action, node, path) => {
      switch (action) {
        case 'newFile': // prompt for name, create file
        case 'newFolder': // prompt for name, create directory
        case 'rename': // prompt for new name, rename
        case 'download': // create blob, trigger download
        case 'delete': // confirm, then delete
      }
      await refreshTree(); // Redraw after changes
    }
  });
  
  container.appendChild(treeElement);
  this.fileTreeOpen = true;
}
```

### Path Handling (Absolute vs Relative)

```javascript
async cd(path) {
  let target;
  
  if (path.startsWith('/')) {
    // Absolute path - use directly
    target = path;
  } else {
    // Relative path - resolve from currentDir
    let segments = this.currentDir.split('/').filter(Boolean);
    path.split('/').filter(Boolean).forEach(part => {
      if (part === '..') segments.pop();
      else if (part !== '.') segments.push(part);
    });
    target = '/' + segments.join('/');
  }
  
  if (await this.opfs.dirExists(target)) {
    this.currentDir = target;
  }
}
```

---

## HTML Structure

```html
<!-- File Tree Panel -->
<div id="file-tree-panel" 
     x-show="$store.opfs.fileTreeOpen"
     x-transition:enter="transition ease-out duration-200"
     x-transition:enter-start="-translate-x-full opacity-0"
     ...>
  
  <!-- Header with close button -->
  <div class="flex justify-between items-center">
    <span>File Tree</span>
    <button @click="$store.opfs.fileTreeOpen = false">✕</button>
  </div>
  
  <!-- Tree content (populated by drawOPFSFileTree) -->
  <div id="file-tree-container"></div>
</div>
```

---

## CSS Styling

```css
/* Make SVG icons white */
#file-tree-container img {
  filter: brightness(0) invert(1);
}
```

The icons are SVGs with `currentColor` fill/stroke, so we use CSS filter to make them white on the dark background.

---

## Data Flow Summary

1. **User clicks file tree button**
   - `drawOPFSFileTree()` is called
   - OPFS is initialized if needed

2. **Tree JSON is generated**
   - `getTreeJson()` recursively walks OPFS
   - Each entry becomes a node with `{name, kind, path, children?}`

3. **DOM is created**
   - `createFileTreeElement()` builds the `<ul>` tree
   - Event listeners attached for clicks and right-clicks

4. **User interacts**
   - Click file → Load into editor
   - Click folder → Expand/collapse
   - Right-click → Show context menu

5. **Context menu actions**
   - Actions call OPFS functions
   - Tree is refreshed after changes

---

## Icon System

Icons are loaded from `/public/icons/` as SVG files:

| Icon File | Used For |
|-----------|----------|
| `folder.svg` | Closed folders |
| `folder-open.svg` | Expanded folders |
| `javascript.svg` | .js, .jsx, .mjs, .cjs files |
| `typescript.svg` | .ts, .tsx files |
| `python.svg` | .py files |
| `rust.svg` | .rs files |
| `text.svg` | Unknown extensions (fallback) |

The extension-to-icon mapping happens in `defaultLanguageForNode()`.

---

## Error Handling

- **Icon load failure**: Falls back to removing the icon element
- **OPFS not available**: Should check for `navigator.storage.getDirectory` support
- **Path not found**: Logged to console, operation cancelled
- **Delete confirmation**: Uses `confirm()` dialog before destructive actions

---

## Layout & Responsiveness

### Editor Resizing

When the file tree panel opens, the editor shifts to the right to show both side-by-side:

```html
<div id="editor-wrapper" :class="{
    'h-[69vh]': $store.bottomBar.move,
    'ml-64': $store.opfs.fileTreeOpen
}" class="h-[96vh] transition-[margin] duration-200">
```

The `ml-64` class adds a left margin of 256px (same as file tree width).

### Z-Index Layering

The components are layered using z-index:
- **File Tree Panel**: `z-20` - Middle layer
- **Terminal**: `z-30` - On top of file tree when both are open
- **Floating Buttons**: `z-10` - Below panels

This ensures the terminal overlays the file tree when both are visible.

### Ace Editor Resize

When toggling the file tree, the Ace editor needs to recalculate its dimensions:

```javascript
// In drawOPFSFileTree()
setTimeout(() => {
    Alpine.store('ace').editor?.resize();
}, 250); // Wait for CSS transition

// In closeFileTree()
closeFileTree() {
    this.fileTreeOpen = false;
    setTimeout(() => {
        Alpine.store('ace').editor?.resize();
    }, 250);
}
```

---

## Future Improvements

1. **Drag and drop** - Move files between folders
2. **Multi-select** - Select multiple files for bulk operations
3. **Search** - Filter tree by file name
4. **Keyboard navigation** - Arrow keys to navigate, Enter to open
5. **File preview** - Show file content on hover
6. **Custom icons** - Let users define icon mappings
