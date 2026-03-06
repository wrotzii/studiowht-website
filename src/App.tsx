import React, { Suspense, lazy, useLayoutEffect, useMemo } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { Header, Footer } from '@/components/Navigation';
import { ContentProvider } from '@/context/ContentContext';

const HomePage = lazy(() => import('./pages/HomePage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ErrorFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
      <p className="text-gray-400 mb-6">Please try refreshing the page</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
        Refresh Page
      </button>
    </div>
  </div>
);

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

function App() {
  const fallback = useMemo(() => <LoadingFallback />, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ContentProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={fallback}>
              <Routes>
                <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
              </Routes>
            </Suspense>
            <Toaster />
          </Router>
        </ContentProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
