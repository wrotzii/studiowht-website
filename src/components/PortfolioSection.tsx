import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { Button } from '@/components/ui/button';
import { useContent } from '@/context/ContentContext';

const PortfolioSection = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const { content, isEditing, setActiveEditSection, setActiveEditItem } = useContent();
  const { title, subtitle, description, projects } = content.portfolio;

  return (
    <section id="portfolio" className="py-24 relative group">
      {isEditing && (
        <div className="absolute top-6 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={() => setActiveEditSection('portfolio')} variant="secondary" size="sm" className="shadow-lg">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Portfolio Settings
          </Button>
        </div>
      )}
      <div className="container mx-auto px-6">
        <div className="mb-16">
          {subtitle && <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">{subtitle}</p>}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-gray-400 max-w-2xl text-lg">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any, index: number) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative group/card">
              {isEditing && (
                <div className="absolute top-4 right-4 z-50 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveEditSection('project'); 
                      setActiveEditItem(index); 
                    }} 
                    variant="secondary" 
                    size="sm"
                    className="shadow-lg"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Project
                  </Button>
                </div>
              )}
              <ProjectCard {...project} onClick={() => !isEditing && setSelectedProject(project as any)} />
            </motion.div>
          ))}
        </div>
      </div>
      <ProjectModal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} project={selectedProject} />
    </section>
  );
};

export default PortfolioSection;
