import { Board } from "./board.js";
import { EngineLoop } from "./engineLoop.js";

const canvas = document.getElementById("game-canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Missing game-canvas html element");

const e = new EngineLoop(canvas);
e.loop();

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context is null");

const board = new Board(ctx);
console.log(board);
canvas.addEventListener("tick", (e) => board.hearTickEvent(e));