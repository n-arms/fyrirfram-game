import { TickDetail } from "./engineLoop.js";
import { Side, BoardIndex, Position, PieceType, Piece } from "./piece.js";

type Highlight = "selected" | "reachable";

export class Render {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  borderSize: number = 10;
  cellSize: number;
  innerCellSize: number;

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
  private focusedSquare: Position | null = null;

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

  hearTickEvent(event: Event) {
    if (!("detail" in event)) throw new Error("Expected tick event");
    const detail = <TickDetail> event.detail;

    if (this.focusedSquare) {
      this.render.highlightSquare(this.focusedSquare, "selected");
    }

    this.render.drawGrid();

    this.pieces.forEach(piece => {
      this.render.drawPiece(piece);
    });
  }

  hearMousedownEvent(event: Event) {
    if (!(event instanceof MouseEvent)) throw new Error("Expected mouse event, got " + event);

    if (event.type !== "mousedown") throw new Error("Expected mousedown event");

    const {x, y} = this.canvasCoords(event.offsetX, event.offsetY);
    const position = this.boardCoords(x, y);

    this.focusedSquare = position;
  }

  hearMouseupEvent(event: Event) {
    if (!(event instanceof MouseEvent)) throw new Error("Expected mouse event, got " + event);

    if (event.type !== "mouseup") throw new Error("Expected mouseup event");

    const {x, y} = this.canvasCoords(event.offsetX, event.offsetY);
    const position = this.boardCoords(x, y);

    if (position) {
      if (this.focusedSquare) {
        if (position.column === this.focusedSquare.column && position.row === this.focusedSquare.row) {
          return;
        } else {
          const piece = this.findPiece(this.focusedSquare);

          if (!piece) return;

          piece.position = position;
        }
      } else {
        return;
      }
    } else {
      this.focusedSquare = null;
    }
  }

  canvasCoords(offsetX: number, offsetY: number) : {x: number, y: number} {
    const scale = this.ctx.canvas.offsetHeight / this.ctx.canvas.height;
    const x = offsetX / scale;
    const y = offsetY / scale;

    return {x, y};
  }

  boardCoords(canvasX: number, canvasY: number) : Position | null {
    const x = Math.floor(canvasX / this.render.cellSize);
    const y = Math.floor(canvasY / this.render.cellSize);

    if (0 <= x && x <= 4 && 0 <= y && y <= 4) {
      return {column: <BoardIndex> x, row: <BoardIndex> y};
    } else {
      return null;
    }
  }

  findPiece(position: Position) : Piece | null {
    let targetPiece = null;
    this.pieces.forEach(piece => {
      if (piece.position.column === position.column && piece.position.row === position.row) {
        targetPiece = piece;
      }
    });
    return targetPiece;
  }
}