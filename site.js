const changeCells = document.getElementsByClassName("box");
const enterPlayer2 = document.getElementsByClassName("enterPlayer2")[0];
const playerName1Input = document.getElementById("playerName1");
const playerName2Input = document.getElementById("playerName2");
const startBtn = document.getElementById("startBtn");
const nameCaptureContainer = document.getElementById("name-capture-container");
const boardMask = document.getElementById("board-mask");
const endGameContainer = document.getElementById("end-game-container");
const playAgain = document.getElementById("play-again");
const mainMenu = document.getElementById("main-menu");
const winningMessage = document.getElementById("winning-message");
const playerInfoContainer = document.getElementById("player-info-container");
const player1Info = document.getElementById("player-1-info");
const player2Info = document.getElementById("player-2-info");
const player1InfoName = document.getElementById("player-1-info-name");
const player2InfoName = document.getElementById("player-2-info-name");
const player1InfoMark = document.getElementById("player-1-info-mark");
const player2InfoMark = document.getElementById("player-2-info-mark");
const player1InfoWins = document.getElementById("player-1-info-wins");
const player2InfoWins = document.getElementById("player-2-info-wins");
const gameState = {
  player1: {
    name: playerName1,
    mark: null,
    previousWins: 0,
    positions: 0,
  },
  player2: {
    name: playerName2,
    mark: null,
    previousWins: 0,
    positions: 0,
    isBot: true,
  },
  winner: null,
  currentPlayer: null,
};

const winningPositions = [
  0b000000111, 0b000111000, 0b111000000, 0b100100100, 0b010010010, 0b001001001,
  0b100010001, 0b001010100,
];

function changeCurrentPlayer(position) {
  const cellId = position.toString(2).padStart(9, "0");
  const cell = document.getElementById(cellId);
  if (gameState.currentPlayer === gameState.player1) {
    gameState.player1.positions += position;
    cell.innerText = gameState.player1.mark;
    gameState.currentPlayer = gameState.player2;
    if (
      gameState.player2.isBot &&
      gameState.player1.positions + gameState.player2.positions < 511
    ) {
      moveAI();
    }
  } else {
    gameState.player2.positions += position;
    cell.innerText = gameState.player2.mark;
    gameState.currentPlayer = gameState.player1;
  }
  player1Info.classList.toggle("highlight-current-player");
  player2Info.classList.toggle("highlight-current-player");
  checkWinConditions();
}

function checkWinConditions() {
  for (i = 0; i < winningPositions.length; i++) {
    const win = winningPositions[i];
    //console.log(winningPosition);
    if ((win & gameState.player1.positions) === win) {
      gameState.winner = gameState.player1;
      endGameState();
      gameState.player1.previousWins++;
      break;
    } else if ((win & gameState.player2.positions) === win) {
      gameState.winner = gameState.player2;
      endGameState();
      gameState.player2.previousWins++;
      break;
    }
  }
  if (
    gameState.player1.positions + gameState.player2.positions === 511 &&
    gameState.winner === null
  ) {
    endGameState();
  }
}

function setStartButtonState() {
  if (!playerName1Input.value) {
    startBtn.disabled = true;
    return;
  }
  if (
    !playerName2Input.classList.contains("hiddenElement") &&
    !playerName2Input.value
  ) {
    console.log("in setStartButton", !playerName1Input.value);
    startBtn.disabled = true;
    return;
  }
  startBtn.disabled = false;
}

