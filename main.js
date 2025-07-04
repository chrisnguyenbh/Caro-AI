
const canvas = document.getElementById("caro");
const ctx = canvas.getContext("2d");
const rows = 15;
const cols = 15;
const cellSize = canvas.width / cols;
let board = [];
let turn = "X";
let winner = null;
const aiMode = document.getElementById("aiMode");

function initGame() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  turn = "X";
  winner = null;
  drawBoard();
  document.getElementById("status").textContent = "";
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 1; i < rows; i++) {
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
  }
  ctx.stroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x]) {
        ctx.fillText(board[y][x], x * cellSize + 10, y * cellSize + 20);
      }
    }
  }
}

function checkWin(x, y) {
  return (
    countDirection(x, y, 1, 0) + countDirection(x, y, -1, 0) > 4 ||
    countDirection(x, y, 0, 1) + countDirection(x, y, 0, -1) > 4 ||
    countDirection(x, y, 1, 1) + countDirection(x, y, -1, -1) > 4 ||
    countDirection(x, y, 1, -1) + countDirection(x, y, -1, 1) > 4
  );
}

function countDirection(x, y, dx, dy) {
  let count = 0;
  while (
    x + dx >= 0 && x + dx < cols &&
    y + dy >= 0 && y + dy < rows &&
    board[y + dy][x + dx] === turn
  ) {
    count++;
    x += dx;
    y += dy;
  }
  return count;
}

canvas.addEventListener("click", (e) => {
  if (winner) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  if (!board[y][x]) {
    board[y][x] = turn;
    drawBoard();
    if (checkWin(x, y)) {
      winner = turn;
      document.getElementById("status").textContent = "Người thắng: " + turn;
    } else {
      turn = turn === "X" ? "O" : "X";
      if (aiMode.checked && !winner) {
  setTimeout(aiPlay, 300);
      }
    }
  }
});

document.getElementById("reset").addEventListener("click", initGame);

function aiPlay() {
  const move = getAIMove();
  if (move) {
    board[move.y][move.x] = "O";
    drawBoard();
    if (checkWin(move.x, move.y)) {
      winner = "O";
      document.getElementById("status").textContent = "AI thắng!";
    } else {
      turn = "X";
    }
  }
}

function getAIMove() {
  const depth = 3;
  let bestScore = -Infinity;
  let bestMove = null;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) {
        board[y][x] = "O";
        let score = minimax(board, depth - 1, false, -Infinity, Infinity);
        board[y][x] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = { x, y };
        }
      }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  if (depth === 0 || isBoardFull()) {
    return evaluateBoard();
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!board[y][x]) {
          board[y][x] = "O";
          let eval = minimax(board, depth - 1, false, alpha, beta);
          board[y][x] = null;
          maxEval = Math.max(maxEval, eval);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) return maxEval;
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!board[y][x]) {
          board[y][x] = "X";
          let eval = minimax(board, depth - 1, true, alpha, beta);
          board[y][x] = null;
          minEval = Math.min(minEval, eval);
          beta = Math.min(beta, eval);
          if (beta <= alpha) return minEval;
        }
      }
    }
    return minEval;
  }
}

function isBoardFull() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) return false;
    }
  }
  return true;
}

function evaluateBoard() {
  return evaluate("O") - evaluate("X");
}

function evaluate(player) {
  let score = 0;

  function countLine(x, y, dx, dy) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
      let nx = x + dx * i;
      let ny = y + dy * i;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        if (board[ny][nx] === player) {
          count++;
        } else if (board[ny][nx] !== null) {
          return 0;
        }
      }
    }
    return count;
  }

  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      for (let [dx, dy] of directions) {
        let cnt = countLine(x, y, dx, dy);
        if (cnt === 5) score += 100000;
        else if (cnt === 4) score += 1000;
        else if (cnt === 3) score += 100;
        else if (cnt === 2) score += 10;
      }
    }
  }

  return score;
}

initGame();
