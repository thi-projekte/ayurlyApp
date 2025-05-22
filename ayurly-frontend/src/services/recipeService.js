import apiRequest from './apiService';
import keycloakService from './keycloakService'; // Um Token zu bekommen für Aktionen

const API_BASE_URL = '/api/recipes';

/**
 * Ruft alle Rezepte oder nach Dosha-Typ gefilterte Rezepte vom Backend ab.
 * @param {string|null} doshaType - Optionaler Dosha-Typ zum Filtern (z.B. 'vata', 'pitta', 'kapha').
 * Bei null oder 'all' (serverseitig interpretiert) werden alle Rezepte geladen.
 * @returns {Promise<Array<object>>} Eine Liste von Rezept-Datenobjekten.
 */
const getAllRecipes = async (doshaType = null) => {
  const token = keycloakService.getToken(); // Token für eventuelle Authentifizierung oder personalisierte Daten
  let url = API_BASE_URL;
  if (doshaType && doshaType !== 'all') {
    url += `?doshaType=${encodeURIComponent(doshaType)}`;
  }
  // Wenn der 'personalized' Endpunkt für eingeloggte User ohne Dosha-Filter genutzt werden soll:
  // if (isLoggedIn && (!doshaType || doshaType === 'all')) {
  //   url = `${API_BASE_URL}/personalized`;
  // }

  return apiRequest(url, 'GET', null, token);
};

/**
 * Ruft ein einzelnes Rezept anhand seiner ID vom Backend ab.
 * @param {string} recipeId - Die UUID des Rezepts.
 * @returns {Promise<object>} Das Rezept-Datenobjekt.
 */
const getRecipeById = async (recipeId) => {
  // Für den GET /api/recipes/{id} wird aktuell kein Token benötigt (@PermitAll),
  // aber wir senden es mit, falls sich das ändert oder für die likedByCurrentUser-Logik im Backend.
  const token = keycloakService.getToken();
  return apiRequest(`${API_BASE_URL}/${recipeId}`, 'GET', null, token);
};

/**
 * Sendet einen Like für ein Rezept.
 * @param {string} recipeId - Die UUID des Rezepts.
 * @returns {Promise<object>} Die Antwort vom Backend (LikeResponseDto).
 */
const likeRecipe = async (recipeId) => {
    const token = keycloakService.getToken();
    if (!token && !keycloakService.isInitialized()) {
      // Wenn Keycloak noch nicht initialisiert ist, warte kurz
      // Dies ist ein Workaround, falls der Token nicht sofort verfügbar ist.
      // Besser wäre es, die UI so zu gestalten, dass Aktionen erst nach KC-Init möglich sind.
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!keycloakService.getToken()) {
        console.error("User not authenticated after delay. Cannot like recipe.");
        throw new Error("User not authenticated. Please log in to like recipes.");
      }
    } else if (!token) {
        console.error("User not authenticated. Cannot like recipe.");
        throw new Error("User not authenticated. Please log in to like recipes.");
    }
    return apiRequest(`${API_BASE_URL}/${recipeId}/like`, 'POST', null, keycloakService.getToken());
};

/**
 * Entfernt einen Like von einem Rezept.
 * @param {string} recipeId - Die UUID des Rezepts.
 * @returns {Promise<object>} Die Antwort vom Backend (LikeResponseDto).
 */
const unlikeRecipe = async (recipeId) => {
    const token = keycloakService.getToken();
     if (!token && !keycloakService.isInitialized()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!keycloakService.getToken()) {
        console.error("User not authenticated after delay. Cannot unlike recipe.");
        throw new Error("User not authenticated. Please log in to unlike recipes.");
      }
    } else if (!token) {
        console.error("User not authenticated. Cannot unlike recipe.");
        throw new Error("User not authenticated. Please log in to unlike recipes.");
    }
    return apiRequest(`${API_BASE_URL}/${recipeId}/unlike`, 'POST', null, keycloakService.getToken()); // Oder DELETE, je nach API-Design
};


export default {
  getAllRecipes,
  getRecipeById,
  likeRecipe,
  unlikeRecipe,
};