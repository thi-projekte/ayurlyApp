import React from 'react';
import { Link } from 'react-router-dom'; // Link für normale Navigation
import '../../styles/footerStyles.css';

const Footer = () => {
  return (
    <footer>
      <h3>It's that simple. <span>Ayurly.</span></h3>
      <div className="right">
        <div className="links">
          <Link to="/">Ayurly</Link>
          <Link to="/dosha-test">Dosha Test</Link>
          <Link to="/rezepte">Rezepte</Link>
          <Link to="/communities">Communities</Link>
          <Link to="/login">Login</Link>
          {/* Hier könnte auch bedingt der Account-Link stehen */}
        </div>
        <div className="socials">
          {/* Icons müssen ggf. als React-Komponenten importiert werden (z.B. von react-icons)
              oder die CSS-Klassen für Flaticons müssen global verfügbar sein. */}
          <i className=""><i className="fi fi-brands-instagram"></i></i>
          <i className=""><i className="fi fi-br-mailbox-envelope"></i></i>
        </div>
        <p>Copyright © 2025 Ayurly, All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;