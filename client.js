const loginDiv = document.getElementById('login');
const gameDiv = document.getElementById('game');
const nicknameInput = document.getElementById('nickname');
const joinButton = document.getElementById('join-game');
const plinkoBoard = document.getElementById('plinko-board');
const chipsSpan = document.getElementById('chips');
const turnSpan = document.getElementById('turn');
const wagerInput = document.getElementById('wager');
const riskSelect = document.getElementById('risk');
const wagerButton = document.getElementById('wager-button');
const newGameButton = document.getElementById('new-game-button');
const messageDiv = document.getElementById('message');

const socket = io('https://plinko-game-server.glitch.me'); // Replace with your Glitch server URL
let player = null;
let gameId = null;

function createBoard() {
    plinkoBoard.innerHTML = '';
    for (let i = 0; i < PLINKO_ROWS; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < i + 1; j++) {
            const peg = document.createElement('div');
            peg.classList.add('peg');
            row.appendChild(peg);
        }
        plinkoBoard.appendChild(row);
    }

    const risk = riskSelect.value;
    const currentMultipliers = MULTIPLIERS[risk];
    const bucketRow = document.createElement('div');
    bucketRow.classList.add('buckets');
    for (let i = 0; i < currentMultipliers.length; i++) {
        const bucket = document.createElement('div');
        bucket.classList.add('bucket');
        bucket.innerText = currentMultipliers[i];
        bucketRow.appendChild(bucket);
    }
    plinkoBoard.appendChild(bucketRow);
}

joinButton.addEventListener('click', () => {
    const nickname = nicknameInput.value;
    if (nickname) {
        socket.emit('join', { nickname });
    }
});

wagerButton.addEventListener('click', () => {
    const wager = parseInt(wagerInput.value);
    const risk = riskSelect.value;
    if (wager > 0 && player.chips >= wager) {
        socket.emit('wager', { wager, risk });
    }
});

newGameButton.addEventListener('click', () => {
    newGameButton.style.display = 'none';
    loginDiv.style.display = 'block';
    gameDiv.style.display = 'none';
});

socket.on('joined', (data) => {
    player = data.player;
    gameId = data.gameId;
    loginDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    chipsSpan.innerText = player.chips;
    createBoard();
});

socket.on('state', (game) => {
    if (game.players[socket.id]) {
        player = game.players[socket.id];
        chipsSpan.innerText = player.chips;
    }
    const turnPlayer = Object.values(game.players).find(p => p.id === game.turn);
    turnSpan.innerText = turnPlayer ? turnPlayer.nickname : 'Unknown';
    wagerButton.disabled = game.turn !== socket.id;
});

socket.on('message', (data) => {
    messageDiv.innerText = data.text;
});

socket.on('gameOver', (data) => {
    alert(`Game over! ${data.winner ? `${data.winner} wins!` : "It's a draw!"} Reason: ${data.reason}`);
    wagerButton.disabled = true;
    newGameButton.style.display = 'block';
});

socket.on('error', (data) => {
    alert(data.message);
});
