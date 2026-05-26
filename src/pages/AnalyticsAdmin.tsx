import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, Clock, CalendarDays, Calendar, Smartphone, Globe, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AnalyticsAdmin = () => {
  const [data, setData] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | '365' | 'all'>('30');
  const [activeTab, setActiveTab] = useState<'web' | 'qr'>('web');

  useEffect(() => {
    setLoading(true);
    const fetchPath = activeTab === 'web' ? `/api/admin/analytics` : `/api/admin/analytics/qr`;
    
    fetch(`${fetchPath}?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(d => {
        // format dates
        const formattedTrend = d.trend?.map((item: any) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        })) || [];
        
        if (activeTab === 'web') {
           setData({ ...d, trend: formattedTrend });
        } else {
           setQrData({ ...d, trend: formattedTrend });
        }
      })
      .finally(() => setLoading(false));
  }, [timeframe, activeTab]);

  const handleExport = () => {
    if (!qrData || !qrData.recentScans) return;
    const csvContent = [
      ['URL', 'Timestamp', 'User Agent', 'Referrer', 'IP Address'].join(','),
      ...qrData.recentScans.map((s: any) => [
        `"${s.url}"`,
        `"${new Date(s.timestamp).toISOString()}"`,
        `"${(s.user_agent || '').replace(/"/g, '""')}"`,
        `"${s.referrer || ''}"`,
        `"${s.ip_address || ''}"`
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'qr_scans_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Overview</h1>
          <p className="text-zinc-400">Track website traffic and popular pages.</p>
        </div>
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
          {[
            { value: '30', label: '30d' },
            { value: '60', label: '60d' },
            { value: '90', label: '90d' },
            { value: '365', label: '1y' },
            { value: 'all', label: 'All' },
          ].map((tf) => (
            <Button
              key={tf.value}
              size="sm"
              variant={timeframe === tf.value ? 'default' : 'ghost'}
              className={timeframe === tf.value ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'text-zinc-400'}
              onClick={() => setTimeframe(tf.value as any)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex border-b border-white/10 gap-6 justify-between items-end">
         <div className="flex gap-6">
           <button
             className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'web' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-white'}`}
             onClick={() => setActiveTab('web')}
           >
             <Globe className="w-4 h-4 inline-block mr-2" /> Web Analytics
           </button>
           <button
             className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'qr' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-white'}`}
             onClick={() => setActiveTab('qr')}
           >
             <Smartphone className="w-4 h-4 inline-block mr-2" /> QR Code Scans
           </button>
         </div>
         {activeTab === 'qr' && (
           <Button size="sm" variant="outline" className="mb-3 text-xs border-white/10 hover:bg-white/5" onClick={handleExport}>
             <ExternalLink className="w-3 h-3 mr-2" /> Export CSV
           </Button>
         )}
      </div>

      {loading ? <div className="text-zinc-500">Loading analytics...</div> : activeTab === 'web' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-zinc-400 mb-4">
                <Eye className="w-5 h-5" />
                <span>Total Views</span>
              </div>
              <div className="text-4xl font-bold text-white">{data?.totalViews?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">Traffic Trend</h3>
            <div className="h-[300px] w-full">
              {data?.trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="formattedDate" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="views" name="Page Views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data available for this timeframe.</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">Top Pages</h3>
            <div className="h-[300px] w-full">
              {data?.topPages?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topPages} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="path" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Bar dataKey="views" name="Views" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data available.</div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-zinc-400 mb-4">
                <Smartphone className="w-5 h-5" />
                <span>Total Scans</span>
              </div>
              <div className="text-4xl font-bold text-white">{qrData?.totalScans?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">Scan Trend</h3>
            <div className="h-[300px] w-full">
              {qrData?.trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={qrData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="formattedDate" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="scans" name="QR Scans" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data available for this timeframe.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-6">Top Destinations</h3>
              <div className="flex-1 overflow-auto -mx-6 px-6">
                {qrData?.topDestinations?.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-400 uppercase bg-black/40">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg font-medium">Destination URL</th>
                        <th className="px-4 py-3 font-medium">Scans</th>
                        <th className="px-4 py-3 rounded-r-lg font-medium">Last Scanned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qrData.topDestinations.map((dest: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-white">
                            <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[300px]">
                              <Link2 className="w-4 h-4 text-zinc-500 shrink-0" />
                              <span className="truncate">{dest.url}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{dest.scans}</td>
                          <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{new Date(dest.last_scan).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center text-zinc-500 h-[200px]">No destination URLs found.</div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-6">Recent Scans</h3>
              <div className="flex-1 overflow-auto -mx-6 px-6">
                {qrData?.recentScans?.length > 0 ? (
                  <div className="space-y-4">
                    {qrData.recentScans.slice(0, 50).map((scan: any, i: number) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 border border-white/5 bg-black/20 transition-colors">
                         <div className="bg-blue-500/10 p-2 rounded-lg shrink-0 h-fit">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                               <span className="text-white text-sm truncate font-medium">{scan.url}</span>
                               <span className="text-xs text-zinc-500 whitespace-nowrap">{new Date(scan.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex gap-4 text-xs text-zinc-500 truncate">
                               <span className="truncate max-w-[150px]" title={scan.user_agent}>UA: {scan.user_agent.substring(0, 30)}...</span>
                               {scan.referrer && scan.referrer !== 'direct' && <span>Ref: {scan.referrer}</span>}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-zinc-500 h-[200px]">No recent scans found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
