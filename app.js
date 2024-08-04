// API ENDPOINT : `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=20&srsearch=${searchInput}`

let page = 0;
let loading = false;

const form = document.querySelector("form");
const input = document.querySelector("input");
const errorMsg = document.querySelector(".error-msg");
const resultsDisplay = document.querySelector(".results-display");
const loader = document.querySelector(".loader");
const suggestionsList = document.querySelector(".suggestions-list");
const searchHistoryContainer = document.querySelector(".search-history");

const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

form.addEventListener("submit", handleSubmit);

input.addEventListener("input", async () => {
    const searchTerm = input.value;
    if (searchTerm.length > 2) {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${searchTerm}&format=json&origin=*`);
        const data = await response.json();
        updateSuggestions(data[1]);
    } else {
        suggestionsList.innerHTML = "";
    }
});

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10 && !loading) {
        loading = true;
        wikiApiCall(input.value).finally(() => loading = false);
    }
});

function handleSubmit(e) {
    e.preventDefault();

    const searchTerm = input.value;
    if (searchTerm === "") {
        errorMsg.textContent = "Woups, veuillez entrer un terme de recherche...";
        return;
    }

    if (!history.includes(searchTerm)) {
        history.push(searchTerm);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    errorMsg.textContent = "";
    loader.style.display = "flex";
    resultsDisplay.textContent = "";
    suggestionsList.innerHTML = ""; // Effacer les suggestions
    page = 0;  // Réinitialiser le compteur de pages pour les nouvelles recherches
    wikiApiCall(searchTerm);
    displayHistory();
}

async function wikiApiCall(searchInput) {
    page++;
    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=20&srsearch=${searchInput}&sroffset=${page * 20}`);
        const data = await response.json();
        createCards(data.query.search);
    } catch (error) {
        errorMsg.textContent = `${error}`;
        loader.style.display = "none";
    }
}

function createCards(data) {
    if (!data.length) {
        errorMsg.textContent = "Oups, aucun résultat";
        loader.style.display = "none";
        return;
    }
    data.forEach(el => {
        const url = `https://en.wikipedia.org/?curid=${el.pageid}`;
        const card = document.createElement("div");
        card.className = "result-item";
        card.innerHTML = `
      <h3 class="result-title">
        <a href=${url} target="_blank">${el.title}</a>
      </h3>
      <a href=${url} class="result-link" target="_blank">${url}</a>
      <span class="result-snippet">${el.snippet}</span>
      <br>
    `;
        resultsDisplay.appendChild(card);
    });
    loader.style.display = "none";
}

function updateSuggestions(suggestions) {
    suggestionsList.innerHTML = suggestions.map(suggestion =>
        `<div class="suggestion-item">${suggestion}</div>`
    ).join('');

    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            suggestionsList.innerHTML = "";
            handleSubmit(new Event('submit'));  // Trigger the form submission
        });
    });
}

function displayHistory() {
    searchHistoryContainer.innerHTML = history.map(term => 
        `<div class="history-item" onclick="searchFromHistory('${term}')">${term}</div>`
    ).join('');
}

function searchFromHistory(term) {
    input.value = term;
    handleSubmit(new Event('submit'));
}

// Appeler displayHistory pour afficher l'historique au chargement
displayHistory();
