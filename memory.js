const config = document.querySelector("#config");
const gameBoard = document.querySelector("#game-board");
const gameRank = document.querySelector("#game-rank");

const timer = document.querySelector("#timer");
let timerInterval = null;
let seconds = 0;
let localUrl = null;
let boardLocked = false;

/*
TIME HANDLING FUNCTIONS
*/
/**
 * Formats seconds into MM:SS format, e.g. 90 -> "01:30"
 * @param {number} s - time in seconds
 * @returns {string} - formatted time string in MM:SS format
 */
function formatMMSS(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

/**
 * Starts the game timer, updating the timer display every second. If the timer is already running, it does nothing.
 */
function startTimer() {
    if (timerInterval) return;
    timer.textContent = `Time: ${formatMMSS(seconds)}`;
    timerInterval = setInterval(() => {
        seconds++;
        timer.textContent = `Time: ${formatMMSS(seconds)}`;
    }, 1000);
}

/**
 * Stops the game timer.
 */
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

/**
 * Resets the game timer to zero.
 */
function resetTimer() {
    stopTimer();
    seconds = 0;
    if (timer) {
        timer.textContent = `Time: ${formatMMSS(0)}`;
    }
}

/*
THEME IMAGE HANDLING - see README for details on how to add them
*/
/**
 * Map of themes to their image data, including number of available images and a function to get the filepath from the image number.
 */
const themeImages = new Map([
    [
        "name_1",
        {
            numberOfImages: 28,
            filepathFromNumber: (imgNumber) => {
                return `./img/1_avatars/name_img_${
                    imgNumber < 10 ? "0" : ""
                }${imgNumber}.jpg`;
            },
        },
    ],
    [
        "name_2",
        {
            numberOfImages: 42,
            filepathFromNumber: (imgNumber) => {
                return `./img/2_avatars/250px_2_2077_${imgNumber}.png`;
            },
        },
    ],
    [
        "name_3",
        {
            numberOfImages: 20,
            filepathFromNumber: (imgNumber) => {
                return `./img/3_avatars/3_${imgNumber}.jpg`;
            },
        },
    ],
]);

// config form handling
const configForm = document.querySelector("#config form");
configForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const answers = Object.fromEntries(new FormData(configForm).entries());
    answers["board-size"] = Number(answers["board-size"]);
    config.style.display = "none";
    gameBoard.style.display = "flex";
    startGame(answers);
});

const stopButton = document.querySelector("#stopButton");
stopButton.addEventListener("click", () => {
    gameBoard.style.display = "none";
    config.style.display = "flex";
});

/*
MAIN GAME FUNCTIONS
*/
/**
 * Starts the game with the specified board size and theme.
 * @param {{ "board-size": number, theme: string }} param0 - game configuration object containing board size and theme
 */
function startGame({ "board-size": boardSize, theme: theme }) {
    const state = { movesNumber: 0, matches: 0 };
    let clickedTiles = [];

    resetTimer();
    startTimer();

    const selectedImagesNumbers = displayTiles({
        "board-size": boardSize,
        theme: theme,
    });

    const flipCards = document.querySelectorAll(".flip-card");
    handleTileClick(
        boardSize,
        flipCards,
        clickedTiles,
        selectedImagesNumbers,
        state,
        theme
    );
}

/**
 * Handles the click event for each flip card.
 * @param {number} boardSize - The size of the game board.
 * @param {NodeList} flipCards - The list of flip cards.
 * @param {Array} clickedTiles - The list of currently clicked tiles.
 * @param {Array} selectedImagesNumbers - The list of selected image numbers.
 * @param {Object} state - The game state object.
 * @param {string} theme - The theme for the game.
 */
