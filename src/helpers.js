export const isOdd = (number) => Math.abs(number % 2) === 1;

export const getKeyByValue = (object, value) =>
  Object.keys(object).find((key) => object[key] === value);

export const getColumnAsInteger = (columns, coordinate) =>
  columns[coordinate.charAt(0)];

export const getColumnAsAlphabet = (columns, columnInt) => {
  for (let key in columns) {
    if (!columns.hasOwnProperty(key)) continue;

    if (columnInt === columns[key]) return key;
  }
  return false;
};

export const getRowAsInteger = (coordinate) =>
  parseInt(coordinate.charAt(1), 10);

export const returnPlayerName = (isPlayer1) =>
  isPlayer1 ? "player1" : "player2";
