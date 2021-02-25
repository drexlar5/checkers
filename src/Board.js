import { Component } from "react";
import * as helper from "./helpers";

const Square = (props) => {
  const { squareClasses, onClick } = props;

  return <button className={`square ${squareClasses}`} onClick={onClick} />;
};

export default class Board extends Component {
  renderSquare(coordinates, squareClasses) {
    return (
      <Square
        key={coordinates}
        squareClasses={squareClasses}
        onClick={() => this.props.onClick(coordinates)}
      />
    );
  }

  render() {
    let boardRender = [];
    let columnsRender = [];

    const {
      moves,
      boardState,
      columns,
      currentPlayer: player,
      activePiece,
    } = this.props;

    for (let coordinates in boardState) {
      if (!boardState.hasOwnProperty(coordinates)) continue;

      const column = helper.getColumnAsInteger(columns, coordinates);
      const row = helper.getRowAsInteger(coordinates);

      const currentPlayer = helper.returnPlayerName(player);

      const colorClass =
        (helper.isOddNumber(column) && helper.isOddNumber(row)) ||
        (!helper.isOddNumber(column) && !helper.isOddNumber(row))
          ? "white"
          : "black";

      let squareClasses = [];

      squareClasses = [...squareClasses, coordinates, colorClass];

      if (activePiece === coordinates) squareClasses.push("isActive");

      if (moves.indexOf(coordinates) > -1) {
        let moveClass = `movable  ${currentPlayer}-move`;
        squareClasses.push(moveClass);
      }

      if (boardState[coordinates] !== null) {
        squareClasses.push(`${boardState[coordinates].player} piece`);

        if (boardState[coordinates].isKing) squareClasses.push("king");
      }

      squareClasses = squareClasses.join(" ");

      columnsRender.push(this.renderSquare(coordinates, squareClasses));

      if (columnsRender.length >= 8) {
        columnsRender = columnsRender.reverse();
        boardRender.push(
          <div key={boardRender.length} className="board-col">
            {columnsRender}
          </div>
        );
        columnsRender = [];
      }
    }
    return boardRender;
  }
}
