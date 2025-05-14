const API_BASE_URL = '/api/users'; // Passe dies an deine Quarkus API-Basis-URL an

/**
 * Ruft das Benutzerprofil vom Backend ab.
 * Erwartet, dass das Backend ein Objekt mit { username, email, firstName, lastName, doshaType } zurückgibt.
 * @param {string} token - Das Keycloak Access Token.
 * @returns {Promise<object>} Das Benutzerprofil.
 */
const fetchUserProfile = async (token) => {
  if (!token) {
    throw new Error("No token provided for fetching user profile.");
  }
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Versuche, eine Fehlermeldung vom Backend zu lesen
      const errorData = await response.text();
      console.error(`Error fetching user profile: ${response.status} ${response.statusText}`, errorData);
      // Fallback, wenn das Backend-Profil noch nicht existiert (z.B. für einen brandneuen Keycloak-User)
      if (response.status === 404) {
           console.warn("User profile not found on backend, possibly a new user.");
           return { doshaType: null }; // Signalisiert, dass kein Profil existiert
      }
      throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error; // Fehler weiterwerfen, damit er im Context behandelt werden kann
  }
};

/**
 * Aktualisiert den Dosha-Typ des Benutzers im Backend.
 * @param {string} doshaType - Der neue Dosha-Typ.
 * @param {string} token - Das Keycloak Access Token.
 * @returns {Promise<object>} Das aktualisierte Benutzerprofil vom Backend.
 */
const updateUserDosha = async (doshaType, token) => {
  if (!token) {
    throw new Error("No token provided for updating Dosha type.");
  }
  try {
    const response = await fetch(`${API_BASE_URL}/me/dosha`, {
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
    return await response.json(); // Backend sollte das aktualisierte Profil zurückgeben
  } catch (error) {
    console.error("Error in updateUserDosha:", error);
    throw error;
  }
};

export default {
  fetchUserProfile,
  updateUserDosha,
};