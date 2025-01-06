import './style.css'

const gameBoard = document.getElementById('game-board');
const gameStatus = document.getElementById('game-status');
let boardSize = 4;
let cards = [];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = true;
let matchedPairs = 0;
let attempts = 0;
let devMode = false;
let cardBackImg = "https://img.freepik.com/premium-vector/neon-swirl-curve-blue-line-light-effect-abstract-ring-background-with-glowing-swirling-background-energy-flow-tunnel-blue-portal-platform-magic-circle-vector-luminous-spiral-round-frame_169343-1737.jpg";
const secretCode = "toggledevmode";
let userInput = "";

async function fetchImageUrl() {
  const response = await fetch('https://picsum.photos/200');
  return response.url;
}

async function fetchMultipleImages(count) {
  const requests = [];
  for (let i = 0; i < count; i++) {
    requests.push(fetchImageUrl());
  }
  return await Promise.all(requests);
}

async function generateCardData(size) {
  const cardCount = size * size;
  const imageUrls = await fetchMultipleImages(cardCount / 2);
  const cardData = [];
  for (let i = 0; i < cardCount / 2; i++) {
    cardData.push({
      name: `card${i + 1}`,
      img: btoa(imageUrls[i])
    });
  }
  const generatedCards = [...cardData, ...cardData].map((card) => ({
    ...card,
    id: generateRandomId()
  }));
  return randomizeCards(generatedCards);
}

function randomizeCards(cards) {
  return cards.sort(() => 0.5 - Math.random());
}

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function renderBoard(cards) {
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
  updateCardSize(boardSize);
  cards.forEach(card => {
    gameBoard.insertAdjacentHTML('beforeend', `
      <div class="card w-[var(--card-size)] h-[var(--card-size)] flex justify-center items-center cursor-pointer relative transition-transform duration-600" data-id="${card.id}">
        <div class="front absolute w-full h-full bg-cover bg-center bg-no-repeat backface-hidden border-[3px] border-black rounded-lg" style="background-image: url(${cardBackImg});">
          <div class="dev-cheat absolute bottom-1 right-1 w-8 h-8 bg-cover bg-center bg-no-repeat hidden"></div>
        </div>
        <div class="back absolute w-full h-full bg-cover bg-center bg-no-repeat backface-hidden border-[3px] border-black rounded-lg transform-rotate-y-180" style="background-image: url(${cardBackImg});"></div>
      </div>
    `);
  });
  setCardBackgrounds(cards);
  updateSidebarHeight();
}

function setCardBackgrounds(cards) {
  const cardElements = document.querySelectorAll('.card');
  cardElements.forEach(card => {
    const cardInfo = cards.find(c => c.id === card.dataset.id);

    card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
    card.querySelector('.back').style.backgroundSize = 'contain';
    card.querySelector('.back').style.backgroundPosition = 'center';
    card.querySelector('.back').style.backgroundRepeat = 'no-repeat';
    card.querySelector('.front').style.backgroundImage = `url(${cardBackImg})`;
    card.querySelector('.front').style.backgroundSize = 'cover';
    card.querySelector('.front').style.backgroundPosition = 'center';
    card.querySelector('.front').style.backgroundRepeat = 'no-repeat';
    if (devMode) {
      card.querySelector('.dev-cheat').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      card.classList.add('dev-active');
    } else {
      card.querySelector('.dev-cheat').style.backgroundImage = '';
      if (!card.classList.contains('flipped')) {
        card.querySelector('.back').style.backgroundImage = `url(${cardBackImg})`;
      }
      card.classList.remove('dev-active');
    }
  });
  cardElements.forEach(card => card.addEventListener('click', flipCard));
}

function updateCardSize(boardSize) {
  const root = document.documentElement;
  const cardSize = 400 / boardSize;
  root.style.setProperty('--card-size', `${cardSize}px`);
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;
  this.classList.add('flipped');
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
    updateAttempts();
    if (firstCard.querySelector('.back').style.backgroundImage === secondCard.querySelector('.back').style.backgroundImage) {
      disableCards();
    } else {
      unflipCards();
    }
  }
}

function unflipCards() { 
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard.querySelector('.back').style.backgroundImage = `url(${cardBackImg})`;
    secondCard.querySelector('.back').style.backgroundImage = `url(${cardBackImg})`;
    resetBoard();
  }, 1000);
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchedPairs++;
  resetBoard();
  if (matchedPairs === (boardSize * boardSize / 2)) {
    setTimeout(() => {
      showWinMessage();
    }, 1000);
  }
}

function showWinMessage() {
  gameStatus.innerHTML = `
    <h3 class="text-2xl text-[#7289da]">You WIN!</h3>
    <p class="text-xl text-white">Attempts: ${attempts}</p>
  `;
  gameStatus.classList.remove('hidden');
  updatePlayButton(false);
}

