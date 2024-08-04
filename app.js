// Page courante pour la pagination des résultats
let page = 0;
// Indicateur de chargement pour éviter les appels multiples
let loading = false;

// Sélection des éléments du DOM
const form = document.querySelector("form");
const input = document.querySelector("input");
const errorMsg = document.querySelector(".error-msg");
const resultsDisplay = document.querySelector(".results-display");
const loader = document.querySelector(".loader");
const suggestionsList = document.querySelector(".suggestions-list");
const themeToggleButton = document.querySelector(".theme-toggle-button");

// Gestion de la soumission du formulaire
document.querySelector(".search-button").addEventListener("click", handleSubmit);
form.addEventListener("submit", handleSubmit);

// Gestion de la saisie dans le champ de recherche pour afficher les suggestions
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

// Chargement des résultats lors du défilement de la page
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10 && !loading) {
        loading = true;
        wikiApiCall(input.value).finally(() => loading = false);
    }
});

// Fonction de gestion de la soumission du formulaire
function handleSubmit(e) {
    e.preventDefault();

    const searchTerm = input.value;
    if (searchTerm === "") {
        errorMsg.textContent = "Woups, veuillez entrer un terme de recherche...";
        return;
    }

    errorMsg.textContent = "";
    loader.style.display = "flex";
    resultsDisplay.textContent = "";
    suggestionsList.innerHTML = ""; 
    page = 0;  
    wikiApiCall(searchTerm);
}

// Appel API pour récupérer les résultats de recherche
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

// Création des cartes pour afficher les résultats de recherche
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

// Mise à jour des suggestions de recherche
function updateSuggestions(suggestions) {
    suggestionsList.innerHTML = suggestions.map(suggestion =>
        `<div class="suggestion-item">${suggestion}</div>`
    ).join('');

    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            suggestionsList.innerHTML = "";
            handleSubmit(new Event('submit'));  
        });
    });
}

// Fonction pour activer le mode sombre
function enableDarkMode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
}

// Fonction pour désactiver le mode sombre
function disableDarkMode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
}

// Fonction pour basculer entre le mode sombre et clair
function toggleDarkMode() {
    if (document.body.classList.contains("dark-mode")) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
}

// Gestion du clic sur le bouton de changement de thème
themeToggleButton.addEventListener("click", toggleDarkMode);

// Chargement du thème sauvegardé lors du chargement de la page
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      enableDarkMode();
    }
});
