import React, { Suspense, lazy, useLayoutEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { Header, Footer } from '@/components/Navigation';
import { ContentProvider, useContent } from '@/context/ContentContext';
import { Lock } from 'lucide-react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageTracker = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!pathname.startsWith('/whtadmin')) {
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname })
      }).catch(() => {});
    }
  }, [pathname]);
  return null;
};

// Applies global wrappers (Maintenance, Announcement)
const AppContent = () => {
  const { settings } = useContent();

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Lock className="w-12 h-12 text-zinc-500" />
        <h1 className="text-3xl font-bold tracking-tight">Under Maintenance</h1>
        <p className="text-zinc-500 max-w-md">We are currently updating our website. Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className={settings?.theme === 'light' ? 'light' : 'dark'}>
      <PageTracker />
      {settings?.announcementBanner && (
         <div 
           className="w-full bg-emerald-600 text-white text-center py-2 px-4 text-sm font-medium z-50 relative"
           dangerouslySetInnerHTML={{ __html: settings.announcementBanner }}
         />
      )}
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-foreground justify-center border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
          {/* Catch all for dynamic pages */}
          <Route path="/*" element={<><Header /><HomePage /><Footer /></>} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ContentProvider>
          <Routes>
            <Route path="/whtadmin/*" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
            <Route path="*" element={<AppContent />} />
          </Routes>
          <Toaster />
        </ContentProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
