import { TickDetail } from "./engineLoop.js";
import { Side, BoardIndex, Position, PieceType, Piece } from "./piece.js";

type Highlight = "selected" | "reachable";

export class Render {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private borderSize: number = 10;
  private cellSize: number;
  private innerCellSize: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.height = ctx.canvas.height;
    this.width = ctx.canvas.width;
    this.borderSize = 10;
    this.cellSize = (this.height - this.borderSize) / 5;
    this.innerCellSize = this.cellSize - this.borderSize;
  }

  drawGrid() {
    this.ctx.fillStyle = "#000";
    this.ctx.strokeStyle = "#000";

    [0, 1, 2, 3, 4, 5].forEach(x => {
      this.ctx.fillRect(x * this.cellSize, 0, this.borderSize, this.height);
      this.ctx.fillRect(0, x * this.cellSize, this.height, this.borderSize);
    })  
  }


  drawPiece(piece: Piece) {
    if (piece.pieceType === "pawn") {
    this.ctx.beginPath();
      this.ctx.arc(
        this.borderSize + this.innerCellSize / 2 + this.cellSize * piece.position.column, 
        this.borderSize + this.innerCellSize / 2 + this.cellSize * piece.position.row,
        this.innerCellSize / 3,
        0,
        2 * Math.PI
      );
    this.ctx.fill();
      
    } else {
      this.ctx.fillRect(
        this.borderSize + this.innerCellSize / 6 + this.cellSize * piece.position.column,
        this.borderSize + this.innerCellSize / 6 + this.cellSize * piece.position.row,
        this.innerCellSize * 2 / 3,
        this.innerCellSize * 2 / 3
      );
    }
  }

  highlightSquare(position: Position, highlight: Highlight) {
    switch (highlight) {
      case "selected":
        this.ctx.fillStyle = "yellow";
        break;
      case "reachable":
        this.ctx.fillStyle = "blue";
        break;
    }
    this.ctx.fillRect(
      this.borderSize + this.cellSize * position.column,
      this.borderSize + this.cellSize * position.row,
      this.innerCellSize,
      this.innerCellSize
    );
  }
}

export class Board {
  private ctx: CanvasRenderingContext2D;
  private pieces: Piece[];
  private render: Render;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.pieces = [];

    (<BoardIndex[]>[0, 1, 3, 4]).forEach(column => {
      this.pieces.push(new Piece("red", {column, row: 0}));
      this.pieces.push(new Piece("blue", {column, row: 4}));
    });
    this.pieces.push(new Piece("red", {column: 2, row: 0}, "king"));
    this.pieces.push(new Piece("blue", {column: 2, row: 4}, "king"));

    this.render = new Render(ctx);
  }

  hearTickEvent(this: Board ,event: Event) {
    if (!("detail" in event)) throw new Error("Expected tick event");
    const detail = <TickDetail> event.detail;
    this.render.drawGrid();

    this.pieces.forEach(piece => {
      this.render.drawPiece(piece);
    });
  }
}