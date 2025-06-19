const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

let games = {};

function createBoard() {
  const size = 5;
  const mineCount = 5;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ mine: false, revealed: false }))
  );
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (!board[r][c].mine) {
      board[r][c] = { mine: true, revealed: false };
      placed++;
    }
  }

  function countAdjacent(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (board[nr][nc].mine) count++;
        }
      }
    }
    return count;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      board[r][c].adjacent = countAdjacent(r, c);
    }
  }

  return board;
}

function createGame() {
  return {
    board: createBoard(),
    players: [],
    turn: 0,
    over: false,
    scores: [0, 0],
  };
}

io.on('connection', (socket) => {
  let currentGameId = null;
  socket.on('join', () => {
    let gameId = Object.keys(games).find(id => games[id].players.length < 2);
    if (!gameId) {
      gameId = socket.id;
      games[gameId] = createGame();
    }
    const game = games[gameId];
    game.players.push(socket.id);
    currentGameId = gameId;
    socket.join(gameId);
    socket.emit('joined', { playerIndex: game.players.length - 1 });
    io.to(gameId).emit('state', game);
  });

  socket.on('reveal', ({ r, c }) => {
    const game = games[currentGameId];
    if (!game || game.over) return;
    const playerIndex = game.players.indexOf(socket.id);
    if (playerIndex !== game.turn) return;
    const cell = game.board[r][c];
    if (cell.revealed) return;
    cell.revealed = true;
    if (cell.mine) {
      game.over = true;
      for (let rr = 0; rr < game.board.length; rr++) {
        for (let cc = 0; cc < game.board[rr].length; cc++) {
          game.board[rr][cc].revealed = true;
        }
      }
      game.scores[1 - playerIndex] += 1;
      io.to(currentGameId).emit('gameOver', { loser: playerIndex, scores: game.scores });
    } else {
      game.turn = 1 - game.turn;
    }
    io.to(currentGameId).emit('state', game);
  });

  socket.on('restart', () => {
    const game = games[currentGameId];
    if (!game || !game.over) return;
    game.board = createBoard();
    game.over = false;
    game.turn = 0;
    io.to(currentGameId).emit('state', game);
  });

  socket.on('disconnect', () => {
    if (currentGameId && games[currentGameId]) {
      const scores = games[currentGameId].scores;
      delete games[currentGameId];
      io.to(currentGameId).emit('gameOver', { disconnected: true, scores });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
