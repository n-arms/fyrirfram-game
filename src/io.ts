import { Board, Card, Cardpile, Move } from "./board.js";
import { TickDetail } from "./engineLoop.js";
import { Side, BoardIndex, Position, PieceType, Piece, rotatePosition, CardIndex, sideOpponent } from "./piece.js";

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

    [0, 1, 2, 3, 4, 5].forEach(x => {
      this.ctx.fillRect(x * this.cellSize, 0, this.borderSize, this.height);
      this.ctx.fillRect(0, x * this.cellSize, this.height, this.borderSize);
    })  
  }

  drawPiece(piece: Piece, isFlipped: boolean) {
    if (piece.side == "red") {
      this.ctx.fillStyle = "red";
    } else {
      this.ctx.fillStyle = "blue";
    }

    let position;

    if (isFlipped) {
      position = rotatePosition(piece.position, 2);
    } else {
      position = piece.position;
    }

    if (piece.pieceType === "pawn") {
    this.ctx.beginPath();
      this.ctx.arc(
        this.borderSize + this.innerCellSize / 2 + this.cellSize * position.column, 
        this.borderSize + this.innerCellSize / 2 + this.cellSize * position.row,
        this.innerCellSize / 3,
        0,
        2 * Math.PI
      );
    this.ctx.fill();
      
    } else {
      this.ctx.fillRect(
        this.borderSize + this.innerCellSize / 6 + this.cellSize * position.column,
        this.borderSize + this.innerCellSize / 6 + this.cellSize * position.row,
        this.innerCellSize * 2 / 3,
        this.innerCellSize * 2 / 3
      );
    }
  }

  highlightSquare(position: Position, highlight: Highlight, isFlipped: boolean) {
    switch (highlight) {
      case "selected":
        this.ctx.fillStyle = "yellow";
        break;
      case "reachable":
        this.ctx.fillStyle = "#4fb3ff";
        break;
    }
    if (isFlipped) {
      position = rotatePosition(position, 2);
    }
    this.ctx.fillRect(
      this.borderSize + this.cellSize * position.column,
      this.borderSize + this.cellSize * position.row,
      this.innerCellSize,
      this.innerCellSize
    );
  }

  highlightCard(cardSide: Side, playingSide: Side, card: CardIndex) {
    let startX;
    let startY;

    if (cardSide === playingSide) {
      startY = this.height * 2 / 3;
    } else {
      startY = 0;
    }

    startX = this.height + (this.height / 4 + this.height * 2 / 24) * card;

    this.ctx.fillStyle = "yellow";
    this.ctx.fillRect(
      startX, startY, this.height / 24, this.height / 3
    );
    this.ctx.fillRect(
      startX + this.height / 24 + this.height / 4, startY, this.height / 24, this.height / 3
    );
    this.ctx.fillRect(startX, startY, this.height / 3, this.height / 24);
    this.ctx.fillRect(startX, startY + this.height / 24 + this.height / 4, this.height / 3, this.height / 24);
  }

  drawCards(cardpile: Cardpile, side: Side) {
    //this.drawCardBoard(cardpile.neutralCard(), "red", this.height, 0);

    const [r1, r2] = cardpile.sideCards("red");
    const [b1, b2] = cardpile.sideCards("blue");
    const n = cardpile.neutralCard;
    const startX = this.height;

    const pannelWidth = this.height * (1/24 + 1/4 + 2/24 + 1/4 + 1/24);

    this.drawCardBoard(n, null, side, startX + (pannelWidth - this.height / 4) / 2, this.height / 3 + this.height / 24);


    if (side === "red") {
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(this.height, 0, pannelWidth, this.height / 3);
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(this.height, 2 * this.height / 3, pannelWidth, this.height / 3);

      this.drawCardBoard(r1, "red", side, startX + this.height / 24, 2 * this.height / 3 + this.height / 24);
      this.drawCardBoard(r2, "red", side, startX + this.height / 4 + this.height * 3 / 24, 2 * this.height / 3 + this.height / 24);

      this.drawCardBoard(b1, "blue", side, startX + this.height / 24, this.height / 24);
      this.drawCardBoard(b2, "blue", side, startX + this.height / 4 + this.height * 3 / 24, this.height / 24);
    } else {
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(this.height, 0, pannelWidth, this.height / 3);
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(this.height, 2 * this.height / 3, pannelWidth, this.height / 3);

      this.drawCardBoard(b1, "blue", side, startX + this.height / 24, 2 * this.height / 3 + this.height / 24);
      this.drawCardBoard(b2, "blue", side, startX + this.height / 4 + this.height * 3 / 24, 2 * this.height / 3 + this.height / 24);

      this.drawCardBoard(r1, "red", side, startX + this.height / 24, this.height / 24);
      this.drawCardBoard(r2, "red", side, startX + this.height / 4 + this.height * 3 / 24, this.height / 24);
    }
  }

  drawCardBoard(card: Card, cardSide: Side | null, playingSide: Side, startX: number, startY: number) {
    const cellSize = this.cellSize / 4;
    const borderSize = this.borderSize / 4;
    const size = cellSize * 5 + borderSize;
    const innerCellSize = cellSize - borderSize;

    this.ctx.fillStyle = "black";

    [0, 1, 2, 3, 4, 5].forEach(x => {
      this.ctx.fillRect(startX + x * cellSize, startY, borderSize, size);
      this.ctx.fillRect(startX, startY + x * cellSize, size, borderSize);
    });

    this.ctx.fillStyle = "yellow";
    this.ctx.fillRect(
      startX + borderSize + cellSize * 2,
      startY + borderSize + cellSize * 2,
      innerCellSize,
      innerCellSize
    );

    let rotations: number;
    const sideBoxY = startY + borderSize + cellSize * 2;
    const sideBoxX = startX + borderSize + cellSize * 2;

    if (cardSide === null) {
      this.ctx.fillStyle = sideOpponent(playingSide);
      this.ctx.fillRect(startX, sideBoxY, cellSize / 4, innerCellSize);

      this.ctx.fillStyle = playingSide;
      this.ctx.fillRect(startX + size - cellSize / 4, sideBoxY, cellSize / 4, innerCellSize);

      rotations = 1;
    } else {
      switch (playingSide) {
        case "red":
          this.ctx.fillStyle = "blue";
          this.ctx.fillRect(sideBoxX, startY, innerCellSize, cellSize / 4);

          this.ctx.fillStyle = "red";
          this.ctx.fillRect(sideBoxX, startY + size - cellSize / 4, innerCellSize, cellSize / 4);
          break;
        case "blue":
          this.ctx.fillStyle = "red";
          this.ctx.fillRect(sideBoxX, startY, innerCellSize, cellSize / 4);

          this.ctx.fillStyle = "blue";
          this.ctx.fillRect(sideBoxX, startY + size - cellSize / 4, innerCellSize, cellSize / 4);
          break;
      }

      if (cardSide === playingSide) {
        rotations = 2;
      } else {
        rotations = 0;
      }
    }

    this.ctx.fillStyle = "#4fb3ff";
    card.relativeMoves.forEach(relativeMove => {
      let move = relativeMove.applyTo({row: 2, column: 2});

      if (!move) throw new Error("Illegal move");

      move = rotatePosition(move, rotations);

      
      this.ctx.fillRect(startX + borderSize + cellSize * move.column,
      startY + borderSize + cellSize * move.row, innerCellSize, innerCellSize);
    });
  }

  drawBoard(input: Input) {
    this.drawGrid();
    if (input.focusedSquare) {
      this.highlightSquare(input.focusedSquare, "selected", input.side === "red");
    }
    input.moves().forEach(move => {
      this.highlightSquare(move, "reachable", input.side === "red");
    })
    input.board.pieces.forEach(piece => this.drawPiece(piece, input.side === "red"));
  }
}

