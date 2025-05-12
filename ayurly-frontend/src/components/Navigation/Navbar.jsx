import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink für aktive Links
import '../../styles/navBarStyles.css'; // Wenn du die alten Styles direkt nutzt

const Navbar = () => {
  // Logik für eingeloggten Zustand kommt später
  const isLoggedIn = false; // Dummy-Wert

  return (
    <nav>
      <NavLink to="/" className="logo">ayurly</NavLink>
      <div className="links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/dosha-test" className={({ isActive }) => isActive ? "active" : ""}>Dosha Test</NavLink>
        <NavLink to="/rezepte" className={({ isActive }) => isActive ? "active" : ""}>Rezepte</NavLink>
        <NavLink to="/communities" className={({ isActive }) => isActive ? "active" : ""}>Communities</NavLink>
        {/* Beispiel für eine bedingte Challenge-Seite, falls du sie noch hast */}
        {/* <NavLink to="/routinen" className={({ isActive }) => isActive ? "active" : ""}>Challenges</NavLink> */}
      </div>

      <div className="login">
        {!isLoggedIn && <NavLink to="/login" className="signup">Login</NavLink>}
        {/* "Account" Link Logik basierend auf isLoggedIn */}
        {isLoggedIn && <NavLink to="/account" className="signup">Account</NavLink>}
        {!isLoggedIn && (
          <div style={{ marginLeft: '10px' }}> {/* Temporärer Workaround für den zweiten "Login" Button, der Account werden soll*/}
             <NavLink to="/account" className="signup" style={{display: 'none'}} >Account (hidden)</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;