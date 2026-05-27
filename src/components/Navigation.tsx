import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Instagram, Youtube } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

// --- Shared Logo Component ---
export const Logo = ({ className = '', style = {}, width, logoOverride }: { className?: string, style?: React.CSSProperties, width?: string | number, logoOverride?: string }) => {
  const [error, setError] = useState(false);
  const { settings, content } = useContent();
  
  // Use settings or default to /logo.png, but allow override (for mobile)
  // If settings object exists and is loaded, and logoUrl is strictly an empty string, it means they cleared it.
  const isLogoCleared = settings && typeof settings.logoUrl === 'string' && settings.logoUrl.trim() === '';
  const defaultSrc = isLogoCleared ? '' : (settings?.logoUrl ? settings.logoUrl : '/logo.png');
  const src = logoOverride || defaultSrc;

  // Reset error state if the image source changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const formattedWidth = width ? (isNaN(Number(width)) ? width : `${width}px`) : undefined;

  // Render text logo if error or if explicitly no logo image set
  const showTextLogo = error || !src;

  return (
    <div 
      className={`flex items-center justify-center max-w-full ${className}`} 
      style={{ 
        ...style, 
        maxWidth: '100%',
        ...(formattedWidth ? { width: formattedWidth } : {})
      }}
    >
      {!showTextLogo ? (
        <img 
          src={src} 
          alt="STUDIOWHT" 
          className="max-w-full max-h-full object-contain block"
          style={{
            width: formattedWidth ? '100%' : 'auto',
            height: formattedWidth ? 'auto' : '100%',
            maxHeight: '100%'
          }}
          onError={() => setError(true)}
          loading="eager"
        />
      ) : (
        <span className="font-black tracking-tighter text-xl md:text-2xl uppercase whitespace-nowrap text-foreground truncate">
          {settings?.siteName ? settings.siteName : <>Studio<span className="text-muted-foreground">WHT</span></>}
        </span>
      )}
    </div>
  );
};

// --- Header Component ---
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useContent();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'Works', id: 'portfolio' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' }
  ];

  const stickyEnabled = settings?.stickyHeader ?? true;
  // Hide on desktop if sticky is disabled. Hide on mobile always when scrolled down unless menu is open
  const hideHeaderDesktop = isScrolled && !stickyEnabled;
  const hideHeaderMobile = isScrolled && !isMobileMenuOpen;
  
  const paddingY = settings?.navbarPadding || '1rem';
  const position = settings?.navbarPosition || 'left';
  const logoDesktop = settings?.logoWidth || undefined;
  const logoMobile = settings?.logoMobileWidth || undefined;
  
  const containerClasses = `container mx-auto px-6 border-b border-border flex items-center ${
    position === 'center' ? 'flex-col md:flex-row justify-between' : 
    position === 'right' ? 'flex-row-reverse justify-between' : 
    'justify-between'
  }`;

  const navClasses = `hidden md:flex gap-10 ${
    position === 'center' ? 'mx-auto' :
    position === 'right' ? 'mr-auto ml-0' :
    ''
  }`;

  const desktopClasses = hideHeaderDesktop 
    ? 'md:-translate-y-full md:opacity-0 md:pointer-events-none' 
    : 'md:translate-y-0 md:opacity-100 md:bg-background/50 md:backdrop-blur-lg md:pointer-events-auto';
    
  const mobileClasses = hideHeaderMobile 
    ? '-translate-y-full opacity-0 pointer-events-none' 
    : 'translate-y-0 opacity-100 bg-background/50 backdrop-blur-lg pointer-events-auto';

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 top-0 ${desktopClasses} ${mobileClasses} ${!isScrolled ? 'pt-4' : ''}`} style={{ paddingTop: paddingY }}>
      <div className={containerClasses} style={{ paddingBottom: paddingY }}>
        <button onClick={() => scrollToSection('hero')} className={`hover:opacity-80 transition-opacity ${position === 'center' ? 'md:absolute md:left-6' : ''}`}>
          {/* Mobile Logo */}
          <div className="md:hidden">
             <Logo logoOverride={settings?.logoMobileUrl || undefined} width={logoMobile || 'auto'} className="h-8 max-w-[50vw]" />
          </div>
          {/* Desktop Logo */}
          <div className="hidden md:block">
             <Logo width={logoDesktop || 'auto'} className="h-10 max-w-full" />
          </div>
        </button>

        <nav className={navClasses}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-foreground/60 hover:text-foreground text-[11px] uppercase tracking-[0.3em] font-medium transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <button className="md:hidden text-foreground p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        
        {position === 'center' && <div className="hidden md:block w-32" />}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border py-8 px-6 flex flex-col gap-6">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-left text-foreground/60 hover:text-foreground text-sm uppercase tracking-widest font-medium">
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
  if (!data) return null;

  return (
    <footer className="bg-background text-foreground py-20 px-6 border-t border-border relative group">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Logo className="h-10" width={data.logoWidth || '150px'} />
          <p className="text-foreground/40 text-[10px] uppercase tracking-[0.4em]">{data.name}</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-8">
          <div className="flex gap-8">
            {[
              { icon: Mail, href: `mailto:${data.email}` },
              { icon: Instagram, href: data.instagram },
              { icon: Youtube, href: data.youtube }
            ].map((social, i) => (
              <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground transition-colors">
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <p className="text-foreground/20 text-[10px] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {data.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
