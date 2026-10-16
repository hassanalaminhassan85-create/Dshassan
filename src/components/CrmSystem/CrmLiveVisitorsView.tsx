import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, RefreshCw, Smartphone, Laptop, Globe, Clock, MapPin, Eye, ExternalLink } from 'lucide-react';

interface LiveVisitorItem {
  session_id: string;
  visitor_id: string;
  current_page: string;
  started_at: string;
  last_active_at: string;
  seconds_ago: number;
  duration_seconds: number;
  page_views_count: number;
  events_count: number;
  country: string;
  city: string;
  device_category: string;
  browser: string;
  os: string;
  traffic_source: string;
  utm_campaign?: string;
  is_returning: boolean;
}

interface CrmLiveVisitorsViewProps {
  onSelectVisitor: (vid: string) => void;
  formatDuration: (sec: number) => string;
  authToken: string;
}

export const CrmLiveVisitorsView: React.FC<CrmLiveVisitorsViewProps> = ({
  onSelectVisitor,
  formatDuration,
  authToken
}) => {
  const [liveData, setLiveData] = useState<{ active_count: number; timestamp: string; visitors: LiveVisitorItem[] }>({
    active_count: 0,
    timestamp: new Date().toISOString(),
    visitors: []
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLive = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/live', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLiveData(data.data);
      }
    } catch (err) {
      console.warn('Error fetching live visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLive, 8000); // 8s polling
    return () => clearInterval(interval);
  }, [autoRefresh, authToken]);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                Live Active Sessions
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                {liveData.active_count} Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sessions updated within the last 15 minutes. Idle sessions timeout after inactivity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Auto-Refresh (8s)</span>
          </label>

          <button
            onClick={fetchLive}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Visitors Grid / Table */}
      {liveData.visitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveData.visitors.map((v) => (
            <motion.div
              key={v.session_id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group text-left"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[140px]">
                      {v.visitor_id}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {v.seconds_ago < 60 ? `${v.seconds_ago}s ago` : `${Math.round(v.seconds_ago / 60)}m ago`}
                  </span>
                </div>

                {/* Current Page */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Active Page
                  </span>
                  <div className="text-xs font-mono font-bold text-amber-400 truncate bg-slate-950/70 p-2 rounded-lg border border-white/5">
                    {v.current_page}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{v.city}, {v.country}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    {v.device_category === 'Mobile' ? (
                      <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    )}
                    <span className="truncate">{v.device_category} ({v.browser})</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Duration: {formatDuration(v.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{v.page_views_count} views, {v.events_count} events</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Source: <strong className="text-white">{v.traffic_source}</strong>
                </span>
                <button
                  onClick={() => onSelectVisitor(v.visitor_id)}
                  className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Journey</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-white/10 font-mono space-y-2">
          <Activity className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-slate-300 uppercase">No Concurrent Active Sessions</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Visitors will appear here in real-time as they browse your pages and click buttons across the website.
          </p>
        </div>
      )}
    </div>
  );
};
