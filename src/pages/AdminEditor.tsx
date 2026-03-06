import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Save, ArrowLeft, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useContent } from '@/context/ContentContext';
import HomePage from './HomePage';
import { Header, Footer } from '@/components/Navigation';

// --- Consolidated Editor Sidebar ---
const EditorSidebar = () => {
  const { content, setContent, activeEditSection, setActiveEditSection, activeEditItem, setActiveEditItem } = useContent();

  if (!activeEditSection) return null;

  const close = () => {
    setActiveEditSection(null);
    setActiveEditItem(null);
  };

  const updateHero = (key: string, val: string) => {
    setContent({ ...content, hero: { ...content.hero, [key]: val } });
  };

  return (
    <div className="fixed top-[72px] right-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 z-[110] overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 p-5 flex justify-between items-center z-10">
        <h2 className="text-sm font-bold uppercase tracking-widest">Edit {activeEditSection}</h2>
        <button onClick={close} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="p-6 space-y-8 flex-1">
        {activeEditSection === 'hero' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Video URL</Label>
              <Input value={content.hero.videoUrl} onChange={(e) => updateHero('videoUrl', e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Subtitle</Label>
              <Input value={content.hero.subtitle} onChange={(e) => updateHero('subtitle', e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Logo Width (px)</Label>
              <Input value={content.hero.logoWidth} onChange={(e) => updateHero('logoWidth', e.target.value)} className="bg-white/5 border-white/10" />
            </div>
          </div>
        )}

        {activeEditSection === 'portfolio' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Title</Label>
              <Input value={content.portfolio.title} onChange={(e) => setContent({...content, portfolio: {...content.portfolio, title: e.target.value}})} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Description</Label>
              <Textarea value={content.portfolio.description} onChange={(e) => setContent({...content, portfolio: {...content.portfolio, description: e.target.value}})} className="bg-white/5 border-white/10 min-h-[100px]" />
            </div>
            <Button 
              onClick={() => {
                const newProject = { id: Date.now(), image: "", title: "New Project", category: "Commercial", description: "", fullDescription: "", role: "", tools: "", date: "", client: "", projectUrl: "" };
                setContent({ ...content, portfolio: { ...content.portfolio, projects: [...content.portfolio.projects, newProject] } });
              }}
              variant="outline" className="w-full border-white/10 hover:bg-white/5 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </div>
        )}

        {activeEditSection === 'project' && activeEditItem !== null && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest">Project Details</h3>
              <Button variant="destructive" size="sm" onClick={() => {
                const newProjects = [...content.portfolio.projects];
                newProjects.splice(activeEditItem, 1);
                setContent({ ...content, portfolio: { ...content.portfolio, projects: newProjects } });
                close();
              }}><Trash2 className="w-4 h-4" /></Button>
            </div>
            {['title', 'category', 'image', 'role', 'date', 'client'].map(field => (
              <div className="space-y-2" key={field}>
                <Label className="text-[10px] uppercase tracking-widest text-white/40">{field}</Label>
                <Input 
                  value={content.portfolio.projects[activeEditItem][field] || ''}
                  onChange={(e) => {
                    const newProjects = [...content.portfolio.projects];
                    newProjects[activeEditItem][field] = e.target.value;
                    setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                  }}
                  className="bg-white/5 border-white/10"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Full Description</Label>
              <Textarea 
                value={content.portfolio.projects[activeEditItem].fullDescription || ''}
                onChange={(e) => {
                  const newProjects = [...content.portfolio.projects];
                  newProjects[activeEditItem].fullDescription = e.target.value;
                  setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                }}
                className="bg-white/5 border-white/10 min-h-[120px]"
              />
            </div>
          </div>
        )}

        {activeEditSection === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Title</Label>
              <Input value={content.about.title} onChange={(e) => setContent({...content, about: {...content.about, title: e.target.value}})} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-white/40">Story</Label>
              <Textarea 
                value={content.about.paragraphs.join('\n\n')}
                onChange={(e) => setContent({...content, about: {...content.about, paragraphs: e.target.value.split('\n\n')}})}
                className="bg-white/5 border-white/10 min-h-[200px]"
              />
            </div>
          </div>
        )}

        {activeEditSection === 'contact' && (
          <div className="space-y-6">
            {['email', 'phone', 'location'].map(field => (
              <div className="space-y-2" key={field}>
                <Label className="text-[10px] uppercase tracking-widest text-white/40">{field}</Label>
                <Input value={content.contact[field]} onChange={(e) => setContent({...content, contact: {...content.contact, [field]: e.target.value}})} className="bg-white/5 border-white/10" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content, setIsEditing } = useContent();

  useEffect(() => {
    if (!localStorage.getItem('isAdminLoggedIn')) navigate('/admin');
    setIsEditing(true);
    return () => setIsEditing(false);
  }, [navigate, setIsEditing]);

  const handleSave = () => {
    const prompt = `Update /src/data/content.json with:\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
    navigator.clipboard.writeText(prompt).then(() => {
      toast({ title: "Copied!", description: "Paste this into the AI chat to save." });
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet><title>Editor - STUDIOWHT</title></Helmet>

      <div className="fixed top-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 z-[100] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-sm font-bold uppercase tracking-widest">Live Editor</h1><p className="text-[10px] text-white/40 uppercase tracking-widest">Click sections to edit</p></div>
        </div>
        <Button onClick={handleSave} className="bg-white text-black hover:bg-white/90 gap-2 px-6 rounded-xl">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="pt-[72px]">
        <Header />
        <HomePage />
        <Footer />
      </div>

      <EditorSidebar />
    </div>
  );
};

export default AdminEditor;
