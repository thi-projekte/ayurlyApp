import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../contexts/UserContext';
import { FaHome, FaClipboardList, FaUtensils, FaSpa, FaSignInAlt, FaUserCircle } from 'react-icons/fa';

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
    <>
      {/* Desktop Navigation */}
      <nav className={styles.navContainer} ref={navRef}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>
          ayurly
        </NavLink>

        {/* Burger Menue war alte mobile nav... ist jetzt über display:none entfernt worden, aber noch hier, falls man doch nochmal damit arbeiten möchte */}
        <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </div>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Dosha Test</NavLink>
          <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Rezepte</NavLink>
          <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Lifestyle</NavLink>

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

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        <NavLink to="/" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
          <FaHome className={styles.mobileNavIcon} />
          <span className={styles.mobileNavText}>Home</span>
        </NavLink>
        <NavLink to="/dosha-test" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
          <FaClipboardList className={styles.mobileNavIcon} />
          <span className={styles.mobileNavText}>Dosha Test</span>
        </NavLink>
        <NavLink to="/rezepte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
          <FaUtensils className={styles.mobileNavIcon} />
          <span className={styles.mobileNavText}>Rezepte</span>
        </NavLink>
        <NavLink to="/lifestyle" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
          <FaSpa className={styles.mobileNavIcon} />
          <span className={styles.mobileNavText}>Lifestyle</span>
        </NavLink>
        {!isAuthenticated ? (
          <NavLink to="/login" onClick={handleLoginClick} className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}>
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
    </>
  );
};

export default Navbar;