const socket = io();

const nicknameModal = document.getElementById('nickname-modal');
const nicknameInput = document.getElementById('nickname');
const joinBtn = document.getElementById('joinBtn');
const gameEl = document.getElementById('game');
const statusEl = document.getElementById('status');
const playersEl = document.getElementById('players');
const leaderboardEl = document.getElementById('leaderboard');
const wagerInput = document.getElementById('wager');
const wagerBtn = document.getElementById('wagerBtn');
const plinkoBoardEl = document.getElementById('plinko-board');

let player = null;
let game = null;

const PLINKO_ROWS = 12;
const PEG_WIDTH = 50;
const PEG_HEIGHT = 50;

joinBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit('join', { nickname });
        nicknameModal.style.display = 'none';
        gameEl.style.display = 'block';
    } else {
        alert('Please enter a nickname.');
    }
});

socket.on('joined', (data) => {
    player = data.player;
    statusEl.textContent = `Joined game ${data.gameId}. Waiting for opponent...`;
});

socket.on('state', (gameState) => {
    game = gameState;
    player = game.players[socket.id];
    updatePlayerList();
    renderPlinkoBoard();

    if (game.over) {
        statusEl.textContent = 'Game Over!';
        wagerBtn.disabled = true;
    } else if (game.turn === player.id) {
        statusEl.textContent = 'Your turn. Place your wager.';
        wagerBtn.disabled = false;
    } else {
        statusEl.textContent = `Waiting for ${game.players[game.turn]?.nickname || 'opponent'} to wager.`;
        wagerBtn.disabled = true;
    }
    
    if (player.lastDrop) {
        animateDrop(player.lastDrop);
    }
});

socket.on('gameOver', (data) => {
    game.over = true;
    statusEl.textContent = `Game Over! ${data.winner} wins. Reason: ${data.reason}`;
    wagerBtn.disabled = true;
});

socket.on('error', (data) => {
    alert(`Error: ${data.message}`);
});

wagerBtn.addEventListener('click', () => {
    const wager = parseInt(wagerInput.value, 10);
    if (isNaN(wager) || wager <= 0) {
        return alert('Please enter a valid wager.');
    }
    socket.emit('wager', { wager });
});

function updatePlayerList() {
    if (!game) return;
    playersEl.innerHTML = '<h3>Players</h3>';
    for (const playerId in game.players) {
        const p = game.players[playerId];
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `<b>${p.id === player.id ? p.nickname + ' (You)' : p.nickname}</b>: ${p.chips} chips`;
        if (p.id === game.turn) {
            playerDiv.style.fontWeight = 'bold';
        }
        playersEl.appendChild(playerDiv);
    }
}

function updateLeaderboard(leaderboard) {
    leaderboardEl.innerHTML = '<h3>Global Leaderboard</h3>';
    const sortedPlayers = Object.entries(leaderboard).sort(([, a], [, b]) => b - a);
    for (const [nickname, score] of sortedPlayers) {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `<b>${nickname}</b>: ${score} wagered`;
        leaderboardEl.appendChild(playerDiv);
    }
}

socket.on('leaderboard', (leaderboard) => {
    updateLeaderboard(leaderboard);
});

function renderPlinkoBoard() {
    plinkoBoardEl.innerHTML = '';
    plinkoBoardEl.style.width = `${(PLINKO_ROWS + 1) * PEG_WIDTH}px`;
    plinkoBoardEl.style.height = `${PLINKO_ROWS * PEG_HEIGHT}px`;

    for (let row = 0; row < PLINKO_ROWS; row++) {
        for (let col = 0; col < row + 2; col++) {
            const peg = document.createElement('div');
            peg.className = 'peg';
            peg.style.left = `${(col - (row + 1) / 2) * PEG_WIDTH + plinkoBoardEl.clientWidth / 2}px`;
            peg.style.top = `${row * PEG_HEIGHT}px`;
            plinkoBoardEl.appendChild(peg);
        }
    }
}

function animateDrop(drop) {
    const ball = document.createElement('div');
    ball.className = 'ball';
    plinkoBoardEl.appendChild(ball);

    let step = 0;
    function moveBall() {
        if (step >= drop.path.length) {
            ball.style.backgroundColor = drop.multiplier > 1 ? 'gold' : 'red';
            setTimeout(() => plinkoBoardEl.removeChild(ball), 1000);
            return;
        }
        const position = drop.path[step];
        ball.style.left = `${(position - PLINKO_ROWS / 2) * PEG_WIDTH + plinkoBoardEl.clientWidth / 2}px`;
        ball.style.top = `${step * PEG_HEIGHT}px`;
        step++;
        requestAnimationFrame(moveBall);
    }
    moveBall();
}
