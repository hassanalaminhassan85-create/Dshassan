import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Laptop,
  Smartphone,
  ExternalLink,
  Calendar,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { CrmVisitor } from '../../server/crmStore';

interface CrmVisitorsViewProps {
  onSelectVisitor: (vid: string) => void;
  authToken: string;
}

export const CrmVisitorsView: React.FC<CrmVisitorsViewProps> = ({
  onSelectVisitor,
  authToken
}) => {
  const [visitors, setVisitors] = useState<CrmVisitor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '15'
      });
      if (search.trim()) params.set('search', search.trim());
      if (countryFilter) params.set('country', countryFilter);
      if (deviceFilter) params.set('device', deviceFilter);

      const res = await fetch(`/api/crm/visitors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.warn('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [page, countryFilter, deviceFilter, authToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisitors();
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visitor ID, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => {
              setDeviceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">All Devices</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setDeviceFilter('');
              setCountryFilter('');
              setPage(1);
              fetchVisitors();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-white/10 cursor-pointer transition-colors"
          >
            Reset
          </button>

          <button
            onClick={fetchVisitors}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Visitor ID</th>
                <th className="py-3 px-3 font-bold">Location</th>
                <th className="py-3 px-3 font-bold">Device & OS</th>
                <th className="py-3 px-3 font-bold">Traffic Source</th>
                <th className="py-3 px-3 font-bold text-center">Sessions</th>
                <th className="py-3 px-3 font-bold text-center">Page Views</th>
                <th className="py-3 px-3 font-bold text-center">Events</th>
                <th className="py-3 px-3 font-bold">Last Active</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {visitors.length > 0 ? (
                visitors.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => onSelectVisitor(v.id)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                          {v.id}
                        </span>
                        {v.is_returning && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Return
                          </span>
                        )}
                        {v.lead_id && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        Landing: {v.landing_page}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{v.city || 'Unknown'}, {v.country}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {v.device_category === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                        <span>{v.device_category} · {v.os}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {v.traffic_source}
                      </span>
                      {v.utm_campaign && (
                        <div className="text-[9px] text-amber-400 truncate max-w-[120px] mt-0.5">
                          {v.utm_campaign}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-white">
                      {v.total_sessions}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      {v.total_page_views}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-400">
                      {v.total_events}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {new Date(v.last_seen_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVisitor(v.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Profile <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    {loading ? 'Querying visitor records...' : 'No visitor records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing {visitors.length} of {total} visitors (Page {page} of {totalPages})
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
