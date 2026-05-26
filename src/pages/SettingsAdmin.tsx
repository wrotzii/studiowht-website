import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon } from 'lucide-react';
import { MediaSelectorModal } from '@/components/admin/MediaSelectorModal';

export const SettingsAdmin = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [onSelectCallback, setOnSelectCallback] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data || {}))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) return;
    
    // Broadcast setting changes for live preview
    window.postMessage({ type: 'UPDATE_SETTINGS', settings }, '*');
    
    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('unsaved');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [settings]);

  const handleSelectMedia = (callback: (url: string) => void) => {
    setOnSelectCallback(() => callback);
    setMediaModalOpen(true);
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Site Settings</h1>
          <p className="text-zinc-400">Manage global settings, colors, and configuration.</p>
        </div>
        <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-full text-xs text-zinc-400">
           {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Unsaved changes'}
        </div>
      </div>
      
      <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Site Favicon</Label>
            <div className="flex gap-2 w-full max-w-md">
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
          <div className="space-y-2 max-w-md">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Global Site Name (SEO)</Label>
            <Input 
              value={settings.siteName || ''} 
              onChange={(e) => setSettings({...settings, siteName: e.target.value})} 
              placeholder="Appended to SEO titles"
              className="bg-black border-white/10" 
            />
          </div>
          
          <div className="w-full h-px bg-white/10 my-8" />

          <h2 className="text-xl font-semibold mb-4">Logo & Header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Site Logo (Desktop)</Label>
              <div className="flex gap-2 w-full">
                <Input 
                  value={settings.logoUrl || ''} 
                  onChange={(e) => setSettings({...settings, logoUrl: e.target.value})} 
                  placeholder="Leave empty for text logo" 
                  className="bg-black border-white/10 flex-1" 
                />
                <Button size="icon" variant="outline" className="border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => setSettings({...settings, logoUrl: url}))}>
                  {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="w-4 h-4 object-contain" /> : <ImageIcon className="w-4 h-4" />}
                </Button>
                {settings.logoUrl && (
                  <Button size="icon" variant="destructive" className="shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => setSettings({...settings, logoUrl: ''})}>
                    <span className="sr-only">Clear</span>
                    &times;
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Site Logo (Mobile)</Label>
              <div className="flex gap-2 w-full">
                <Input 
                  value={settings.logoMobileUrl || ''} 
                  onChange={(e) => setSettings({...settings, logoMobileUrl: e.target.value})} 
                  placeholder="Fallback to desktop if empty" 
                  className="bg-black border-white/10 flex-1" 
                />
                <Button size="icon" variant="outline" className="border-white/10 shrink-0" onClick={() => handleSelectMedia((url) => setSettings({...settings, logoMobileUrl: url}))}>
                  {settings.logoMobileUrl ? <img src={settings.logoMobileUrl} alt="Mobile Logo" className="w-4 h-4 object-contain" /> : <ImageIcon className="w-4 h-4" />}
                </Button>
                {settings.logoMobileUrl && (
                  <Button size="icon" variant="destructive" className="shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => setSettings({...settings, logoMobileUrl: ''})}>
                    <span className="sr-only">Clear</span>
                    &times;
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
             <div className="space-y-2">
               <Label className="text-zinc-400 text-xs uppercase tracking-wider">Logo Width (Desktop)</Label>
               <Input 
                 value={settings.logoWidth || ''} 
                 onChange={(e) => setSettings({...settings, logoWidth: e.target.value})} 
                 placeholder="e.g. 150px or auto"
                 className="bg-black border-white/10" 
               />
             </div>
             <div className="space-y-2">
               <Label className="text-zinc-400 text-xs uppercase tracking-wider">Logo Width (Mobile)</Label>
               <Input 
                 value={settings.logoMobileWidth || ''} 
                 onChange={(e) => setSettings({...settings, logoMobileWidth: e.target.value})} 
                 placeholder="e.g. 100px or auto"
                 className="bg-black border-white/10" 
               />
             </div>
             <div className="space-y-2">
               <Label className="text-zinc-400 text-xs uppercase tracking-wider">Navbar Padding Y</Label>
               <Input 
                 value={settings.navbarPadding || ''} 
                 onChange={(e) => setSettings({...settings, navbarPadding: e.target.value})} 
                 placeholder="e.g. 1rem"
                 className="bg-black border-white/10" 
               />
             </div>
             <div className="space-y-2">
               <Label className="text-zinc-400 text-xs uppercase tracking-wider">Navbar Alignment</Label>
               <select 
                 value={settings.navbarPosition || 'left'} 
                 onChange={(e) => setSettings({...settings, navbarPosition: e.target.value})} 
                 className="w-full bg-black border border-white/10 rounded-md h-10 px-3 text-sm text-white"
               >
                 <option value="left">Left Aligned</option>
                 <option value="center">Centered</option>
                 <option value="right">Right Aligned</option>
               </select>
             </div>
          </div>
          
          <div className="space-y-2 flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
             <div>
                <Label className="text-white text-base">Sticky Header</Label>
                <p className="text-zinc-400 text-xs mt-1">If enabled, the header sticks to the top when scrolling.</p>
             </div>
             <input 
               type="checkbox" 
               checked={settings.stickyHeader ?? true} // default true
               onChange={(e) => setSettings({...settings, stickyHeader: e.target.checked})}
               className="w-5 h-5 rounded border-white/10 bg-black text-emerald-500 focus:ring-emerald-500"
             />
          </div>
          
          <div className="w-full h-px bg-white/10 my-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Theme Mode</Label>
              <select 
                value={settings.theme || 'dark'} 
                onChange={(e) => setSettings({...settings, theme: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-10 px-3 text-sm text-white"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Primary Color (Hex)</Label>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 rounded border border-white/10 shrink-0" style={{ backgroundColor: settings.primaryColor || '#10b981' }} />
                <Input 
                  value={settings.primaryColor || ''} 
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} 
                  placeholder="#10b981"
                  className="bg-black border-white/10 font-mono" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Heading Font</Label>
              <select 
                value={settings.fontHeading || 'Inter'} 
                onChange={(e) => setSettings({...settings, fontHeading: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-10 px-3 text-sm text-white"
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
                className="w-full bg-black border border-white/10 rounded-md h-10 px-3 text-sm text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Button Style</Label>
              <select 
                value={settings.buttonStyle || 'rounded'} 
                onChange={(e) => setSettings({...settings, buttonStyle: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-md h-10 px-3 text-sm text-white"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 my-8" />
          
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-6">
            <div className="space-y-2 flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
               <div>
                  <Label className="text-white text-base">Maintenance Mode</Label>
                  <p className="text-zinc-400 text-xs mt-1">If enabled, the public site will show a "Under Maintenance" screen.</p>
               </div>
               <input 
                 type="checkbox" 
                 checked={settings.maintenanceMode || false}
                 onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                 className="w-5 h-5 rounded border-white/10 bg-black text-emerald-500 focus:ring-emerald-500"
               />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Announcement Banner HTML</Label>
              <Textarea 
                value={settings.announcementBanner || ''} 
                onChange={(e) => setSettings({...settings, announcementBanner: e.target.value})} 
                placeholder="Displays at the very top of the site (empty to disable)"
                className="bg-black border-white/10 min-h-[60px] font-mono text-xs" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Custom Global CSS</Label>
              <Textarea 
                value={settings.customCss || ''} 
                onChange={(e) => setSettings({...settings, customCss: e.target.value})} 
                placeholder="body { ... }"
                className="bg-black border-white/10 min-h-[150px] font-mono text-xs" 
              />
            </div>
          </div>
        </div>
      </div>
      <MediaSelectorModal 
        isOpen={mediaModalOpen} 
        onClose={() => setMediaModalOpen(false)} 
        onSelect={(url) => {
          if (onSelectCallback) onSelectCallback(url);
          setMediaModalOpen(false);
        }} 
      />
    </div>
  );
};
