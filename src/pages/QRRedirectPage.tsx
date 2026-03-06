import React, { useEffect } from 'react';
import { useContent } from '@/context/ContentContext';

const QRRedirectPage = () => {
  const { content } = useContent();

  useEffect(() => {
    if (content?.qrRedirect?.currentUrl) {
      window.location.href = content.qrRedirect.currentUrl;
    }
  }, [content]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
};

export default QRRedirectPage;
