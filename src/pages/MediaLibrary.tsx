import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Video, FileText, Search, Plus, Trash2, Folder, ExternalLink, RefreshCw, Upload } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail: string;
  title: string;
  folder: string;
  tags: string;
  created_at: string;
  size: number;
}

export const MediaLibrary = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const { toast } = useToast();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedia(data);
      } else {
        setMedia([]);
      }
    } catch(err) {
      toast({ title: 'Error', description: 'Failed to fetch media', variant: 'destructive' });
      setMedia([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const safeMedia = Array.isArray(media) ? media : [];
  const folders = ['All', ...Array.from(new Set(safeMedia.map(m => m.folder).filter(Boolean)))];

  const filteredMedia = safeMedia.filter(item => {
    const titleStr = item.title || '';
    const matchesSearch = titleStr.toLowerCase().includes(search.toLowerCase()) || 
                          (item.tags && item.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesFolder = activeFolder === 'All' || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this media?')) return;
    try {
      await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      setMedia(media.filter(m => m.id !== id));
      toast({ title: 'Success', description: 'Media deleted' });
    } catch(err) {
      toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Media Library</h1>
          <p className="text-sm text-zinc-400">Manage your images, videos, and embedded media.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchMedia} className="border-white/10 bg-transparent text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Media
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 space-y-6 shrink-0">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-zinc-900 border-white/10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase font-semibold text-zinc-500 mb-2 px-2">Folders</h3>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${activeFolder === folder ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Folder className="w-4 h-4" />
                  {folder}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1 bg-zinc-900/40 rounded-2xl border border-white/10 p-6 min-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No media found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(item => (
                <div key={item.id} className="group relative bg-black/60 border border-white/10 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  ) : item.type === 'video' ? (
                    <div className="relative w-full h-full flex flex-col justify-center items-center text-zinc-500">
                      {item.thumbnail !== item.url ? <img src={item.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-50" /> : null}
                      <Video className="w-10 h-10 mb-2 relative z-10" />
                      <span className="text-xs font-semibold uppercase relative z-10">Video</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-center items-center text-zinc-500">
                      <FileText className="w-10 h-10 mb-2" />
                      <span className="text-xs font-semibold uppercase">Document</span>
                    </div>
                  )}
                  
                   {/* Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between backdrop-blur-sm">
                    <div className="flex justify-end gap-2">
                       <a href={item.url} target="_blank" rel="noreferrer" className="text-white bg-white/20 p-1.5 rounded-md hover:bg-white/30 transition-colors" title="Open in new tab">
                          <ExternalLink className="w-4 h-4" />
                       </a>
                       <button onClick={() => setEditingItem(item)} className="text-blue-400 bg-blue-500/20 p-1.5 rounded-md hover:bg-blue-500/40 transition-colors" title="Edit Metadata">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2 w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                       </button>
                       <button onClick={() => handleDelete(item.id)} className="text-red-400 bg-red-500/20 p-1.5 rounded-md hover:bg-red-500/40 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      <p className="text-zinc-400 text-xs truncate mt-0.5">{item.type} • {item.folder}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AddMediaModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdded={(m) => setMedia([m, ...media])} />
      {editingItem && (
        <EditMediaModal 
          item={editingItem} 
          isOpen={!!editingItem} 
          onClose={() => setEditingItem(null)} 
          onUpdated={(m) => {
            setMedia(media.map(prev => prev.id === m.id ? m : prev));
          }} 
        />
      )}
    </div>
  );
};

const EditMediaModal = ({ item, isOpen, onClose, onUpdated }: { item: MediaItem, isOpen: boolean, onClose: () => void, onUpdated: (m: MediaItem) => void }) => {
  const [title, setTitle] = useState(item.title || '');
  const [folder, setFolder] = useState(item.folder || 'Uncategorized');
  const [tags, setTags] = useState(item.tags || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, folder, tags })
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Media updated' });
        onUpdated({ ...item, title, folder, tags });
        onClose();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 z-50 shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-white mb-4">Edit Media Details</Dialog.Title>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Title</Label>
              <Input placeholder="File name or description" value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Folder</Label>
              <Input placeholder="E.g., Images, Documents, Videos" value={folder} onChange={e => setFolder(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Tags (comma separated)</Label>
              <Input placeholder="E.g., hero, banner, mobile" value={tags} onChange={e => setTags(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const AddMediaModal = ({ isOpen, onClose, onAdded }: { isOpen: boolean, onClose: () => void, onAdded: (m: MediaItem) => void }) => {
  const [tab, setTab] = useState<'upload'|'embed'>('upload');
  const [embedUrl, setEmbedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('Uncategorized');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media/upload', true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          onAdded(data);
          toast({ title: 'Success', description: 'File uploaded' });
          onClose();
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to parse response', variant: 'destructive' });
        }
      } else {
        let errMsg = 'Upload failed';
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error) errMsg = errData.error;
        } catch {}
        toast({ title: 'Error', description: errMsg, variant: 'destructive' });
      }
      setUploading(false);
      setUploadProgress(0);
    };
    
    xhr.onerror = () => {
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
      setUploading(false);
      setUploadProgress(0);
    };
    
    xhr.send(formData);
  };

  const handleEmbed = async () => {
    if (!embedUrl) return;
    setUploading(true);
    let type = 'document';
    let thumb = '';
    
    // Naive embed detection
    if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
      type = 'video';
      const match = embedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match) thumb = `https://img.youtube.com/vi/${match[1]}/0.jpg`;
    } else if (embedUrl.includes('vimeo.com')) type = 'video';
    else if (embedUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = 'image';
    else if (embedUrl.match(/\.(mp4|webm)$/i)) type = 'video';
    
    try {
      const res = await fetch('/api/admin/media/embed', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: embedUrl, title: title || 'Embedded Media', folder, type, thumbnail: thumb || embedUrl })
      });
      const data = await res.json();
      if (res.ok) {
        onAdded(data);
        setEmbedUrl('');
        setTitle('');
        onClose();
      } else throw new Error();
    } catch {
      toast({ title: 'Error', description: 'Failed to add embed', variant: 'destructive' });
    }
    setUploading(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 z-50 shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-white mb-4">Add Media</Dialog.Title>
          
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg mb-6">
            <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`} onClick={() => setTab('upload')}>Upload File</button>
            <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'embed' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`} onClick={() => setTab('embed')}>Embed URL</button>
          </div>

          {tab === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-white/20 transition-colors bg-white/5 relative">
                <Upload className="w-8 h-8 text-zinc-400 mb-3" />
                <p className="text-sm text-zinc-300 font-medium mb-1">Click or drag file to upload</p>
                <p className="text-xs text-zinc-500">Supports images, PDF, MP4</p>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">URL</Label>
                <Input placeholder="https://youtube.com/..." value={embedUrl} onChange={e=>setEmbedUrl(e.target.value)} className="bg-black border-white/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Title (Optional)</Label>
                <Input placeholder="E.g., Intro Video" value={title} onChange={e=>setTitle(e.target.value)} className="bg-black border-white/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Folder</Label>
                <Input placeholder="Uncategorized" value={folder} onChange={e=>setFolder(e.target.value)} className="bg-black border-white/10" />
              </div>
              <Button onClick={handleEmbed} disabled={uploading || !embedUrl} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                {uploading ? 'Adding...' : 'Add Embed'}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
