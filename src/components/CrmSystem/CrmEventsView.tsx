import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Eye,
  Zap,
  RefreshCw,
  Code2,
  X
} from 'lucide-react';
import { CrmEvent } from '../../server/crmStore';

interface CrmEventsViewProps {
  onSelectVisitor: (vid: string) => void;
  authToken: string;
}

export const CrmEventsView: React.FC<CrmEventsViewProps> = ({
  onSelectVisitor,
  authToken
}) => {
  const [events, setEvents] = useState<CrmEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CrmEvent | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '25'
      });
      if (category !== 'all') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/crm/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.warn('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, category, authToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'cta', label: 'CTAs' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'form', label: 'Forms' },
    { id: 'pageview', label: 'Pageviews' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'test', label: 'Test Pings' }
  ];

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event name, path, label..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCategory('all');
                setSearch('');
                setPage(1);
                fetchEvents();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-white/10 cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                category === c.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-3 font-bold">Event Name</th>
                <th className="py-3 px-3 font-bold">Page Path</th>
                <th className="py-3 px-3 font-bold">Element Label</th>
                <th className="py-3 px-3 font-bold">Visitor ID</th>
                <th className="py-3 px-3 font-bold text-center">Type</th>
                <th className="py-3 px-3 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {events.length > 0 ? (
                events.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {evt.event_category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-white group-hover:text-amber-300 transition-colors">
                      {evt.event_name}
                    </td>

                    <td className="py-3 px-3 text-amber-400 truncate max-w-[150px]">
                      {evt.path}
                    </td>

                    <td className="py-3 px-3 text-slate-300 truncate max-w-[160px]" title={evt.element_text}>
                      {evt.element_text || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVisitor(evt.visitor_id);
                        }}
                        className="text-slate-400 hover:text-amber-400 underline truncate max-w-[110px] block"
                      >
                        {evt.visitor_id}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {evt.is_conversion ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Conversion
                        </span>
                      ) : evt.is_test ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Diagnostic
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Normal</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                        title="Inspect payload"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {loading ? 'Fetching telemetry stream...' : 'No events found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {events.length} of {total} events (Page {page} of {totalPages})
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

      {/* JSON Payload Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase">{selectedEvent.event_name}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Event ID:</span>
                <span className="text-white font-bold">{selectedEvent.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Category:</span>
                <span className="text-amber-400 uppercase font-bold">{selectedEvent.event_category}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Route:</span>
                <span className="text-white">{selectedEvent.path}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Timestamp:</span>
                <span className="text-white">{selectedEvent.created_at}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Sanitized Metadata:</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-emerald-400 overflow-x-auto max-h-48">
                {JSON.stringify(selectedEvent.metadata || { destination: selectedEvent.destination_url || null, label: selectedEvent.element_text || null }, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
