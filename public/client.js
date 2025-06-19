const socket = io();
let playerIndex = null;
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoresEl = document.getElementById('scores');
const restartBtn = document.getElementById('restart');
let boardState = [];

socket.on('connect', () => {
  statusEl.textContent = 'Waiting for opponent...';
  socket.emit('join');
});

socket.on('joined', (data) => {
  playerIndex = data.playerIndex;
});

socket.on('state', (game) => {
  boardState = game.board;
  renderBoard();
  scoresEl.textContent = `Score: ${game.scores[0]} - ${game.scores[1]}`;
  restartBtn.style.display = game.over ? 'inline' : 'none';
  if (game.over) return;
  if (game.players.length < 2) {
    statusEl.textContent = 'Waiting for opponent...';
  } else if (game.turn === playerIndex) {
    statusEl.textContent = 'Your turn';
  } else {
    statusEl.textContent = "Opponent's turn";
  }
});

socket.on('gameOver', (data) => {
  if (data.disconnected) {
    statusEl.textContent = 'Opponent disconnected';
  } else if (data.loser === playerIndex) {
    statusEl.textContent = 'You hit a mine! You lose!';
  } else {
    statusEl.textContent = 'Opponent hit a mine! You win!';
  }
  if (data.scores) {
    scoresEl.textContent = `Score: ${data.scores[0]} - ${data.scores[1]}`;
  }
  restartBtn.style.display = 'inline';
});

function renderBoard() {
  boardEl.innerHTML = '';
  boardState.forEach((row, r) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    row.forEach((cell, c) => {
      const cellEl = document.createElement('div');
      cellEl.className = 'cell';
      if (cell.revealed) {
        cellEl.classList.add('revealed');
        if (cell.mine) {
          cellEl.classList.add('mine');
          cellEl.textContent = 'X';
        } else if (cell.adjacent > 0) {
          cellEl.textContent = cell.adjacent;
        }
      } else {
        cellEl.addEventListener('click', () => {
          socket.emit('reveal', { r, c });
        });
      }
      rowEl.appendChild(cellEl);
    });
    boardEl.appendChild(rowEl);
  });
}

restartBtn.addEventListener('click', () => {
  socket.emit('restart');
  restartBtn.style.display = 'none';
  statusEl.textContent = 'Waiting for opponent...';
});
