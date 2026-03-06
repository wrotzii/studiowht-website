import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Phone, Instagram, Youtube } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import logoAsset from '@/assets/logo.png';

// Navigation items constant to prevent re-renders
const NAV_ITEMS = [
  { label: 'Home', id: 'hero' },
  { label: 'Works', id: 'portfolio' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' }
];

// --- Shared Logo Component ---
export const Logo = React.memo(({ className = '', style = {} }: any) => {
  const [error, setError] = useState(false);
  const src = typeof logoAsset === 'string' ? logoAsset : (logoAsset as any)?.default || logoAsset;

  return (
    <div className={`flex items-center ${className}`} style={style}>
      {!error ? (
        <img 
          src={src} 
          alt="STUDIOWHT" 
          className="max-h-full w-auto object-contain block"
          onError={() => setError(true)}
          loading="eager"
        />
      ) : (
        <span className="font-black tracking-tighter text-xl md:text-2xl uppercase whitespace-nowrap text-white">
          Studio<span className="text-neutral-500">WHT</span>
        </span>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';

// --- Header Component ---
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el && typeof el.offsetTop === 'number') {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 top-0 ${isScrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <button onClick={() => scrollToSection('hero')} className="hover:opacity-80 transition-opacity">
          <Logo className="h-8 md:h-10" />
        </button>

        <nav className="hidden md:flex gap-10">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-white/60 hover:text-white text-[11px] uppercase tracking-[0.3em] font-medium transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 py-8 px-6 flex flex-col gap-6">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-left text-white/60 hover:text-white text-sm uppercase tracking-widest font-medium">
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// --- Footer Component ---
export const Footer = () => {
  const { content } = useContent();
  const data = content?.footer;
  if (!data || !data.email || !data.phone) return null;

  return (
    <footer className="bg-black text-white py-20 px-6 border-t border-white/5 relative group">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Logo className="h-10" style={{ width: data.logoWidth ? `${data.logoWidth}px` : '150px' }} />
          <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">{data.name || 'STUDIOWHT'}</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-8">
          <div className="flex gap-8">
            {[
              { icon: Mail, href: `mailto:${data.email}` },
              { icon: Phone, href: `tel:${data.phone}` },
              data.instagram ? { icon: Instagram, href: data.instagram } : null,
              data.youtube ? { icon: Youtube, href: data.youtube } : null
            ].filter(Boolean).map((social: any, i) => {
              const Icon = social?.icon;
              return (
                <a key={i} href={social?.href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                  {Icon && <Icon className="w-5 h-5" />}
                </a>
              );
            })}
          </div>
          <p className="text-white/20 text-[10px] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {data.copyright || 'All rights reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
};
