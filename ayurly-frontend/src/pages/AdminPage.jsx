import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(`/admin/${path}`);
  const isExactActive = (path) => location.pathname === `/admin/${path}`;

  // Wenn der Benutzer auf /admin/lookups ist, aber keine Unterroute gewählt hat,
  // leite ihn z.B. zu Dosha-Typen weiter.
  useEffect(() => {
    if (location.pathname === '/admin/lookups') {
      navigate('dosha-types', { replace: true });
    }
    // Ggf. ähnliche Logik für /admin/content
  }, [location.pathname, navigate]);


  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <nav className={styles.adminNav}>
          <NavLink
            to="dashboard"
            className={() => `${styles.navLink} ${isExactActive('dashboard') || location.pathname === '/admin' ? styles.activeLink : ''}`}
          >
            Übersicht
          </NavLink>
          <NavLink
            to="content" // Basis für Content, z.B. /admin/content/recipes
            className={() => `${styles.navLink} ${isActive('content') ? styles.activeLink : ''}`}
          >
            Content Management
          </NavLink>
          <NavLink
            to="lookups/dosha-types" // Direkt zur ersten Lookup-Seite
            className={() => `${styles.navLink} ${isActive('lookups') ? styles.activeLink : ''}`}
          >
            Lookup Tabellen
          </NavLink>
        </nav>
      </header>

      {/* Optional: Sub-Navigation für Lookup-Tabellen, wenn man auf /admin/lookups ist */}
      {isActive('lookups') && (
        <nav className={styles.adminSubNav}> {/* Neues CSS hierfür anlegen */}
          <NavLink to="lookups/dosha-types" className={({isActive}) => isActive ? styles.activeSubLink : styles.subLink}>Dosha-Typen</NavLink>
          <NavLink to="lookups/content-types" className={({isActive}) => isActive ? styles.activeSubLink : styles.subLink}>Content-Typen</NavLink>
          <NavLink to="lookups/units" className={({isActive}) => isActive ? styles.activeSubLink : styles.subLink}>Einheiten</NavLink>
        </nav>
      )}

      <main className={styles.adminContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;