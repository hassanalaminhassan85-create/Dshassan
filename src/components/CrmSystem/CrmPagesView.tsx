import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Clock,
  Eye,
  TrendingUp,
  MousePointer,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface PageStat {
  path: string;
  page_views: number;
  unique_visitors: number;
  entry_sessions: number;
  avg_duration_seconds: number;
  exit_rate: number;
  cta_rate: number;
  form_conversion_rate: number;
}

interface CrmPagesViewProps {
  authToken: string;
  formatDuration: (sec: number) => string;
}

export const CrmPagesView: React.FC<CrmPagesViewProps> = ({
  authToken,
  formatDuration
}) => {
  const [pages, setPages] = useState<PageStat[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/pages', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (err) {
      console.warn('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [authToken]);

  const filtered = pages.filter(p =>
    p.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Website Page Performance & Content Analytics
          </h2>
          <p className="text-[11px] text-slate-400">
            Metrics per route: Views, Engagement duration, CTA click-through rate, and form completions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            onClick={fetchPages}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Route Path</th>
                <th className="py-3 px-3 font-bold text-right">Page Views</th>
                <th className="py-3 px-3 font-bold text-right">Unique Visitors</th>
                <th className="py-3 px-3 font-bold text-right">Entry Sessions</th>
                <th className="py-3 px-3 font-bold text-right">Avg Duration</th>
                <th className="py-3 px-3 font-bold text-right">Exit Rate</th>
                <th className="py-3 px-3 font-bold text-right">CTA CTR</th>
                <th className="py-3 px-4 font-bold text-right">Form Conv %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.path} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="truncate max-w-[220px]">{p.path}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-amber-400">
                      {p.page_views.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {p.unique_visitors.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {p.entry_sessions.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatDuration(p.avg_duration_seconds)}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400">
                      {p.exit_rate}%
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {p.cta_rate}%
                    </td>

                    <td className="py-3 px-4 text-right text-amber-400 font-bold">
                      {p.form_conversion_rate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {loading ? 'Analyzing page performance...' : 'No page view analytics available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
