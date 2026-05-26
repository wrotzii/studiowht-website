import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { History, X, Clock, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Revision {
  id: string;
  created_at: string;
  name: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (content: any) => void;
}

export const VersionHistoryModal = ({ isOpen, onClose, onRestore }: VersionHistoryModalProps) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/admin/content/revisions')
        .then(res => res.json())
        .then(data => setRevisions(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error("Failed to load revisions:", err);
          setRevisions([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleRestore = async (id: string) => {
    if (!confirm("Are you sure you want to restore this version? This will overwrite your current draft.")) return;
    
    setRestoringId(id);
    try {
      const res = await fetch(`/api/admin/content/revisions/${id}`);
      if (res.ok) {
        const data = await res.json();
        onRestore(data);
        toast({ title: 'Restored', description: 'Version restored. Be sure to publish if you want it live.' });
      } else {
        toast({ title: 'Error', description: 'Could not fetch version data.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to restore version.', variant: 'destructive' });
    }
    setRestoringId(null);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 z-[60] shadow-2xl flex flex-col max-h-[80vh]">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              <Dialog.Title className="text-xl font-bold text-white">Version History</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : revisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p>No published versions found.</p>
                <p className="mt-1">Publish changes to create a history.</p>
              </div>
            ) : (
              <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8">
                {revisions.map((rev, index) => (
                  <div key={rev.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-zinc-800 border-[3px] border-emerald-500 rounded-full" />
                    
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 transition-colors hover:border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-medium flex items-center gap-2">
                            {rev.name}
                            {index === 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Live</span>}
                          </h3>
                          <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rev.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="secondary"
                        disabled={restoringId === rev.id || restoringId !== null}
                        onClick={() => handleRestore(rev.id)}
                        className="mt-4 w-full bg-white/5 hover:bg-white/10 text-white border border-white/5 h-8 text-xs"
                      >
                        {restoringId === rev.id ? 'Restoring...' : <span className="flex items-center gap-2"><RotateCcw className="w-3 h-3" /> Restore Version</span>}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
