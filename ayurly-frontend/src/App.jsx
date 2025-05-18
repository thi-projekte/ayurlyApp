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
import { UserProvider } from './contexts/UserContext';
// Admin-Page Imports
import AdminRoute from './components/Navigation/AdminRoute';
import AdminPage from './pages/AdminPage'; 
import ManageDoshaTypes from './components/Admin/ManageDoshaTypes'; 

function App() {
  return (
    <Router>
      <UserProvider> {/* UserContext umschließt alles */}
      {/* <div className="App">  Optionaler Wrapper, falls du ihn für globale Styles brauchst */}
        <Navbar /> {/* Navbar immer anzeigen */}
        <main> {/* main content wird dynamisch über die simulierten Routen geladen */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dosha-test" element={<DoshaTestPage />} />
            <Route path="/rezepte" element={<RezeptePage />} />
            <Route path="/rezepte/:rezeptId" element={<RezepteDetailPage />} />
            {/* <Route path="/communities" element={<CommunitiesPage />} /> */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* Ggf. Protected Routes für Seiten wie /account */}
            {/* Ggf. eine Route für Routinen/Challenges, falls noch relevant */}
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}> {/* Geschützte Hauptroute */}
              {/* <Route index element={<Navigate to="dashboard" replace />} /> Standard-Weiterleitung für /admin */}
              <Route path="" element={<AdminPage />}> {/* Layout für Admin-Seiten */}
                <Route path="dashboard" element={<div>Admin Dashboard Platzhalter</div>} />
                <Route path="content" element={<div>Content Management Platzhalter</div>} />
                {/* <Route path="content/recipes" element={<ManageRecipes />} /> */}
                <Route path="lookups" element={<div>Lookup Tabellen Management Platzhalter</div>} />
                <Route path="lookups/dosha-types" element={<ManageDoshaTypes />} />
                {/* <Route path="lookups/content-types" element={<ManageContentTypes />} /> */}
                {/* <Route path="lookups/units" element={<ManageUnits />} /> */}
                {/* Weitere Admin-Unterrouten */}
              </Route>
            </Route>
            {/* Fallback-Route für nicht gefundene Pfade */}
            <Route path="*" element={<div>404 Seite nicht gefunden</div>} /> 
          </Routes>
        </main>
        <Footer /> {/* Footer immer anzeigen */}
      </UserProvider>
    </Router>
  );
}

export default App;