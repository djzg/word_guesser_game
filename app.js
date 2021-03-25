
const guesserElement = document.querySelector('#guesser');
const randomWordElement = document.querySelector('#randomWord');
const definitionElement = document.querySelector('#definition');
const gridElement = document.querySelector(".grid");

let currentWord = '';
let currentDefinition = '';
let currentWinner = "";

const images = [];

// fisher yates algorithm for scrambling words
function scrambleWord(word) {
  const hat = [...word];
  let scrambledWord = '';
  while (hat.length) {
    const randomIndex = Math.floor(Math.random() * hat.length);
    const randomLetter = hat[randomIndex];
    scrambledWord += randomLetter;
    hat.splice(randomIndex, 1);
  }
  return scrambledWord;
}

function updateGrid() {
  gridElement.innerHTML = '';

  images.forEach(image => {
    const imageElement = document.createElement('img');
    imageElement.src = image.src;
    imageElement.style.gridColumn = image.col;
    imageElement.style.gridRow = image.row;
    gridElement.appendChild(imageElement);
  });

};

async function getRandomWord() {
  const response = await fetch('https://random-words-api.vercel.app/word')
  const json = await response.json();
  const [{ word, definition }] = json; // replaces 'const word = json[0].word' accesing of the array element
  return { word, definition };

};
function resetGame({ word, definition }){
  console.log(word, "\n", definition);
  //console.log(scrambleWord(word));
  currentWord = word;
  currentDefinition = definition;
  currentWinner = '';
  guesserElement.textContent = '';
  randomWordElement.textContent = scrambleWord(word);
  definitionElement.textContent = definition;
};

getRandomWord().then(resetGame);


const client = new tmi.Client({
	connection: { reconnect: true },
	channels: [ 'codinggarden' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	console.log(`${tags['display-name']}: ${message}`);
  if (!currentWord) return;

  const [command, ...args] = message.split(' ');
  if (command === '!guess') {
    if (currentWinner) return;

    const guess = args.join(' ');
    if (guess === currentWord) {
      console.log("Winner", guess, tags['display-name']);
      randomWordElement.textContent = currentWord;
      definitionElement.textContent = currentDefinition;
      currentWinner = tags['user-id'];
      guesserElement.textContent = `${tags['display-name']} has guessed: `;
    } else {
      console.log("Incorrect guess!", tags['display-name']);
    }
    if (command === "!place" && tags['user-id'] === currentWinner) {
      const [name, row, col] = args;
      images.push({
        src: 'img/bonsai.png',
        row: row || 3,
        col: col || 5,
      });
      updateGrid();
      getRandomWord().then(resetGame);
    }
  }
});

