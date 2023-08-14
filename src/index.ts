
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
