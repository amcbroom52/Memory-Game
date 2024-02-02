"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [
  "red", "blue", "green", "orange", "purple",
  "red", "blue", "green", "orange", "purple",
];
const CARDS = [
  "aceClubs", "aceSpades", "aceDiamonds", "aceHearts",
  "twoClubs", "twoSpades", "twoDiamonds", "twoHearts",
  "threeClubs", "threeSpades", "threeDiamonds", "threeHearts",
  "fourClubs", "fourSpades", "fourDiamonds", "fourHearts",
  "fiveClubs", "fiveSpades", "fiveDiamonds", "fiveHearts",
  "sixClubs", "sixSpades", "sixDiamonds", "sixHearts",
  "sevenClubs", "sevenSpades", "sevenDiamonds", "sevenHearts",
  "eightClubs", "eightSpades", "eightDiamonds", "eightHearts",
  "nineClubs", "nineSpades", "nineDiamonds", "nineHearts",
  "tenClubs", "tenSpades", "tenDiamonds", "tenHearts",
  "jackClubs", "jackSpades", "jackDiamonds", "jackHearts",
  "queenClubs", "queenSpades", "queenDiamonds", "queenHearts",
  "kingClubs", "kingSpades", "kingDiamonds", "kingHearts",
];

let flippedCards = [];

let checking = false;
let gamePlaying = false;

let score = 0;
let minute = 0;
let second = 0;
let millisecond = -1;

updateBest();
document.getElementById("difficulty").addEventListener("change", updateBest);



function startGame(){
  if(!gamePlaying){
    const gameBoard = document.getElementById("game");
    const cards = shuffle(CARDS);
    let difficulty = document.getElementById("difficulty").value;
    let button = document.querySelector("button");
    let size;

    switch(difficulty){
      case "easy":
        size = 5;
        break;
      case "medium":
        size = 10;
        break;
      case "hard":
        size = 20;
        break;
    };

    while(gameBoard.firstChild){
      gameBoard.removeChild(gameBoard.lastChild);
    };

    let cardList = cards.slice(0, size).concat(cards.slice(0, size));

    cardList = shuffle(cardList);
    createCards(cardList);

    button.style.opacity = 0.5;
    button.innerHTML = "Playing...";
    button.style.fontSize = "25px";

    document.getElementById("difficulty").disabled = true;
    gamePlaying = true;
    score = -1;

    updateBest();
    increaseScore();
    Timer();
  }
}

/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */

function createCards(cardList) {
  const gameBoard = document.getElementById("game");

  for (let i in cardList) {
    let card = document.createElement("div");
    let cardImg = document.createElement("img");
    let difficulty = document.getElementById("difficulty").value;

    card.id = `${cardList[i]}${(cardList.slice(0,i).includes(cardList[i])) ? 1:0}`;
    card.classList.add(`${difficulty}`);

    cardImg.src = "./images/cardBack.png";
    cardImg.classList.add("card-image");

    card.appendChild(cardImg);
    gameBoard.appendChild(card);
  }
  gameBoard.addEventListener("click", function(event){handleCardClick(event)});
}


/** Flip a card face-up. */

function flipCard(card) {
  let cardDiv = card.parentElement;
  card.src = `./images/${cardDiv.id.substring(0, cardDiv.id.length - 1)}.png`;

  if(flippedCards.length % 2 == 0){
    flippedCards.push(cardDiv);
  } else {
    let previousFlip = flippedCards[flippedCards.length - 1];

    if(previousFlip.id.slice(0, previousFlip.id.length - 1) === cardDiv.id.slice(0, cardDiv.id.length - 1)){
      flippedCards.push(cardDiv);
      if(flippedCards.length == document.getElementById("game").childElementCount){
        endGame();
      }
    } else{
      checking = true;
      setTimeout(unFlipCard, 1000, card);
    }
  }
}

/** Flip a card face-down. */

function unFlipCard(card) {
  flippedCards[flippedCards.length - 1].children[0].src = "./images/cardBack.png";
  card.src = "./images/cardBack.png";
  checking = false;
  flippedCards.pop();
}

