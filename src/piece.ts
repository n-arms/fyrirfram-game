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

export function rotatePosition(position: Position, rotations: number) : Position {
  for (let i = 0; i < rotations; i++) {
    position = {row: position.column, column: <BoardIndex> (4 - position.row)};
  }
  return position;
}