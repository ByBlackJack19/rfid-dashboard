// ⚡ Configuración de Spotify
const clientId = "682780c12e3047d2ad0986d34edd6c96"; // reemplaza con el tuyo
const redirectUri = "https://byblackjack19.github.io/rfid-dashboard/index.html"; // el mismo que registraste
const scopes = "user-read-email"; // puedes ampliar permisos si quieres

// Obtener token desde URL despuasdassdés del login
function getTokenFromUrl() {
  const hash = window.location.hash.substring(1).split("&")
    .reduce((acc, item) => {
      const parts = item.split("=");
      acc[parts[0]] = decodeURIComponent(parts[1]);
      return acc;
    }, {});
  return hash.access_token;
}

let token = getTokenFromUrl();

// Botón de login
document.getElementById("login").addEventListener("click", () => {
const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
  window.location = authUrl;
});

// Inicializar mapa con Leaflet
const map = L.map('map').setView([20, 0], 2); // Vista mundial

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Ejemplo: al hacer clic en España (lat, lon aproximados)
L.marker([40, -3]).addTo(map)
  .bindPopup("Haz clic para ver playlists de España")
  .on("click", async () => {
    if (!token) {
      alert("Inicia sesión con Spotify primero.");
      return;
    }
    const response = await fetch("https://api.spotify.com/v1/browse/featured-playlists?country=ES", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await response.json();
    mostrarInfo("España", data.playlists.items);
  });

// Mostrar resultados
function mostrarInfo(pais, playlists) {
  const infoDiv = document.getElementById("info");
  infoDiv.innerHTML = `<h2>Playlists destacadas en ${pais}</h2>`;
  playlists.forEach(pl => {
    infoDiv.innerHTML += `
      <p>
        <img src="${pl.images[0].url}" width="50"> 
        <a href="${pl.external_urls.spotify}" target="_blank">${pl.name}</a>
      </p>`;
  });
}




