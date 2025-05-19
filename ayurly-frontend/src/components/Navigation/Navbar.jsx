import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../contexts/UserContext';

const Navbar = () => {
  const { keycloakInstance, loadingKeycloak, login, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef();

  const isAuthenticated = !loadingKeycloak && keycloakInstance && keycloakInstance.authenticated;
  const isAdmin = isAuthenticated && keycloakInstance.hasRealmRole('admin');

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLoginClick = () => {
    closeMenu(); // Schließe das Menü, bevor der Login-Prozess startet
    login(); // Ruft keycloakInstance.login() auf
  };

  const handleLogoutClick = () => {
    closeMenu();
    logout(); // Ruft keycloakInstance.logout() auf
  };

  if (loadingKeycloak) {
    return (
      <nav className={styles.navContainer} ref={navRef}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>ayurly</NavLink>
        <div className={styles.links}>Lade...</div>
      </nav>
    );
  }

  return (
    <nav className={styles.navContainer} ref={navRef}>
      <NavLink to="/" className={styles.logo} onClick={closeMenu}>
        ayurly
      </NavLink>

      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'}
      </div>

      <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
        <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Dosha Test</NavLink>
        <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Rezepte</NavLink>
        <NavLink to="/communities" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Communities</NavLink> 
        
        {isAuthenticated && (
          <NavLink to="/account" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>myAyurly</NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Admin</NavLink>
        )}

        {menuOpen && (
          <div className={`${styles.login} ${styles.visibleOnMobile}`}>
            {!isAuthenticated ? (
              <button onClick={handleLoginClick} className={styles.loginButton}>Login</button>
            ) : (
              <button onClick={handleLogoutClick} className={styles.loginButton}>Logout</button>
            )}
          </div>
        )}
      </div>
      
      <div className={`${styles.login} ${menuOpen ? styles.hiddenOnMobileMenuOpen : ''}`}>
        {!isAuthenticated ? (
          <button onClick={handleLoginClick} className={styles.loginButton}>Login</button>
        ) : (
          <button onClick={handleLogoutClick} className={styles.loginButton}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;