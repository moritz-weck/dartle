const MAX_GUESSES = 6;

// Für den ersten Prototypen wird der Zielspieler
// hier festgelegt. Später wird er automatisch
// anhand des Datums ausgewählt.
const TARGET_PLAYER_NAME = "Luke Humphries";


// ----------------------------------------
// Game state
// ----------------------------------------

let players = [];
let targetPlayer = null;
let guesses = [];
let gameOver = false;


// ----------------------------------------
// DOM elements
// ----------------------------------------

const playerInput = document.getElementById("player-input");
const guessButton = document.getElementById("guess-button");
const autocompleteList = document.getElementById("autocomplete-list");
const guessesContainer = document.getElementById("guesses-container");

const currentGuessElement = document.getElementById("current-guess");

const gameMessage = document.getElementById("game-message");
const gameMessageTitle = document.getElementById("game-message-title");
const gameMessageText = document.getElementById("game-message-text");

const newGameButton = document.getElementById("new-game-button");


// ----------------------------------------
// Load player data
// ----------------------------------------

async function loadPlayers() {

    try {

        const response = await fetch("players.json");

        if (!response.ok) {
            throw new Error("players.json konnte nicht geladen werden.");
        }

        players = await response.json();

        // Zufälligen Zielspieler auswählen
        const randomIndex = Math.floor(Math.random() * players.length);
        targetPlayer = players[randomIndex];

        console.log("Spieler geladen:", players);
        console.log("Zielspieler:", targetPlayer);

    } catch (error) {

        console.error(error);

        gameMessage.classList.remove("hidden");
        gameMessageTitle.textContent = "Fehler";
        gameMessageText.textContent =
            "Die Spielerdaten konnten nicht geladen werden.";

    }
}


// ----------------------------------------
// Autocomplete
// ----------------------------------------

playerInput.addEventListener("input", () => {

    const searchTerm = playerInput.value
        .trim()
        .toLowerCase();

    autocompleteList.innerHTML = "";

    if (searchTerm.length === 0) {
        return;
    }

    const matchingPlayers = players
        .filter(player =>
            player.name.toLowerCase().includes(searchTerm)
        )
        .slice(0, 8);


    matchingPlayers.forEach(player => {

        const option = document.createElement("div");

        option.classList.add("autocomplete-option");

        option.textContent = player.name;

        option.addEventListener("click", () => {

            playerInput.value = player.name;

            autocompleteList.innerHTML = "";

        });

        autocompleteList.appendChild(option);

    });

});


// ----------------------------------------
// Close autocomplete when clicking elsewhere
// ----------------------------------------

document.addEventListener("click", (event) => {

    if (
        event.target !== playerInput &&
        !autocompleteList.contains(event.target)
    ) {
        autocompleteList.innerHTML = "";
    }

});


// ----------------------------------------
// Calculate birthday
// ----------------------------------------

function calculateAge(birthday) {
    const [day, month, year] = birthday.split("-").map(Number);

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayThisYear = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    );

    if (today < birthdayThisYear) {
        age--;
    }

    return age;
}


// ----------------------------------------
// Parse flag
// ----------------------------------------

const countryFlags = {
    "England": "gb-eng.svg",
    "Wales": "gb-wls.svg",
    "Scotland": "gb-sct.svg",
    "Northern Ireland": "gb-nir.svg",
    "Germany": "de.svg",
    "Netherlands": "nl.svg",
    "Belgium": "be.svg",
    "Australia": "au.svg",
    "Poland": "pl.svg",
    "Ireland": "ie.svg",
    "Latvia": "lv.svg",
    "Sweden": "se.svg",
    "Austria": "st.svg",
    "France": "fr.svg",
    "Czech Republic": "cz,svg",
    "Norway": "no.svg",
    "Canada": "ca.svg",
    "Croatia": "hr.svg",
    "Switzerland": "ch.svg",
    "Lithuania": "lt.svg",
    "Spain": "es.svg",
    "Slovenia" : "si.svg"
};

function getFlag(country) {
    return countryFlags[country];
}


// ----------------------------------------
// Guess button
// ----------------------------------------

guessButton.addEventListener("click", makeGuess);


// ----------------------------------------
// Enter key
// ----------------------------------------

playerInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        makeGuess();
    }

});


// ----------------------------------------
// Make a guess
// ----------------------------------------