function newGame() {
  gameState.player1.positions = 0;
  gameState.player2.positions = 0;
  if (gameState.winner === gameState.player1) {
    gameState.currentPlayer = gameState.player2;
    gameState.player1.mark = "O";
    gameState.player2.mark = "X";
    player2Info.classList.add("highlight-current-player");
    player1Info.classList.remove("highlight-current-player");
  } else if (gameState.winner === gameState.player2) {
    gameState.currentPlayer = gameState.player1;
    gameState.player1.mark = "X";
    gameState.player2.mark = "O";
    player1Info.classList.add("highlight-current-player");
    player2Info.classList.remove("highlight-current-player");
  } else if (Math.round(Math.random())) {
    gameState.currentPlayer = gameState.player1;
    gameState.player1.mark = "X";
    gameState.player2.mark = "O";
    player1Info.classList.add("highlight-current-player");
    player2Info.classList.remove("highlight-current-player");
  } else {
    gameState.currentPlayer = gameState.player2;
    gameState.player1.mark = "O";
    gameState.player2.mark = "X";
    player1Info.classList.add("highlight-current-player");
    player2Info.classList.remove("highlight-current-player");
  }
  gameState.winner = null;
  boardMask.classList.add("hiddenElement");
  //clear board of marks
  for (i = 0; i < changeCells.length; i++) {
    const changeCell = changeCells[i];
    changeCell.innerHTML = "";
  }
  if (gameState.player2.isBot) {
    gameState.player2.name = "Computer";
  }
  player1InfoName.innerText = gameState.player1.name;
  player2InfoName.innerText = gameState.player2.name;
  player1InfoMark.innerText = gameState.player1.mark;
  player2InfoMark.innerText = gameState.player2.mark;
  player1InfoWins.innerText = gameState.player1.previousWins;
  player2InfoWins.innerText = gameState.player2.previousWins;
  playerInfoContainer.classList.remove("hiddenElement");
  if (gameState.player2.isBot && gameState.player2.mark === "X") {
    moveAI();
  }
}

function endGameState() {
  boardMask.classList.remove("hiddenElement");
  endGameContainer.classList.remove("hiddenElement");
  if (gameState.winner === gameState.player1) {
    winningMessage.innerText = gameState.player1.name + " has won the game!";
  } else if (gameState.winner === gameState.player2) {
    winningMessage.innerText = gameState.player2.name + " has won the game!";
  } else {
    winningMessage.innerText = "Cat's game!";
  }
}

function moveAI() {
  //can I win? if so, move there!
  //can i prevent a win? if so, move there!
  //move to random cell.
  for (i = 0; i < winningPositions.length; i++) {
    const win = winningPositions[i];
    for (j = 0; j < changeCells.length; j++) {
      const cell = changeCells[j];
      const cellValue = parseInt(cell.id, 2);

      if (
        cellValue & gameState.player1.positions ||
        cellValue & gameState.player2.positions
        //then cell already claimed
      ) {
        continue;
      } else {
        let didAIMove = canAIWin(win, cell);
        if (didAIMove) {
          changeCurrentPlayer(didAIMove);
          return;
        }
        didAIMove = canAIBlock(win, cell);
        if (didAIMove) {
          changeCurrentPlayer(didAIMove);
          return;
        }
      }
    }
  }
  moveAIRandom();
}

function canAIWin(win, cell) {
  const cellValue = parseInt(cell.id, 2);
  if (((cellValue + gameState.player2.positions) & win) === win) {
    return cellValue;
  }
  return false;
}

function canAIBlock(win, cell) {
  const cellValue = parseInt(cell.id, 2);
  if (((cellValue + gameState.player1.positions) & win) === win) {
    return cellValue;
  }
  return false;
}

function moveAIRandom() {
  let randomCell = Math.round(Math.random() * 8);
  let randomValue = Math.pow(2, randomCell);
  while (
    randomValue & gameState.player1.positions ||
    randomValue & gameState.player2.positions
  ) {
    randomCell = Math.round(Math.random() * 8);
    randomValue = Math.pow(2, randomCell);
  }
  changeCurrentPlayer(randomValue);
}

// ***********************Event Listeners*****************************
playerName1Input.addEventListener("keyup", setStartButtonState);

enterPlayer2.addEventListener("click", () => {
  let playerEle2 = document.getElementById("playerName2");
  playerEle2.classList.remove("hiddenElement");
  let player2Btn = document.getElementById("player2Btn");
  player2Btn.classList.add("hiddenElement");
  setStartButtonState();
  playerName2Input.focus();
  gameState.player2.isBot = false;
});

playerName2Input.addEventListener("keyup", setStartButtonState);

startBtn.addEventListener("click", () => {
  gameState.player1.name = playerName1Input.value;
  gameState.player2.name = playerName2Input.value;
  nameCaptureContainer.classList.add("hiddenElement");
  newGame();
});

for (i = 0; i < changeCells.length; i++) {
  const changeCell = changeCells[i];
  changeCell.addEventListener("click", function (e) {
    changeCurrentPlayer(parseInt(e.currentTarget.id, 2));
  });
}

playAgain.addEventListener("click", () => {
  newGame();
});

mainMenu.addEventListener("click", () => {
  window.location.reload();
});
