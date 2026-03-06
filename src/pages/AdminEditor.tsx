import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useContent } from '@/context/ContentContext';
import HomePage from './HomePage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditorModals from '@/components/EditorModals';

const AdminEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content, setIsEditing } = useContent();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
    }
    setIsEditing(true);
    return () => setIsEditing(false);
  }, [navigate, setIsEditing]);

  const handleSave = () => {
    const prompt = `I have updated the website content. Please update /src/data/content.json with the following JSON:\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
    
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

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Helmet>
        <title>Live Editor - STUDIOWHT</title>
      </Helmet>

      {/* Top Admin Bar */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 z-[100] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Live Editor</h1>
            <p className="text-gray-400 text-xs">Hover over sections to edit</p>
          </div>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <Save className="w-4 h-4" />
          Confirm & Save Changes
        </Button>
      </div>

      {/* The actual website replica */}
      <div className="pt-[72px]">
        <Header />
        <HomePage />
        <Footer />
      </div>

      <EditorModals />
    </div>
  );
};

export default AdminEditor;
