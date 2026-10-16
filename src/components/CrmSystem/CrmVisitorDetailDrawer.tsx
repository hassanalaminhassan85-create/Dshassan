import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Calendar,
  Globe,
  Clock,
  Laptop,
  Smartphone,
  Eye,
  Activity,
  Layers,
  ArrowRight,
  UserCheck,
  MousePointer,
  MessageCircle,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { CrmVisitor, CrmSession, CrmEvent, CrmLead } from '../../server/crmStore';

interface CrmVisitorDetailDrawerProps {
  visitorId: string | null;
  onClose: () => void;
  authToken: string;
  onSelectLead?: (leadId: string) => void;
  formatDuration: (sec: number) => string;
}

export const CrmVisitorDetailDrawer: React.FC<CrmVisitorDetailDrawerProps> = ({
  visitorId,
  onClose,
  authToken,
  onSelectLead,
  formatDuration
}) => {
  const [data, setData] = useState<{
    visitor: CrmVisitor;
    sessions: CrmSession[];
    events: CrmEvent[];
    lead: CrmLead | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'sessions'>('timeline');

  useEffect(() => {
    if (!visitorId) {
      setData(null);
      return;
    }
    const loadVisitor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/crm/visitors/${visitorId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const resData = await res.json();
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      } catch (err) {
        console.warn('Error loading visitor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadVisitor();
  }, [visitorId, authToken]);

  if (!visitorId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl h-full bg-slate-950 border-l border-white/10 text-white flex flex-col z-10 shadow-2xl overflow-hidden font-mono"
        >
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase">{visitorId}</h3>
                  {data?.visitor?.is_returning && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Returning
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Visitor Journey & Telemetry Record</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Loading visitor profile...
            </div>
          ) : data ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Profile Snapshot Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">First Seen</span>
                  <div className="text-slate-200 font-bold truncate">
                    {new Date(data.visitor.first_seen_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Last Active</span>
                  <div className="text-amber-400 font-bold truncate">
                    {new Date(data.visitor.last_seen_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Location</span>
                  <div className="text-slate-200 font-bold truncate">
                    {data.visitor.city || 'Unknown'}, {data.visitor.country}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Device & OS</span>
                  <div className="text-slate-200 font-bold truncate">
                    {data.visitor.device_category} · {data.visitor.browser} ({data.visitor.os})
                  </div>
                </div>
              </div>

              {/* Attribution & Aggregates */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Traffic Acquisition:</span>
                  <span className="font-bold text-amber-400">{data.visitor.traffic_source}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-400">Landing Page:</span>
                  <span className="font-bold text-white truncate max-w-[240px]">{data.visitor.landing_page}</span>
                </div>
                {data.visitor.utm_campaign && (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-slate-400">Campaign Attribution:</span>
                    <span className="font-bold text-emerald-400">{data.visitor.utm_campaign}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <div className="text-sm font-bold text-white">{data.visitor.total_sessions}</div>
                    <span className="text-[9px] text-slate-400">Sessions</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <div className="text-sm font-bold text-amber-400">{data.visitor.total_page_views}</div>
                    <span className="text-[9px] text-slate-400">Page Views</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <div className="text-sm font-bold text-emerald-400">{data.visitor.total_events}</div>
                    <span className="text-[9px] text-slate-400">Total Events</span>
                  </div>
                </div>
              </div>

              {/* Associated Lead Banner (if identified) */}
              {data.lead && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{data.lead.name}</div>
                      <div className="text-[10px] text-amber-300/80">{data.lead.email || data.lead.phone} · Stage: {data.lead.stage}</div>
                    </div>
                  </div>
                  {onSelectLead && (
                    <button
                      onClick={() => onSelectLead(data.lead!.id)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 cursor-pointer"
                    >
                      View Lead
                    </button>
                  )}
                </div>
              )}

              {/* Sub-tab Navigation */}
              <div className="flex border-b border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Event Timeline ({data.events.length})
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`pb-2 px-3 font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'sessions'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Session History ({data.sessions.length})
                </button>
              </div>

              {/* Tab 1: Timeline */}
              {activeTab === 'timeline' ? (
                <div className="space-y-2">
                  {data.events.length > 0 ? (
                    data.events.map((evt) => {
                      const timeStr = new Date(evt.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });

                      const getIcon = () => {
                        if (evt.event_category === 'whatsapp') return <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />;
                        if (evt.event_category === 'phone') return <Phone className="w-3.5 h-3.5 text-blue-400" />;
                        if (evt.event_category === 'email') return <Mail className="w-3.5 h-3.5 text-purple-400" />;
                        if (evt.event_category === 'form') return <FileText className="w-3.5 h-3.5 text-amber-400" />;
                        if (evt.event_category === 'pageview') return <Eye className="w-3.5 h-3.5 text-blue-300" />;
                        return <MousePointer className="w-3.5 h-3.5 text-slate-400" />;
                      };

                      return (
                        <div
                          key={evt.id}
                          className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3 text-xs"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-950 border border-white/5 shrink-0 mt-0.5">
                            {getIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white truncate">{evt.event_name}</span>
                              <span className="text-[10px] text-slate-500 shrink-0">{timeStr}</span>
                            </div>
                            <div className="text-[11px] text-amber-400/90 truncate">{evt.path}</div>
                            {evt.element_text && (
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                Label: &quot;{evt.element_text}&quot;
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">No events recorded yet</div>
                  )}
                </div>
              ) : (
                /* Tab 2: Sessions */
                <div className="space-y-2.5">
                  {data.sessions.map((ses, idx) => (
                    <div
                      key={ses.id}
                      className="p-3 rounded-xl bg-slate-900/70 border border-white/5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Session #{data.sessions.length - idx}</span>
                        <span>{new Date(ses.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate max-w-[200px]">Entry: {ses.entry_page}</span>
                        <span className="text-amber-400 font-bold">{formatDuration(ses.duration_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>{ses.page_views_count} views</span>
                        <span>{ses.events_count} events</span>
                        {ses.converted && (
                          <span className="text-emerald-400 font-bold">Converted</span>
                        )}
                        {ses.is_bounce && (
                          <span className="text-rose-400">Bounce</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Visitor not found
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
