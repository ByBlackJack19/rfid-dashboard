// ===================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ===================================
const clientId = "682780c12e3047d2ad0986d34edd6c96";
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// ===================================
// FUNCIONES DE LA API DE SPOTIFY
// ===================================

/**
 * Obtiene el token de acceso para la aplicación.
 * @returns {Promise<string>} Token de acceso.
 */
async function getClientCredentialsToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: '4d8c85761f5f4452ae8978cf951e0140' // ¡IMPORTANTE! Reemplaza esto con tu Client Secret
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * Obtiene los tracks de una playlist.
 * @param {string} token Token de acceso.
 * @param {string} playlistId ID de la playlist.
 * @returns {Promise<Array>} Lista de tracks.
 */
async function getPlaylistTracks(token, playlistId) {
  const response = await fetch(`https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks3${playlistId}/tracks?market=from_token`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.items.map(item => item.track);
}

// ===================================
// MAPEO DE PAÍSES Y ARTISTAS
// ===================================

// Datos de las playlists "Top 50" de Spotify por país
const countryPlaylists = {
  'Argentina': '37i9dQZEVXbMJSdZlJz3hG',
  'Mexico': '37i9dQZEVXbO3qyFxbkOE1',
  'Spain': '37i9dQZEVXbJPvwgoO1J0J',
  'United Kingdom': '37i9dQZEVXbLn7RQyWnrrR',
  'United States': '37i9dQZEVXbLRQCoZzNYwZ',
  'Brazil': '37i9dQZEVXbKXq1V6xLsc3',
  'Colombia': '37i9dQZEVXbJ8LPtGfJmUZ'
};

// Ubicación de los países para los marcadores
const countryLocations = {
  'Argentina': { lat: -34.6037, lon: -58.3816 },
  'Mexico': { lat: 19.4326, lon: -99.1332 },
  'Spain': { lat: 40.4168, lon: -3.7038 },
  'United Kingdom': { lat: 51.5074, lon: -0.1278 },
  'United States': { lat: 38.9072, lon: -77.0369 },
  'Brazil': { lat: -23.5505, lon: -46.6333 },
  'Colombia': { lat: 4.7110, lon: -74.0721 }
};

/**
 * Identifica el artista más popular para cada país y lo muestra en el mapa.
 */
async function showArtistsOnMap() {
  const token = await getClientCredentialsToken();
  const artistsByCountry = {};

  for (const [country, playlistId] of Object.entries(countryPlaylists)) {
    const tracks = await getPlaylistTracks(token, playlistId);
    
    // Contar la frecuencia de los artistas
    const artistCounts = {};
    tracks.forEach(track => {
      track.artists.forEach(artist => {
        artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
      });
    });

    // Encontrar al artista con la mayor frecuencia
    let topArtist = null;
    let maxCount = 0;
    for (const artist in artistCounts) {
      if (artistCounts[artist] > maxCount) {
        maxCount = artistCounts[artist];
        topArtist = artist;
      }
    }
    
    // Guardar el artista más popular del país
    artistsByCountry[country] = topArtist;

    // Colocar el marcador en el mapa
    if (topArtist && countryLocations[country]) {
      const location = countryLocations[country];
      const marker = L.marker([location.lat, location.lon]).addTo(map);
      marker.bindPopup(`
        <b>País: ${country}</b><br>
        Artista más popular: <b>${topArtist}</b>
      `);
    }
  }

  console.log("Artistas más populares por país:", artistsByCountry);
}

// ===================================
// LÓGICA PRINCIPAL
// ===================================
window.onload = showArtistsOnMap;
