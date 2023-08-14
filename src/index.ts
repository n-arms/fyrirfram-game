
/*
import { Board } from "./board.js";
import { EngineLoop } from "./engineLoop.js";
import { Input, Render } from "./io.js";

const canvas = document.getElementById("game-canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Missing game-canvas html element");

const e = new EngineLoop(canvas);
e.loop();

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context is null");

const input = new Input(new Board(), new Render(ctx));

canvas.addEventListener("tick", (e) => input.hearTickEvent(e));
canvas.addEventListener("mousedown", e => input.hearMousedownEvent(e));
canvas.addEventListener("mouseup", e => input.hearMouseupEvent(e));
*/

import { ActualCanvas, Canvas, Click, Grid, Row, SingleSquare } from "./grid.js";

const canvas = document.getElementById("game-canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Missing game-canvas html element");

class PushButton implements Grid {
  isOn: boolean = true;

  mouseDown(event: Click): void {

  }
  mouseUp(event: Click): void {
    if (this.isOn) this.isOn = false;
    else this.isOn = true;
  }
  render(canvas: Canvas): void {
    canvas.fillRect(0, 0, 1, 1, this.isOn ? "yellow" : "blue");
  }
  getWidth(): number {
    throw new Error("Method not implemented.");
  }
  getHeight(): number {
    throw new Error("Method not implemented.");
  }
}

const grid = new Row([new SingleSquare(100, 100, 1, 1, new PushButton()), new SingleSquare(100, 100, 1, 1, new PushButton())]);
canvas.addEventListener("mouseup", e => {
  const scale = canvas.offsetHeight / canvas.height;
  grid.mouseUp(new Click(e.offsetX / scale, e.offsetY / scale));
});
const canvasWrapper = new ActualCanvas(canvas);

function loop() {
  grid.render(canvasWrapper);
  window.requestAnimationFrame(loop);
}

loop();