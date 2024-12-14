// import user from "./words.json" assert { type: 'json' };

class App {
  constructor() {
    let randomNumfromRed;
    let alreadyWon;
    window.addEventListener("message", (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === "devvit-message") {
        const { message } = data;

        // Always output full message
        // output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Load initial data
        if (message.type === "initialData") {
          const { username, currentCounter, played } = message.data;
          // usernameLabel.innerText = username;
          // counterLabel.innerText = counter = currentCounter;
          alreadyWon = played;
          randomNumfromRed = currentCounter;
          
        }

        // Update counter
        if (message.type === "updateCounter") {
          const { currentCounter } = message.data;
          // randomNumfromRed = currentCounter;
          // counterLabel.innerText = counter = currentCounter;
        }
      }
    });
    let currentWord = "";
    let scrambledWord = "";
    // this.loadWords();
    function shuffleWord(word) {
      return word
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
    }

    async function startGame() {
      const fetchData = await fetchJSONData();
      const wordList2 = fetchData.users;

      let randomNum;

      if (randomNumfromRed !== 0 && randomNumfromRed !== undefined) {
        
        randomNum = randomNumfromRed;
      } else {
        randomNum = Math.floor(Math.random() * wordList2.length);
      }

      const randomWordObj = wordList2[randomNum];
      currentWord = randomWordObj.word;
      scrambledWord = shuffleWord(currentWord);
      document.getElementById("scrambled-word").textContent = scrambledWord;
      // document.getElementById(
      //   "clue"
      // ).textContent = `Clue: ${randomWordObj.clue}`;
      const imgElement = document.getElementById('myImage');
      imgElement.src = randomWordObj.clue;
      document.getElementById("user-input").value = "";
      document.getElementById("result").textContent = "";
      document
        .getElementById("check-button")
        .addEventListener("click", checkAnswer);
      displayScrambledWord(scrambledWord);
    }
    function displayScrambledWord(word) {
      const container = document.getElementById("scrambled-word");
      container.innerHTML = ""; // Clear previous content
      word.split("").forEach((letter) => {
        const span = document.createElement("span");
        span.textContent = letter;
        container.appendChild(span);
      });
    }

    async function fetchJSONData() {
      try {
        const res = await fetch("./output_img.json");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return data;
      } catch (error) {
        return console.error("Unable to fetch data:", error);
      }
    }
    function checkAnswer() {
      const userInput = document
        .getElementById("user-input")
        .value.trim()
        .toLowerCase();
      const resultDiv = document.getElementById("result");

      if (userInput === currentWord) {
        if (alreadyWon === true) {
          resultDiv.textContent =
            "You have already played this word. Try a new post!";
          resultDiv.style.color = "#9bf59b";
        } else {
          resultDiv.textContent = "Correct! Well done.";
          resultDiv.style.color = "#9bf59b";
          window.parent?.postMessage(
            { type: "updateScore", data: { score: Number(100) } },
            "*"
          );
        }
      } else {
        resultDiv.textContent = "Wrong! Try again.";
        resultDiv.style.color = "red";
      }
    }

    // Start the game when the page loads
    window.onload = startGame;
    // window.onload = getmessage;
  }
}

new App();
