export class EngineLoop {
  private lastTick: number;
  private tickCount: number = 0;
  private millisPerTick: number = 20;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.lastTick = Date.now();
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Requires a browser supporting the canvas API");
    this.ctx = ctx;
  }

  loop() {
    const now = Date.now();
    const elapsed = now - this.lastTick;

    const elapsedTicks = Math.round(elapsed / this.millisPerTick);

    this.lastTick += elapsedTicks * this.millisPerTick;

    this.tickCount += elapsedTicks;

    let tick = new CustomEvent("tick", {
      bubbles: true,
      cancelable: true,
      composed: false,
      detail: {
        tickCount: this.tickCount,
        skippedTicks: elapsedTicks
      }
    });
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.dispatchEvent(tick);

    window.requestAnimationFrame(() => this.loop());
  }
}