function increaseScore(){
  let difficulty = document.getElementById("difficulty").value;
  let bestScore = localStorage.getItem(`${difficulty}Score`);
  let underRecord = true;

  document.getElementById("score").innerHTML = `${++score}`;

  if(score > +bestScore){
    underRecord = false;
  }

  if(underRecord || bestScore === null){
    document.getElementById("score").style.color = "lawngreen";
  } else{
    document.getElementById("score").style.color = "red";
  }
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  let cardDiv = evt.target.parentElement;

  if(CARDS.includes(cardDiv.id.substring(0, cardDiv.id.length - 1)) &&
  ( flippedCards.length == 0 || cardDiv.id != flippedCards[flippedCards.length - 1].id) &&
  !checking && gamePlaying){
    const card = evt.target;
    increaseScore();
    flipCard(card);
  }
}

function Timer(){
  if(gamePlaying){
    millisecond++;

    if(millisecond > 99){
      millisecond = 0;
      second++;
    }
    if(second > 59){
      second = 0;
      minute++;
    }

    let millisecondString = (millisecond > 9) ? `${millisecond}` : `0${millisecond}`;
    let secondString = (second > 9) ? `${second}` : `0${second}`;
    let minuteString = (minute > 9) ? `${minute}` : `0${minute}`;
    document.getElementById("time").innerHTML = (minute > 0) ?
    `${minuteString}:${secondString}:${millisecondString}` : `${secondString}:${millisecondString}`;

    let underRecord = true;
    let currentTime = [minute, second, millisecond];
    let difficulty = document.getElementById("difficulty").value;
    let bestTime = JSON.parse(localStorage.getItem(`${difficulty}Time`));


    for (let i in currentTime){
      if(!bestTime){
        break;
      }
      if(currentTime[i] < bestTime[i]){
        break;
      }
      if(currentTime[i] > bestTime[i]){
        underRecord = false;
        break;
      }
    }

    if(underRecord){
      document.getElementById("time").style.color = "lawngreen";
    } else{
      document.getElementById("time").style.color = "red";
    }

    setTimeout(Timer, 10);
  }
}

function updateBest(){
  let bestTimeText = document.getElementById("best-time");
  let bestScoreText = document.getElementById("best-score");
  let difficulty = document.getElementById("difficulty").value;
  let bestTime = JSON.parse(localStorage.getItem(`${difficulty}Time`));
  let bestScore = localStorage.getItem(`${difficulty}Score`);

  if(!bestTime){
    document.getElementById("best-time").innerHTML = "N/A";
    bestScoreText.innerHTML = "N/A";
    return 0;
  }

  let bestMinute = bestTime[0];
  let bestSecond = bestTime[1];
  let bestMillisecond = bestTime[2];

  let millisecondString = (bestMillisecond > 9) ? `${bestMillisecond}` : `0${bestMillisecond}`;
  let secondString = (bestSecond > 9) ? `${bestSecond}` : `0${bestSecond}`;
  let minuteString = (bestMinute > 9) ? `${bestMinute}` : `0${bestMinute}`;

  bestTimeText.innerHTML = (bestMinute > 0) ?
  `${minuteString}:${secondString}:${millisecondString}` : `${secondString}:${millisecondString}`;

  bestScoreText.innerHTML = bestScore;
}


function endGame(){
  let button = document.querySelector("button");
  let difficulty = document.getElementById("difficulty").value;
  let finalTime = [minute, second, millisecond];
  let bestTime = JSON.parse(localStorage.getItem(`${difficulty}Time`));
  let newRecord = false;

  button.style.opacity = 1;
  button.innerHTML = "Play Again";
  button.style.fontSize = "25px";

  document.getElementById("difficulty").disabled = false;
  gamePlaying = false;

  for (let i in finalTime){
    if(!bestTime){
      newRecord = true;
      break;
    }
    if(finalTime[i] < bestTime[i]){
      newRecord = true;
      break;
    }
    if(finalTime[i] > bestTime[i]){
      break;
    }
  }

  if(newRecord){
    localStorage.setItem(`${difficulty}Time`, JSON.stringify(finalTime));
  }

  if(!(localStorage.getItem(`${difficulty}Score`)) || score < +localStorage.getItem(`${difficulty}Score`)){
    localStorage.setItem(`${difficulty}Score`, score);
  }

  minute = 0;
  second = 0;
  millisecond = -1;

  while(flippedCards[0]){
    flippedCards.pop();
  }
}
