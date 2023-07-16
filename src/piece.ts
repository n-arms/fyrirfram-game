export type Side = "red" | "blue";
export type BoardIndex = 0 | 1 | 2 | 3 | 4;
export type Position = { row: BoardIndex, column: BoardIndex };
export type PieceType = "pawn" | "king";

export class Piece {
  side: Side;
  position: Position;
  pieceType: PieceType;

  constructor(side: Side, position: Position, pieceType: PieceType = "pawn") {
    this.side = side;
    this.position = position;
    this.pieceType = pieceType;
  }
}