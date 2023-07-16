import { Board, Move } from "./board.js";
import { TickDetail } from "./engineLoop.js";
import { Side, BoardIndex, Position, PieceType, Piece } from "./piece.js";

export type Highlight = "selected" | "reachable";

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
    this.ctx.fillStyle = "#000";
  }

  drawBoard(input: Input) {
    this.drawGrid();
    if (input.focusedSquare) {
      this.highlightSquare(input.focusedSquare, "selected");
    }
    input.board.pieces.forEach(piece => this.drawPiece(piece));
  }
}

export class Input {
  private render: Render;
  focusedSquare: Position | null = null;
  board: Board;
  private ctx: CanvasRenderingContext2D;

  constructor(board: Board, render: Render) {
    this.board = board;
    this.render = render;
    this.ctx = render.ctx;
  }

  hearTickEvent(event: Event) {
    if (!("detail" in event)) throw new Error("Expected tick event");
    const detail = <TickDetail> event.detail;

    if (this.focusedSquare) {
      this.render.highlightSquare(this.focusedSquare, "selected");
    }

    this.render.drawBoard(this);
  }

  hearMousedownEvent(event: Event) {
    if (!(event instanceof MouseEvent)) throw new Error("Expected mouse event, got " + event);

    if (event.type !== "mousedown") throw new Error("Expected mousedown event");

    const {x, y} = this.canvasCoords(event.offsetX, event.offsetY);
    const position = this.boardCoords(x, y);

    if (!position) return;

    if (this.focusedSquare) {
      const move = new Move(this.focusedSquare, position);
      if (this.board.moveIsValid(move)) {
        this.board.playMove(move);
      }
      this.focusedSquare = null;
    } else {
      this.focusedSquare = position;
    }
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
          const move = new Move(this.focusedSquare, position);
          if (this.board.moveIsValid(move)) {
            this.board.playMove(move);
          }
          this.focusedSquare = null;
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
  }}
