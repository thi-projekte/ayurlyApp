import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { useUser } from '../../contexts/UserContext';

const Footer = () => {
  const { keycloakInstance, loadingKeycloak } = useUser();
  const isAuthenticated = !loadingKeycloak && keycloakInstance && keycloakInstance.authenticated;

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.logoArea}>
        <h3>
          It's that simple.<br /> <span className={styles.ayurlySpan}>Ayurly.</span>
        </h3>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.footerLinks}>
          <div className={styles.row}>
            <Link to="/">Startseite</Link>
            <Link to="/dosha-test">Dosha Test</Link>
            {isAuthenticated ? (
              <Link to="/myAyurly">myAyurly</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
            <Link to="/impressum">Impressum & Datenschutz</Link>
          </div>
          <div className={styles.row}>
            <Link to="/rezepte">Rezepte</Link>
            <Link to="/yoga">Yoga-Übungen</Link>
            <Link to="/produkte">Produkte</Link>
            <Link to="/lifestyle">Lifestyle</Link>
          </div>
        </div>
        <div className={styles.socials}>
          <a href="https://www.instagram.com/ayurly.balance/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fi fi-brands-instagram"></i>
          </a>
          <a href="mailto:info@ayurly.com" aria-label="E-Mail">
            <i className="fi fi-br-mailbox-envelope"></i>
          </a>
        </div>
        <p className={styles.copyright}>
          Copyright &copy; {new Date().getFullYear()} Ayurly, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;