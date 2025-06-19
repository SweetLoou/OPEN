const socket = io();

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
const leaderboardList = document.getElementById('leaderboard-list');

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
        console.log(`Joining game with nickname: ${nickname}`);
        socket.emit('join', { nickname });
    }
});

wagerButton.addEventListener('click', () => {
    const wager = parseInt(wagerInput.value);
    const risk = riskSelect.value;
    if (wager > 0) {
        console.log(`Wagering: ${wager} with risk: ${risk}`);
        socket.emit('wager', { wager, risk });
    }
});

newGameButton.addEventListener('click', () => {
    const nickname = player.nickname;
    if (nickname) {
        console.log(`Joining new game with nickname: ${nickname}`);
        socket.emit('join', { nickname });
        newGameButton.style.display = 'none';
    }
});

socket.on('joined', (data) => {
    console.log('Joined game:', data);
    player = data.player;
    gameId = data.gameId;
    loginDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    createBoard();
});

socket.on('state', (game) => {
    console.log('Received game state:', game);
    const me = game.players[player.id];
    if (me) {
        chipsSpan.innerText = me.chips;
    }
    turnSpan.innerText = game.players[game.turn].nickname;
    wagerButton.disabled = game.turn !== player.id;
});

socket.on('leaderboard', (leaderboard) => {
    console.log('Received leaderboard:', leaderboard);
    leaderboardList.innerHTML = '';
    for (const nickname in leaderboard) {
        const li = document.createElement('li');
        li.innerText = `${nickname}: ${leaderboard[nickname]}`;
        leaderboardList.appendChild(li);
    }
});

socket.on('gameOver', (data) => {
    console.log('Game over:', data);
    alert(`Game over! ${data.winner ? `${data.winner} wins!` : ''} ${data.reason}`);
    wagerButton.disabled = true;
    newGameButton.style.display = 'block';
});

socket.on('error', (data) => {
    console.error('Received error:', data);
    alert(data.message);
});