export class Input {
  private render: Render;
  focusedSquare: Position | null = null;
  focusedCard: CardIndex | null = null;
  board: Board;
  side: Side = "blue";
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
      this.render.highlightSquare(this.focusedSquare, "selected", this.side === "red");
    }

    this.render.drawBoard(this);
    this.render.drawCards(this.board.cardpile, this.side);
    if (this.focusedCard !== null)
      this.render.highlightCard(this.side, this.side, this.focusedCard);

    const winner = this.board.gameWon();

    if (winner) {
      alert(`${winner} has won`)
    }
  }

  hearMousedownEvent(event: Event) {
    if (!(event instanceof MouseEvent)) throw new Error("Expected mouse event, got " + event);

    if (event.type !== "mousedown") throw new Error("Expected mousedown event");

    const {x, y} = this.canvasCoords(event.offsetX, event.offsetY);
    const position = this.boardCoords(x, y);
    const card = this.cardCoords(x, y);


    if (card !== null) {
      this.focusedCard = card;
    }

    if (position) {
      if (this.focusedSquare && this.focusedCard !== null) {
        const move = new Move(this.focusedSquare, position);
        if (this.board.moveIsValid(move)) {
          this.board.playMove(move, this.focusedCard);
          this.side = sideOpponent(this.side);
          this.focusedCard = null;
        }
        this.focusedSquare = null;
      } else if (this.board.findPiece(position)?.side === this.side) {
        this.focusedSquare = position;
      }
    }
  }

  hearMouseupEvent(event: Event) {
    if (!(event instanceof MouseEvent)) throw new Error("Expected mouse event, got " + event);

    if (event.type !== "mouseup") throw new Error("Expected mouseup event");

    const {x, y} = this.canvasCoords(event.offsetX, event.offsetY);
    const position = this.boardCoords(x, y);

    if (position) {
      if (this.focusedSquare && this.focusedCard !== null) {
        if (position.column === this.focusedSquare.column && position.row === this.focusedSquare.row) {
          return;
        } else {
          const move = new Move(this.focusedSquare, position);
          if (this.board.moveIsValid(move)) {
            this.board.playMove(move, this.focusedCard);
            this.side = sideOpponent(this.side);
            this.focusedCard = null;
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
      const position = {column: <BoardIndex> x, row: <BoardIndex> y};
      if (this.side === "blue") return position;
      else return rotatePosition(position, 2)
    } else {
      return null;
    }
  }

  cardCoords(canvasX: number, canvasY: number) : CardIndex | null {
    const height = this.render.height;
    if (canvasY > height || canvasY < 2 * height / 3) {
      return null;
    }
    const x = Math.floor((canvasX - height) / (height / 4 + height / 12));


    if (0 <= x && x <= 1) {
      return <CardIndex> x;
    } else {
      return null;
    }
  }

  moves() : Position[] {
    if (!this.focusedSquare || this.focusedCard === null) return [];

    return this.board.validMoves(this.focusedSquare, this.focusedCard, this.side);
  }
}
