// Configurazione delle API
const OMDB_API_KEY = 'c7a79fb4';
const SPOTIFY_CLIENT_ID = '61e526682e6f4304848876e0896e10af';
const SPOTIFY_CLIENT_SECRET = '7fadbe81ee78426698cd34bc5d1cf014';

// Lista di anime e film casuali
const randomTitles = [
    'Attack on Titan',
    'Death Note',
    'Spirited Away',
    'Your Name',
    'Demon Slayer',
    'Jujutsu Kaisen',
    'The Matrix',
    'Inception',
    'Interstellar',
    'The Dark Knight',
    'Pulp Fiction',
    'Fight Club',
    'The Godfather',
    'Parasite',
    'Spider-Man: Into the Spider-Verse'
];

// Inizializzazione delle particelle
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: {
                value: 0.5,
                random: false,
                anim: { enable: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
});

// Funzione per cercare un anime/film
async function searchAnime() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    if (!searchQuery) {
        showNotification('Inserisci un titolo da cercare', 'warning');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.Response === 'False') {
            showNotification('Nessun risultato trovato', 'error');
            return;
        }

        displayResult(data);
        await searchSpotifyPlaylists(data.Title);
    } catch (error) {
        console.error('Errore nella ricerca:', error);
        showNotification('Errore durante la ricerca', 'error');
    } finally {
        showLoading(false);
    }
}

// Funzione per ottenere un titolo casuale
function getRandomAnime() {
    const randomIndex = Math.floor(Math.random() * randomTitles.length);
    document.getElementById('searchInput').value = randomTitles[randomIndex];
    searchAnime();
}

// Funzione per visualizzare i risultati
function displayResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `
        <div class="card">
            <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" 
                 class="card-img-top" alt="${data.Title}">
            <div class="card-body">
                <h5 class="card-title">${data.Title} (${data.Year})</h5>
                <div class="info-grid">
                    <p><strong>Genere:</strong> ${data.Genre}</p>
                    <p><strong>Regista:</strong> ${data.Director}</p>
                    <p><strong>Attori:</strong> ${data.Actors}</p>
                    <p><strong>Valutazione:</strong> ${data.imdbRating}/10</p>
                </div>
                <p class="card-text">${data.Plot}</p>
            </div>
        </div>
    `;
}

// Funzione per cercare playlist su Spotify
async function searchSpotifyPlaylists(title) {
    try {
        const token = await getSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=playlist&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.playlists.items.length > 0) {
            displayPlaylists(data.playlists.items);
        } else {
            showNotification('Nessuna playlist trovata su Spotify', 'info');
        }
    } catch (error) {
        console.error('Errore nella ricerca delle playlist:', error);
        showNotification('Errore durante la ricerca delle playlist', 'error');
    }
}

// Funzione per ottenere il token di accesso Spotify
async function getSpotifyToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Funzione per visualizzare le playlist
function displayPlaylists(playlists) {
    const playlistContainer = document.getElementById('playlistContainer');
    playlistContainer.innerHTML = `
        <h4 class="mt-4 mb-3">Playlist Consigliate</h4>
        <div class="playlist-list">
            ${playlists.map(playlist => `
                <div class="playlist-item">
                    <div class="d-flex align-items-center">
                        <img src="${playlist.images[0]?.url || 'https://via.placeholder.com/80'}" 
                             class="playlist-thumbnail me-3" alt="${playlist.name}">
                        <div class="playlist-info">
                            <h5>${playlist.name}</h5>
                            <p>${playlist.tracks.total} brani</p>
                            <a href="${playlist.external_urls.spotify}" target="_blank" 
                               class="btn btn-sm btn-success">Apri su Spotify</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Funzione per mostrare/ nascondere il caricamento
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (show) {
        loadingElement.style.display = 'block';
    } else {
        loadingElement.style.display = 'none';
    }
}

// Funzione per mostrare le notifiche
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1000';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Event Listeners
document.getElementById('searchButton').addEventListener('click', searchAnime);
document.getElementById('randomButton').addEventListener('click', getRandomAnime);
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchAnime();
    }
}); 