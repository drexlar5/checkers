import { Component } from "react";
import styled from "styled-components";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { returnPlayerName } from "./helpers";
import Board from "./Board";
import { Checkers } from "./Checkers";

/* ------------------------------ image import ------------------------------ */
import redPawn from "./img/red-pawn.png";
import bluePawn from "./img/blue-pawn.png";
import redKing from "./img/red-king.png";
import blueKing from "./img/blue-king.png";

const browserHistory = createBrowserHistory();
class App extends Component {
  constructor(props) {
    super(props);

    this.columns = this.setColumns();

    this.Checkers = new Checkers(this.columns);

    this.state = {
      players: 2,
      history: [
        {
          boardState: this.createBoard(),
          currentPlayer: true,
        },
      ],
      activePiece: null,
      moves: [],
      jumpKills: null,
      hasJumped: null,
      stepNumber: 0,
      winner: null,
    };
  }

  setColumns() {
    const columns = {};
    columns.a = 0;
    columns.b = 1;
    columns.c = 2;
    columns.d = 3;
    columns.e = 4;
    columns.f = 5;
    columns.g = 6;
    columns.h = 7;

    return columns;
  }

  createBoard() {
    // initialize board
    let board = {};

    for (let key in this.columns) {
      if (this.columns.hasOwnProperty(key)) {
        for (let n = 1; n <= 8; n++) {
          let row = key + n;
          board[row] = null;
        }
      }
    }

    board = this.initPlayers(board);

    return board;
  }

  initPlayers(board) {
    const player1 = [
      "a8",
      "c8",
      "e8",
      "g8",
      "b7",
      "d7",
      "f7",
      "h7",
      "a6",
      "c6",
      "e6",
      "g6",
    ];
    const player2 = [
      "b3",
      "d3",
      "f3",
      "h3",
      "a2",
      "c2",
      "e2",
      "g2",
      "b1",
      "d1",
      "f1",
      "h1",
    ];

    let self = this;

    player1.map((elem) => (board[elem] = self.createPiece(elem, "player1")));
    player2.map((elem) => (board[elem] = self.createPiece(elem, "player2")));

    return board;
  }

  createPiece(location, player) {
    let piece = {};

    piece.player = player;
    piece.location = location;
    piece.isKing = false;

    return piece;
  }

  getCurrentState() {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    return history[history.length - 1];
  }

  handleClick(coordinates) {
    if (this.state.winner !== null) return;

    const currentState = this.getCurrentState();
    const boardState = currentState.boardState;
    const clickedSquare = boardState[coordinates];

    // clicked on a piece
    if (clickedSquare !== null) {
      // cannot select opponents piece
      if (clickedSquare.player !== returnPlayerName(currentState.currentPlayer))
        return;

      //  unset active piece if clicked
      if (
        this.state.activePiece === coordinates &&
        this.state.hasJumped === null
      ) {
        this.setState({
          activePiece: null,
          moves: [],
          jumpKills: null,
        });
        return;
      }

      // disable moving of new piece if player has already jumped
      if (this.state.hasJumped !== null && boardState[coordinates] !== null)
        return;

      // set active piece
      let movesData = this.Checkers.getMoves(
        boardState,
        coordinates,
        clickedSquare.isKing,
        false
      );

      this.setState({
        activePiece: coordinates,
        moves: movesData[0],
        jumpKills: movesData[1],
      });

      return;
    }

    // Clicked on an empty square
    if (this.state.activePiece === null) {
      return;
    }

    if (this.state.moves.length > 0) {
      const postMoveState = this.Checkers.movePiece(coordinates, this.state);

      if (postMoveState === null) return;

      this.updateStatePostMove(postMoveState);
    }
  }

  updateStatePostMove(postMoveState) {
    this.setState({
      history: this.state.history.concat([
        {
          boardState: postMoveState.boardState,
          currentPlayer: postMoveState.currentPlayer,
        },
      ]),
      activePiece: postMoveState.activePiece,
      moves: postMoveState.moves,
      jumpKills: postMoveState.jumpKills,
      hasJumped: postMoveState.hasJumped,
      stepNumber: this.state.history.length,
      winner: postMoveState.winner,
    });
  }

