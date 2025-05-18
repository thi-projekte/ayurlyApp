const API_BASE_URL = '/api/user-accounts'; // Angepasst

/**
 * Ruft das Benutzerprofil vom Backend ab.
 * Erwartet, dass das Backend ein Objekt mit { keycloakId, username, email, firstName, lastName, doshaType } zurückgibt.
 * @param {string} token - Das Keycloak Access Token.
 * @returns {Promise<object>} Das Benutzerprofil.
 */
const fetchUserProfile = async (token) => {
  if (!token) {
    throw new Error("No token provided for fetching user profile.");
  }
  try {
    const response = await fetch(`${API_BASE_URL}/me`, { // Pfad /me bleibt gleich
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error fetching user profile: ${response.status} ${response.statusText}`, errorData);
      if (response.status === 404) { // Sollte jetzt seltener auftreten, da Backend den User anlegt
           console.warn("User profile not found on backend, possibly a new user and /me was not called yet to create it.");
           // Hier könntest du ein "leeres" Profil zurückgeben, das signalisiert, dass der Dosha-Typ noch nicht gesetzt ist.
           // Die Backend-Ressource erstellt jetzt aber schon einen leeren AppUser-Eintrag.
           // Die DTO-Struktur wird aber trotzdem erwartet.
           return { doshaType: null }; // Oder was immer deine UserAccountResponse-Struktur bei leerem Dosha ist
      }
      throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error;
  }
};

/**
 * Aktualisiert den Dosha-Typ des Benutzers im Backend.
 * @param {string} doshaType - Der neue Dosha-Typ.
 * @param {string} token - Das Keycloak Access Token.
 * @returns {Promise<object>} Das aktualisierte Benutzerprofil vom Backend (UserAccountResponse DTO).
 */
const updateUserDosha = async (doshaType, token) => {
  if (!token) {
    throw new Error("No token provided for updating Dosha type.");
  }
  try {
    const response = await fetch(`${API_BASE_URL}/me/dosha`, { // Pfad /me/dosha bleibt gleich
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ doshaType: doshaType }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error updating dosha type: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`Failed to update Dosha type. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in updateUserDosha:", error);
    throw error;
  }
};

export default {
  fetchUserProfile,
  updateUserDosha,
};