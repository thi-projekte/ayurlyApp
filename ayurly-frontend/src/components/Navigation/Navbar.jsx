import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../contexts/UserContext';
import { 
    FaHome, FaClipboardList, FaUtensils, FaSpa, FaSignInAlt, FaUserCircle, 
    FaBars, FaTimes, FaShoppingBag, FaHeartbeat, FaChevronDown, FaChevronUp, FaCaretUp 
} from 'react-icons/fa';

const Navbar = () => {
    const { keycloakInstance, loadingKeycloak, login, logout, doshaType } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLifestyleMobileOpen, setIsLifestyleMobileOpen] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const navRef = useRef();
    const mobileMenuPopupRef = useRef();
    const location = useLocation();

    const isAuthenticated = !loadingKeycloak && keycloakInstance && keycloakInstance.authenticated;
    const isAdmin = isAuthenticated && keycloakInstance.hasRealmRole('admin');
    const showDoshaTestLink = !isAuthenticated || !doshaType;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        setIsStandalone(mediaQuery.matches);
        const handleChange = (e) => setIsStandalone(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => {
        setMenuOpen(false);
        setIsLifestyleMobileOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target) &&
                mobileMenuPopupRef.current && !mobileMenuPopupRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        setIsLifestyleMobileOpen(false);
    }, [location]);

    if (loadingKeycloak) {
        return <nav className={styles.navContainer}><div className={styles.logo}>ayurly</div></nav>;
    }

    return (
        <>
            {/* --- Obere Navigationsleiste --- */}
            <nav className={styles.navContainer} ref={navRef}>
                <NavLink to="/" className={styles.logo} onClick={closeMenu}>ayurly</NavLink>

                {/* --- Desktop Links --- */}
                <div className={`${styles.links} ${styles.desktopOnly}`}>
                    <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Home</NavLink>
                    {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Dosha Test</NavLink>}
                    <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Rezepte</NavLink>
                    <div className={styles.dropdownContainer}>
                        <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Lifestyle</NavLink>
                        <div className={styles.dropdownMenu}>
                            <NavLink to="/produkte" className={({ isActive }) => `${styles.dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`}>Produkte</NavLink>
                            <NavLink to="/yoga" className={({ isActive }) => `${styles.dropdownLink} ${isActive ? styles.activeDropdownLink : ''}`}>Yoga</NavLink>
                        </div>
                    </div>
                    {isAuthenticated && <NavLink to="/myAyurly" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>myAyurly</NavLink>}
                    {isAdmin && <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>Admin</NavLink>}
                </div>
                
                <div className={`${styles.login} ${styles.desktopOnly}`}>
                    {!isAuthenticated ? <button onClick={login} className={styles.loginButton}>Login</button> : <button onClick={logout} className={styles.loginButton}>Logout</button>}
                </div>

                {/* --- Burger-Icon für Mobile Browser --- */}
                {!isStandalone && <div className={styles.mobileMenuIcon} onClick={toggleMenu}>{menuOpen ? <FaTimes /> : <FaBars />}</div>}
            </nav>

            {/* --- Aufklappbares Burger-Menü (Mobile Browser) --- */}
            {!isStandalone && menuOpen && (
                <div className={styles.mobileMenuPopup} ref={mobileMenuPopupRef}>
                    <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
                    {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Dosha Test</NavLink>}
                    <NavLink to="/rezepte" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Rezepte</NavLink>
                    <div className={styles.mobileDropdownContainer}>
                        <div className={styles.mobileDropdownToggle}>
                            <NavLink to="/lifestyle" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Lifestyle</NavLink>
                            <button onClick={() => setIsLifestyleMobileOpen(!isLifestyleMobileOpen)}>{isLifestyleMobileOpen ? <FaChevronUp /> : <FaChevronDown />}</button>
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
                    {!isAuthenticated ? <button onClick={() => { closeMenu(); login(); }} className={styles.mobileMenuLoginButton}>Login</button> : <button onClick={() => { closeMenu(); logout(); }} className={styles.mobileMenuLoginButton}>Logout</button>}
                </div>
            )}

            {/* --- Mobile Bottom Navigation (PWA) --- */}
            {isStandalone && (
                <nav className={styles.mobileBottomNav}>
                    <NavLink to="/" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaHome className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Home</span></NavLink>                        
                    {showDoshaTestLink && <NavLink to="/dosha-test" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaClipboardList className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Dosha Test</span></NavLink>}
                    <NavLink to="/rezepte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaUtensils className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Rezepte</span></NavLink>                        
                    
                    <div className={styles.pwaDropdownContainer}>
                            {isLifestyleMobileOpen && (
                                <div className={styles.pwaSubMenu} onClick={() => setIsLifestyleMobileOpen(false)}>
                                    <div className={styles.pwaSubMenuItemStack}>
                                        <NavLink to="/produkte" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaShoppingBag className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Produkte</span></NavLink>
                                        <NavLink to="/yoga" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaHeartbeat className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Yoga</span></NavLink>
                                    </div>
                                </div>
                            )}
                             <button className={styles.pwaSubMenuTrigger} onClick={() => setIsLifestyleMobileOpen(v => !v)} ><FaCaretUp/> </button>
                            <NavLink to="/lifestyle" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`} onClick={() => setIsLifestyleMobileOpen(false)}>
                                <FaSpa className={styles.mobileNavIcon} />
                                <span className={styles.mobileNavText}>Lifestyle</span>
                            </NavLink>
                    </div>

                    {isAuthenticated ? 
                        <NavLink to="/myAyurly" className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.activeMobile : ''}`}><FaUserCircle className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>myAyurly</span></NavLink>
                        :
                        <div onClick={() => { closeMenu(); login(); }} className={styles.mobileNavLink}><FaSignInAlt className={styles.mobileNavIcon} /><span className={styles.mobileNavText}>Login</span></div>
                    }
                </nav>
            )}
        </>
    );
};

export default Navbar;