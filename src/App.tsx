import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContentProvider } from '@/context/ContentContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEditor = lazy(() => import('./pages/AdminEditor'));
const QRRedirectPage = lazy(() => import('./pages/QRRedirectPage'));
const AdminQRRedirect = lazy(() => import('./pages/AdminQRRedirect'));

function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/editor" element={<AdminEditor />} />
              <Route path="/admin/qr-manager" element={<AdminQRRedirect />} />
              <Route path="/admin/qr-redirect" element={<AdminQRRedirect />} />
              <Route path="/qr" element={<QRRedirectPage />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </ContentProvider>
    </HelmetProvider>
  );
}

export default App;