function makeGuess() {

    if (gameOver) {
        return;
    }

    const playerName = playerInput.value.trim();

    if (playerName === "") {
        return;
    }


    // Spieler suchen
    const guessedPlayer = players.find(
        player =>
            player.name.toLowerCase() === playerName.toLowerCase()
    );


    // Ungültiger Spieler
    if (!guessedPlayer) {

        alert("Bitte wähle einen gültigen Dartspieler aus.");

        return;
    }


    // Spieler wurde bereits geraten
    const alreadyGuessed = guesses.some(
        player => player.name === guessedPlayer.name
    );

    if (alreadyGuessed) {

        alert("Diesen Spieler hast du bereits geraten.");

        return;
    }


    // Guess speichern
    guesses.push(guessedPlayer);


    // Guess anzeigen
    displayGuess(guessedPlayer);


    // Versuchszähler aktualisieren
    currentGuessElement.textContent = guesses.length;


    // Eingabefeld leeren
    playerInput.value = "";

    autocompleteList.innerHTML = "";


    // Gewinn?
    if (guessedPlayer.name === targetPlayer.name) {

        endGame(true);

        return;
    }


    // Alle Versuche aufgebraucht?
    if (guesses.length >= MAX_GUESSES) {

        endGame(false);

    }

}


// ----------------------------------------
// Display guess
// ----------------------------------------

function displayGuess(player) {
    
    const row = document.createElement("div");

    row.classList.add("guess-row");


    // Player name
    const nameCell = document.createElement("div");

    nameCell.classList.add("player-name");

    nameCell.textContent = player.name;

    row.appendChild(nameCell);


    // Country
    row.appendChild(
        createCountryCell(
            player,
            compareExact(player.country, targetPlayer.country)
        )
    );


    // Age
    row.appendChild(
        createResultCell(
            calculateAge(player.age),
            compareNumber(calculateAge(player.age), calculateAge(targetPlayer.age)),
            getArrow(calculateAge(player.age), calculateAge(targetPlayer.age))
        )
    );


    // Ranking
    row.appendChild(
        createResultCell(
            "#" + player.ranking,
            compareNumber(player.ranking, targetPlayer.ranking),
            getArrow(targetPlayer.ranking, player.ranking)
        )
    );


    // Major titles
    row.appendChild(
        createResultCell(
            player.majorTitles,
            compareNumber(player.majorTitles, targetPlayer.majorTitles),
            getArrow(player.majorTitles, targetPlayer.majorTitles)
        )
    );


    // Floor titles
    row.appendChild(
        createResultCell(
            player.floorTitles,
            compareNumber(player.floorTitles, targetPlayer.floorTitles, 2),
            getArrow(player.floorTitles, targetPlayer.floorTitles)
        )
    );


    // Tour Card Since
    row.appendChild(
        createResultCell(
            player.TourCardSince,
            compareNumber(player.TourCardSince, targetPlayer.TourCardSince),
            getArrow(player.TourCardSince, targetPlayer.TourCardSince)
        )
    );


    guessesContainer.appendChild(row);

}


// ----------------------------------------
// Create result cell
// ----------------------------------------

function createResultCell(value, status, arrow = "") {

    const cell = document.createElement("div");

    cell.classList.add("result", status);

    cell.textContent = `${value} ${arrow}`;

    return cell;

}


// ----------------------------------------
// Create country cell
// ----------------------------------------

function createCountryCell(player, status) {

    const cell = document.createElement("div");

    cell.classList.add("result", status);

    const flag = document.createElement("img");

    flag.src = `flags/${getFlag(player.country)}`;
    flag.alt = player.country;

    flag.classList.add("country-flag");

    cell.appendChild(flag);

    return cell;
}


// ----------------------------------------
// Compare exact values
// ----------------------------------------

function compareExact(value1, value2) {

    if (value1 === value2) {
        return "correct";
    }

    return "wrong";

}


// ----------------------------------------
// Compare numerical values
// ----------------------------------------

function compareNumber(value1, value2) {

    if (value1 === value2) {
        return "correct";
    }

    return "wrong";

}


// ----------------------------------------
// Get arrow for numerical values
// ----------------------------------------

function getArrow(guess, target) {

    if (guess < target) {
        return "⬆️";
    }

    if (guess > target) {
        return "⬇️";
    }

    return "";

}


// ----------------------------------------
// End game
// ----------------------------------------

function endGame(won) {

    displayGuess(targetPlayer);

    gameOver = true;

    guessButton.disabled = true;
    playerInput.disabled = true;


    if (won) {

        gameMessage.classList.remove("hidden");

        gameMessageTitle.textContent = "🎯 Correct!";

        gameMessageText.textContent =
            `You guessed ${targetPlayer.name} using ${guesses.length} ` +
            `${guesses.length === 1 ? "guess" : "guesses"}.`;

        newGameButton.classList.remove("hidden");

    } else {

        gameMessage.classList.remove("hidden");

        gameMessageTitle.textContent = "❌ Game Over";

        gameMessageText.textContent =
            `The secret player was ${targetPlayer.name}.`;

        newGameButton.classList.remove("hidden");

    }

}


// ----------------------------------------
// New game
// ----------------------------------------

newGameButton.addEventListener("click", () => {

    // Für den ersten Prototypen wird einfach
    // die Seite neu geladen.

    location.reload();

});


// ----------------------------------------
// Start game
// ----------------------------------------

loadPlayers();