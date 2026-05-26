import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import defaultContent from '@/data/content.json';

const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: any) => {
  const [content, setContent] = useState(defaultContent);
  const [seo, setSeo] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Exclude admin routes from fetching pages
    if (location.pathname.startsWith('/whtadmin')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/content?slug=${encodeURIComponent(location.pathname)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.content) {
          setContent({ ...defaultContent, ...data.content });
          setSeo(data.seo);
        } else if (data && !data.settings) {
          setContent({ ...defaultContent, ...data });
        }
        if (data && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error("Failed to fetch content", err))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  // Apply Global Settings side effects
  useEffect(() => {
    if (settings) {
      if (settings.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.favicon;
      }
      
      if (settings.customCss) {
        let style = document.getElementById('custom-css');
        if (!style) {
          style = document.createElement('style');
          style.id = 'custom-css';
          document.head.appendChild(style);
        }
        style.innerHTML = settings.customCss;
      }

      let generatedStyle = document.getElementById('generated-css');
      if (!generatedStyle) {
        generatedStyle = document.createElement('style');
        generatedStyle.id = 'generated-css';
        document.head.appendChild(generatedStyle);
      }
      
      let cssRules = ':root {\n';
      if (settings.primaryColor) {
        cssRules += `--color-emerald-500: ${settings.primaryColor};\n`; // Override primary
        cssRules += `--color-primary: ${settings.primaryColor};\n`;
      }
      if (settings.fontHeading) {
        cssRules += `--font-heading: '${settings.fontHeading}', sans-serif;\n`;
      }
      if (settings.fontBody) {
        cssRules += `--font-body: '${settings.fontBody}', sans-serif;\n`;
      }
      if (settings.buttonStyle === 'square') {
        cssRules += `--radius: 0px;\n`;
      } else if (settings.buttonStyle === 'pill') {
        cssRules += `--radius: 9999px;\n`;
      } else {
        cssRules += `--radius: 0.5rem;\n`;
      }
      cssRules += '}\n';

      // apply fonts
      if (settings.fontHeading || settings.fontBody) {
        cssRules += `
          h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading) !important; }
          body { font-family: var(--font-body) !important; }
        `;
      }
      generatedStyle.innerHTML = cssRules;
    }
  }, [settings]);

  useEffect(() => {
    // Listen to preview updates from SiteEditor
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_CONTENT' && event.data.content) {
        setContent(event.data.content);
      }
      if (event.data?.type === 'UPDATE_SETTINGS' && event.data.settings) {
        setSettings(event.data.settings);
      }
    };
    window.addEventListener('message', handleMessage);

    // Prevent navigation in iframe to avoid editor content mismatch
    const handleLinkClick = (e: MouseEvent) => {
      if (new URLSearchParams(window.location.search).get('preview') !== '1') return;

      if (window !== window.top) {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.href && !link.href.startsWith('javascript:')) {
          e.preventDefault();
          // Optionally, send a message to parent to navigate the editor
          window.parent.postMessage({ type: 'NAVIGATE', url: link.getAttribute('href') }, '*');
        }
      }
    };
    if (window !== window.top) {
      document.addEventListener('click', handleLinkClick, true);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (window !== window.top) {
        document.removeEventListener('click', handleLinkClick, true);
      }
    };
  }, []);

  const value = useMemo(() => ({ 
    content, setContent, seo, settings, setSettings
  }), [content, seo, settings]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-white justify-center border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
