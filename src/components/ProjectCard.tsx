import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '@/context/ContentContext';

const ProjectCard = ({ image, title, category, description, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const { content } = useContent();
  const { imageAspect, imageFit, imagePosition } = content.portfolio;

  // Convert aspect ratio string (e.g., "4/5") to a valid Tailwind class or inline style
  const aspectRatioStyle = imageAspect ? { aspectRatio: imageAspect } : { aspectRatio: '4/5' };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="cursor-pointer group relative overflow-hidden rounded-2xl bg-zinc-900 isolate ring-1 ring-white/10"
    >
      <div className="overflow-hidden w-full" style={aspectRatioStyle}>
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          decoding="async"
          style={{ 
            objectFit: imageFit as any || 'cover',
            objectPosition: imagePosition || 'center'
          }}
          className="w-full h-full transition-transform duration-700 group-hover:scale-110" 
          referrerPolicy="no-referrer" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 transition-transform duration-300 group-hover:translate-y-0 pointer-events-none">
        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{category}</p>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
