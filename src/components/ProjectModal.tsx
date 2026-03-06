import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

const ProjectModal = ({ isOpen, onClose, project }: any) => {
  const { content } = useContent();
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!project) return null;
  const { imageFit, imagePosition } = content.portfolio;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            onClick={onClose} 
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              aria-label="Close modal"
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Header */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={project.image} 
                alt={project.title} 
                loading="lazy"
                decoding="async"
                style={{ 
                  objectFit: imageFit as any || 'cover',
                  objectPosition: imagePosition || 'center'
                }}
                className="w-full h-full" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent md:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950 hidden md:block" />
            </div>

            {/* Content Body */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <p className="text-primary text-sm font-medium tracking-wider uppercase mb-2">{project.category}</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">{project.title}</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b border-white/10 pb-2">About the Project</h3>
                  <p className="text-gray-400 leading-relaxed">{project.fullDescription || project.description}</p>
                </div>

                {/* Project Details Sidebar */}
                <div className="grid grid-cols-2 gap-6">
                  {project.client && <div><p className="text-sm text-gray-500 mb-1">Client</p><p className="font-medium">{project.client}</p></div>}
                  {project.role && <div><p className="text-sm text-gray-500 mb-1">Role</p><p className="font-medium">{project.role}</p></div>}
                  {project.tools && <div className="col-span-2"><p className="text-sm text-gray-500 mb-1">Tools / Gear</p><p className="font-medium">{project.tools}</p></div>}
                  {project.date && <div><p className="text-sm text-gray-500 mb-1">Date</p><p className="font-medium">{project.date}</p></div>}
                </div>

                {project.projectUrl && (
                  <div className="pt-4">
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        View Project <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
