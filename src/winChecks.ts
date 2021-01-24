type Board = string[][];
type DebugBoard = boolean[][];

const boardSize = 8;

const checkForWin = (cells: string[], player: string) => {
  let count = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] == player) {
      count++;
      if (count == 4) {
        console.log("won");
        return true;
      }
    } else {
      count = 0;
    }
  }
};

const checkHoriz = (
  row: number,
  col: number,
  player: string,
  board: Board,
  boardSize: number,
  debugBoard: DebugBoard,
  debug = false,
) => {
  let cells = [];

  for (let i = 3; i > 0; i--) {
    if (col - i < 0) continue;
    const cell = board[row][col - i];
    if (debug) debugBoard[row][col - i] = true;
    if (!cell) break;
    cells.push(cell);
  }
  for (let i = 0; i < 4; i++) {
    if (col + i > boardSize - 1) continue;
    const cell = board[row][col + i];
    if (debug) debugBoard[row][col + i] = true;
    if (!cell) break;
    cells.push(cell);
  }

  return checkForWin(cells, player);
};

const checkVert = (
  row: number,
  col: number,
  player: string,
  board: Board,
  boardSize: number,
  debugBoard: DebugBoard,
  debug = false,
) => {
  let cells = [];

  for (let i = 3; i > 0; i--) {
    if (row - i < 0) continue;
    const cell = board[row - i][col];
    if (debug) debugBoard[row - i][col] = true;
    if (!cell) break;
    cells.push(cell);
  }
  for (let i = 0; i < 4; i++) {
    if (row + i > boardSize - 1) continue;
    const cell = board[row + i][col];
    if (debug) debugBoard[row + i][col] = true;
    if (!cell) break;
    cells.push(cell);
  }

  return checkForWin(cells, player);
};

const checkDiagRight = (
  row: number,
  col: number,
  player: string,
  board: Board,
  boardSize: number,
  debugBoard: DebugBoard,
  debug = false,
) => {
  let cells = [];
  for (let i = 3; i > 0; i--) {
    if (row - i < 0 || col - i < 0) continue;
    const cell = board[row - i][col - i];
    if (debug) debugBoard[row - i][col - i] = true;
    if (!cell) break;
    cells.push(cell);
  }
  for (let i = 0; i < 4; i++) {
    if (row + i > boardSize - 1 || col + i > boardSize - 1) continue;
    const cell = board[row + i][col + i];
    if (debug) debugBoard[row + i][col + i] = true;
    if (!cell) break;
    cells.push(cell);
  }

  return checkForWin(cells, player);
};

const checkDiagLeft = (
  row: number,
  col: number,
  player: string,
  board: Board,
  boardSize: number,
  debugBoard: DebugBoard,
  debug = false,
) => {
  let cells = [];
  for (let i = 3; i > 0; i--) {
    if (row - i < 0 || col + i > boardSize - 1) continue;
    const cell = board[row - i][col + i];
    if (debug) debugBoard[row - i][col + i] = true;
    if (!cell) break;
    cells.push(cell);
  }
  for (let i = 0; i < 4; i++) {
    if (row + i > boardSize - 1 || col - i < 0) continue;
    const cell = board[row + i][col - i];
    if (debug) debugBoard[row + i][col - i] = true;
    if (!cell) break;
    cells.push(cell);
  }

  return checkForWin(cells, player);
};

export const checkPositionForWin = (
  row: number,
  col: number,
  player: string,
  board: Board,
  boardSize: number,
  debugBoard: DebugBoard,
  debug = false,
) => {
  if (checkHoriz(row, col, player, board, boardSize, debugBoard, debug))
    return true;
  if (checkVert(row, col, player, board, boardSize, debugBoard, debug))
    return true;
  if (checkDiagLeft(row, col, player, board, boardSize, debugBoard, debug))
    return true;
  if (checkDiagRight(row, col, player, board, boardSize, debugBoard, debug))
    return true;

  return false;
};
