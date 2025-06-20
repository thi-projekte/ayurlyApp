import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../contexts/UserContext';
import { FaHome, FaClipboardList, FaUtensils, FaSpa, FaSignInAlt, FaUserCircle, FaBars, FaTimes, FaShoppingBag, FaHeartbeat, FaChevronDown, FaChevronUp, FaCaretUp } from 'react-icons/fa';

const Navbar = () => {
  const { keycloakInstance, loadingKeycloak, login, logout, doshaType } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLifestyleDesktopOpen, setIsLifestyleDesktopOpen] = useState(false);
  const [isLifestyleMobileOpen, setIsLifestyleMobileOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const navRef = useRef();
  const mobileMenuPopupRef = useRef();
  const location = useLocation();

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
  const closeMenu = () => { setMenuOpen(false); setIsLifestyleMobileOpen(false); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Prüfe, ob der Klick außerhalb des gesamten navRef (obere Leiste) UND außerhalb des Popup-Menüs selbst erfolgte.
      if (navRef.current && !navRef.current.contains(event.target) &&
        mobileMenuPopupRef.current && !mobileMenuPopupRef.current.contains(event.target)) {
        closeMenu();
      } // else if (navRef.current && !navRef.current.contains(event.target) && !mobileMenuPopupRef.current) {
      //   closeMenu();
      // }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } //else {
    //document.removeEventListener('mousedown', handleClickOutside);
    //}
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Schließt das mobile Submenü, wenn die Route sich ändert
  useEffect(() => {
    setIsLifestyleMobileOpen(false);
  }, [location]);

  const handleLoginClick = () => {
    closeMenu(); // Schließe das Menü, bevor der Login-Prozess startet
    login();
  };

  const handleLogoutClick = () => {
    closeMenu();
    logout(); // Ruft keycloakInstance.logout() auf
  };

  if (loadingKeycloak) {
    return (
      <nav className={styles.navContainer} ref={navRef}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>ayurly</NavLink>
      </nav>
    );
  }

  return (
    <>
      {/* --- Obere Navigationsleiste (Logo, Desktop-Links/Login, Burger-Icon) --- */}
      <nav className={styles.navContainer} ref={navRef}>
        <NavLink to="/" className={styles.logo} onClick={closeMenu}>
          ayurly
        </NavLink>

        {/* Desktop Links */}
        <div className={`${styles.links} ${styles.desktopOnly}`}>
          <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Home</NavLink>
          {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Dosha Test</NavLink>}
          <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Rezepte</NavLink>
          {/* Desktop Dropdown für Lifestyle */}
          <div className={styles.dropdownContainer}>
            <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Lifestyle</NavLink>
            <div className={styles.dropdownMenu}>
              <NavLink
                to="/produkte"
                className={({ isActive }) => `${styles.dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`}
              >Produkte
              </NavLink>
              <NavLink
                to="/yoga"
                className={({ isActive }) => `${styles.dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`}
              >Yoga
              </NavLink>
            </div>
          </div>
          {isAuthenticated && <NavLink to="/myAyurly" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>myAyurly</NavLink>}
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Admin</NavLink>}
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
        <div className={styles.mobileMenuPopup} ref={mobileMenuPopupRef}>
          <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
          {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Dosha Test</NavLink>}
          <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Rezepte</NavLink>
          <div className={styles.mobileDropdownContainer}>
            <div className={styles.mobileDropdownToggle}>
              <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Lifestyle</NavLink>
              <button onClick={() => setIsLifestyleMobileOpen(!isLifestyleMobileOpen)}>
                {isLifestyleMobileOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            {isLifestyleMobileOpen && (
              <div className={styles.mobileSubMenu}>
                <NavLink to="/produkte" className={({ isActive }) => `${styles.mobileSubLink} ${isActive ? styles.activeMobileSubLink : ''}`} onClick={closeMenu}>Produkte</NavLink>
                <NavLink to="/yoga" className={({ isActive }) => `${styles.mobileSubLink} ${isActive ? styles.activeMobileSubLink : ''}`} onClick={closeMenu}>Yoga</NavLink>
              </div>
            )}
          </div>
          {isAuthenticated && <NavLink to="/myAyurly" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>myAyurly</NavLink>}
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Admin</NavLink>}
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
        <>
          {isLifestyleMobileOpen && (
            <div className={styles.pwaSubMenu}>
              <NavLink to="/produkte" className={({ isActive }) => `${styles.pwaSubMenuLink} ${isActive ? styles.activePwaSubMenuLink : ''}`} onClick={() => setIsLifestyleMobileOpen(false)}><FaShoppingBag /> Produkte</NavLink>
              <NavLink to="/yoga" className={({ isActive }) => `${styles.pwaSubMenuLink} ${isActive ? styles.activePwaSubMenuLink : ''}`} onClick={() => setIsLifestyleMobileOpen(false)}><FaHeartbeat /> Yoga</NavLink>
            </div>
          )}
          <nav className={styles.mobileBottomNav}>
            <NavLink to="/" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaHome className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Home</span></NavLink>
            {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaClipboardList className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Dosha Test</span></NavLink>}
            <NavLink to="/rezepte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaUtensils className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Rezepte</span></NavLink>

            <div className={styles.pwaDropdownContainer}>
              {isLifestyleMobileOpen && (
                <div className={styles.pwaSubMenu}>
                  <NavLink to="/produkte" className={styles.mobileNavLink} onClick={() => setIsLifestyleMobileOpen(false)}>
                    <FaShoppingBag className={styles.mobileNavIcon} />
                    <span className={styles.mobileNavText}>Produkte</span>
                  </NavLink>
                  <NavLink to="/yoga" className={styles.mobileNavLink} onClick={() => setIsLifestyleMobileOpen(false)}>
                    <FaHeartbeat className={styles.mobileNavIcon} />
                    <span className={styles.mobileNavText}>Yoga</span>
                  </NavLink>
                </div>
              )}
              <button className={styles.pwaSubMenuTrigger} onClick={() => setIsLifestyleMobileOpen(!isLifestyleMobileOpen)}>
                <FaCaretUp />
              </button>
              <NavLink to="/lifestyle" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`} onClick={() => setIsLifestyleMobileOpen(false)}>
                <FaSpa className={styles.mobileNavIcon} />
                <span className={styles.mobileNavText}>Lifestyle</span>
              </NavLink>
            </div>
            {isAuthenticated ?
              <NavLink to="/myAyurly" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaUserCircle className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>myAyurly</span></NavLink>
              :
              <div onClick={handleLoginClick} className={styles.mobileNavLink}><FaSignInAlt className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Login</span></div>
            }
          </nav>
        </>
      )}
    </>
  );
};

export default Navbar;