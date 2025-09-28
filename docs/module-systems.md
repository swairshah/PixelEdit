# Electron Module Systems Explained

## Overview

Electron apps have two distinct environments that require different module systems:

- **Main Process**: Node.js environment → CommonJS
- **Renderer Process**: Chromium browser environment → ES Modules

## Main Process (CommonJS)

Runs in Node.js with full system access:

```typescript
// src/main/main.ts
import { app, BrowserWindow } from "electron";

// TypeScript compiles to:
const { app, BrowserWindow } = require("electron");
```

**Configuration**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020"
  }
}
```

## Renderer Process (ES Modules)

Runs in Chromium browser, sandboxed:

```typescript
// src/renderer/renderer.ts
export {};

// TypeScript compiles to:
export {};
```

**Configuration**: `tsconfig.renderer.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2020",
    "target": "ES2020"
  }
}
```

## Why Different Systems?

### Security
- Renderer is isolated from Node.js APIs
- Prevents malicious code from accessing file system
- Context isolation with `contextBridge`

### Performance
- Browser optimized for ES modules
- Native module loading in Chromium

### Standards
- ES modules are web standard
- CommonJS is Node.js legacy

## Build Process

```json
{
  "scripts": {
    "build": "tsc && tsc -p tsconfig.renderer.json && mkdir -p dist/renderer && cp src/renderer/index.html dist/renderer/"
  }
}
```

## Common Errors

### "exports is not defined"
- **Cause**: CommonJS code in browser environment
- **Fix**: Use separate TypeScript configs for each process

### "contextBridge API can only be used when contextIsolation is enabled"
- **Cause**: `contextIsolation: false` in webPreferences
- **Fix**: Set `contextIsolation: true` and `nodeIntegration: false`

## Best Practices

1. **Always use separate configs** for main and renderer
2. **Enable context isolation** for security
3. **Use preload scripts** to expose Node.js APIs safely
4. **Keep renderer code browser-compatible**