function handleTileClick(
    boardSize,
    flipCards,
    clickedTiles,
    selectedImagesNumbers,
    state,
    theme
) {
    for (let i = 0; i < flipCards.length; i++) {
        flipCards[i].addEventListener("click", () => {
            if (boardLocked) return;
            if (
                clickedTiles.length < 2 &&
                !clickedTiles.includes(flipCards[i]) &&
                !flipCards[i].classList.contains("matched")
            ) {
                showTile(flipCards[i], clickedTiles, state);
            } else if (
                !clickedTiles.includes(flipCards[i]) &&
                !flipCards[i].classList.contains("matched")
            ) {
                checkForMatch(
                    boardSize,
                    flipCards,
                    clickedTiles,
                    selectedImagesNumbers,
                    state,
                    theme
                );
                showTile(flipCards[i], clickedTiles, state);
            }
            /*if (state.matches === (boardSize * boardSize) / 2 - 1) {
                checkForMatch(
                    boardSize,
                    flipCards,
                    clickedTiles,
                    selectedImagesNumbers,
                    state,
                    theme
                );
            }*/
            console.log(state.matches);

            if (clickedTiles.length === 2) {
                const firstTile = clickedTiles[0];
                const secondTile = clickedTiles[1];
                const firstIndex = Array.from(flipCards).indexOf(
                    clickedTiles[0]
                );
                const secondIndex = Array.from(flipCards).indexOf(
                    clickedTiles[1]
                );
                if (
                    !(
                        selectedImagesNumbers[firstIndex] ===
                        selectedImagesNumbers[secondIndex]
                    )
                ) {
                    boardLocked = true;
                    clickedTiles.length = 0;
                    setTimeout(() => {
                        firstTile.querySelector(
                            ".flip-card-inner"
                        ).style.transform = "rotateY(0deg)";
                        secondTile.querySelector(
                            ".flip-card-inner"
                        ).style.transform = "rotateY(0deg)";
                        boardLocked = false;
                    }, 600);
                } else {
                    checkForMatch(
                        boardSize,
                        flipCards,
                        clickedTiles,
                        selectedImagesNumbers,
                        state,
                        theme
                    );
                    clickedTiles.length = 0;
                }
            }
        });
    }
}

/**
 * Shows the clicked tile and updates the game state.
 * @param {HTMLElement} tile - The tile that was clicked.
 * @param {Array} clickedTiles - The list of currently clicked tiles.
 * @param {Object} state - The game state object.
 */
function showTile(tile, clickedTiles, state) {
    tile.querySelector(".flip-card-inner").style.transform = "rotateY(180deg)";
    clickedTiles.push(tile);
    state.movesNumber++;
    const moves = document.querySelector("#moves");
    moves.innerHTML = `Moves: ${state.movesNumber}`;
}

/**
 * Checks if the two clicked tiles form a match.
 * @param {number} boardSize - The size of the game board.
 * @param {NodeList} flipCards - The list of flip cards.
 * @param {Array} clickedTiles - The list of currently clicked tiles.
 * @param {Array} selectedImagesNumbers - The list of selected image numbers.
 * @param {Object} state - The game state object.
 * @param {string} theme - The theme for the game.
 */
function checkForMatch(
    boardSize,
    flipCards,
    clickedTiles,
    selectedImagesNumbers,
    state,
    theme
) {
    if (clickedTiles.length === 2) {
        const firstIndex = Array.from(flipCards).indexOf(clickedTiles[0]);
        const secondIndex = Array.from(flipCards).indexOf(clickedTiles[1]);
        if (
            selectedImagesNumbers[firstIndex] ===
            selectedImagesNumbers[secondIndex]
        ) {
            // it's a match
            clickedTiles[0].classList.add("matched");
            clickedTiles[1].classList.add("matched");
            state.matches++;
            //clickedTiles.length = 0;
            console.log(state.matches);
            if (state.matches === (boardSize * boardSize) / 2) {
                // game over
                stopTimer();
                setTimeout(() => {
                    displayEndScreen(
                        state.movesNumber,
                        seconds,
                        boardSize,
                        theme
                    );
                }, 500);
            }
        }
    }
}