function updateAttempts() {
  gameStatus.querySelector('p').textContent = `Attempts: ${attempts}`;
}

function updatePlayButton(isActive) {
  const playButton = document.getElementById('play-btn');
  if (isActive) {
    playButton.textContent = 'Quit';
    playButton.onclick = quitGame;
  } else {
    playButton.textContent = 'Play';
    playButton.onclick = startGame;
  }
}

function quitGame() {
  document.querySelectorAll('.card').forEach(card => {
    if (!card.classList.contains('flipped')) {
      card.classList.add('flipped');
      const cardInfo = cards.find(c => c.id === card.dataset.id);
      card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
    }
  });
  gameStatus.innerHTML = `
    <h3 class="text-2xl text-[#7289da]">Match Aborted</h3>
    <p class="text-xl text-white">Attempts: ${attempts}</p>
  `;
  gameStatus.classList.remove('hidden');
  updatePlayButton(false);
}

async function startGame() {
  lockBoard = true;
  resetGameVariables();
  gameStatus.innerHTML = `<h3 class="text-2xl text-[#7289da]">Fetching Images...</h3><p id="fetch-progress" class="text-xl text-white">0/${boardSize * boardSize / 2} completed</p>`;
  gameStatus.classList.remove('hidden');
  const flippedCards = document.querySelectorAll('.card.flipped');
  flippedCards.forEach(card => card.classList.remove('flipped'));
  setTimeout(async () => {
    cards = await generateCardData(boardSize);
    resetGameStatus();
    gameBoard.innerHTML = '';
    matchedPairs = 0;
    attempts = 0;
    lockBoard = false;
    renderBoard(cards);
    updatePlayButton(true);
    updateGameStatus();
    if (devMode) {
      document.querySelectorAll('.card').forEach(card => {
        const cardInfo = cards.find(c => c.id === card.dataset.id);
        card.querySelector('.dev-cheat').style.backgroundImage = `url(${atob(cardInfo.img)})`;
        card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
        card.classList.add('dev-active');
      });
    }
  }, 600);
}

function resetGameVariables() {
  firstCard = null;
  secondCard = null;
  hasFlippedCard = false;
  lockBoard = false;
  matchedPairs = 0;
  attempts = 0;
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function updateGameStatus() {
  gameStatus.innerHTML = `
    <h3 class="text-2xl text-[#7289da]">In Match</h3>
    <p class="text-xl text-white">Attempts: ${attempts}</p>
  `;
  gameStatus.classList.remove('hidden');
}

function resetGameStatus() {
  gameStatus.innerHTML = '';
  gameStatus.classList.add('hidden');
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

function toggleDevMode() {
  devMode = !devMode;
  document.querySelectorAll('.card').forEach(card => {
    const cardInfo = cards.find(c => c.id === card.dataset.id);
    if (devMode) {
      card.querySelector('.dev-cheat').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      if (!card.classList.contains('flipped')) {
        card.querySelector('.back').style.backgroundImage = `url(${atob(cardInfo.img)})`;
      }
      card.classList.add('dev-active');
    } else {
      card.querySelector('.dev-cheat').style.backgroundImage = '';
      if (!card.classList.contains('flipped')) {
        card.querySelector('.back').style.backgroundImage = `url(${cardBackImg})`;
      }
      card.classList.remove('dev-active');
    }
  });
}

function changeCardBackImage(url) {
  cardBackImg = url;
  document.querySelectorAll('.card .front').forEach(front => {
    front.style.backgroundImage = `url(${cardBackImg})`;
  });
}

async function changeBoardSize(size) {
  boardSize = parseInt(size);
  resetGameVariables();
  gameStatus.innerHTML = `<h3 class="text-2xl text-[#7289da]">Fetching Images...</h3><p id="fetch-progress" class="text-xl text-white">0/${boardSize * boardSize / 2} completed</p>`;
  gameStatus.classList.remove('hidden');
  cards = await generateCardData(boardSize);
  renderBoard(cards);
  updateSidebarHeight();
  resetGameStatus();
}

function updateSidebarHeight() {
  const gameBoardHeight = gameBoard.offsetHeight;
  const sidebar1 = document.getElementById('sidebar-1');
  const sidebar2 = document.getElementById('sidebar-2');
  sidebar1.style.height = `${gameBoardHeight * 0.91}px`;
  sidebar2.style.height = `${gameBoardHeight * 0.91}px`;
}

(async () => {
  gameStatus.innerHTML = `<h3 class="text-2xl text-[#7289da]">Fetching Images...</h3><p id="fetch-progress" class="text-xl text-white">0/${boardSize * boardSize / 2} completed</p>`;
  gameStatus.classList.remove('hidden');
  cards = await generateCardData(boardSize);
  renderBoard(cards);
  updatePlayButton(false);
  resetGameStatus();
  updateSidebarHeight();
})();
