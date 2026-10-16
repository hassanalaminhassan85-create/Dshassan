import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Eye,
  Activity,
  Clock,
  ArrowUpRight,
  MousePointer,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Globe,
  Smartphone,
  Compass,
  Zap,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CrmOverviewKpis } from './types';

interface CrmOverviewViewProps {
  kpi: CrmOverviewKpis;
  trafficTrends: Array<{ date: string; visitors: number; pageViews: number; sessions: number; leads: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  trafficSources: Array<{ name: string; value: number }>;
  topPages: Array<{ path: string; views: number; uniqueVisitors: number }>;
  recentEvents: Array<any>;
  onNavigateTab: (tab: any) => void;
  formatDuration: (sec: number) => string;
}

const DEVICE_COLORS = ['#F59E0B', '#3B82F6', '#10B981'];

export const CrmOverviewView: React.FC<CrmOverviewViewProps> = ({
  kpi,
  trafficTrends,
  deviceBreakdown,
  trafficSources,
  topPages,
  recentEvents,
  onNavigateTab,
  formatDuration
}) => {
  return (
    <div className="space-y-6">
      {/* Group 1: High-Level Executive Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-amber-500/90 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            1. Real-Time Audience & Engagement Matrix
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Calculated from persistent visitor ledger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Visitors */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Total Visitors</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{kpi.totalVisitors.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-2.5 h-2.5" /> {kpi.uniqueVisitors} Unique
            </div>
          </div>

          {/* Card 2: Active Sessions */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Active Now</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{kpi.activeSessions}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {kpi.totalSessions} Total Sessions
            </div>
          </div>

          {/* Card 3: Returning Rate */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Returning Traffic</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{kpi.returningVisitors}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {kpi.totalVisitors > 0 ? Math.round((kpi.returningVisitors / kpi.totalVisitors) * 100) : 0}% Repeat Rate
            </div>
          </div>

          {/* Card 4: Total Page Views */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Page Views</span>
              <Eye className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{kpi.totalPageViews.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {kpi.avgPagesPerSession} Views / Session
            </div>
          </div>

          {/* Card 5: Avg Duration */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Avg Duration</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{formatDuration(kpi.avgDurationSeconds)}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Engagement Time
            </div>
          </div>

          {/* Card 6: Bounce Rate */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">Bounce Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{kpi.bounceRate}%</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Single-page sessions
            </div>
          </div>
        </div>
      </div>

      {/* Group 2: High-Value Business Calls-to-Action & Lead Generation KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-amber-500/90 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            2. Business Action & Lead Conversion Pipeline
          </h3>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Leads CRM <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <MousePointer className="w-3 h-3 text-amber-400" />
              <span>Button Clicks</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">{kpi.buttonClicks}</div>
            <span className="text-[9px] text-slate-500 font-mono">Tracked CTAs</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-left">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] mb-1">
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">{kpi.whatsappClicks}</div>
            <span className="text-[9px] text-slate-500 font-mono">Direct clicks</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/20 text-left">
            <div className="flex items-center gap-1.5 text-blue-400 text-[11px] mb-1">
              <Phone className="w-3 h-3" />
              <span>Telephone</span>
            </div>
            <div className="text-lg font-bold font-mono text-blue-400">{kpi.telephoneClicks}</div>
            <span className="text-[9px] text-slate-500 font-mono">Hotline dials</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/20 text-left">
            <div className="flex items-center gap-1.5 text-purple-400 text-[11px] mb-1">
              <Mail className="w-3 h-3" />
              <span>Email Clicks</span>
            </div>
            <div className="text-lg font-bold font-mono text-purple-400">{kpi.emailClicks}</div>
            <span className="text-[9px] text-slate-500 font-mono">Direct inquiries</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-left">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Form Starts</span>
            </div>
            <div className="text-lg font-bold font-mono text-white">{kpi.formStarts}</div>
            <span className="text-[9px] text-slate-500 font-mono">Input triggered</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 bg-emerald-950/10 text-left">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] mb-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Submitted</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">{kpi.formSubmissions}</div>
            <span className="text-[9px] text-slate-500 font-mono">Confirmed forms</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 bg-amber-950/10 text-left">
            <div className="flex items-center gap-1.5 text-amber-300 text-[11px] mb-1">
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>New Leads</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-400">{kpi.newLeads}</div>
            <span className="text-[9px] text-slate-400 font-mono">{kpi.conversionRate}% Conv Rate</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900 text-left">
            <div className="flex items-center gap-1.5 text-amber-200 text-[11px] mb-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Deals Won</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">{kpi.customersAcquired}</div>
            <span className="text-[9px] text-slate-400 font-mono">{kpi.qualifiedLeads} Qualified</span>
          </div>
        </div>
      </div>

      {/* Group 3: Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Website Traffic & Ingestion Velocity
              </h4>
              <p className="text-[11px] text-slate-400">Sessions, Pageviews & Leads by Date</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Visitors
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Page Views
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Leads
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {trafficTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" />
                  <Area type="monotone" dataKey="pageViews" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPv)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No telemetry recorded for this period yet
              </div>
            )}
          </div>
        </div>

        {/* Device & Traffic Sources (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
              Device Category Distribution
            </h4>
            <div className="h-36 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-xs font-mono pr-4 shrink-0">
                {deviceBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                    <span className="text-slate-300">{d.name}:</span>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-2">
              Traffic Source Acquisition
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {trafficSources.map((src) => {
                const total = trafficSources.reduce((a, b) => a + b.value, 0) || 1;
                const pct = Math.round((src.value / total) * 100);
                return (
                  <div key={src.name} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{src.name}</span>
                      <span className="text-amber-400 font-bold">{src.value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Group 4: Top Pages & Recent Interaction Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Pages Table (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Most Visited Pages & Content Interest
              </h4>
              <button
                onClick={() => onNavigateTab('pages')}
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                All Pages <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/5 pb-1">
                    <th className="py-1.5 font-medium">Page Route</th>
                    <th className="py-1.5 font-medium text-right">Views</th>
                    <th className="py-1.5 font-medium text-right">Unique Visitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {topPages.length > 0 ? (
                    topPages.map((page, idx) => (
                      <tr key={page.path} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 flex items-center gap-2">
                          <span className="text-[10px] text-amber-500 font-bold">#{idx + 1}</span>
                          <span className="font-semibold text-white">{page.path}</span>
                        </td>
                        <td className="py-2 text-right text-amber-400 font-bold">{page.views.toLocaleString()}</td>
                        <td className="py-2 text-right text-slate-400">{page.uniqueVisitors.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-500">
                        No page views recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Events Timeline (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Live Event Ingestion Stream
              </h4>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Event Explorer <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentEvents.length > 0 ? (
                recentEvents.map((evt) => {
                  const timeStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <div
                      key={evt.id}
                      className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="truncate max-w-[220px]">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-1.5 bg-amber-500/20 text-amber-300">
                          {evt.event_category}
                        </span>
                        <span className="text-slate-200">{evt.event_name}</span>
                        <div className="text-[10px] text-slate-500 truncate">{evt.path}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeStr}</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 font-mono text-xs">
                  Awaiting visitor interactions...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
