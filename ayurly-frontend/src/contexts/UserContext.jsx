import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import keycloakService from '../services/keycloakService';
import userService from '../services/userService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // Backend-Profil: { keycloakId, username, email, firstName, lastName, doshaType }
  const [loadingKeycloak, setLoadingKeycloak] = useState(true); 

  const [anonymousDoshaType, setAnonymousDoshaType] = useState(() => {
    return localStorage.getItem('doshaTypeContextual');
  });

  const fetchAndSetUserProfile = async (kcInstance) => {
    if (kcInstance && kcInstance.authenticated && kcInstance.token) {
      try {
        console.log("UserContext: Authenticated, fetching user profile from backend...");
        const profileFromBackend = await userService.fetchUserProfile(kcInstance.token);
        setUserProfile(profileFromBackend);
        console.log("UserContext: Profile from backend:", profileFromBackend);

        const localContextualDosha = localStorage.getItem('doshaTypeContextual');
        if (localContextualDosha && !profileFromBackend.doshaType) {
          console.log(`UserContext: User ${profileFromBackend.keycloakId} has no DoshaType in backend. Attempting to sync local contextual Dosha: ${localContextualDosha}`);
          // Versuche, den lokalen Dosha-Typ zum Backend zu synchronisieren
          // Warte kurz, falls der User gerade erst angelegt wurde und der /me Call zum Anlegen noch läuft
          setTimeout(async () => {
            try {
                const updatedProfile = await userService.updateUserDosha(localContextualDosha, kcInstance.token);
                setUserProfile(updatedProfile); // Aktualisiere mit der Antwort vom Backend
                localStorage.removeItem('doshaTypeContextual');
                console.log("UserContext: Contextual DoshaType synced to backend and removed from local storage.");
            } catch (syncError) {
                console.error("UserContext: Failed to sync contextual DoshaType to backend:", syncError);
            }
          }, 1500); 
        } else if (profileFromBackend.doshaType) {
            // Wenn Backend einen Dosha-Typ hat, stelle sicher, dass der lokale kontextuelle entfernt wird
            localStorage.removeItem('doshaTypeContextual');
        }

      } catch (error) {
        console.error("UserContext: Failed to fetch user profile from backend:", error);
        // Fallback: Basis-Benutzerdaten aus dem Token nehmen, doshaType bleibt null
        const tokenProfile = {
          keycloakId: kcInstance.subject,
          username: kcInstance.tokenParsed?.preferred_username || 'User',
          email: kcInstance.tokenParsed?.email,
          firstName: kcInstance.tokenParsed?.given_name,
          lastName: kcInstance.tokenParsed?.family_name,
          doshaType: null, // Wird vom Backend geholt
        };
        setUserProfile(tokenProfile);
      }
    } else if (!kcInstance || !kcInstance.authenticated) {
        // User ist nicht (mehr) eingeloggt
        setUserProfile(null); // Kein Profil, wenn nicht eingeloggt
    }
  };

  const handleAuthentication = useCallback(async (kcInstance) => {
    setLoadingKeycloak(false);
    if (kcInstance && kcInstance.authenticated) {
      setIsLoggedIn(true);
      setKeycloak(kcInstance);
      await fetchAndSetUserProfile(kcInstance); // Profil laden
    } else {
      setIsLoggedIn(false);
      setKeycloak(null);
      setUserProfile(null); // User ist nicht eingeloggt, kein Profil
    }
  }, []);

  const handleAuthError = useCallback((error) => {
    setLoadingKeycloak(false);
    setIsLoggedIn(false);
    setKeycloak(null);
    setUserProfile(null);
    console.error("UserContext: Keycloak authentication error:", error);
  }, []);

  useEffect(() => {
    keycloakService.initKeycloak(handleAuthentication, handleAuthError);
  }, [handleAuthentication, handleAuthError]);


  // Diese Funktion wird vom DoshaTestPage aufgerufen, um den Dosha-Typ zu setzen/aktualisieren
  const updateDoshaTypeContextual = async (newDosha) => {
    if (isLoggedIn && keycloak && keycloak.token) {
      // Eingeloggter User: Direkt ans Backend senden und Profil aktualisieren
      try {
        console.log(`UserContext: Updating DoshaType to ${newDosha} for logged-in user.`);
        const updatedProfile = await userService.updateUserDosha(newDosha, keycloak.token);
        setUserProfile(updatedProfile); // Aktualisiere das gesamte Profil mit der Backend-Antwort
        localStorage.removeItem('doshaTypeContextual'); // Entferne den lokalen Kontext-Wert
        setAnonymousDoshaType(null); // Der anonyme Wert ist nicht mehr relevant
      } catch (error) {
        console.error("UserContext: Failed to update DoshaType in backend:", error);
        localStorage.setItem('doshaTypeContextual', newDosha); // Notfall-Fallback
        setUserProfile(prev => ({ ...prev, doshaType: newDosha })); // Optimistisches UI-Update
      }
    } else {
      // Nicht eingeloggter User: Nur im localStorage für den Kontext speichern
      console.log(`UserContext: Setting contextual DoshaType to ${newDosha} for anonymous user.`);
      localStorage.setItem('doshaTypeContextual', newDosha);
      setAnonymousDoshaType(newDosha); 
    }
  };

  const login = keycloakService.login;
  const logout = () => {
    keycloakService.logout(); // Keycloak-Logout leitet weiter und löst dann neuen Init-Flow aus
    // Lokale States werden durch den neuen Init-Flow nach Logout zurückgesetzt
  };
  const register = keycloakService.register;

  const getEffectiveDoshaType = () => {
    if (isLoggedIn && userProfile) {
      return userProfile.doshaType;
    }
    return anonymousDoshaType;
  };

  return (
    <UserContext.Provider value={{
      isLoggedIn,
      userProfile,
      doshaType: getEffectiveDoshaType(),
      login,
      logout,
      register,
      updateUserDosha: updateDoshaTypeContextual, 
      keycloakInstance: keycloak,
      loadingKeycloak,
      accountManagementUrl: keycloak?.authenticated ? keycloak.createAccountUrl() : null
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};