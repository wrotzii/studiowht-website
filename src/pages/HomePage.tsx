import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, Edit2 } from 'lucide-react';
import PortfolioSection from '@/components/PortfolioSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import { Button } from '@/components/ui/button';
import { useContent } from '@/context/ContentContext';

const HomePage = () => {
  const { content, isEditing, setActiveEditSection } = useContent();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>STUDIOWHT - {content.hero.subtitle}</title>
      </Helmet>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden group">
        {isEditing && (
          <div className="absolute top-24 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={() => setActiveEditSection('hero')} variant="secondary" size="sm" className="shadow-lg">
              <Edit2 className="w-4 h-4 mr-2" /> Edit Hero & Logo
            </Button>
          </div>
        )}
        {/* Background Video/Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src={content.hero.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <img 
              src="/white_no_box_cropped.png" 
              alt="STUDIOWHT Logo" 
              style={{ 
                width: content.hero.logoWidth ? (isNaN(Number(content.hero.logoWidth)) ? content.hero.logoWidth : `${content.hero.logoWidth}px`) : undefined,
                height: content.hero.logoHeight ? (isNaN(Number(content.hero.logoHeight)) ? content.hero.logoHeight : `${content.hero.logoHeight}px`) : undefined,
                objectFit: content.hero.logoFit as any,
                objectPosition: content.hero.logoPosition
              }}
              className="max-w-full"
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={() => scrollToSection('portfolio')}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-all duration-300 flex flex-col items-center gap-2 z-10 hover:scale-110"
          aria-label="Scroll to portfolio"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </section>

      <PortfolioSection />
      <AboutSection />
      <ContactSection />
    </>
  );
};

export default HomePage;
