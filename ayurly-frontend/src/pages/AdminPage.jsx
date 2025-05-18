import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from './AdminPage.module.css'; // Erstelle diese CSS-Datei

const AdminPage = () => {
  const location = useLocation();

  // Hilfsfunktion, um zu bestimmen, ob ein Link aktiv ist, auch für Unterrouten
  const isActive = (path) => location.pathname.startsWith(`/admin/${path}`);

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <nav className={styles.adminNav}>
          <NavLink
            to="dashboard" // Relativer Pfad zu /admin/dashboard
            className={({ isActive: isRouteActive }) =>
              `${styles.navLink} ${isRouteActive || location.pathname === '/admin' ? styles.activeLink : ''}`
            }
          >
            Übersicht
          </NavLink>
          <NavLink
            to="content"
            className={() => `${styles.navLink} ${isActive('content') ? styles.activeLink : ''}`}
          >
            Content Management
          </NavLink>
          <NavLink
            to="lookups"
            className={() => `${styles.navLink} ${isActive('lookups') ? styles.activeLink : ''}`}
          >
            Lookup Tabellen
          </NavLink>
          {/* Weitere Admin-Links hier */}
        </nav>
      </header>
      <main className={styles.adminContent}>
        <Outlet /> {/* Hier werden die Unterkomponenten (Dashboard, Content, Lookups) gerendert */}
      </main>
    </div>
  );
};

export default AdminPage;