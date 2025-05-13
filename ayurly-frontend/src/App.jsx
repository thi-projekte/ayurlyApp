import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar'; // .jsx ist optional beim Import
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage';
 import DoshaTestPage from './pages/DoshaTestPage';
import RezeptePage from './pages/RezeptePage';
import RezepteDetailPage from './pages/RezepteDetailPage';
// import CommunitiesPage from './pages/CommunitiesPage';
import LoginPage from './pages/LoginPage';
 import AccountPage from './pages/AccountPage';

// Globale App-Styles, falls vorhanden (Vite generiert eine App.css, die du anpassen oder ersetzen kannst)
// import './App.css'; // Wenn du spezifische App-Wrapper Styles hast

// Importiere deine alten CSS-Dateien, die allgemeingültig sind
// (bis du sie in Komponenten-spezifische Styles umwandelst oder CSS-Module nutzt)
import './styles/navBarStyles.css';
import './styles/footerStyles.css';
// Weitere globale Styles deiner Seiten hier importieren, wenn nötig,
// oder besser direkt in den jeweiligen Page-Komponenten.

function App() {
  return (
    <Router>
      {/* <div className="App">  Optionaler Wrapper, falls du ihn für globale Styles brauchst */}
        <Navbar />
        <main> {/* Dies ist der Bereich, der sich mit der Route ändert */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dosha-test" element={<DoshaTestPage />} />
            <Route path="/rezepte" element={<RezeptePage />} />
            <Route path="/rezepte/:rezeptId" element={<RezepteDetailPage />} />
            {/* <Route path="/communities" element={<CommunitiesPage />} /> */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* Ggf. eine Route für Routinen/Challenges, falls noch relevant */}
            {/* <Route path="/routinen" element={<RoutinenPage />} /> */}
          </Routes>
        </main>
        <Footer />
      {/* </div> */}
    </Router>
  );
}

export default App;