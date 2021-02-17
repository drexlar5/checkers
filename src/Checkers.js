import * as helper from "./helpers";

export class Checkers {
  constructor(columns) {
    this.columns = columns;
  }

  getCorners = (coordinates) => {
    const column = helper.getColumnAsInteger(this.columns, coordinates);
    const row = helper.getRowAsInteger(coordinates);

    const columnLeft =
      column - 1 >= 0
        ? helper.getColumnAsAlphabet(this.columns, column - 1)
        : false;
    const columnRight =
      column + 1 <= 7
        ? helper.getColumnAsAlphabet(this.columns, column + 1)
        : false;

    const rowUpper = row + 1 < 9 ? row + 1 : false;
    const rowLower = row - 1 > 0 ? row - 1 : false;

    let corners = {};

    corners.leftUpper = columnLeft && rowUpper ? columnLeft + rowUpper : null;
    corners.rightUpper =
      columnRight && rowUpper ? columnRight + rowUpper : null;
    corners.leftLower = columnLeft && rowLower ? columnLeft + rowLower : null;
    corners.rightLower =
      columnRight && rowLower ? columnRight + rowLower : null;

    return corners;
  };

  getMoves = (boardState, coordinates, isKing = false, hasJumped = false) => {
    if (boardState[coordinates] == null) return [];

    let moves = [];
    let jumps = [];

    let killJumps = {};

    const corners = this.getCorners(coordinates);

    const row = helper.getRowAsInteger(coordinates);
    const player = boardState[coordinates].player;

    const advanceRow = player === "player1" ? row - 1 : row + 1;

    for (let key in corners) {
      if (!corners.hasOwnProperty(key)) continue;

      let cornerCoordinates = corners[key];

      if (cornerCoordinates == null) continue;

      if (!isKing && cornerCoordinates.indexOf(advanceRow) < 0) continue;

      if (boardState[cornerCoordinates] === null) {
        moves.push(cornerCoordinates);
      } else {
        let neighborPiece = boardState[cornerCoordinates];

        if (neighborPiece.player === player) continue;

        let opponentCorners = this.getCorners(cornerCoordinates);
        let potentialJump = opponentCorners[key];

        if (boardState[potentialJump] == null) {
          killJumps[cornerCoordinates] = potentialJump;
          jumps.push(potentialJump);
        }
      }
    }
    let movesOut;

    if (!hasJumped) {
      movesOut = moves.concat(jumps);
    } else {
      movesOut = jumps;
    }
    let killJumpsOut = jumps.length > 0 ? killJumps : null;

    return [movesOut, killJumpsOut];
  };

  evaluateWinner = (boardState) => {
    let player1Pieces = 0;
    let player1Moves = 0;

    let player2Pieces = 0;
    let player2Moves = 0;

    for (let coordinates in boardState) {
      if (
        !boardState.hasOwnProperty(coordinates) ||
        boardState[coordinates] == null
      )
        continue;

      const movesData = this.getMoves(
        boardState,
        coordinates,
        boardState[coordinates].isKing,
        false
      );
      const moveCount = movesData[0].length;

      if (boardState[coordinates].player === "player1") {
        ++player1Pieces;
        player1Moves += moveCount;
      } else {
        ++player2Pieces;
        player2Moves += moveCount;
      }
    }

    if (player1Pieces === 0) return "player2pieces";

    if (player2Pieces === 0) return "player1pieces";

    if (player1Moves === 0) return "player2moves";

    if (player2Moves === 0) return "player1moves";

    return null;
  };

  shouldBeKing = (movingPiece, coordinates) => {
    if (movingPiece.isKing) return false;

    const row = helper.getRowAsInteger(coordinates);
    const player = movingPiece.player;

    return (
      (row === 1 && player === "player1") || (row === 8 && player === "player2")
    );
  };

  movePiece = (coordinates, state) => {
    const { stepNumber, activePiece, jumpKills, moves, history } = state;
    let currentState = Object.assign({}, history[stepNumber]);
    let boardState = Object.assign({}, currentState.boardState);
    let movingPiece = Object.assign({}, boardState[activePiece]);

    let jumpArray = [];

    for (let key in jumpKills) {
      if (!jumpKills.hasOwnProperty(key)) continue;

      jumpArray.push(jumpKills[key]);
    }

    // restrict movement if the coordinates don't match a moveable or jumpable square.
    if (moves.indexOf(coordinates) < 0 && jumpArray.indexOf(coordinates) < 0)
      return null;

    if (this.shouldBeKing(movingPiece, coordinates)) movingPiece.isKing = true;

    // Move piece to new coordinates
    boardState[activePiece] = null;
    boardState[coordinates] = movingPiece;

    // Remove opponent piece if jump is made
    const player = movingPiece.player;
    let hasJumped = null;
    let newMoves = [];
    let setCurrentPlayer = player === "player2";
    let setActivePiece = null;

    if (jumpArray.indexOf(coordinates) > -1) {
      let opponentPosition = helper.getKeyByValue(jumpKills, coordinates);
      boardState[opponentPosition] = null;

      newMoves = this.getMoves(
        boardState,
        coordinates,
        movingPiece.isKing,
        true
      );

      if (newMoves[0].length < 1) {
        hasJumped = false;
      } else {
        hasJumped = true;
      }
    }

    if (hasJumped) {
      if (newMoves[0].length > 0) {
        setCurrentPlayer = currentState.setCurrentPlayer;
        setActivePiece = coordinates;
      }
    }

    const updatedState = {
      boardState,
      currentPlayer: setCurrentPlayer,
      activePiece: setActivePiece,
      moves: hasJumped ? newMoves[0] : [],
      jumpKills: hasJumped ? newMoves[1] : null,
      hasJumped: hasJumped ? player : null,
      winner: this.evaluateWinner(boardState),
    };

    return updatedState;
  };
}
