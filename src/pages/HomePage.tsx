import React from 'react';
import { Logo } from '@/components/Navigation';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PortfolioSection, AboutSection, ContactSection } from '@/components/Sections';
import { useContent } from '@/context/ContentContext';
import { MediaEmbed } from '@/components/ui/MediaEmbed';

const HomePage = () => {
  const { content, seo, settings } = useContent();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const layout = content.layout || ['portfolio', 'about', 'contact'];

  const renderSection = (id: string) => {
    switch(id) {
      case 'portfolio': return <PortfolioSection key={id} />;
      case 'about': return <AboutSection key={id} />;
      case 'contact': return <ContactSection key={id} />;
      default: return null;
    }
  };

  const pageTitle = seo?.title || `STUDIOWHT - ${content.hero.subtitle}`;
  const fullTitle = settings?.siteName ? `${pageTitle} | ${settings.siteName}` : pageTitle;

  return (
    <div className={`bg-background text-foreground selection:bg-primary selection:text-primary-foreground ${settings?.theme === 'light' ? 'light' : 'dark'}`}>
      <Helmet>
        <title>{fullTitle}</title>
        {seo?.description && <meta name="description" content={seo.description} />}
        {seo?.image && <meta property="og:image" content={seo.image} />}
      </Helmet>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden group">
        
        {/* Background Video with Overlay */}
        <div className="absolute inset-0 z-0 bg-background pointer-events-none">
          <MediaEmbed 
            url={content.hero.videoUrl} 
            className="w-[150vw] h-[150vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-50 mix-blend-luminosity"
            autoPlay 
            loop 
            muted 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 w-full max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12"
          >
            <Logo 
              width={content.hero.logoWidth || '400px'}
              className="mx-auto"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl tracking-[0.3em] uppercase font-light text-foreground/80"
          >
            {content.hero.subtitle}
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        {layout.length > 0 && (
          <motion.button
            onClick={() => scrollToSection(layout[0])}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-foreground/50 hover:text-foreground transition-all duration-500 flex flex-col items-center gap-4 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-medium">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </section>

      {layout.map(renderSection)}
    </div>
  );
};

export default HomePage;
