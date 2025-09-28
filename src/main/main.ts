import { app, BrowserWindow } from "electron";
import path from "path";

class MainWindow {
  private win: BrowserWindow | null = null;

  constructor() {
    app.whenReady().then(() => this.createWindow());
  }

  private createWindow(): void {
    this.win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    console.log(path.join(__dirname, "../renderer/index.html"));

    this.win.loadFile(path.join(__dirname, "../renderer/index.html"));

    this.win.on("closed", () => {
      this.win = null;
    });
  }
}

new MainWindow();
