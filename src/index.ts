import { EngineLoop } from "./engineLoop.js";

const canvas = document.getElementById("game-canvas");

if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Missing game-canvas html element");

const e = new EngineLoop(canvas);
e.loop();

canvas.addEventListener("tick", (e) => console.log(e))
