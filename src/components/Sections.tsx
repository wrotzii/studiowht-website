import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, User, Briefcase, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/context/ContentContext';
import { MediaEmbed } from '@/components/ui/MediaEmbed';

// --- Portfolio Section Components ---

const ProjectCard = ({ image, title, category, description, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    onClick={onClick}
    className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer"
  >
    <div className="absolute inset-0 pointer-events-none">
      <MediaEmbed url={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" autoPlay loop muted />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
      <p className="text-sm uppercase tracking-widest text-white/60 mb-2">{category}</p>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{description}</p>
    </div>
  </motion.div>
);

const ProjectModal = ({ isOpen, onClose, project }: any) => {
  if (!project) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-950 rounded-3xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[4/5] lg:aspect-auto h-full min-h-[400px]">
                <MediaEmbed url={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted />
              </div>
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs uppercase tracking-widest mb-4 border border-white/10">{project.category}</span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h2>
                  <p className="text-xl text-white/70 leading-relaxed mb-8">{project.fullDescription || project.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/40"><User className="w-4 h-4" /><span className="text-sm uppercase tracking-widest">Role</span></div>
                    <p className="text-white font-medium">{project.role}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/40"><Calendar className="w-4 h-4" /><span className="text-sm uppercase tracking-widest">Date</span></div>
                    <p className="text-white font-medium">{project.date}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/40"><Briefcase className="w-4 h-4" /><span className="text-sm uppercase tracking-widest">Client</span></div>
                    <p className="text-white font-medium">{project.client}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/40"><Wrench className="w-4 h-4" /><span className="text-sm uppercase tracking-widest">Tools</span></div>
                    <p className="text-white font-medium">{project.tools}</p>
                  </div>
                </div>
                {project.projectUrl && (
                  <Button asChild className="w-full md:w-auto h-14 px-8 rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300 group">
                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      View Project <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PortfolioSection = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const { content } = useContent();
  const { title, subtitle, description, projects } = content.portfolio;

  return (
    <section id="portfolio" className="py-24 relative group">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          {subtitle && <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">{subtitle}</p>}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-gray-400 max-w-2xl text-lg">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(projects || []).map((project: any, index: number) => (
            <div key={project.id} className="relative group/card">
              <ProjectCard {...project} onClick={() => setSelectedProject(project)} />
            </div>
          ))}
        </div>
      </div>
      <ProjectModal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} project={selectedProject} />
    </section>
  );
};

// --- About Section ---

export const AboutSection = () => {
  const { content } = useContent();
  const { title, subtitle, paragraphs, skills } = content.about;

  return (
    <section id="about" className="py-24 bg-secondary/20 relative group">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">{subtitle}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">{title}</h2>
          <div className="text-lg text-foreground/80 space-y-6 max-w-3xl">
            {(paragraphs || []).map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(skills || []).map((skill: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-card border border-border/30 transition-all duration-300 hover:bg-secondary hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-3">{skill.title}</h3>
              <p className="text-muted-foreground">{skill.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Contact Section ---

export const ContactSection = () => {
  const { toast } = useToast();
  const { content } = useContent();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { title, subtitle, description, email } = content.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast({ title: 'Message Sent!', description: "I'll get back to you soon." });
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to send message.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Network error. Please try again later.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-32 relative group">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">{subtitle}</p>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">{title}</h2>
            <p className="text-lg text-gray-400 mb-12 max-w-md leading-relaxed">{description}</p>
            
            <div className="pt-8 border-t border-white/10 mt-auto">
              <span className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Direct Email</span>
              <a href={`mailto:${email}`} className="text-xl md:text-2xl font-medium text-white hover:text-white/70 transition-colors">
                {email}
              </a>
            </div>
          </div>

          <div className="bg-zinc-900/30 p-8 md:p-10 rounded-3xl border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest text-gray-500">Name *</Label>
                <Input 
                  value={formData.name} 
                  required
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="bg-transparent border-t-0 border-x-0 border-b border-white/10 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-white text-lg transition-colors placeholder:text-neutral-700" 
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest text-gray-500">Email *</Label>
                <Input 
                  value={formData.email} 
                  type="email"
                  required
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="bg-transparent border-t-0 border-x-0 border-b border-white/10 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-white text-lg transition-colors placeholder:text-neutral-700" 
                  placeholder="hello@example.com"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest text-gray-500">Message *</Label>
                <Textarea 
                  value={formData.message} 
                  required
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  className="bg-transparent border-t-0 border-x-0 border-b border-white/10 rounded-none px-0 min-h-[120px] focus-visible:ring-0 focus-visible:border-white text-lg transition-colors resize-none placeholder:text-neutral-700" 
                  placeholder="Tell me about your project"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 text-sm tracking-widest uppercase font-semibold mt-4 transition-all">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