/*
BOARD GAME DISPLAY FUNCTIONS
*/
/**
 * Displays the game tiles based on the specified board size and theme.
 * @param {{ "board-size": number, theme: string }} param0 - The game configuration object.
 * @returns {Array} - The list of selected image numbers.
 */
function displayTiles({ "board-size": boardSize, theme: theme }) {
    const tiles = document.querySelector("#tiles");
    tiles.innerHTML = "";
    tiles.style.setProperty("--cols", boardSize);
    const [selectedImagesNumbers, selectedImagesPaths] = selectRandomTileImages(
        themeImages.get(theme),
        boardSize
    );
    for (let i = 0; i < boardSize * boardSize; i++) {
        const flipCard = createFLipCard(selectedImagesPaths[i]);
        tiles.appendChild(flipCard);
    }

    return selectedImagesNumbers;
}

/**
 * Creates a flip card element with the specified image source.
 * @param {string} src - The source URL of the image for the flip card back.
 * @returns {HTMLElement} - The created flip card element.
 */
function createFLipCard(src) {
    // Example of a generated flip card:
    ("<div class='flip-card'>\
            <div class='flip-card-inner'>\
                <div class='flip-card-front'>przód</div>\
                <div class='flip-card-back'>tył</div>\
            </div>\
    </div>");
    const flipCard = document.createElement("div");
    flipCard.classList.add("flip-card");

    const flipCardInner = document.createElement("div");
    flipCardInner.classList.add("flip-card-inner");

    const flipCardFront = document.createElement("div");
    flipCardFront.classList.add("flip-card-front");
    flipCardFront.innerHTML = `<img src="./img/question.png" alt="?"  loading="lazy" decoding="async"/>`;

    const flipCardBack = document.createElement("div");
    flipCardBack.classList.add("flip-card-back");
    flipCardBack.innerHTML = `<img src="${src}" alt="card image" loading="lazy" decoding="async"/>`;

    flipCardInner.appendChild(flipCardFront);
    flipCardInner.appendChild(flipCardBack);
    flipCard.appendChild(flipCardInner);

    return flipCard;
}

/**
 * Selects random tile images based on the theme and board size.
 * @param {Object} themeImages - The object containing image paths for the selected theme.
 * @param {number} boardSize - The size of the game board.
 * @returns {Array} - An array containing the selected image numbers and their paths.
 */
