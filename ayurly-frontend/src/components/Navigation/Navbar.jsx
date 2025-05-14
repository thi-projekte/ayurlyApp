// src/components/Navigation/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css'; // Importiere das CSS-Modul

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Später durch KeyCloak ersetzen
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(); // Ref für die Navbar, um Klicks außerhalb zu erkennen

  // Dummy-Login/Logout-Funktionen
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Schließen des Menüs bei Klick außerhalb der Navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    // Event Listener hinzufügen, wenn das Menü offen ist
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Event Listener entfernen, wenn das Menü geschlossen ist
      document.removeEventListener('mousedown', handleClickOutside);
    }
    // Cleanup-Funktion
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);


  return (
    <nav className={styles.navContainer} ref={navRef}>
      <NavLink to="/" className={styles.logo} onClick={closeMenu}>
        ayurly
      </NavLink>

      {/* Burger-Icon für Mobile */}
      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'} {/* Schließen/Öffnen Icon */}
      </div>

      {/* Navigationslinks */}
      {/* Die Klasse 'open' wird hinzugefügt, wenn menuOpen true ist */}
      <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          onClick={closeMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/dosha-test"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          onClick={closeMenu}
        >
          Dosha Test
        </NavLink>
        <NavLink
          to="/rezepte"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          onClick={closeMenu}
        >
          Rezepte
        </NavLink>
        <NavLink
          to="/communities"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          onClick={closeMenu}
        >
          Communities
        </NavLink>
        {isLoggedIn && (
          <NavLink
            to="/account"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            onClick={closeMenu}
          >
            myAyurly
          </NavLink>
        )}

        {/* Login/Logout im mobilen Menü anzeigen, wenn es offen ist */}
        {menuOpen && (
            <div className={`${styles.login} ${styles.visibleOnMobile}`}>
                 {!isLoggedIn ? (
                    <NavLink to="/login" className={styles.loginButton} onClick={() => { handleLogin(); closeMenu();}}> {/* Dummy Login bei Klick */}
                        Login
                    </NavLink>
                    ) : (
                    <button onClick={() => { handleLogout(); closeMenu(); }} className={styles.loginButton}>
                        Logout
                    </button>
                    )}
            </div>
         )}
      </div>

      {/* Login-Bereich für Desktop (wird durch CSS im mobilen Modus bei offenem Menü ausgeblendet) */}
      {/* Die Klasse hiddenOnMobileMenuOpen wird im CSS verwendet, um diesen Block zu verstecken, wenn das Menü offen ist,
          um Duplizierung zu vermeiden, da der Login dann im Menü selbst ist.
          Alternativ: {!menuOpen && (...)} im JSX, aber CSS-Lösung ist oft sauberer für reine Darstellung. */}
      <div className={`${styles.login} ${menuOpen ? styles.hiddenOnMobileMenuOpen : ''}`}>
        {!isLoggedIn ? (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid --
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogin();}} className={styles.loginButton}> {/* Temporär Link, bis /login Page da ist oder KeyCloak */}
            Login
          </a>
        ) : (
          <button onClick={handleLogout} className={styles.loginButton}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;