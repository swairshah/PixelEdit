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

export {};

class PixelEditor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.init();
    }

    public init() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, 100, 200);
    }
}

window.onload = () => {
    new PixelEditor();
};