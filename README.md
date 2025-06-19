# Two-Player Mines Game

This is a simple web app where two players take turns revealing squares on a 5x5 board. Five squares contain mines. If a player clicks on a mine they lose the game and the other player wins. Revealed cells show the number of adjacent mines. Wins are tracked for the duration of your connection and you can start a new round when the game ends.

## Running the Game

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   npm start
   ```
3. Open `http://localhost:3000` in two different browser windows or devices to play.

When a mine is revealed the game ends and the entire board is shown.

Click **Play Again** after a round finishes to reset the board while keeping the current scores.

The game will automatically pair two connections together. If a player disconnects the game ends.

## Run online with GitHub Codespaces

You can try the game without installing anything locally using GitHub Codespaces.
This repository includes a **devcontainer** configuration. Open the repository on
GitHub and choose **Code → Codespaces → New codespace**. After the codespace
starts, run:

```sh
npm start
```

Then open the forwarded port **3000** to play the game in your browser.
