import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../contexts/UserContext';
import { FaHome, FaClipboardList, FaUtensils, FaSpa, FaSignInAlt, FaUserCircle, FaBars, FaTimes, FaShoppingBag, FaHeartbeat  } from 'react-icons/fa';

const Navbar = () => {
  const { keycloakInstance, loadingKeycloak, login, logout, doshaType } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const navRef = useRef();

  const isAuthenticated = !loadingKeycloak && keycloakInstance && keycloakInstance.authenticated;
  const isAdmin = isAuthenticated && keycloakInstance.hasRealmRole('admin');
  const showDoshaTestLink = !isAuthenticated || !doshaType;

  // Prüfen, ob die App im Standalone-Modus läuft
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Prüfe, ob der Klick außerhalb des gesamten navRef (obere Leiste) UND außerhalb des Popup-Menüs selbst erfolgte.
      if (navRef.current && !navRef.current.contains(event.target) &&
          mobileMenuPopupRef.current && !mobileMenuPopupRef.current.contains(event.target)) {
        closeMenu();
      } else if (navRef.current && !navRef.current.contains(event.target) && !mobileMenuPopupRef.current) {
        closeMenu();
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, navRef]); // mobileMenuPopupRef wird unten definiert

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
const commonNavLinks = (isMobileContext = false) => ( // isMobileContext für unterschiedliche Klick-Handler oder Styles falls nötig
    <>
      <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
      {showDoshaTestLink && (
        <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Dosha Test</NavLink>
      )}
      <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Rezepte</NavLink>
      <NavLink to="/produkte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Produkte</NavLink>
      <NavLink to="/yoga" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Yoga</NavLink>
      <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Lifestyle</NavLink>
      {isAuthenticated && (
        <NavLink to="/account" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>myAyurly</NavLink>
      )}
      {isAdmin && ( // Admin-Link nur im Desktop-Menü oder Burger-Menü anzeigen, nicht Bottom-Nav
         !isStandalone && // Zusätzliche Bedingung, um Admin-Link nicht in der Logik für Bottom-Nav zu haben
        <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Admin</NavLink>
      )}
    </>
  );


  return (
    <>
      {/* --- Obere Navigationsleiste (Logo, Desktop-Links/Login, Burger-Icon) --- */}
      <nav className={styles.navContainer} ref={navRef}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>
          ayurly
        </NavLink>

        {/* Desktop Links */}
        <div className={`${styles.links} ${styles.desktopOnly}`}>
          {commonNavLinks()}
        </div>
        
        {/* Desktop Login/Logout Button */}
        <div className={`${styles.login} ${styles.desktopOnly}`}>
          {!isAuthenticated ? (
            <button onClick={handleLoginClick} className={styles.loginButton}>Login</button>
          ) : (
            <button onClick={handleLogoutClick} className={styles.loginButton}>Logout</button>
          )}
        </div>

        {/* Burger-Menü Icon (nur anzeigen, wenn NICHT Standalone PWA) */}
        {!isStandalone && (
          <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        )}
      </nav>

      {/* Aufklappbares Burger-Menü (nur wenn NICHT Standalone PWA und Menü offen) */}
      {!isStandalone && menuOpen && (
        <div className={`${styles.mobileMenuPopup} ${menuOpen ? styles.open : ''}`}>
          {commonNavLinks(true)}
          {/* Login/Logout im Burger-Menü */}
          {!isAuthenticated ? (
            <button onClick={handleLoginClick} className={styles.mobileMenuLoginButton}>Login</button>
          ) : (
            <button onClick={handleLogoutClick} className={styles.mobileMenuLoginButton}>Logout</button>
          )}
        </div>
      )}


      {/* Mobile Bottom Navigation (nur anzeigen, wenn Standalone PWA) */}
      {isStandalone && (
        <nav className={styles.mobileBottomNav}>
          <NavLink to="/" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
            <FaHome className={styles.mobileNavIcon} />
            <span className={styles.mobileNavText}>Home</span>
          </NavLink>
          {showDoshaTestLink && (
            <NavLink to="/dosha-test" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
              <FaClipboardList className={styles.mobileNavIcon} />
              <span className={styles.mobileNavText}>Dosha Test</span>
            </NavLink>
          )}
          <NavLink to="/rezepte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
            <FaUtensils className={styles.mobileNavIcon} />
            <span className={styles.mobileNavText}>Rezepte</span>
          </NavLink>
          <NavLink to="/produkte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
            <FaShoppingBag className={styles.mobileNavIcon} /> 
            <span className={styles.mobileNavText}>Produkte</span>
          </NavLink>
          <NavLink to="/yoga" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
            <FaHeartbeat className={styles.mobileNavIcon} />
            <span className={styles.mobileNavText}>Yoga</span>
          </NavLink>
          <NavLink to="/lifestyle" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
            <FaSpa className={styles.mobileNavIcon} />
            <span className={styles.mobileNavText}>Lifestyle</span>
          </NavLink>
          {!isAuthenticated ? (
            <NavLink to="/login" onClick={(e) => { e.preventDefault(); handleLoginClick(); }} className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
              <FaSignInAlt className={styles.mobileNavIcon} />
              <span className={styles.mobileNavText}>Login</span>
            </NavLink>
          ) : (
            <NavLink to="/account" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
              <FaUserCircle className={styles.mobileNavIcon} />
              <span className={styles.mobileNavText}>myAyurly</span>
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
};

export default Navbar;