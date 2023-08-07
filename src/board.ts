import { Side, BoardIndex, Position, Piece, CardIndex } from "./piece.js";
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
  new Card("cat", [new RelativeMove(0, 2), new RelativeMove(0, -1)]),
  new Card("dog", [new RelativeMove(-2, 1), new RelativeMove(1, 1)]),
  new Card("fish", [new RelativeMove(-1, 1), new RelativeMove(1, -1)]),
  new Card("moose", [new RelativeMove(1, 2), new RelativeMove(-1, 2)]),
  new Card("chipmunk", [new RelativeMove(-1, -1), new RelativeMove(-1, -1)]),
];

function get_random<T>(list: T[]) : T | null {
  if (list.length === 0) return null;
  const elem = list[Math.floor(Math.random() * list.length)];
  if (!elem) return null;
  return elem;
}

function get_card() : Card {
  const card = get_random(cards);
  if (!card) throw new Error("Got null card");
  return card;
}

export class Cardpile {
  cards: [Card, Side | null][];

  constructor() {
    this.cards = [
      [get_card(), "red"],
      [get_card(), "red"],
      [get_card(), "blue"],
      [get_card(), "blue"],
      [get_card(), null],
    ];
  }

  moves(piece: Piece) : Position[] {
    const cards = this.cards
      .filter(([card, side]) => side === piece.side)
      .map(([card, side]) => card);

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
    const cards: Card[] = [];

    this.cards.forEach(([card, cardSide]) => {
      if (cardSide === side) {
        cards.push(card);
      }
    });

    if (cards.length != 2) throw new Error("Incorrect number of cards in cardpile");

    return <[Card, Card]> cards;
  }

  neutralCard() : Card {
    let targetCard : null | Card = null;
    this.cards.forEach(([card, side]) => {
      if (!side) {
        targetCard = card;
      }
    });
    if (!targetCard) throw new Error("No neutral card in cardpile");
    return targetCard;
  }
}

export class Board {
  pieces: Piece[];
  cardpile: Cardpile;

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

  playMove(move: Move) {
    const piece = this.findPiece(move.start);

    if (piece) {
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
}