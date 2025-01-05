import './style.css'

const gameBoard = document.getElementById('game-board');

let cardData = [
  { name: "card1", img: btoa("https://emojiisland.com/cdn/shop/products/Smiling_Face_Emoji_large.png?v=1571606036")},
  { name: "card2", img: btoa("https://emojiisland.com/cdn/shop/products/Skull_Emoji_Icon_8cee31f2-35dd-42e7-b757-3cb8cfe72437_large.png?v=1571606093")},
  { name: "card3", img: btoa("https://emojiisland.com/cdn/shop/products/Fire_Emoji_large.png?v=1571606063")},
  { name: "card4", img: btoa("https://emojiisland.com/cdn/shop/products/The_Sun_Emoji_large.png?v=1571606063")},
  { name: "card5", img: btoa("https://emojiisland.com/cdn/shop/products/17_large.png?v=1571606116")},
  { name: "card6", img: btoa("https://emojiisland.com/cdn/shop/products/Emoji_Icon_-_Sunglasses_cool_emoji_large.png?v=1571606093")},
  { name: "card7", img: btoa("https://emojiisland.com/cdn/shop/products/Money_Bag_Emoji_large.png?v=1571606064")},
  { name: "card8", img: btoa("https://emojiisland.com/cdn/shop/products/Crying_Emoji_Icon_2_large.png?v=1571606091")}
];
let cards = [...cardData, ...cardData].map((card) => ({
  ...card,
  id: generateRandomId()
}));

let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let matchedPairs = 0;
let attempts = 0;
let devMode = false;
const cardBackImg = "https://img.freepik.com/premium-vector/neon-swirl-curve-blue-line-light-effect-abstract-ring-background-with-glowing-swirling-background-energy-flow-tunnel-blue-portal-platform-magic-circle-vector-luminous-spiral-round-frame_169343-1737.jpg";
const secretCode = "toggledevmode";
let userInput = "";

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function randomizeCards(cards) {
  gameBoard.innerHTML = '';
  cards.sort(() => 0.5 - Math.random()).forEach(card => {
    gameBoard.insertAdjacentHTML('beforeend', `
      <div class="card w-24 aspect-square flex justify-center items-center cursor-pointer relative transform-style-3d transition-transform duration-[600ms]" data-id="${card.id}">
        <div class="front absolute w-full h-full rounded-lg bg-white flex justify-center items-center text-2xl">
          <div class="dev-cheat absolute bottom-1 right-1 w-6 h-6 bg-cover bg-center bg-no-repeat"></div>
        </div>
        <div class="back absolute w-full h-full rounded-lg bg-black text-white"></div>
      </div>
    `);
  });
  setCardBackgrounds(cards);
}

function setCardBackgrounds(cards) {
  const cardElements = document.querySelectorAll('.card');
  cardElements.forEach((card, index) => {
    const cardInfo = cards.find(c => c.id === card.dataset.id);

    card.querySelector('.back').style.backgroundImage = `url(data:image/png;base64,${cardInfo.img})`;
    card.querySelector('.back').style.backgroundSize = 'contain';
    card.querySelector('.back').style.backgroundPosition = 'center';
    card.querySelector('.back').style.backgroundRepeat = 'no-repeat';
    card.querySelector('.front').style.backgroundImage = `url(${cardBackImg})`;
    card.querySelector('.front').style.backgroundSize = 'cover';
    card.querySelector('.front').style.backgroundPosition = 'center';
    card.querySelector('.front').style.backgroundRepeat = 'no-repeat';
    card.querySelector('.dev-cheat').style.backgroundImage = '';
  });
  cardElements.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;
  this.classList.add('transform rotate-y-180');
  const cardInfo = cards.find(c => c.id === this.dataset.id);
  this.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
  } else {
    hasFlippedCard = false;
    secondCard = this;
    lockBoard = true;
    attempts++;
    (firstCard.querySelector('.back').style.backgroundImage === secondCard.querySelector('.back').style.backgroundImage) ? disableCards() : unflipCards();
  }
}

function unflipCards() { 
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('transform rotate-y-180');
    secondCard.classList.remove('transform rotate-y-180');
    firstCard.querySelector('.back').style.backgroundImage = `url(data:image/png;base64,${cards.find(c => c.id === firstCard.dataset.id).img})`;
    secondCard.querySelector('.back').style.backgroundImage = `url(data:image/png;base64,${cards.find(c => c.id === secondCard.dataset.id).img})`;
    resetBoard();
  }, 1000);
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchedPairs++;
  resetBoard();
  if (matchedPairs === cardData.length) {
    setTimeout(() => {
      showWinScreen();
    }, 1000);
  }
}

function showWinScreen() {
  gameBoard.insertAdjacentHTML("beforeend", `
    <div id="win-screen" class="text-center fixed bg-gray-800 z-10 w-full h-full flex items-center justify-center flex-col top-0 left-0">
      <h1 class="text-6xl text-blue-400">You WIN!</h1>
      <div class="my-4"><p class="text-white text-2xl">Attempts: ${attempts}</p></div>
      <div><button class="bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded" onclick="restartGame()">Play Again</button></div>
    </div>
  `);
}


function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function restartGame() {
  document.getElementById('win-screen').remove();
  gameBoard.innerHTML = '';
  matchedPairs = 0;
  attempts = 0;
  randomizeCards(cards);
  if (devMode) {
    document.querySelectorAll('.card').forEach(card => {
      const cardInfo = cards.find(c => c.id === card.dataset.id);
      card.querySelector('.dev-cheat').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.classList.add('dev-active');
    });
  }
}

function toggleDevMode() {
  devMode = !devMode;
  document.querySelectorAll('.card').forEach(card => {
    const cardInfo = cards.find(c => c.id === card.dataset.id);
    if (devMode) {
      card.querySelector('.dev-cheat').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.classList.add('dev-active');
    } else {
      card.querySelector('.dev-cheat').style.backgroundImage = '';
      card.querySelector('.back').style.backgroundImage = `url(data:image/png;base64,${cardInfo.img})`;
      card.classList.remove('dev-active');
    }
  });
}

document.addEventListener('keydown', (event) => {
  userInput += event.key.toLowerCase();
  if (userInput.includes(secretCode)) {
    toggleDevMode();
    userInput = "";
  } else if (event.key === 'Escape') {
    if (devMode) {
      toggleDevMode();
    }
    userInput = "";
  }
});

randomizeCards(cards);
