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
      if (aiMode.checked && turn === "O" && !winner) {
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
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) {
        board[y][x] = "O";
        if (checkWin(x, y)) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) {
        board[y][x] = "X";
        if (checkWin(x, y)) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }
  const range = [-1, 0, 1];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x]) {
        for (let dy of range) {
          for (let dx of range) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !board[ny][nx]) {
              return { x: nx, y: ny };
            }
          }
        }
      }
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) return { x, y };
    }
  }
  return null;
}

initGame();