import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import keycloakService from '../services/keycloakService'; // Importieren
import userService from '../services/userService'; // Importieren (wird später erstellt)

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null); // Die Keycloak-Instanz
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // Enthält { username, email, firstName, lastName, doshaType }
  const [doshaType, setDoshaType] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAuthentication = useCallback(async (kcInstance) => {
    if (kcInstance && kcInstance.authenticated) {
      setIsLoggedIn(true);
      setKeycloak(kcInstance);

      // Lade Benutzerprofil (inkl. Dosha-Typ) vom Backend
      try {
        const profile = await userService.fetchUserProfile(kcInstance.token);
        setUserProfile(profile);
        setDoshaType(profile.doshaType || localStorage.getItem('doshaTypeContextual')); // Fallback auf lokalen Wert, falls Backend keinen hat

        // Wenn ein Dosha-Typ vom Backend kommt, ggf. lokalen entfernen
        if (profile.doshaType) {
          localStorage.removeItem('doshaTypeContextual');
        } else {
          // Wenn Backend keinen Dosha-Typ hat, aber einer lokal existiert (z.B. neuer User),
          // versuche, ihn zum Backend zu synchronisieren.
          const localDosha = localStorage.getItem('doshaTypeContextual');
          if (localDosha) {
            // Warte kurz, um sicherzustellen, dass der Benutzer wirklich neu ist / keine Race Condition
            setTimeout(async () => {
                const currentProfile = await userService.fetchUserProfile(kcInstance.token); // Nochmal holen
                if (!currentProfile.doshaType) {
                    console.log(`User ${currentProfile.username} has no DoshaType in backend, attempting to sync local: ${localDosha}`);
                    await updateDoshaTypeAndPersist(localDosha, kcInstance); // Speichern und dann entfernen
                }
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile from backend:", error);
        // Fallback: Benutzerdaten aus dem Token nehmen
        const tokenProfile = {
          username: kcInstance.tokenParsed?.preferred_username || 'User',
          email: kcInstance.tokenParsed?.email,
          firstName: kcInstance.tokenParsed?.given_name,
          lastName: kcInstance.tokenParsed?.family_name,
          doshaType: kcInstance.tokenParsed?.doshaType || localStorage.getItem('doshaTypeContextual'),
        };
        setUserProfile(tokenProfile);
        setDoshaType(tokenProfile.doshaType);
      }
    } else {
      setIsLoggedIn(false);
      setKeycloak(null);
      setUserProfile(null);
      // Für nicht eingeloggte Benutzer den Dosha-Typ aus dem localStorage laden
      setDoshaType(localStorage.getItem('doshaTypeContextual'));
    }
    setLoading(false);
  }, []);

  const handleAuthError = useCallback((error) => {
    setLoading(false);
    // Behandle Authentifizierungsfehler, z.B. Fehlermeldung anzeigen
    // Fürs Erste, lade lokalen Dosha-Typ als Fallback
    setDoshaType(localStorage.getItem('doshaTypeContextual'));
  }, []);

  useEffect(() => {
    keycloakService.initKeycloak(handleAuthentication, handleAuthError);
  }, [handleAuthentication, handleAuthError]);

  const updateDoshaTypeAndPersist = async (newDosha, kcInstanceForUpdate = keycloak) => {
    setDoshaType(newDosha);
    if (isLoggedIn && kcInstanceForUpdate && kcInstanceForUpdate.authenticated) {
      try {
        const updatedProfile = await userService.updateUserDosha(newDosha, kcInstanceForUpdate.token);
        setUserProfile(updatedProfile); // Aktualisiere das Profil mit der Antwort vom Backend
        localStorage.removeItem('doshaTypeContextual'); // Entferne den lokalen Wert, da jetzt serverseitig
        console.log("Dosha type updated in backend and local storage cleared.");
      } catch (error) {
        console.error("Failed to update Dosha type in backend:", error);
        // Fehlerbehandlung: Was passiert, wenn Backend-Update fehlschlägt?
        // Option: Lokalen Wert vorerst beibehalten oder dem Benutzer eine Fehlermeldung anzeigen.
        // Für dieses Beispiel: Wir behalten den im Context gesetzten Wert und versuchen es später ggf. erneut.
        localStorage.setItem('doshaTypeContextual', newDosha); // Als Fallback wieder lokal speichern
      }
    } else {
      // Nicht eingeloggt, nur im localStorage und Context speichern
      localStorage.setItem('doshaTypeContextual', newDosha);
    }
  };


  const login = keycloakService.login;
  const logout = () => {
    setIsLoggedIn(false); // Sofort UI aktualisieren
    setUserProfile(null);
    setDoshaType(localStorage.getItem('doshaTypeContextual')); // Fallback auf lokalen Wert
    keycloakService.logout();
  };
  const register = keycloakService.register;

  if (loading) {
    return <div>Anwendung wird geladen...</div>; // Oder ein schönerer globaler Loader
  }

  return (
    <UserContext.Provider value={{
      isLoggedIn,
      userProfile,
      doshaType,
      login,
      logout,
      register,
      updateDoshaType: updateDoshaTypeAndPersist,
      keycloakInstance: keycloak, // Die initialisierte Keycloak-Instanz
      loadingKeycloak: loading,
      accountManagementUrl: keycloak?.authenticated ? keycloak.createAccountUrl() : null
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook für einfachen Zugriff auf den Context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};