import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContent } from '@/context/ContentContext';

const AdminQRRedirect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content, setContent } = useContent();

  const [currentUrl, setCurrentUrl] = useState('');
  const [presets, setPresets] = useState<{ name: string; url: string }[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetUrl, setNewPresetUrl] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    if (content?.qrRedirect) {
      setCurrentUrl(content.qrRedirect.currentUrl || '');
      setPresets(content.qrRedirect.presets || []);
    }
  }, [content]);

  const handleSave = () => {
    const updatedContent = {
      ...content,
      qrRedirect: {
        currentUrl,
        presets
      }
    };
    
    setContent(updatedContent);

    const prompt = `I have updated the website content. Please update /src/data/content.json with the following JSON:\n\n\`\`\`json\n${JSON.stringify(updatedContent, null, 2)}\n\`\`\``;
    
    navigator.clipboard.writeText(prompt).then(() => {
      toast({
        title: "Command Copied!",
        description: "Paste the copied command into the AI chat to save your changes.",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the command to clipboard.",
        variant: "destructive"
      });
    });
  };

  const handleAddPreset = () => {
    if (!newPresetName || !newPresetUrl) {
      toast({
        title: "Missing fields",
        description: "Please provide both a name and a URL for the preset.",
        variant: "destructive"
      });
      return;
    }

    setPresets([...presets, { name: newPresetName, url: newPresetUrl }]);
    setNewPresetName('');
    setNewPresetUrl('');
  };

  const handleDeletePreset = (index: number) => {
    const newPresets = [...presets];
    newPresets.splice(index, 1);
    setPresets(newPresets);
  };

  const handleSelectPreset = (url: string) => {
    setCurrentUrl(url);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <Helmet>
        <title>QR Redirect Manager - STUDIOWHT</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">QR Redirect Manager</h1>
              <p className="text-gray-400 mt-1">Control where your /qr link points to</p>
            </div>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Redirect Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              Current Redirect
            </h2>
            
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Label className="text-blue-400 mb-2 block">Currently redirecting to:</Label>
              <div className="text-lg font-mono break-all">{currentUrl || 'Not set'}</div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentUrl">Update Redirect URL</Label>
                <Input 
                  id="currentUrl"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-black border-white/20 text-white mt-1"
                />
              </div>
              <p className="text-sm text-gray-400">
                Enter a custom URL above, or select one from your presets below.
              </p>
            </div>
          </div>

          {/* Presets Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Saved Presets</h2>
            
            <div className="space-y-4 mb-8">
              {presets.length === 0 ? (
                <p className="text-gray-400 italic">No presets saved yet.</p>
              ) : (
                presets.map((preset, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black border border-white/10 rounded-lg group">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="font-medium truncate">{preset.name}</div>
                      <div className="text-sm text-gray-400 truncate">{preset.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleSelectPreset(preset.url)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use
                      </Button>
                      <button 
                        onClick={() => handleDeletePreset(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium mb-4">Add New Preset</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="presetName">Preset Name</Label>
                  <Input 
                    id="presetName"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g. Latest Video"
                    className="bg-black border-white/20 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="presetUrl">URL</Label>
                  <Input 
                    id="presetUrl"
                    value={newPresetUrl}
                    onChange={(e) => setNewPresetUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-black border-white/20 text-white mt-1"
                  />
                </div>
                <Button onClick={handleAddPreset} className="w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Preset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQRRedirect;
