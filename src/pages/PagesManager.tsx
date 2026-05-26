import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Plus, Search, Edit2, Trash2, Home, Copy, Settings,
  CheckCircle2, XCircle, LayoutTemplate
} from 'lucide-react';

interface Page {
  id: string;
  slug: string;
  title: string;
  status: string;
  is_home: number;
  created_at: string;
  updated_at: string;
  is_special?: boolean;
}

export const PagesManager = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      if (res.ok) {
        setPages(await res.json());
      }
    } catch(err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSlug) return;
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, slug: newSlug.startsWith('/') ? newSlug : `/${newSlug}` })
      });
      if (res.ok) {
        setIsCreating(false);
        setNewTitle('');
        setNewSlug('');
        fetchPages();
        toast({ title: 'Success', description: 'Page created successfully.' });
      } else {
         const err = await res.json();
         toast({ title: 'Error', description: err.error || 'Failed to create page.', variant: 'destructive' });
      }
    } catch(err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPages();
        toast({ title: 'Success', description: 'Page deleted.' });
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.error || 'Failed to delete.', variant: 'destructive' });
      }
    } catch(err) {}
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pages/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        fetchPages();
        toast({ title: 'Success', description: 'Page duplicated.' });
      }
    } catch(err) {}
  };

  const handleSetHome = async (id: string) => {
    try {
       const res = await fetch(`/api/admin/pages/${id}/set-home`, { method: 'POST' });
       if (res.ok) {
         fetchPages();
         toast({ title: 'Success', description: 'Homepage updated.' });
       }
    } catch(err) {}
  };

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Pages</h1>
            <p className="text-zinc-400">Manage pages, SEO, and visibility.</p>
          </div>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            <Plus className="w-4 h-4 mr-2" /> New Page
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-zinc-900/40 border border-white/10 p-6 rounded-2xl mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Create New Page</h2>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Page Title</Label>
              <Input value={newTitle} onChange={e => {
                setNewTitle(e.target.value);
                if(!newSlug || newSlug === '/' + newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, -1)) {
                   setNewSlug('/' + e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }
              }} className="bg-black/50 border-white/10" placeholder="e.g. About Us" />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">URL Slug</Label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. /about" />
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-white text-black hover:bg-neutral-200">Create</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 py-2">
          <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
          <Input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 px-0 h-10 text-white placeholder:text-zinc-600"
            placeholder="Search pages..."
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading pages...</div>
        ) : filteredPages.length === 0 ? (
          <div className="py-12 text-center border text-zinc-500 border-white/5 rounded-2xl bg-white/5 border-dashed">
            No pages found.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPages.map(page => (
              <div key={page.id} className="bg-zinc-900/40 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {page.is_home === 1 ? (
                      <Home className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg flex items-center gap-2">
                      {page.title}
                      {page.status === 'published' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] uppercase font-bold tracking-wider">Draft</span>
                      )}
                    </h3>
                    <div className="text-sm text-zinc-500 mt-1">{page.slug}</div>
                    <div className="text-xs text-zinc-600 mt-2">
                      Updated {new Date(page.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                  {page.is_home !== 1 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-zinc-400 hover:text-white"
                      onClick={() => handleSetHome(page.id)}
                      title="Set as Homepage"
                    >
                      <Home className="w-4 h-4 mr-2" /> Set Home
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-zinc-400 hover:text-white"
                    onClick={() => handleDuplicate(page.id)}
                    title="Duplicate Page"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => navigate(`/whtadmin/site-editor/${page.id}`)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  {page.is_home !== 1 && page.id !== 'home' && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
