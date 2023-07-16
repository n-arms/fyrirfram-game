import { Side, BoardIndex, Position, PieceType, Piece } from "./piece.js";

export class Move {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }
}

export class Board {
  pieces: Piece[];

  constructor() {
    this.pieces = [];

    (<BoardIndex[]>[0, 1, 3, 4]).forEach(column => {
      this.pieces.push(new Piece("red", {column, row: 0}));
      this.pieces.push(new Piece("blue", {column, row: 4}));
    });
    this.pieces.push(new Piece("red", {column: 2, row: 0}, "king"));
    this.pieces.push(new Piece("blue", {column: 2, row: 4}, "king"));
  }

  moveIsValid(move: Move) : boolean {
    const piece = this.findPiece(move.start);

    if (!piece) return false;

    return true; // TODO
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

  playMove(move: Move) {
    const piece = this.findPiece(move.start);

    if (piece) {
      piece.position = move.end;
    }
  }
}