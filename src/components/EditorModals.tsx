import React from 'react';
import { useContent } from '@/context/ContentContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const EditorModals = () => {
  const { content, setContent, activeEditSection, setActiveEditSection, activeEditItem, setActiveEditItem } = useContent();

  if (!activeEditSection) return null;

  const close = () => {
    setActiveEditSection(null);
    setActiveEditItem(null);
  };

  return (
    <div className="fixed top-[72px] right-0 bottom-0 w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 z-[110] overflow-y-auto shadow-2xl flex flex-col">
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-10">
        <h2 className="text-lg font-semibold capitalize">Edit {activeEditSection}</h2>
        <button onClick={close} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 space-y-6 flex-1">
        {activeEditSection === 'hero' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Background Video URL</Label>
              <Input 
                value={content.hero.videoUrl}
                onChange={(e) => setContent({...content, hero: {...content.hero, videoUrl: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input 
                value={content.hero.subtitle}
                onChange={(e) => setContent({...content, hero: {...content.hero, subtitle: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="font-medium mb-4">Logo Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input 
                      value={content.hero.logoWidth}
                      onChange={(e) => setContent({...content, hero: {...content.hero, logoWidth: e.target.value}})}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input 
                      value={content.hero.logoHeight}
                      onChange={(e) => setContent({...content, hero: {...content.hero, logoHeight: e.target.value}})}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Object Fit</Label>
                  <select 
                    value={content.hero.logoFit}
                    onChange={(e) => setContent({...content, hero: {...content.hero, logoFit: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Object Position</Label>
                  <select 
                    value={content.hero.logoPosition}
                    onChange={(e) => setContent({...content, hero: {...content.hero, logoPosition: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEditSection === 'portfolio' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={content.portfolio.title}
                onChange={(e) => setContent({...content, portfolio: {...content.portfolio, title: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={content.portfolio.description}
                onChange={(e) => setContent({...content, portfolio: {...content.portfolio, description: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="font-medium mb-4">Image Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <select 
                    value={content.portfolio.imageAspect}
                    onChange={(e) => setContent({...content, portfolio: {...content.portfolio, imageAspect: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="4/5">4:5 (Portrait)</option>
                    <option value="1/1">1:1 (Square)</option>
                    <option value="16/9">16:9 (Landscape)</option>
                    <option value="3/2">3:2 (Classic Photo)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Object Fit</Label>
                  <select 
                    value={content.portfolio.imageFit}
                    onChange={(e) => setContent({...content, portfolio: {...content.portfolio, imageFit: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Object Position</Label>
                  <select 
                    value={content.portfolio.imagePosition}
                    onChange={(e) => setContent({...content, portfolio: {...content.portfolio, imagePosition: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <Button 
                onClick={() => {
                  const newProject = {
                    id: Date.now(), image: "", title: "New Project", category: "", description: "", fullDescription: "", role: "", tools: "", date: "", client: "", projectUrl: ""
                  };
                  setContent({
                    ...content,
                    portfolio: {
                      ...content.portfolio,
                      projects: [...content.portfolio.projects, newProject]
                    }
                  });
                }}
                variant="outline" 
                className="w-full border-white/10 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Project
              </Button>
            </div>
          </div>
        )}

        {activeEditSection === 'project' && activeEditItem !== null && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Edit Project</h3>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  const newProjects = [...content.portfolio.projects];
                  newProjects.splice(activeEditItem, 1);
                  setContent({
                    ...content,
                    portfolio: { ...content.portfolio, projects: newProjects }
                  });
                  close();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
            {['title', 'category', 'image', 'projectUrl'].map(field => (
              <div className="space-y-2" key={field}>
                <Label className="capitalize">{field}</Label>
                <Input 
                  value={content.portfolio.projects[activeEditItem][field] || ''}
                  onChange={(e) => {
                    const newProjects = [...content.portfolio.projects];
                    newProjects[activeEditItem][field] = e.target.value;
                    setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                  }}
                  className="bg-black/50 border-white/10"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea 
                value={content.portfolio.projects[activeEditItem].description || ''}
                onChange={(e) => {
                  const newProjects = [...content.portfolio.projects];
                  newProjects[activeEditItem].description = e.target.value;
                  setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                }}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea 
                value={content.portfolio.projects[activeEditItem].fullDescription || ''}
                onChange={(e) => {
                  const newProjects = [...content.portfolio.projects];
                  newProjects[activeEditItem].fullDescription = e.target.value;
                  setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                }}
                className="bg-black/50 border-white/10 min-h-[100px]"
              />
            </div>
            {['role', 'tools', 'date', 'client'].map(field => (
              <div className="space-y-2" key={field}>
                <Label className="capitalize">{field}</Label>
                <Input 
                  value={content.portfolio.projects[activeEditItem][field] || ''}
                  onChange={(e) => {
                    const newProjects = [...content.portfolio.projects];
                    newProjects[activeEditItem][field] = e.target.value;
                    setContent({...content, portfolio: {...content.portfolio, projects: newProjects}});
                  }}
                  className="bg-black/50 border-white/10"
                />
              </div>
            ))}
          </div>
        )}

        {activeEditSection === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={content.about.title}
                onChange={(e) => setContent({...content, about: {...content.about, title: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input 
                value={content.about.subtitle}
                onChange={(e) => setContent({...content, about: {...content.about, subtitle: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Paragraph 1</Label>
              <Textarea 
                value={content.about.paragraphs[0]}
                onChange={(e) => {
                  const newParagraphs = [...content.about.paragraphs];
                  newParagraphs[0] = e.target.value;
                  setContent({...content, about: {...content.about, paragraphs: newParagraphs}});
                }}
                className="bg-black/50 border-white/10 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Paragraph 2</Label>
              <Textarea 
                value={content.about.paragraphs[1]}
                onChange={(e) => {
                  const newParagraphs = [...content.about.paragraphs];
                  newParagraphs[1] = e.target.value;
                  setContent({...content, about: {...content.about, paragraphs: newParagraphs}});
                }}
                className="bg-black/50 border-white/10 min-h-[100px]"
              />
            </div>
          </div>
        )}

        {activeEditSection === 'contact' && (
          <div className="space-y-6">
            {['title', 'subtitle', 'description', 'email', 'phone', 'location'].map(field => (
              <div className="space-y-2" key={field}>
                <Label className="capitalize">{field}</Label>
                {field === 'description' ? (
                  <Textarea 
                    value={content.contact[field]}
                    onChange={(e) => setContent({...content, contact: {...content.contact, [field]: e.target.value}})}
                    className="bg-black/50 border-white/10"
                  />
                ) : (
                  <Input 
                    value={content.contact[field]}
                    onChange={(e) => setContent({...content, contact: {...content.contact, [field]: e.target.value}})}
                    className="bg-black/50 border-white/10"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {activeEditSection === 'footer' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={content.footer.name}
                onChange={(e) => setContent({...content, footer: {...content.footer, name: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Copyright Text</Label>
              <Input 
                value={content.footer.copyright}
                onChange={(e) => setContent({...content, footer: {...content.footer, copyright: e.target.value}})}
                className="bg-black/50 border-white/10"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="font-medium mb-4">Logo Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input 
                      value={content.footer.logoWidth}
                      onChange={(e) => setContent({...content, footer: {...content.footer, logoWidth: e.target.value}})}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input 
                      value={content.footer.logoHeight}
                      onChange={(e) => setContent({...content, footer: {...content.footer, logoHeight: e.target.value}})}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Object Fit</Label>
                  <select 
                    value={content.footer.logoFit}
                    onChange={(e) => setContent({...content, footer: {...content.footer, logoFit: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                    <option value="fill">Fill</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Object Position</Label>
                  <select 
                    value={content.footer.logoPosition}
                    onChange={(e) => setContent({...content, footer: {...content.footer, logoPosition: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorModals;
