import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; 

const AdminRoute = () => {
  const { keycloakInstance, loadingKeycloak } = useUser();

  if (loadingKeycloak) {
    return <div>Lade Benutzerinformationen...</div>; 
  }

  const isAuthenticated = keycloakInstance && keycloakInstance.authenticated;
  const isAdmin = isAuthenticated && keycloakInstance.hasRealmRole('admin'); 

  if (!isAuthenticated) {
    // Weiterleitung zum Login, wenn nicht authentifiziert
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Benutzer ist authentifiziert, aber kein Admin
    return <Navigate to="/" replace />; // Weiterleitung zur Homepage
  }

  return <Outlet />; // Rendert die Kind-Routen, wenn der Benutzer Admin ist
};

export default AdminRoute;