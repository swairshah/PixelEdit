# Electron Context Bridge Tutorial

## The Problem

In Electron, you have two processes:
- **Main Process** (`main.ts`) - Controls windows, file system, Node.js APIs
- **Renderer Process** (`renderer.ts`) - Runs in browser-like environment

By default, the renderer **cannot** control main process features like:
- Minimizing windows
- Accessing file system
- Using Node.js APIs

## The Old Way (Deprecated)

```typescript
// main.ts
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false
}

// renderer.ts
const { remote } = require('electron');
const currentWindow = remote.getCurrentWindow();
currentWindow.minimize(); // Direct control
```

**Problems:**
- `remote` module is deprecated
- Security vulnerabilities
- Renderer has full Node.js access
- Can crash main process

## The Modern Way: Context Bridge

Context Bridge creates a **secure, controlled bridge** between processes.

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │  Preload Script │    │  Renderer       │
│                 │    │                 │    │                 │
│ - Full Node.js  │◄──►│ - Node.js APIs  │◄──►│ - Sandboxed     │
│ - Window control│    │ - Can inject    │    │ - Only gets what│
│ - File system   │    │   into window   │    │   you expose    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Setup

**1. Main Process Configuration**
```typescript
// main.ts
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, "preload.js")
}
```

**2. Preload Script**
```typescript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: process.versions,
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});
```

**3. Main Process IPC Handlers**
```typescript
// main.ts
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});
```

**4. TypeScript Declarations**
```typescript
// renderer.ts
declare global {
  interface Window {
    electronAPI: {
      platform: string;
      versions: { node: string; chrome: string; electron: string; };
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
  }
}
```

**5. Using in Renderer**
```typescript
// renderer.ts
window.electronAPI.minimizeWindow();
window.electronAPI.closeWindow();
```

## What the Preload Script Does

The preload script runs in a **special context** that has:

- **Node.js access** - Can use `require`, `process`, `fs`
- **Renderer injection** - Can add things to `window` object
- **Security boundary** - Acts as controlled gateway

**Key Points:**
- Runs **before** renderer code
- Sets up the API bridge
- Only exposes what you choose
- Required for contextBridge pattern

## Security Benefits

- **Sandboxed renderer** - No direct Node.js access
- **Controlled API** - Only expose what you need
- **No code injection** - Prevents `eval`/`require` attacks
- **Process isolation** - Renderer can't crash main process

## Communication Flow

1. **Renderer** calls `window.electronAPI.minimizeWindow()`
2. **Preload** sends IPC message to main process
3. **Main process** receives message and calls `mainWindow.minimize()`
4. **Window actually minimizes**

## When to Use Each Approach

**Use Context Bridge when:**
- Building production apps
- Need security
- Want controlled API surface
- Working with untrusted content

**Use `nodeIntegration: true` when:**
- Quick prototyping
- Internal tools
- You trust the content
- Need full Node.js access

## Summary

Context Bridge is the **recommended, secure way** to give renderer access to main process functionality. The preload script acts as your **API gateway**, exposing only what you want in a controlled manner.
