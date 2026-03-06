import React, { useCallback, useState } from 'react';
import { Logo } from '@/components/Navigation';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PortfolioSection, AboutSection, ContactSection } from '@/components/Sections';
import { useContent } from '@/context/ContentContext';

const HomePage = () => {
  const { content } = useContent();
  const [videoError, setVideoError] = useState(false);
  
  // Validate content structure
  if (!content?.hero || !content?.portfolio || !content?.about || !content?.contact) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Error loading page content</div>;
  }
  
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black">
      <Helmet>
        <title>STUDIOWHT - {content.hero.subtitle}</title>
      </Helmet>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden group">
        
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0">
          {!videoError && (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover opacity-50"
              poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80"
              onError={() => setVideoError(true)}
            >
              <source src={content.hero.videoUrl} type="video/mp4" />
            </video>
          )}
          {videoError && (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12"
          >
            <Logo 
              style={{ 
                width: content.hero.logoWidth ? (isNaN(Number(content.hero.logoWidth)) ? content.hero.logoWidth : `${content.hero.logoWidth}px`) : '400px',
                height: 'auto',
                objectFit: 'contain'
              }}
              className="mx-auto"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/60 tracking-[0.3em] uppercase font-light"
          >
            {content.hero.subtitle}
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={() => scrollToSection('portfolio')}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 hover:text-white transition-all duration-500 flex flex-col items-center gap-4 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] uppercase tracking-[0.5em] font-medium">Explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      <PortfolioSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
};

export default HomePage;
