import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link, useParams } from 'react-router-dom';
import { MediaSelectorModal } from '@/components/admin/MediaSelectorModal';
import { 
  Save, LayoutTemplate, Monitor, Tablet, Smartphone, 
  ChevronLeft, GripVertical, Eye, EyeOff, Plus, Trash2, 
  Settings, Undo, Redo, LayoutGrid, Type, Image as ImageIcon,
  CheckCircle2, AlertCircle, RefreshCw, History, Globe
} from 'lucide-react';
import defaultContent from '@/data/content.json';
import { VersionHistoryModal } from '@/components/admin/VersionHistoryModal';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state: { hasError: boolean, error: Error | null } = { hasError: false, error: null };
  props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SiteEditor error trapped by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6">
          <div className="w-full max-w-xl p-8 bg-zinc-900/50 border border-white/10 rounded-3xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Something went wrong</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              The Site Editor experienced a rendering exception. This can happen if database values are corrupted, missing section variables, or unexpected.
            </p>
            <div className="p-4 bg-black/50 border border-white/5 rounded-2xl text-left max-h-40 overflow-y-auto font-mono text-xs text-red-400">
              {this.state.error?.message || String(this.state.error)}
              {this.state.error?.stack && <span className="opacity-50 block mt-2 text-[10px]">{this.state.error.stack}</span>}
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()} className="bg-white text-black hover:bg-neutral-200 h-10 px-5">
                Reload Editor
              </Button>
              <Link to="/whtadmin">
                <Button variant="outline" className="border-white/10 text-white h-10 px-5">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const SiteEditor = () => {
  const { id } = useParams();
  const [content, setContent] = useState<any>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [currentMediaCb, setCurrentMediaCb] = useState<((url: string) => void) | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Undo / Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fetchContent = async () => {
    try {
      const [contentRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/pages/${id || 'home'}/draft`),
        fetch(`/api/settings`)
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      if (contentRes.ok) {
        const data = await contentRes.json();
        const dbContent = data.content || {};

        
        // Deeply merge to guarantee every section is safely defined
        const initData = {
          ...defaultContent,
          ...dbContent,
          hero: { ...defaultContent.hero, ...(dbContent.hero || {}) },
          about: { ...defaultContent.about, ...(dbContent.about || {}) },
          portfolio: { ...defaultContent.portfolio, ...(dbContent.portfolio || {}) },
          contact: { ...defaultContent.contact, ...(dbContent.contact || {}) },
          footer: { ...defaultContent.footer, ...(dbContent.footer || {}) },
          layout: Array.isArray(dbContent.layout) ? dbContent.layout : (Array.isArray(data.content?.layout) ? data.content.layout : ['portfolio', 'about', 'contact'])
        };

        setContent(initData);
        setPageInfo(data.pageInfo || {
          id: id || 'home',
          title: id === 'home' || !id ? 'Home' : id.charAt(0).toUpperCase() + id.slice(1),
          slug: id === 'home' || !id ? '/' : `/${id}`,
          status: 'draft',
          is_home: id === 'home' || !id ? 1 : 0
        });
        setHistory([initData]);
        setHistoryIndex(0);
      } else {
        throw new Error('Page not found');
      }
    } catch(err) {
      const initContent = { 
        ...defaultContent, 
        layout: ['portfolio', 'about', 'contact'] 
      };
      setContent(initContent);
      setPageInfo({
        id: id || 'home',
        title: id === 'home' || !id ? 'Home' : id.charAt(0).toUpperCase() + id.slice(1),
        slug: id === 'home' || !id ? '/' : `/${id}`,
        status: 'draft',
        is_home: id === 'home' || !id ? 1 : 0
      });
      setHistory([initContent]);
      setHistoryIndex(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Sync to iframe whenever content changes, and Autosave
  useEffect(() => {
    if (content && iframeRef.current?.contentWindow) {
      const t = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_CONTENT', content }, '*');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [content]);

  useEffect(() => {
    if (settings && iframeRef.current?.contentWindow) {
      const t = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_SETTINGS', settings }, '*');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [settings]);

  // Autosave Draft
  useEffect(() => {
    if (!content || !pageInfo || historyIndex === 0) return; // Skip initial load
    
    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch(`/api/admin/pages/${pageInfo.id}/draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, pageInfo })
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('unsaved');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [content, pageInfo, historyIndex]);

  // Autosave Global Settings
  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) return;
    // Debounce autosave
    setSettingsSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSettingsSaveStatus('saving');
      try {
        await fetch(`/api/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        setSettingsSaveStatus('saved');
      } catch (err) {
        setSettingsSaveStatus('unsaved');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [settings]);

  // Handle undo/redo stack
  const pushToHistory = useCallback((newContent: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 20) newHistory.shift(); // keep last 20
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setContent(newContent);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    const newContent = {
      ...content,
      [section]: {
        ...content[section],
        [field]: value
      }
    };
    pushToHistory(newContent);
  };

  const handlePublish = async () => {
    if (!pageInfo) return;
    setSaving(true);
    try {
      const isNamed = confirm("Do you want to name this version? Cancel skips naming.");
      const name = isNamed ? prompt("Version Name:", `Update ${new Date().toLocaleDateString()}`) : null;
      
      const res = await fetch(`/api/admin/pages/${pageInfo.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, name, pageInfo })
      });
      if (res.ok) {
        toast({ title: 'Published', description: 'Changes are live.', 
          action: (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4"/> Success
            </div>
          )
        });
        setSaveStatus('saved');
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to publish.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to publish.', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading || !content) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>;

  const allSections = ['hero', 'portfolio', 'about', 'contact', 'footer'];
  
  // Helpers for Layout Editor
  const handleLayoutOrder = (direction: 'up' | 'down', index: number) => {
    const newLayout = [...content.layout];
    if (direction === 'up' && index > 0) {
      [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
    } else if (direction === 'down' && index < newLayout.length - 1) {
      [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
    }
    pushToHistory({ ...content, layout: newLayout });
  };

  const handleLayoutToggle = (section: string) => {
    const newLayout = [...content.layout];
    if (newLayout.includes(section)) {
      pushToHistory({ ...content, layout: newLayout.filter(s => s !== section) });
    } else {
      pushToHistory({ ...content, layout: [...newLayout, section] });
    }
  };

  const getPreviewWidth = () => {
    if (deviceMode === 'tablet') return '768px';
    if (deviceMode === 'mobile') return '375px';
    return '100%';
  };

  const handleSelectMedia = (cb: (url: string) => void) => {
    setCurrentMediaCb(() => cb);
    setMediaModalOpen(true);
  };

  // Render properties based on selected section
  const renderProperties = () => {
    switch (selectedSection) {
      case 'seo_settings':
        return (
          <div className="space-y-6 form-animate">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Page Title (System)</Label>
              <Input 
                value={pageInfo.title || ''} 
                onChange={(e) => setPageInfo({...pageInfo, title: e.target.value})} 
                className="bg-black border-white/10" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Slug</Label>
              <Input 
                value={pageInfo.slug || ''} 
                onChange={(e) => setPageInfo({...pageInfo, slug: e.target.value})} 
                disabled={pageInfo.id === 'home' || pageInfo.is_home === 1}
                className="bg-black border-white/10" 
              />
              {(pageInfo.id === 'home' || pageInfo.is_home === 1) && <p className="text-xs text-zinc-500">Homepage slug cannot be changed.</p>}
            </div>
            <div className="w-full h-px bg-white/10 my-4" />
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">SEO Title</Label>
              <Input 
                value={pageInfo.seo_title || ''} 
                onChange={(e) => setPageInfo({...pageInfo, seo_title: e.target.value})} 
                placeholder="Title shown in browser tab"
                className="bg-black border-white/10" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Meta Description</Label>
              <Textarea 
                value={pageInfo.seo_description || ''} 
                onChange={(e) => setPageInfo({...pageInfo, seo_description: e.target.value})} 
                placeholder="Description for search engines"
                className="bg-black border-white/10 min-h-[100px]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">OG Image (Social Share Preview)</Label>
              <div className="flex gap-2 w-full">
                <Input 
                  value={pageInfo.seo_image || ''} 
                  onChange={(e) => setPageInfo({...pageInfo, seo_image: e.target.value})} 
                  placeholder="Image URL" 
                  className="bg-black border-white/10 flex-1" 
                />
                <Button size="icon" variant="outline" className="border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => setPageInfo({...pageInfo, seo_image: url}))}>
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      case 'global_settings':
        return (
          <div className="space-y-6 form-animate pb-12">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Site Favicon</Label>
              <div className="flex gap-2 w-full">
                <Input 
                  value={settings.favicon || ''} 
                  onChange={(e) => setSettings({...settings, favicon: e.target.value})} 
                  placeholder="Favicon URL (.ico or .png)" 
                  className="bg-black border-white/10 flex-1" 
                />
                <Button size="icon" variant="outline" className="border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => setSettings({...settings, favicon: url}))}>
                  {settings.favicon ? <img src={settings.favicon} alt="Favicon" className="w-4 h-4 rounded-sm" /> : <ImageIcon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Global Site Name</Label>
              <Input 
                value={settings.siteName || ''} 
                onChange={(e) => setSettings({...settings, siteName: e.target.value})} 
                placeholder="Name appended to SEO titles"
                className="bg-black border-white/10" 
              />
            </div>
            <div className="w-full h-px bg-white/10 my-4" />
            
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-2">Global UI & Colors</div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Theme Mode</Label>
              <select 
                value={settings.theme || 'dark'} 
                onChange={(e) => setSettings({...settings, theme: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-9 px-3 text-sm"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Primary Color (Hex)</Label>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded border border-white/10 shrink-0" style={{ backgroundColor: settings.primaryColor || '#10b981' }} />
                <Input 
                  value={settings.primaryColor || ''} 
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} 
                  placeholder="#10b981"
                  className="bg-black border-white/10 font-mono" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Button Style</Label>
              <select 
                value={settings.buttonStyle || 'rounded'} 
                onChange={(e) => setSettings({...settings, buttonStyle: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-9 px-3 text-sm"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Heading Font</Label>
              <select 
                value={settings.fontHeading || 'Inter'} 
                onChange={(e) => setSettings({...settings, fontHeading: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-9 px-3 text-sm"
              >
                <option value="Inter">Inter (Sans)</option>
                <option value="Playfair Display">Playfair Display (Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Tech)</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Body Font</Label>
              <select 
                value={settings.fontBody || 'Inter'} 
                onChange={(e) => setSettings({...settings, fontBody: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-9 px-3 text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </select>
            </div>

            <div className="w-full h-px bg-white/10 my-4" />
            
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-2">Integrations & Announcements</div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Announcement Banner HTML</Label>
              <Textarea 
                value={settings.announcementBanner || ''} 
                onChange={(e) => setSettings({...settings, announcementBanner: e.target.value})} 
                placeholder="Displays at the very top of the site"
                className="bg-black border-white/10 min-h-[60px] font-mono text-xs" 
              />
            </div>
            
            <div className="space-y-2 flex items-center justify-between pt-2">
               <Label className="text-zinc-400 text-xs uppercase tracking-wider">Maintenance Mode</Label>
               <input 
                 type="checkbox" 
                 checked={settings.maintenanceMode || false}
                 onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                 className="w-4 h-4 rounded border-white/10 bg-black text-emerald-500 focus:ring-emerald-500"
               />
            </div>

            <div className="w-full h-px bg-white/10 my-4" />
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Custom CSS</Label>
              <Textarea 
                value={settings.customCss || ''} 
                onChange={(e) => setSettings({...settings, customCss: e.target.value})} 
                placeholder="body { ... }"
                className="bg-black border-white/10 min-h-[150px] font-mono text-xs" 
              />
            </div>
            <div className="space-y-2 flex items-center justify-between text-xs text-zinc-500">
               State: {settingsSaveStatus === 'saving' ? 'Saving...' : settingsSaveStatus === 'saved' ? 'Saved' : 'Unsaved'}
            </div>
          </div>
        );
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Video URL (MP4/WebM)</Label>
              <div className="flex gap-2">
                <Input value={content.hero.videoUrl} onChange={(e) => handleChange('hero', 'videoUrl', e.target.value)} className="bg-black border-white/10 flex-1" />
                <Button size="icon" variant="outline" className="border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => handleChange('hero', 'videoUrl', url))}>
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Logo Width (Desktop)</Label>
              <Input value={content.hero.logoWidth || '400px'} onChange={(e) => handleChange('hero', 'logoWidth', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Subtitle Text</Label>
              <Input value={content.hero.subtitle} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} className="bg-black border-white/10" />
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title</Label>
              <Input value={content.portfolio.title} onChange={(e) => handleChange('portfolio', 'title', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Description</Label>
              <Textarea value={content.portfolio.description} onChange={(e) => handleChange('portfolio', 'description', e.target.value)} className="bg-black border-white/10" />
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider">Projects</Label>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                  const newProjects = [...content.portfolio.projects, {
                    id: Date.now(), title: "New Project", category: "Category", image: "", description: "Desc",
                    fullDescription: "", role: "", tools: "", date: "", client: "", projectUrl: ""
                  }];
                  handleChange('portfolio', 'projects', newProjects);
                }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-3">
                {(content.portfolio.projects || []).map((p: any, i: number) => (
                  <div key={p.id} className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <Label className="text-zinc-400 text-[10px] tracking-widest uppercase">Project Details</Label>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => {
                          const newProjects = content.portfolio.projects.filter((x: any) => x.id !== p.id);
                          handleChange('portfolio', 'projects', newProjects);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">Title & Category</Label>
                        <div className="flex gap-2">
                          <Input value={p.title} onChange={(e) => {
                            const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, title: e.target.value } : x);
                            handleChange('portfolio', 'projects', newProjects);
                          }} placeholder="Title" className="bg-black/50 border-white/10 h-8 text-sm flex-1" />
                          <Input value={p.category} onChange={(e) => {
                            const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, category: e.target.value } : x);
                            handleChange('portfolio', 'projects', newProjects);
                          }} placeholder="Category" className="bg-black/50 border-white/10 h-8 text-sm w-1/3" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">Media Image / Video</Label>
                        <div className="flex gap-2 w-full">
                          <Input value={p.image} onChange={(e) => {
                            const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, image: e.target.value } : x);
                            handleChange('portfolio', 'projects', newProjects);
                          }} placeholder="Image URL" className="bg-black/50 border-white/10 h-8 text-sm flex-1" />
                          <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => {
                            const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, image: url } : x);
                            handleChange('portfolio', 'projects', newProjects);
                          })}>
                            <ImageIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">Short Description</Label>
                        <Textarea value={p.description} onChange={(e) => {
                          const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, description: e.target.value } : x);
                          handleChange('portfolio', 'projects', newProjects);
                        }} placeholder="Brief description for the card" className="bg-black/50 border-white/10 text-sm min-h-[60px]" />
                      </div>
                      
                      <div className="pt-2 border-t border-white/10">
                        <Label className="text-xs text-zinc-500 mb-2 block">Modal Details (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input value={p.role} onChange={(e) => {
                              const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, role: e.target.value } : x);
                              handleChange('portfolio', 'projects', newProjects);
                            }} placeholder="Role" className="bg-black/50 border-white/10 h-8 text-xs" />
                            <Input value={p.date} onChange={(e) => {
                              const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, date: e.target.value } : x);
                              handleChange('portfolio', 'projects', newProjects);
                            }} placeholder="Date" className="bg-black/50 border-white/10 h-8 text-xs" />
                            <Input value={p.client} onChange={(e) => {
                              const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, client: e.target.value } : x);
                              handleChange('portfolio', 'projects', newProjects);
                            }} placeholder="Client" className="bg-black/50 border-white/10 h-8 text-xs" />
                            <Input value={p.tools} onChange={(e) => {
                              const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, tools: e.target.value } : x);
                              handleChange('portfolio', 'projects', newProjects);
                            }} placeholder="Tools" className="bg-black/50 border-white/10 h-8 text-xs" />
                        </div>
                        <Textarea value={p.fullDescription} onChange={(e) => {
                          const newProjects = content.portfolio.projects.map((x: any) => x.id === p.id ? { ...x, fullDescription: e.target.value } : x);
                          handleChange('portfolio', 'projects', newProjects);
                        }} placeholder="Full description for modal" className="bg-black/50 border-white/10 text-sm min-h-[80px]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title</Label>
              <Input value={content.about.title} onChange={(e) => handleChange('about', 'title', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Subtitle</Label>
              <Input value={content.about.subtitle} onChange={(e) => handleChange('about', 'subtitle', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Biography (Paragraphs)</Label>
              <Textarea 
                value={Array.isArray(content.about.paragraphs) ? content.about.paragraphs.join('\n\n') : ''} 
                onChange={(e) => handleChange('about', 'paragraphs', e.target.value.split('\n\n'))}
                className="bg-black border-white/10 min-h-[200px]" 
              />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Title</Label>
              <Input value={content.contact.title} onChange={(e) => handleChange('contact', 'title', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Subtitle</Label>
              <Input value={content.contact.subtitle} onChange={(e) => handleChange('contact', 'subtitle', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Email Address</Label>
              <Input value={content.contact.email} onChange={(e) => handleChange('contact', 'email', e.target.value)} className="bg-black border-white/10" />
            </div>
          </div>
        );
      case 'footer':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Copyright Text</Label>
              <Input value={content.footer.copyright} onChange={(e) => handleChange('footer', 'copyright', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Instagram URL</Label>
              <Input value={content.footer.instagram} onChange={(e) => handleChange('footer', 'instagram', e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">YouTube URL</Label>
              <Input value={content.footer.youtube} onChange={(e) => handleChange('footer', 'youtube', e.target.value)} className="bg-black border-white/10" />
            </div>
          </div>
        );
      default:
        return <div className="text-zinc-500 text-sm">Select a section to edit properties.</div>;
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-white font-sans flex flex-col overflow-hidden">
      
      {/* TOP HEADER */}
      <header className="h-14 border-b border-white/10 bg-black flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/whtadmin" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm bg-white/5 px-2 py-1.5 rounded-md">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Visual Editor <span className="opacity-50">/ {pageInfo?.title}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <Button variant="ghost" size="icon" onClick={() => setDeviceMode('desktop')} className={`h-8 w-8 rounded-md ${deviceMode === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
            <Monitor className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeviceMode('tablet')} className={`h-8 w-8 rounded-md ${deviceMode === 'tablet' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
            <Tablet className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeviceMode('mobile')} className={`h-8 w-8 rounded-md ${deviceMode === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            {(saveStatus === 'saving' || settingsSaveStatus === 'saving') && <span className="text-xs text-zinc-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Autosaving...</span>}
            {(saveStatus === 'unsaved' || settingsSaveStatus === 'unsaved') && <span className="text-xs text-amber-500">Unsaved changes</span>}
            {saveStatus === 'saved' && settingsSaveStatus === 'saved' && <span className="text-xs text-zinc-500">All saved</span>}
          </div>

          <div className="flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" disabled={historyIndex <= 0} onClick={undo} className="h-8 w-8 text-zinc-400 hover:text-white">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={historyIndex >= history.length - 1} onClick={redo} className="h-8 w-8 text-zinc-400 hover:text-white">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={() => setRevisionsModalOpen(true)} variant="outline" size="sm" className="border-white/10 bg-transparent text-white h-8 text-xs font-medium">
            Version History
          </Button>

          <Button onClick={handlePublish} disabled={saving} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs font-semibold px-4">
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Navigator */}
        <aside className="w-64 border-r border-white/10 bg-black flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1 flex items-center gap-2">
              <LayoutGrid className="w-3 h-3" /> Navigator
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Always shown sections */}
            <button 
              onClick={() => setSelectedSection('hero')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedSection === 'hero' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 opacity-50" />
                Hero Banner
              </div>
            </button>

            {/* Dynamic Layout Sections */}
            <div className="py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold px-2 mb-2">Page Structure</div>
              {content.layout.map((sec: string, i: number) => (
                <div key={sec} className={`group flex items-center gap-1 rounded-lg transition-colors ${selectedSection === sec ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5'}`}>
                  <div className="flex flex-col gap-0 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleLayoutOrder('up', i)} disabled={i === 0} className="text-zinc-500 hover:text-white disabled:opacity-0"><GripVertical className="w-3 h-3 rotate-90" /></button>
                    <button onClick={() => handleLayoutOrder('down', i)} disabled={i === content.layout.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-0"><GripVertical className="w-3 h-3 rotate-90" /></button>
                  </div>
                  <button onClick={() => setSelectedSection(sec)} className="flex-1 flex items-center gap-2 p-2 text-sm capitalize">
                    {sec === 'portfolio' ? <ImageIcon className="w-4 h-4 opacity-50" /> : <Type className="w-4 h-4 opacity-50" />}
                    {sec}
                  </button>
                  <button onClick={() => handleLayoutToggle(sec)} className="p-2 opacity-50 hover:opacity-100">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {allSections.filter(s => s !== 'hero' && s !== 'footer' && !content.layout.includes(s)).map(sec => (
                <div key={sec} className="group flex items-center gap-1 rounded-lg text-zinc-600 hover:bg-white/5 transition-colors">
                  <div className="w-5" />
                  <button onClick={() => setSelectedSection(sec)} className="flex-1 flex items-center gap-2 p-2 text-sm capitalize">
                    {sec === 'portfolio' ? <ImageIcon className="w-4 h-4 opacity-50" /> : <Type className="w-4 h-4 opacity-50" />}
                    {sec}
                  </button>
                  <button onClick={() => handleLayoutToggle(sec)} className="p-2 opacity-50 hover:opacity-100 hover:text-white">
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedSection('footer')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedSection === 'footer' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 opacity-50" />
                Footer
              </div>
            </button>
            <div className="w-full h-px bg-white/10 my-2" />
            <button 
              onClick={() => setSelectedSection('seo_settings')}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedSection === 'seo_settings' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 opacity-50" />
                Page Settings
              </div>
            </button>
          </div>
        </aside>

        {/* CENTER: Canvas Preview */}
        <main className="flex-1 bg-zinc-900 overflow-y-auto flex justify-center p-4 md:p-8">
          <div 
            className="bg-black rounded-lg overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 transition-all duration-300 relative"
            style={{ width: getPreviewWidth(), minHeight: '100%' }}
          >
            <iframe 
              ref={iframeRef}
              src={`${pageInfo?.slug || '/'}?preview=1`}
              key={pageInfo?.slug || '/'}
              className="w-full h-full border-0 pointer-events-auto"
              title="Live Preview"
              onLoad={() => {
                // Initial sync when iframe loads
                iframeRef.current?.contentWindow?.postMessage({ type: 'UPDATE_CONTENT', content }, '*');
              }}
            />
          </div>
        </main>

        {/* RIGHT SIDEBAR: Inspector */}
        <aside className="w-[320px] border-l border-white/10 bg-black flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-medium text-white capitalize">{selectedSection} Properties</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderProperties()}
          </div>
        </aside>

      </div>
      
      <MediaSelectorModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={(url) => {
          if (currentMediaCb) currentMediaCb(url);
          setMediaModalOpen(false);
        }}
      />
      
      <VersionHistoryModal 
        isOpen={revisionsModalOpen} 
        onClose={() => setRevisionsModalOpen(false)}
        onRestore={(revContent) => {
          setContent(revContent);
          pushToHistory(revContent);
          setRevisionsModalOpen(false);
        }}
      />
    </div>
  );
};

const SiteEditorWithBoundary = () => (
  <ErrorBoundary>
    <SiteEditor />
  </ErrorBoundary>
);

export default SiteEditorWithBoundary;
