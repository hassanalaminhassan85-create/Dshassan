import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { CrmSession } from '../../server/crmStore';

interface CrmSessionsViewProps {
  onSelectVisitor: (vid: string) => void;
  formatDuration: (sec: number) => string;
  authToken: string;
}

export const CrmSessionsView: React.FC<CrmSessionsViewProps> = ({
  onSelectVisitor,
  formatDuration,
  authToken
}) => {
  const [sessions, setSessions] = useState<CrmSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20'
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/crm/sessions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.warn('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, authToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSessions();
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search session ID, visitor ID, page..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearch('');
              setPage(1);
              fetchSessions();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-white/10 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Session ID</th>
                <th className="py-3 px-3 font-bold">Visitor</th>
                <th className="py-3 px-3 font-bold">Duration</th>
                <th className="py-3 px-3 font-bold">Entry Page</th>
                <th className="py-3 px-3 font-bold">Exit Page</th>
                <th className="py-3 px-3 font-bold text-center">Views</th>
                <th className="py-3 px-3 font-bold">Location</th>
                <th className="py-3 px-3 font-bold text-center">Outcome</th>
                <th className="py-3 px-4 font-bold">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {s.id}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectVisitor(s.visitor_id)}
                        className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="truncate max-w-[110px]">{s.visitor_id}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-300">
                      {formatDuration(s.duration_seconds)}
                    </td>

                    <td className="py-3 px-3 font-bold text-white truncate max-w-[140px]" title={s.entry_page}>
                      {s.entry_page}
                    </td>

                    <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]" title={s.exit_page || s.entry_page}>
                      {s.exit_page || s.entry_page}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      {s.page_views_count}
                    </td>

                    <td className="py-3 px-3 truncate max-w-[130px]">
                      {s.city || 'Unknown'}, {s.country}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {s.converted ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Converted
                        </span>
                      ) : s.is_bounce ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Bounce
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                          Engaged
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(s.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    {loading ? 'Loading sessions...' : 'No sessions recorded yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {sessions.length} of {total} sessions (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-white">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
