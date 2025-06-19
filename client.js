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

let player = {
    nickname: 'Player',
    chips: 1000,
};
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
        player.nickname = nickname;
        loginDiv.style.display = 'none';
        gameDiv.style.display = 'block';
        chipsSpan.innerText = player.chips;
        turnSpan.innerText = player.nickname;
        createBoard();
    }
});

wagerButton.addEventListener('click', () => {
    const wager = parseInt(wagerInput.value);
    const risk = riskSelect.value;
    if (wager > 0 && player.chips >= wager) {
        player.chips -= wager;

        const outcomes = PLINKO_ROWS;
        let rightMoves = 0;
        for (let i = 0; i < outcomes; i++) {
            if (Math.random() < 0.5) {
                rightMoves++;
            }
        }

        const finalPosition = rightMoves;
        const currentMultipliers = MULTIPLIERS[risk];
        const multiplier = currentMultipliers[finalPosition];
        const winnings = wager * multiplier;
        player.chips += winnings;

        chipsSpan.innerText = player.chips;

        if (player.chips <= 0) {
            alert('Game over! You ran out of chips.');
            wagerButton.disabled = true;
            newGameButton.style.display = 'block';
        }
    }
});

newGameButton.addEventListener('click', () => {
    player.chips = 1000;
    chipsSpan.innerText = player.chips;
    wagerButton.disabled = false;
    newGameButton.style.display = 'none';
});
