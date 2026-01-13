// OPFS Helper 
// Works in Chromium + Firefox

let _rootPromise = null;

export async function getRoot() {
  if (!_rootPromise) {
    _rootPromise = navigator.storage.getDirectory();
  }
  return _rootPromise;
}

// -----------------------------
// Path utils
// -----------------------------
function splitPath(path) {
  return path.replace(/^\/+/, '').split('/').filter(Boolean);
}

// -----------------------------
// Core traversal
// -----------------------------
async function getDirHandle(path, create = false) {
  const root = await getRoot();
  const parts = splitPath(path);
  let dir = root;

  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create });
  }
  return dir;
}

async function getFileHandle(path, create = false) {
  const parts = splitPath(path);
  const fileName = parts.pop();
  const dirPath = parts.join('/');
  const dir = await getDirHandle(dirPath, create);
  return dir.getFileHandle(fileName, { create });
}

// -----------------------------
// File operations
// -----------------------------
export async function writeFile(path, data, opts = {}) {
  const {
    append = false,
    binary = false,
  } = opts;

  const fileHandle = await getFileHandle(path, true);
  const writable = await fileHandle.createWritable({
    keepExistingData: append,
  });

  await writable.write(
    binary ? data : String(data)
  );

  await writable.close();
}

export async function readFile(path, opts = {}) {
  const { binary = false } = opts;
  const fileHandle = await getFileHandle(path);
  const file = await fileHandle.getFile();

  return binary ? await file.arrayBuffer() : await file.text();
}

export async function fileSize(path) {
  const fileHandle = await getFileHandle(path);
  const file = await fileHandle.getFile();
  return file.size;
}

export async function exists(path) {
  try {
    const parts = splitPath(path);
    if (parts.length === 0) return true;
    const name = parts.pop();
    const parentDir = await getDirHandle(parts.join('/'));
    await parentDir.getDirectoryHandle(name); 
    return true;
  } catch {
    try {
        const parts = splitPath(path);
        const name = parts.pop();
        const parentDir = await getDirHandle(parts.join('/'));
        await parentDir.getFileHandle(name);
        return true;
    } catch {
        return false;
    }
  }
}

export async function deleteFile(path) {
  const parts = splitPath(path);
  const name = parts.pop();
  const dir = await getDirHandle(parts.join('/'));
  await dir.removeEntry(name);
}

// -----------------------------
// Directory operations
// -----------------------------
export async function mkdir(path) {
  await getDirHandle(path, true);
}

export async function deleteDir(path, recursive = true) {
  const root = await getRoot();
  await root.removeEntry(
    splitPath(path)[0],
    { recursive }
  );
}

// -----------------------------
// Directory listing
// -----------------------------
export async function listDir(path = '/', recursive = false) {
  const dir = path === '/' ? await getRoot() : await getDirHandle(path);
  const result = [];

  for await (const [name, handle] of dir.entries()) {
    result.push({
      name,
      kind: handle.kind,
    });

    if (recursive && handle.kind === 'directory') {
      const sub = await listDir(`${path}/${name}`, true);
      result.push(
        ...sub.map(e => ({
          ...e,
          name: `${name}/${e.name}`,
        }))
      );
    }
  }

  return result;
}
export async function dirExists(path) {
  try {
    if (path === '/' || path === '') return true;
    await getDirHandle(path); // Reuses your existing getDirHandle logic
    return true;
  } catch {
    return false;
  }
}
// -----------------------------
// Move / Rename
// -----------------------------
export async function move(src, dest) {
  const data = await readFile(src, { binary: true });
  await writeFile(dest, data, { binary: true });
  await deleteFile(src);
}

// -----------------------------
// Utility
// -----------------------------
export async function clearAll() {
  const root = await getRoot();
  for await (const [name] of root.entries()) {
    await root.removeEntry(name, { recursive: true });
  }
}
