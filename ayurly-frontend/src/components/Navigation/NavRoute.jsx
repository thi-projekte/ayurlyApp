import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Annahme: UserContext existiert

const AdminRoute = () => {
  const { keycloakInstance, loadingKeycloak } = useUser();

  if (loadingKeycloak) {
    return <div>Lade Benutzerinformationen...</div>;
  }

  const isAuthenticated = keycloakInstance && keycloakInstance.authenticated;
  const isAdmin = isAuthenticated && keycloakInstance.hasRealmRole('admin'); // Oder hasResourceRole('admin', 'your-client-id')

  if (!isAuthenticated) {
    // Optional: Weiterleitung zum Login, wenn nicht authentifiziert
    // keycloakInstance.login(); // Dies würde einen direkten Login-Versuch starten
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Benutzer ist authentifiziert, aber kein Admin
    return <Navigate to="/" replace />; // Weiterleitung zur Homepage 

  return <Outlet />; // Rendert die Kind-Routen, wenn der Benutzer Admin ist
    };
}

export default AdminRoute;