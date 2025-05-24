import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css'; // Importiere das CSS-Modul

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.logoArea}>
        <h3>
          It's that simple.<br></br> <span className={styles.ayurlySpan}>Ayurly.</span> 
        </h3>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.footerLinks}>
          <Link to="/">Ayurly</Link>
          <Link to="/dosha-test">Dosha Test</Link>
          <Link to="/rezepte">Rezepte</Link>
          <Link to="/lifestyle">Lifestyle</Link>
          <Link to="/login">Login</Link>
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