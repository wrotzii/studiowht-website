import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, QrCode, LogOut, Star, Plus, Trash2, Edit2, CheckCircle2, MessageSquare } from 'lucide-react';

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        toast({ title: 'Error', description: 'Invalid password', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-white/10 rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Admin Portal</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-zinc-400">Password</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-zinc-800/50 border-white/10 h-12 text-lg"
              placeholder="Enter password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-white text-black hover:bg-neutral-200">
            {loading ? 'Authenticating...' : 'Enter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

interface Favorite {
  id: number;
  label: string;
  url: string;
}

const QREditor = () => {
  const [activeUrl, setActiveUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUrl, setSavingUrl] = useState(false);
  const [favLabel, setFavLabel] = useState('');
  const [favUrl, setFavUrl] = useState('');
  const [editingFavId, setEditingFavId] = useState<number | null>(null);
  const [editFavLabel, setEditFavLabel] = useState('');
  const [editFavUrl, setEditFavUrl] = useState('');
  const { toast } = useToast();

  const fetchState = async () => {
    try {
      const res = await fetch('/api/admin/qr');
      if (res.ok) {
        const data = await res.json();
        setActiveUrl(data.activeUrl || '');
        setNewUrl(data.activeUrl || '');
        setFavorites(data.favorites || []);
      }
    } catch(err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleUpdateActiveUrl = async (urlToSave: string) => {
    try {
      const parsed = new URL(urlToSave);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch(err) {
      toast({ title: 'Invalid URL', description: 'URL must be a valid http or https link', variant: 'destructive' });
      return;
    }
    setSavingUrl(true);
    try {
      const res = await fetch('/api/admin/qr/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToSave })
      });
      if (res.ok) {
        setActiveUrl(urlToSave);
        toast({ title: 'Success', description: 'Active redirect URL updated.' });
      }
    } catch(err) {
      toast({ title: 'Error', description: 'Failed to update URL.', variant: 'destructive' });
    }
    setSavingUrl(false);
  };

  const handleAddFav = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!favLabel) {
      toast({ title: 'Error', description: 'Label is required.', variant: 'destructive' });
      return;
    }
    try {
      const parsed = new URL(favUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch(err) {
      toast({ title: 'Error', description: 'Valid HTTP/HTTPS URL required.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/admin/qr/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: favLabel, url: favUrl })
      });
      if (res.ok) {
        setFavLabel('');
        setFavUrl('');
        fetchState();
        toast({ title: 'Success', description: 'Favorite added.' });
      }
    } catch(err) {}
  };

  const handleDeleteFav = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/qr/favorites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchState();
        toast({ title: 'Deleted', description: 'Favorite removed.' });
      }
    } catch(err) {}
  };

  const handleEditFav = async (id: number) => {
    if (!editFavLabel) {
      toast({ title: 'Error', description: 'Label is required.', variant: 'destructive' });
      return;
    }
    try {
      const parsed = new URL(editFavUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch(err) {
      toast({ title: 'Error', description: 'Valid HTTP/HTTPS URL required.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`/api/admin/qr/favorites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editFavLabel, url: editFavUrl })
      });
      if (res.ok) {
        setEditingFavId(null);
        fetchState();
        toast({ title: 'Success', description: 'Favorite updated.' });
      }
    } catch(err) {}
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4 border-b border-white/10 pb-8">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">QR Code Redirect</h1>
          <p className="text-zinc-400">Manage the destination URL for the public /qr route.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Active URL Card */}
        <div className="bg-zinc-900/40 border border-white/10 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Live Destination
              </h2>
            </div>
            {activeUrl ? (
              <a href={activeUrl} target="_blank" rel="noreferrer" className="text-xl md:text-2xl text-emerald-400 font-medium break-all hover:underline mb-8 block">
                {activeUrl}
              </a>
            ) : (
              <p className="text-zinc-500 text-lg mb-8 italic">Not configured</p>
            )}
          </div>
          
          <div className="space-y-4 border-t border-white/10 pt-6">
            <Label className="text-zinc-400 uppercase text-xs tracking-widest">Set new destination manually</Label>
            <div className="flex gap-2">
              <Input 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="bg-black/50 border-white/10 h-12"
              />
              <Button 
                onClick={() => handleUpdateActiveUrl(newUrl)}
                disabled={savingUrl || newUrl === activeUrl}
                className="h-12 px-6 bg-white text-black hover:bg-neutral-200"
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Favorites Card */}
        <div className="bg-zinc-900/40 border border-white/10 p-6 rounded-3xl">
          <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500" />
            Favorite Links
          </h2>
          
          <div className="space-y-4 mb-8">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl transition-colors hover:border-white/20 relative group">
                {editingFavId === fav.id ? (
                  <div className="flex flex-col gap-2">
                    <Input 
                      value={editFavLabel} 
                      onChange={(e) => setEditFavLabel(e.target.value)} 
                      className="bg-black/50 border-white/10 h-8"
                    />
                    <Input 
                      value={editFavUrl} 
                      onChange={(e) => setEditFavUrl(e.target.value)} 
                      className="bg-black/50 border-white/10 h-8"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingFavId(null)}>Cancel</Button>
                      <Button size="sm" className="h-8 bg-white text-black hover:bg-neutral-200" onClick={() => handleEditFav(fav.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="truncate pr-4 flex-1">
                      <p className="font-medium text-white truncate">{fav.label}</p>
                      <p className="text-sm text-zinc-500 truncate">{fav.url}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-white/10 hover:bg-white/10 bg-transparent text-white h-8 text-xs"
                        onClick={() => handleUpdateActiveUrl(fav.url)}
                      >
                        Set Active
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-400 hover:text-white hover:bg-white/10 h-8 w-8"
                        onClick={() => {
                          setEditFavLabel(fav.label);
                          setEditFavUrl(fav.url);
                          setEditingFavId(fav.id);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                        onClick={() => handleDeleteFav(fav.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="text-zinc-500 text-sm italic text-center py-4">No favorites saved.</p>
            )}
          </div>

          <div className="border-t border-white/10 pt-6">
            <form onSubmit={handleAddFav} className="space-y-4">
              <Label className="text-zinc-400 uppercase text-xs tracking-widest mb-2 block">Add to favorites</Label>
              <Input 
                value={favLabel} 
                onChange={(e) => setFavLabel(e.target.value)} 
                placeholder="Label (e.g. Portfolio)" 
                className="bg-black/50 border-white/10"
              />
              <div className="flex gap-2">
                <Input 
                  value={favUrl} 
                  onChange={(e) => setFavUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="bg-black/50 border-white/10"
                />
                <Button type="submit" size="icon" className="bg-zinc-800 text-white hover:bg-zinc-700 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import { NavLink } from 'react-router-dom';
import { LayoutTemplate, MonitorSmartphone, Image as ImageIcon, FileText, Activity, Settings as SettingsIcon, BarChart2, Menu, X } from 'lucide-react';
import SiteEditor from './SiteEditor';
import { MediaLibrary } from './MediaLibrary';

import { PagesManager } from './PagesManager';
import { SettingsAdmin } from './SettingsAdmin';
import { AnalyticsAdmin } from './AnalyticsAdmin';

const MessagesViewer = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    fetch('/api/admin/messages')
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: number) => {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'POST' });
    fetchMessages();
  };

  const deleteMessage = async (id: number) => {
    if(confirm('Are you sure you want to delete this message?')) {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      fetchMessages();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Inbox</h1>
        <p className="text-zinc-400">Manage contact form messages.</p>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : (
          <div className="divide-y divide-white/10">
               {messages.map((msg: any) => (
                 <div key={msg.id} className={`p-6 transition-colors ${msg.is_read ? 'bg-transparent text-zinc-400' : 'bg-emerald-950/20'}`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="flex items-center gap-2">
                         {!msg.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                         <h3 className="font-semibold text-lg text-white">{msg.name}</h3>
                       </div>
                       <a href={`mailto:${msg.email}`} className="text-sm text-emerald-400 hover:underline">{msg.email}</a>
                     </div>
                     <span className="text-xs text-zinc-500">{new Date(msg.created_at).toLocaleString()}</span>
                   </div>
                   <p className="text-zinc-300 whitespace-pre-wrap bg-black/50 p-4 rounded-xl border border-white/5">{msg.message}</p>
                   <div className="mt-4 flex gap-4">
                      {!msg.is_read && (
                        <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => markAsRead(msg.id)}>
                          <CheckCircle2 className="w-3 h-3 mr-2" /> Mark as Read
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                      </Button>
                   </div>
                 </div>
               ))}
               {messages.length === 0 && (
                 <div className="p-8 text-center text-zinc-500">No messages yet.</div>
               )}
          </div>
        )}
      </div>
    </div>
  );
};

const LogsViewer = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-white/10 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
        <p className="text-zinc-400">Security event audit trail.</p>
      </div>
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-white/5 text-zinc-500 border-b border-white/10">
              <tr>
                 <th className="px-6 py-4 font-medium">Timestamp</th>
                 <th className="px-6 py-4 font-medium">Action</th>
                 <th className="px-6 py-4 font-medium">User</th>
                 <th className="px-6 py-4 font-medium">IP</th>
                 <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
               {logs.map((log: any) => (
                 <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                   <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-medium ${log.action.includes('fail') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                       {log.action}
                     </span>
                   </td>
                   <td className="px-6 py-4 capitalize">{log.user}</td>
                   <td className="px-6 py-4 font-mono text-xs">{log.ip_address}</td>
                   <td className="px-6 py-4">{log.details}</td>
                 </tr>
               ))}
               {logs.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No activity recorded yet.</td>
                 </tr>
               )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/whtadmin');
    window.location.reload();
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-zinc-950 md:bg-zinc-900/30 flex flex-col sticky top-0 max-h-screen md:h-screen z-50">
        <div className="p-6 border-b border-white/10 flex items-center justify-between md:justify-start">
          <div className="font-bold tracking-widest text-lg flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5 text-emerald-500" />
            WHT ADMIN
          </div>
          <div className="md:hidden flex items-center gap-2">
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <nav className={`p-4 space-y-1 flex-grow flex-col overflow-y-auto ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 px-4 mt-2">Content</div>
          <NavLink 
            to="/whtadmin/pages" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            Pages
          </NavLink>
          <NavLink 
            to="/whtadmin/media" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Media Library
          </NavLink>

          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2 px-4 mt-6">System Tools</div>
          <NavLink 
            to="/whtadmin/analytics" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <BarChart2 className="w-5 h-5" />
            Analytics
          </NavLink>
          <NavLink 
            to="/whtadmin/qr-editor" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <QrCode className="w-5 h-5" />
            QR Redirects
          </NavLink>
          <NavLink 
            to="/whtadmin/messages" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </NavLink>
          <NavLink 
            to="/whtadmin/logs" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" />
            Activity Logs
          </NavLink>
          <NavLink 
            to="/whtadmin/site-settings" 
            onClick={closeMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </NavLink>
        </nav>
        <div className="p-4 border-t border-white/10 hidden md:block">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-12 md:max-h-screen md:overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="pages" replace />} />
          <Route path="pages" element={<PagesManager />} />
          <Route path="qr-editor" element={<QREditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="messages" element={<MessagesViewer />} />
          <Route path="logs" element={<LogsViewer />} />
          <Route path="analytics" element={<AnalyticsAdmin />} />
          <Route path="site-settings" element={<SettingsAdmin />} />
          <Route path="settings" element={<Navigate to="site-settings" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state by probing the active url endpoint
    fetch('/api/admin/qr')
      .then(res => {
        if (res.ok) setIsAuthenticated(true);
        else setIsAuthenticated(false);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-white justify-center border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Routes>
      <Route path="site-editor/:id" element={<SiteEditor />} />
      <Route path="site-editor" element={<Navigate to="/whtadmin/pages" replace />} />
      <Route path="*" element={<AdminLayout />} />
    </Routes>
  );
}
