export class Click {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export interface Canvas {
  fillRect(x: number, y: number, w: number, h: number, colour: string): void;
  fillCircle(x: number, y: number, w: number, h: number, colour: string): void;
}

export class FunctionalCanvas implements Canvas {
  fillRectClosure: (x: number, y: number, w: number, h: number, colour: string) => void;
  fillCircleClosure: (x: number, y: number, w: number, h: number, colour: string) => void;

  constructor(
    fillRectClosure: (x: number, y: number, w: number, h: number, colour: string) => void,
    fillCircleClosure: (x: number, y: number, w: number, h: number, colour: string) => void
  ) {
    this.fillRectClosure = fillRectClosure;
    this.fillCircleClosure = fillCircleClosure;
  }
  fillRect(x: number, y: number, w: number, h: number, colour: string): void {
    this.fillRectClosure(x, y, w, h, colour);
  }
  fillCircle(x: number, y: number, w: number, h: number, colour: string): void {
    this.fillCircleClosure(x, y, w, h, colour);
  }
}

export class ActualCanvas implements Canvas {
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas API unsupported");
    this.ctx = ctx;
  }
  fillRect(x: number, y: number, w: number, h: number, colour: string): void {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, y, w, h);
  }
  fillCircle(x: number, y: number, w: number, h: number, colour: string): void {
    throw new Error("Bruh circles too hard");
  }
}

export interface Grid {
  mouseDown(event: Click): void;
  mouseUp(event: Click): void;
  render(canvas: Canvas): void;
  getWidth(): number;
  getHeight(): number;
}

export class SingleSquare implements Grid {
  width: number;
  height: number;
  logicalWidth: number;
  logicalHeight: number;
  dispatch: Grid;

  constructor(width: number, height: number, logicalWidth: number, logicalHeight: number, dispatch: Grid) {
    this.width = width;
    this.height = height;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.dispatch = dispatch;
  }
  
  mouseDown(event: Click): void {
    this.dispatch.mouseDown(event);
  }
  mouseUp(event: Click): void {
    this.dispatch.mouseUp(event);
  }
  render(canvas: Canvas): void {
    const xFactor = this.width / this.logicalWidth;
    const yFactor = this.height / this.logicalHeight;
    this.dispatch.render(
      new FunctionalCanvas(
        (x, y, w, h, colour) => canvas.fillRect(x * xFactor, y * yFactor, w * xFactor, h * yFactor, colour),
        (x, y, w, h, colour) => canvas.fillCircle(x * xFactor, y * yFactor, w * xFactor, h * yFactor, colour),
      )
    );
  }
  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }
}

export class Row implements Grid {
  grids: Grid[];

  constructor(grids: Grid[]) {
    this.grids = grids;
  }
  
  mouseDown(event: Click): void {
    let translation = 0;
    this.grids.forEach(grid => {
      const width = grid.getWidth();
      if (translation <= event.x && event.x <= (translation + width)) {
        grid.mouseDown(event);
      }
      translation += width;
    });
  }
  mouseUp(event: Click): void {
    let translation = 0;
    this.grids.forEach(grid => {
      const width = grid.getWidth();
      if (translation <= event.x && event.x <= (translation + width)) {
        grid.mouseUp(event);
      }
      translation += width;
    });
  }
  render(canvas: Canvas): void {
    let translation = 0;
    this.grids.forEach(grid => {
      grid.render(
        new FunctionalCanvas(
          (x, y, w, h, colour) => canvas.fillRect(x + translation, y, w, h, colour),
          (x, y, w, h, colour) => canvas.fillCircle(x + translation, y, w, h, colour),
        )
      );
      translation += grid.getWidth();
    })
  }
  getWidth(): number {
    let total = 0;
    this.grids.forEach(grid => total += grid.getWidth());
    return total;
  }
  getHeight(): number {
    let total = 0;
    this.grids.forEach(grid => total += grid.getHeight());
    return total;
  }
}