  undo() {
    const stepBack = parseInt(this.state.stepNumber, 10) - 1;

    const unsetHistory = this.state.history.slice(0, stepBack + 1);

    this.setState({
      history: unsetHistory,
      activePiece: null,
      moves: [],
      jumpKills: null,
      hasJumped: null,
      stepNumber: stepBack,
      winner: null,
    });
  }

  render() {
    const columns = this.columns;
    const { history, activePiece, moves, stepNumber, winner } = this.state;
    const currentState = history[stepNumber];
    const { boardState, currentPlayer } = currentState;

    let gameStatus;
    let undoClass = "undo";

    if (stepNumber < 1) undoClass += " disabled";

    switch (winner) {
      case "player1pieces":
        gameStatus = "Player One Wins!";
        break;
      case "player2pieces":
        gameStatus = "Player Two Wins!";
        break;
      case "player1moves":
        gameStatus = "No moves left - Player One Wins!";
        break;
      case "player2moves":
        gameStatus = "No moves left - Player Two Wins!";
        break;
      default:
        gameStatus = currentPlayer === true ? "Player One" : "Player Two";
        break;
    }

    return (
      <Router history={browserHistory} basename={"checkers"}>
        <Wrapper className="checkers">
          <div className="game-status">{gameStatus}</div>
          <div className="game-board">
            <Board
              boardState={boardState}
              currentPlayer={currentPlayer}
              activePiece={activePiece}
              moves={moves}
              columns={columns}
              onClick={(coordinates) => this.handleClick(coordinates)}
            />
          </div>
          <div className="time-travel">
            <button
              className={undoClass}
              onClick={() =>
                undoClass.includes("disabled") ? null : this.undo()
              }
            >
              Undo
            </button>
          </div>
        </Wrapper>
      </Router>
    );
  }
}

const Wrapper = styled.div`
  .players > div {
    display: inline-block;
    border: 3px solid wheat;
    font-size: 30px;
    padding: 5px 10px;
    min-width: 250px;
    margin: 0 0 10px 0;
    cursor: pointer;
  }

  .game-board {
    display: inline-block;
    border: 10px solid gold;
    position: relative;
  }

  .game-status {
    display: block;
    padding: 5px;
    background-color: #fff;
    border: 5px solid #deb887;
    width: 55%;
    max-width: 500px;
    font-size: 30px;
    position: relative;
    top: 15px;
    z-index: 3;
    margin: 0 auto;
  }

  .time-travel {
    max-width: 660px;
    display: block;
    margin: 0 auto;
    text-align: right;
  }

  .undo {
    font-size: 15px;
    padding: 5px;
    border-radius: 0;
    background-color: #fff;
    box-shadow: none;
    border: 3px solid #deb887;
    margin: 5px;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  .board-col {
    display: inline-block;
    max-width: 80px;
  }

  .square {
    background: no-repeat #fff;
    border: none;
    height: 80px;
    width: 80px;
    padding: 5px;
    background-origin: content-box;
    background-size: contain;

    &.player1,
    &.player2,
    &.movable {
      cursor: pointer;
    }

    &.movable.player1-move {
      background-color: #ff6347;
    }

    &.movable.player2-move {
      background-color: #7fffd4;
    }

    &.black {
      background-color: #262626;
    }

    &.player1 {
      background-image: url(${redPawn});
      &.king {
        background-image: url(${redKing});
      }
    }

    &.player2 {
      background-image: url(${bluePawn});
      &.king {
        background-image: url(${blueKing});
      }
    }
  }

  .isActive {
    background-color: wheat;
  }

  @media only screen and (max-width: 700px) {
    .board-col {
      max-width: 60px;
    }
    .square {
      height: 60px;
      width: 60px;
    }
  }

  @media only screen and (max-width: 520px) {
    .board-col {
      max-width: 50px;
    }
    .square {
      height: 50px;
      width: 50px;
    }
  }

  @media only screen and (max-width: 440px) {
    .board-col {
      max-width: 40px;
    }
    .square {
      height: 40px;
      width: 40px;
    }
  }

  @media only screen and (max-width: 370px) {
    .board-col {
      max-width: 35px;
    }
    .square {
      height: 35px;
      width: 35px;
    }
  }
`;

export default App;
