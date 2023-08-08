import { Side, BoardIndex, Position, Piece, CardIndex, sideOpponent } from "./piece.js";
import _ from "lodash";

export class Move {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }
}

export class RelativeMove {
  column: number;
  row: number;

  constructor(column: number, row: number) {
    this.column = column;
    this.row = row;
  }

  applyTo(position: Position) : Position | null {
    const column = position.column + this.column;
    const row = position.row + this.row;

    if (0 <= column && column <= 4 && 0 <= row && row <= 4) {
      return { row: <BoardIndex> row, column: <BoardIndex> column };
    } else {
      return null;
    }
  }

  flip() : RelativeMove {
    return new RelativeMove(-this.column, -this.row);
  }
}

export class Card {
  name: string;
  relativeMoves: RelativeMove[];

  constructor(name: string, relativeMoves: RelativeMove[]) {
    this.name = name;
    this.relativeMoves = relativeMoves;
  }
}

export const cards = [
  new Card("monkey", [new RelativeMove(-1, -1), new RelativeMove(-1, 1), new RelativeMove(1, 1), new RelativeMove(1, -1)]),
  new Card("tiger", [new RelativeMove(0, 2), new RelativeMove(0, -1)]),
  new Card("boar", [new RelativeMove(-1, 0), new RelativeMove(0, 1), new RelativeMove(1, 0)]),
  new Card("mantis", [new RelativeMove(1, 1), new RelativeMove(-1, 1), new RelativeMove(0, -1)]),
  new Card("dragon", [new RelativeMove(2, 1), new RelativeMove(-2, 1), new RelativeMove(-1, -1), new RelativeMove(1, -1)]),
  new Card("crane", [new RelativeMove(1, -1), new RelativeMove(-1, -1), new RelativeMove(0, 1)]),
  new Card("crab", [new RelativeMove(2, -1), new RelativeMove(-2, -1), new RelativeMove(0, 1)]),
];

export class DrawPile {
  cards: Card[];

  constructor() {
    this.cards = [
      new Card("monkey", [new RelativeMove(-1, -1), new RelativeMove(-1, 1), new RelativeMove(1, 1), new RelativeMove(1, -1)]),
      new Card("tiger", [new RelativeMove(0, 2), new RelativeMove(0, -1)]),
      new Card("boar", [new RelativeMove(-1, 0), new RelativeMove(0, 1), new RelativeMove(1, 0)]),
      new Card("mantis", [new RelativeMove(1, 1), new RelativeMove(-1, 1), new RelativeMove(0, -1)]),
      new Card("dragon", [new RelativeMove(2, 1), new RelativeMove(-2, 1), new RelativeMove(-1, -1), new RelativeMove(1, -1)]),
      new Card("crane", [new RelativeMove(1, -1), new RelativeMove(-1, -1), new RelativeMove(0, 1)]),
      new Card("crab", [new RelativeMove(2, -1), new RelativeMove(-2, -1), new RelativeMove(0, 1)]),
    ];
  }

  draw() : Card {
    if (this.cards.length === 0) throw new Error("Drawpile was empty");
    const index = Math.floor(Math.random() * this.cards.length);
    const card = <Card> this.cards[index];
    this.cards.splice(index, 1);
    return card;
  }
}

export class Cardpile {
  redCards: [Card, Card];
  blueCards: [Card, Card];
  neutralCard: Card;

  constructor() {
    const drawPile = new DrawPile();
    this.redCards = [drawPile.draw(), drawPile.draw()];
    this.blueCards = [drawPile.draw(), drawPile.draw()];
    this.neutralCard = drawPile.draw();
  }

  moves(piece: Piece) : Position[] {
    let cards;

    if (piece.side === "red") {
      cards = this.redCards;
    } else {
      cards = this.blueCards;
    }

    let moves : Position[] = [];

    cards.forEach(card => {
     card.relativeMoves.forEach(relativeMove => {
        if (piece.side === "blue") {
         relativeMove = relativeMove.flip();
        }
       const move = relativeMove.applyTo(piece.position);
        if (move) {
          moves.push(move);
        }
      })
    });

    return moves;
  }

  sideCards(side: Side) : [Card, Card] {
    if (side === "red") {
      return this.redCards;
    } else {
      return this.blueCards;
    }
  }

  useCard(card: CardIndex, side: Side) {
    const temp = this.sideCards(side)[card];
    this.sideCards(side)[card] = this.neutralCard;
    this.neutralCard = temp;
  }
}

export class Board {
  pieces: Piece[];
  cardpile: Cardpile;
  side: Side = "blue";

  constructor() {
    this.pieces = [];

    (<BoardIndex[]>[0, 1, 3, 4]).forEach(column => {
      this.pieces.push(new Piece("red", {column, row: 0}));
      this.pieces.push(new Piece("blue", {column, row: 4}));
    });
    this.pieces.push(new Piece("red", {column: 2, row: 0}, "king"));
    this.pieces.push(new Piece("blue", {column: 2, row: 4}, "king"));
    this.cardpile = new Cardpile();
  }

  moveIsValid(move: Move) : boolean {
    const piece = this.findPiece(move.start);
    const capturing = this.findPiece(move.end);

    if (!piece) return false;
    if (piece.side !== this.side) return false;
    if (capturing && capturing.side === piece.side) return false;

    if (_.some(this.cardpile.moves(piece), move.end)) {
      return true;
    } else {
      return false;
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

  removePiece(position: Position) {
    this.pieces = this.pieces.filter(piece => (piece.position.column !== position.column || piece.position.row !== position.row));
  }

  playMove(move: Move, card: CardIndex) {
    const piece = this.findPiece(move.start);
    this.cardpile.useCard(card, this.side);
    this.side = sideOpponent(this.side);

    if (piece) {
      const capturing = this.findPiece(move.end);

      if (capturing) {
        this.removePiece(capturing.position);
      }
      
      piece.position = move.end;
    }
  }

  validMoves(focusedSquare: Position, focusedCard: CardIndex, side: Side): Position[] {
    const moves: Position[] = [];
    this.cardpile.sideCards(side)[focusedCard].relativeMoves.forEach(relativeMove => {
      const move = ((side === "blue") ? relativeMove.flip() : relativeMove).applyTo(focusedSquare);
      if (move) moves.push(move);
    });
    return moves;
  }

  gameWon(): Side | null {
    let redKing = false;
    let blueKing = false;

    this.pieces.forEach(piece => {
      if (piece.pieceType === "king") {
        if (piece.side === "blue") blueKing = true;
        else redKing = true;
      }
    });

    if (!redKing) return "blue";
    if (!blueKing) return "red";
    return null;
  }
}