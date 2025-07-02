const canvas = document.getElementById("caro");
const ctx = canvas.getContext("2d");
const size = 30;
const rows = 20;
const cols = 20;
let board;
let turn;
let gameOver;

function initGame() {
  board = Array.from({ length: rows }, () => Array(cols).fill(""));
  turn = "X";
  gameOver = false;
  drawBoard();
}

canvas.addEventListener("click", (e) => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / size);
  const y = Math.floor((e.clientY - rect.top) / size);

  if (!board[y][x]) {
    board[y][x] = turn;
    drawBoard();
    if (checkWin(x, y)) {
      setTimeout(() => {
        alert(`${turn} thắng rồi!`);
      }, 100);
      gameOver = true;
    } else {
      turn = turn === "X" ? "O" : "X";
    }
  }
});

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * size);
    ctx.lineTo(cols * size, i * size);
  }
  for (let i = 0; i <= cols; i++) {
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, rows * size);
  }
  ctx.stroke();

  ctx.font = "20px Arial";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x]) {
        ctx.fillText(board[y][x], x * size + 10, y * size + 22);
      }
    }
  }
}

function checkWin(x, y) {
  return (
    count(x, y, 1, 0) + count(x, y, -1, 0) >= 4 || // Ngang
    count(x, y, 0, 1) + count(x, y, 0, -1) >= 4 || // Dọc
    count(x, y, 1, 1) + count(x, y, -1, -1) >= 4 || // Chéo \
    count(x, y, 1, -1) + count(x, y, -1, 1) >= 4    // Chéo /
  );
}

function count(x, y, dx, dy) {
  let count = 0;
  while (
    x + dx >= 0 &&
    x + dx < cols &&
    y + dy >= 0 &&
    y + dy < rows &&
    board[y + dy][x + dx] === turn
  ) {
    count++;
    x += dx;
    y += dy;
  }
  return count;
}

document.getElementById("reset").addEventListener("click", () => {
  initGame();
});

initGame();