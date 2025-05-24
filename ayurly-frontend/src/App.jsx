import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar'; // .jsx ist optional beim Import
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage';
import DoshaTestPage from './pages/DoshaTestPage';
import RezeptePage from './pages/RezeptePage';
import RezepteDetailPage from './pages/RezepteDetailPage';
import LifestylePage from './pages/LifestylePage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import { UserProvider } from './contexts/UserContext';
// Admin-Page Imports
import AdminRoute from './components/Navigation/AdminRoute';
import AdminPage from './pages/AdminPage'; 
import ManageDoshaTypes from './components/Admin/ManageDoshaTypes'; 
import ManageContentTypes from './components/Admin/ManageContentTypes'; 
import ManageUnits from './components/Admin/ManageUnits'; 
import ManageRecipes from './components/Admin/ManageRecipes';

function App() {
  return (
    <Router>
      <UserProvider> {/* UserContext umschließt alles */}
        <Navbar /> {/* Navbar immer anzeigen */}
        <main> {/* main content wird dynamisch über die simulierten Routen geladen */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dosha-test" element={<DoshaTestPage />} />
            <Route path="/rezepte" element={<RezeptePage />} />
            <Route path="/rezepte/:rezeptId" element={<RezepteDetailPage />} />
            <Route path="/lifestyle" element={<LifestylePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminPage />}> {/* Layout-Route */}
                <Route index element={<Navigate to="content/recipes" replace />} /> {/* Standard für /admin */}
                <Route path="dashboard" element={<div>Admin Dashboard (Platzhalter)</div>} />
                
                {/* Content Management - Hauptseite und Unterrouten */}
                <Route path="content" element={<Outlet/>}> {/* Wrapper für Content-Unterrouten */}
                   <Route index element={<Navigate to="recipes" replace />} /> {/* Standard für /admin/content */}
                   <Route path="recipes" element={<ManageRecipes />} /> 
                   {/* Hier kommen später weitere Content-Typen wie z.B. Produkte, Yoga-Übungen */}
                </Route>

                {/* Lookup Tabellen Management - Hauptseite und Unterrouten */}
                <Route path="lookups" element={<Outlet/>}> {/* Nur Outlet für Unterrouten */}
                    <Route index element={<Navigate to="dosha-types" replace />} /> {/* Standard zu Dosha-Typen */}
                    <Route path="dosha-types" element={<ManageDoshaTypes />} />
                    <Route path="content-types" element={<ManageContentTypes />} />
                    <Route path="units" element={<ManageUnits />} />
                </Route>
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