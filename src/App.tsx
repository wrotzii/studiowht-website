import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import { ContentProvider } from '@/context/ContentContext';

function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/editor" element={<AdminEditor />} />
          </Routes>
          <Toaster />
        </Router>
      </ContentProvider>
    </HelmetProvider>
  );
}

export default App;
