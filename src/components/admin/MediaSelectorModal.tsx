import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Search, Folder, ImageIcon, Video, FileText, CheckCircle2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MediaItem } from '@/pages/MediaLibrary';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const MediaSelectorModal = ({ isOpen, onClose, onSelect }: MediaSelectorModalProps) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/admin/media')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMedia(data);
          } else {
            setMedia([]);
          }
        })
        .catch(err => {
          console.error(err);
          setMedia([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const safeMedia = Array.isArray(media) ? media : [];
  const folders = ['All', ...Array.from(new Set(safeMedia.map(m => m.folder).filter(Boolean)))];
  const filteredMedia = safeMedia.filter(m => 
    (m.title && m.title.toLowerCase().includes(search.toLowerCase())) &&
    (activeFolder === 'All' || m.folder === activeFolder)
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[80vh] bg-zinc-950 border border-white/10 rounded-2xl flex flex-col z-[60] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Dialog.Title className="text-lg font-semibold text-white">Select Media</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white h-8 w-8">
                <X className="w-5 h-5" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-48 border-r border-white/10 bg-black p-4 flex flex-col gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-8 text-xs bg-zinc-900 border-white/10" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {folders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${activeFolder === folder ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-4 bg-zinc-900/50">
              {loading ? (
                 <div className="flex justify-center items-center h-full"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : filteredMedia.length === 0 ? (
                 <div className="flex justify-center items-center h-full text-zinc-500 text-sm">No media found. Go to Media Library to upload.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredMedia.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.url); onClose(); }}
                      className="group relative bg-black border border-white/10 rounded-lg overflow-hidden aspect-square flex items-center justify-center hover:border-emerald-500 transition-colors focus:outline-none focus:ring-2 ring-emerald-500/50"
                    >
                      {item.type === 'image' ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : item.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                           {item.thumbnail !== item.url && <img src={item.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />}
                           <Video className="w-6 h-6 z-10" />
                        </div>
                      ) : (
                        <FileText className="w-6 h-6 text-zinc-500" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </main>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
