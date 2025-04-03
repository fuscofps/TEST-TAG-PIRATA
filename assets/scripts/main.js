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

// Configurazione Unsplash
const UNSPLASH_ACCESS_KEY = 'v7JWK2ZwA-n_DUEGTpcna5NDH6a2ZR9dWFyCXrBxFcg';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Inizializzazione di particles.js
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 30,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#ffffff'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.3,
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true
            },
            lineLinked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                outMode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detectOn: 'canvas',
            events: {
                onHover: {
                    enable: false
                },
                onClick: {
                    enable: false
                },
                resize: true
            }
        },
        retina_detect: true
    });
});

// Funzione per creare le particelle
function createParticle(direction = 'down') {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Dimensioni casuali più grandi
    const size = Math.random() * 15 + 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Posizione iniziale casuale
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = direction === 'down' ? '-10px' : '100vh';
    
    // Velocità più veloce
    const duration = Math.random() * 0.8 + 0.3;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationName = direction === 'down' ? 'fall' : 'rise';
    
    container.appendChild(particle);
    
    // Rimuovi la particella dopo l'animazione
    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

// Gestione dello scroll
let lastScroll = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    const scrollDiff = currentScroll - lastScroll;
    const direction = scrollDiff > 0 ? 'down' : 'up';
    const speed = Math.abs(scrollDiff);
    
    // Crea particelle in base alla direzione e velocità dello scroll
    if (speed > 0) {
        // Crea più particelle in base alla velocità dello scroll
        const numParticles = Math.min(Math.floor(speed / 3), 20);
        for (let i = 0; i < numParticles; i++) {
            setTimeout(() => {
                createParticle(direction);
                // Crea una seconda particella con un leggero ritardo
                setTimeout(() => {
                    createParticle(direction);
                }, 30);
            }, i * 10);
        }
    }
    
    lastScroll = currentScroll;
});

// Inizializza le particelle
document.addEventListener('DOMContentLoaded', () => {
    // Crea il container delle particelle se non esiste
    if (!document.querySelector('.particles-container')) {
        const container = document.createElement('div');
        container.className = 'particles-container';
        document.body.appendChild(container);
    }
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

        await displayResult(data);
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

// Funzione per tradurre il testo in italiano
async function translateToItalian(text) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|it`);
        const data = await response.json();
        return data.responseData.translatedText || text;
    } catch (error) {
        console.error('Errore nella traduzione:', error);
        return text;
    }
}

// Funzione per visualizzare i risultati
async function displayResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    
    // Traduci la trama in italiano
    const plot = data.Plot ? await translateToItalian(data.Plot) : 'Nessuna descrizione disponibile';
    
    resultContainer.innerHTML = `
        <div class="card">
            <img src="${data.Poster}" class="card-img-top" alt="${data.Title}">
            <div class="card-body">
                <h5 class="card-title">${data.Title} (${data.Year})</h5>
                <div class="info-grid">
                    <div>
                        <p><strong>Genere:</strong> ${data.Genre}</p>
                        <p><strong>Regista:</strong> ${data.Director}</p>
                        <p><strong>Attori:</strong> ${data.Actors}</p>
                    </div>
                    <div>
                        <p><strong>Valutazione:</strong> ${data.imdbRating}/10</p>
                        <p><strong>Durata:</strong> ${data.Runtime}</p>
                        <p><strong>Paese:</strong> ${data.Country}</p>
                    </div>
                </div>
                <div class="card-text">
                    <h6 class="mb-3">Trama:</h6>
                    <p>${plot}</p>
                </div>
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
    const playlistList = document.querySelector('.playlist-list');
    if (!playlistList) {
        console.error('Elemento playlist-list non trovato');
        return;
    }

    playlistList.innerHTML = '';
    
    if (!playlists || playlists.length === 0) {
        const noPlaylists = document.createElement('div');
        noPlaylists.className = 'playlist-item';
        noPlaylists.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="playlist-info">
                    <h5>Nessuna playlist trovata</h5>
                    <p>Prova a cercare un altro film o anime</p>
                </div>
            </div>
        `;
        playlistList.appendChild(noPlaylists);
        return;
    }
    
    playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        
        // Gestione dell'immagine con fallback
        const imageUrl = playlist.images && playlist.images.length > 0 
            ? playlist.images[0].url 
            : 'https://via.placeholder.com/60';
            
        const playlistName = playlist.name || 'Playlist senza nome';
        const playlistDescription = playlist.description || 'Playlist di colonne sonore';
        const spotifyUrl = playlist.external_urls?.spotify || '#';
            
        playlistItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${imageUrl}" 
                     class="playlist-thumbnail me-3" 
                     alt="${playlistName}"
                     onerror="this.src='https://via.placeholder.com/60'">
                <div class="playlist-info">
                    <h5>${playlistName}</h5>
                    <p>${playlistDescription}</p>
                    <a href="${spotifyUrl}" 
                       target="_blank" 
                       class="btn btn-sm btn-primary">
                        <i class="fab fa-spotify"></i> Ascolta su Spotify
                    </a>
                </div>
            </div>
        `;
        playlistList.appendChild(playlistItem);
    });
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
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', searchAnime);
    document.getElementById('randomButton').addEventListener('click', getRandomAnime);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAnime();
        }
    });
});

// Funzione per aggiornare l'immagine di sfondo
async function updateBackgroundImage(query) {
    try {
        console.log('Aggiornamento sfondo per:', query);
        const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;
            console.log('URL immagine trovata:', imageUrl);
            
            // Applica l'immagine di sfondo direttamente al pseudo-elemento ::before
            const beforeElement = document.querySelector('body::before');
            if (beforeElement) {
                beforeElement.style.backgroundImage = `url(${imageUrl})`;
            } else {
                // Fallback: applica al body
                document.body.style.backgroundImage = `url(${imageUrl})`;
            }
            
            // Trigger download per Unsplash
            fetch(data.results[0].links.download_location + `?client_id=${UNSPLASH_ACCESS_KEY}`);
        } else {
            console.log('Nessuna immagine trovata per:', query);
        }
    } catch (error) {
        console.error('Errore nel caricamento dell\'immagine:', error);
    }
}

// Funzione per l'autocompletamento
let searchTimeout;
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        searchSuggestions.style.display = 'none';
        return;
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            
            if (data.Search) {
                searchSuggestions.innerHTML = '';
                data.Search.slice(0, 5).forEach(movie => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = `${movie.Title} (${movie.Year})`;
                    div.addEventListener('click', () => {
                        searchInput.value = movie.Title;
                        searchSuggestions.style.display = 'none';
                        searchMovie(movie.Title);
                    });
                    searchSuggestions.appendChild(div);
                });
                searchSuggestions.style.display = 'block';
            } else {
                searchSuggestions.style.display = 'none';
            }
        } catch (error) {
            console.error('Errore nell\'autocompletamento:', error);
            searchSuggestions.style.display = 'none';
        }
    }, 300);
});

// Nascondi i suggerimenti quando si clicca fuori
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.style.display = 'none';
    }
});

// Modifica la funzione searchMovie per rimuovere il cambio dello sfondo
async function searchMovie(query) {
    showLoading();
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Response === "True") {
            displayResult(data);
        } else {
            displayError("Film non trovato. Prova con un altro titolo.");
        }
    } catch (error) {
        displayError("Errore nella ricerca. Riprova più tardi.");
    }
    hideLoading();
}