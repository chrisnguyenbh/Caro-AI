const canvas = document.getElementById('caro');
const ctx = canvas.getContext('2d');
const size = 30;
const rows = 20;
const cols = 20;
let board = Array.from(Array(rows), () => Array(cols).fill(''));
let turn = 'X';

canvas.addEventListener('click', (e) => {
  const x = Math.floor(e.offsetX / size);
  const y = Math.floor(e.offsetY / size);
  if (!board[y][x]) {
    board[y][x] = turn;
    turn = turn === 'X' ? 'O' : 'X';
    drawBoard();
  }
});

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * size);
    ctx.lineTo(cols * size, i * size);
  }
  for (let i = 0; i <= cols; i++) {
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, rows * size);
  }
  ctx.stroke();

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x]) {
        ctx.fillText(board[y][x], x * size + 10, y * size + 20);
      }
    }
  }
}

drawBoard();