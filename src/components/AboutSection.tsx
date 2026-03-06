import React from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/context/ContentContext';

const AboutSection = () => {
  const { content, isEditing, setActiveEditSection } = useContent();
  const { title, subtitle, paragraphs, skills } = content.about;

  return (
    <section id="about" className="py-24 bg-zinc-900/30 relative group">
      {isEditing && (
        <div className="absolute top-6 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={() => setActiveEditSection('about')} variant="secondary" size="sm" className="shadow-lg">
            <Edit2 className="w-4 h-4 mr-2" /> Edit About
          </Button>
        </div>
      )}
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16">
          <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">{subtitle}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">{title}</h2>
          <div className="text-lg text-gray-300 space-y-6 max-w-3xl">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="p-6 rounded-2xl bg-black/40 border border-white/5 transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <h3 className="text-xl font-semibold mb-3">{skill.title}</h3>
              <p className="text-gray-400">{skill.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
