// ==========================
// CONFIGURACIÓN
// ==========================
const clientId = "682780c12e3047d2ad0986d34edd6c96"; 
const redirectUri = "https://byblackjack19.github.io/rfid-dashboard/index.html";
const scopes = "user-read-private user-read-email";

// ==========================
// FUNCIONES AUXILIARES
// ==========================

// Genera un string aleatorio
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Codifica en base64url
function base64encode(string) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Genera el Code Challenge (SHA256)
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64encode(digest);
}

// ==========================
// FLUJO DE LOGIN
// ==========================

// Guardar code_verifier temporalmente
let codeVerifier = localStorage.getItem("code_verifier");

document.getElementById("login").addEventListener("click", async () => {
  codeVerifier = generateRandomString(128);
  localStorage.setItem("code_verifier", codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${codeChallenge}`;

  window.location = authUrl;
});

// ==========================
// INTERCAMBIAR CODE -> TOKEN
// ==========================
async function fetchAccessToken(code) {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  return await response.json();
}

// ==========================
// OBTENER DATOS DEL USUARIO
// ==========================
async function getUserProfile(token) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: "Bearer " + token }
  });
  return await response.json();
}

// ==========================
// MANEJAR REDIRECCIÓN
// ==========================
window.onload = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const tokenResponse = await fetchAccessToken(code);
    console.log("Token:", tokenResponse);

    if (tokenResponse.access_token) {
      const userData = await getUserProfile(tokenResponse.access_token);
      document.getElementById("info").innerHTML = `
        <h2>Bienvenido, ${userData.display_name}</h2>
        <p>Email: ${userData.email}</p>
        <img src="${userData.images?.[0]?.url || ''}" width="100"/>
      `;
    } else {
      document.getElementById("info").innerText = "Error al obtener el token";
    }
  }
};