function selectRandomTileImages(themeImages, boardSize) {
    let selectedImagesNumbers = [];
    let imgNumber;
    for (
        let i = 0;
        selectedImagesNumbers.length < (boardSize * boardSize) / 2;
        i++
    ) {
        do {
            imgNumber = Math.floor(
                Math.random() * themeImages.numberOfImages + 1
            );
        } while (selectedImagesNumbers.includes(imgNumber));
        selectedImagesNumbers.push(imgNumber);
    }

    // images numbers to images filepaths
    selectedImagesNumbers = selectedImagesNumbers.concat(selectedImagesNumbers);
    selectedImagesNumbers = shuffle(selectedImagesNumbers);
    console.log(selectedImagesNumbers);
    let selectedImagesPaths = selectedImagesNumbers.map((num) =>
        themeImages.filepathFromNumber(num)
    );
    return [selectedImagesNumbers, selectedImagesPaths];
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - The shuffled array.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/*
END SCREEN AND SCORE HANDLING FUNCTIONS
*/
/**
 * Displays the end screen with the final game statistics.
 * @param {number} movesNumber - The number of moves made in the game.
 * @param {number} seconds - The time taken to complete the game.
 * @param {number} boardSize - The size of the game board.
 * @param {string} theme - The theme for the game.
 */
function displayEndScreen(movesNumber, seconds, boardSize, theme) {
    gameRank.style.display = "flex";
    gameBoard.style.display = "none";

    // show existing scores
    loadScores();

    // end screen form handling
    const endForm = document.querySelector("#game-rank form");
    //endForm.removeEventListener("submit", newGame);
    endForm.addEventListener("submit", (e) => {
        const endForm = document.querySelector("#game-rank form");
        e.preventDefault();
        const answers = Object.fromEntries(new FormData(endForm).entries());
        answers["board-size"] = Number(answers["board-size"]);

        // save the score
        saveScore(answers["nickname"], movesNumber, seconds, boardSize, theme);
    });
}

/**
 * Saves the game score to the server.
 * @param {string} nickname - The player's nickname.
 * @param {number} moves - The number of moves made in the game.
 * @param {number} time - The time taken to complete the game.
 * @param {number} boardSize - The size of the game board.
 * @param {string} theme - The theme for the game.
 */
async function saveScore(nickname, moves, time, boardSize, theme) {
    try {
        const saveButton = document.querySelector("#game-rank button");
        saveButton.style.display = "none";

        const score = {
            nickname: nickname,
            moves: moves,
            time: time,
            boardSize: boardSize,
            theme: theme,
        };

        let storedURL = localStorage.getItem("memoryGameScoresURL") || null;

        if (!storedURL) {
            const response = await fetch("https://api.jsonblob.com", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([score]),
            });
            if (!response.ok) {
                throw new Error("Failed to save score");
            }
            const location = response.headers.get("Location");
            if (!location) {
                throw new Error("No Location header in response");
            }

            storedURL = `https://api.jsonblob.com${location}`;
            localStorage.setItem("memoryGameScoresURL", storedURL);
        } else {
            const response = await fetch(storedURL);
            if (!response.ok) {
                throw new Error("Failed to load existing scores");
            }
            const data = await response.json();
            const existingScores = Array.isArray(data)
                ? data
                : data.scores || [];
            existingScores.push(score);
            const putResponse = await fetch(storedURL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(existingScores),
            });
            if (!putResponse.ok) {
                throw new Error("Failed to update scores");
            }
        }
        await loadScores();

        //saveButton.style.display = "block";
        //saveButton.textContent = "Play again";
        //const endForm = document.querySelector("#game-rank form");

        //endForm.removeEventListener("submit", saving);
        //endForm.addEventListener("submit", newGame);
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

const newGame = (e) => {
    resetGame();
};

/**
 * Loads the game scores from the server and displays them in the ranking list.
 * @returns {Promise<void>} - A promise that resolves when the scores have been loaded and displayed.
 */
async function loadScores() {
    const rankList = document.querySelector("#rank-list");
    if (!rankList) return;

    const storedURL = localStorage.getItem("memoryGameScoresURL") || null;
    if (!storedURL) {
        rankList.innerHTML = "<li>No scores yet.</li>";
        return;
    }

    try {
        const response = await fetch(storedURL);
        if (!response.ok) {
            throw new Error("Failed to load scores");
        }
        const data = await response.json();
        const scores = Array.isArray(data) ? data : data.scores || [];
        if (scores.length === 0) {
            rankList.innerHTML = "<li>No scores yet.</li>";
            return;
        }

        // sort scores by time, then by moves
        scores.sort((a, b) => {
            if (a.time === b.time) {
                return a.moves - b.moves;
            }
            return a.time - b.time;
        });
        rankList.innerHTML = scores
            .slice(0, 10) // top 10 scores
            .map(
                (score) =>
                    `<li>${escapeHtml(score.nickname)} --- Moves: ${
                        score.moves
                    } --- Time: ${formatMMSS(score.time)} -- (${
                        score.boardSize
                    }x${score.boardSize}, ${escapeHtml(score.theme)})</li>`
            )
            .join("");
    } catch (error) {
        console.error("Error loading scores:", error);
        rankList.innerHTML = "<li>Error loading scores.</li>";
    }
}

/**
 * Escapes HTML characters in a string to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/**
 * Resets the game by hiding the game rank screen and showing the configuration screen.
 */
function resetGame() {
    gameRank.style.display = "none";
    config.style.display = "flex";
}
