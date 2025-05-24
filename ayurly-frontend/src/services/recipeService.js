import apiRequest from './apiService';
import keycloakService from './keycloakService'; 

const API_BASE_URL = '/api/recipes';

/**
 * Ruft alle Rezepte oder nach Dosha-Typ gefilterte Rezepte vom Backend ab.
 * @param {string|null} doshaType - Optionaler Dosha-Typ zum Filtern (z.B. 'vata', 'pitta', 'kapha').
 * Bei null oder 'all' (serverseitig interpretiert) werden alle Rezepte geladen.
 * @returns {Promise<Array<object>>} Eine Liste von Rezept-Datenobjekten.
 */
const getAllRecipes = async (doshaType = null) => {
  const token = keycloakService.getToken(); 
  let url = API_BASE_URL;
  if (doshaType && doshaType !== 'all') {
    url += `?doshaType=${encodeURIComponent(doshaType)}`;
  }
  return apiRequest(url, 'GET', null, token);
};

/**
 * Ruft ein einzelnes Rezept anhand seiner ID vom Backend ab.
 * @param {string} recipeId - Die UUID des Rezepts.
 * @returns {Promise<object>} Das Rezept-Datenobjekt.
 */
const getRecipeById = async (recipeId) => {
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
    return apiRequest(`${API_BASE_URL}/${recipeId}/unlike`, 'POST', null, keycloakService.getToken());
};


export default {
  getAllRecipes,
  getRecipeById,
  likeRecipe,
  unlikeRecipe,
};