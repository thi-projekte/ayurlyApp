import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar'; // .jsx ist optional beim Import
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage';
import ProduktePage from './pages/ProduktePage';
import ProdukteDetailPage from './pages/ProdukteDetailPage';
import DoshaTestPage from './pages/DoshaTestPage';
import RezeptePage from './pages/RezeptePage';
import RezepteDetailPage from './pages/RezepteDetailPage';
import YogaPage from './pages/YogaPage';
import YogaDetailPage from './pages/YogaDetailPage';
import LifestylePage from './pages/LifestylePage';
import LoginPage from './pages/LoginPage';
import MyAyurlyPage from './pages/MyAyurlyPage';
import { UserProvider } from './contexts/UserContext';
import ProcessTestComponent from './components/ProcessTestComponent';
import ScrollToTop from './components/UI/ScrollToTop';
import ImpressumPage from './pages/ImpressumPage';
// Admin-Page Imports
import AdminRoute from './components/Navigation/AdminRoute';
import DashboardOverview from './components/Admin/DashboardOverview';
import ProtectedRoute from './components/Navigation/ProtectedRoute';
import AdminPage from './pages/AdminPage'; 
import ManageDoshaTypes from './components/Admin/ManageDoshaTypes'; 
import ManageContentTypes from './components/Admin/ManageContentTypes'; 
import ManageUnits from './components/Admin/ManageUnits'; 
import ManageRecipes from './components/Admin/ManageRecipes';
import ManageMicrohabits from './components/Admin/ManageMicrohabits';
import ManageProducts from './components/Admin/ManageProducts';
import ManageYoga from './components/Admin/ManageYoga';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <UserProvider> {/* UserContext umschließt alles */}
        <Navbar /> {/* Navbar immer anzeigen */}
        <main> {/* main content wird dynamisch über die simulierten Routen geladen */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="test-bpmn" element= {<ProcessTestComponent />} />
            <Route path="/dosha-test" element={<DoshaTestPage />} />
            <Route path="/rezepte" element={<RezeptePage />} />
            <Route path="/rezepte/:rezeptId" element={<RezepteDetailPage />} />
            <Route path="/yoga" element={<YogaPage />} />
            <Route path="/yoga/:yogaId" element={<YogaDetailPage />} />
            <Route path="/produkte" element={<ProduktePage />} />
            <Route path="/produkte/:produktId" element={<ProdukteDetailPage />} />
            <Route path="/lifestyle" element={<LifestylePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/myAyurly" element={<ProtectedRoute />}>
              <Route path="" element={<MyAyurlyPage />} />
            </Route>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminPage />}> {/* Layout-Route */}
                <Route index element={<Navigate to="dashboard" replace />} /> {/* Standard für /admin */}
                <Route path="dashboard" element={<DashboardOverview />} />
                
                {/* Content Management - Hauptseite und Unterrouten */}
                <Route path="content" element={<Outlet/>}> {/* Wrapper für Content-Unterrouten */}
                   <Route index element={<Navigate to="recipes" replace />} /> {/* Standard für /admin/content */}
                   <Route path="recipes" element={<ManageRecipes />} /> 
                   <Route path="microhabits" element={<ManageMicrohabits />} />
                   <Route path="products" element={<ManageProducts />} />
                   <Route path="yoga" element={<ManageYoga />} />
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