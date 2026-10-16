import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Radio,
  Users,
  Layers,
  Activity,
  FileText,
  Globe,
  UserCheck,
  Compass,
  TrendingUp,
  Download,
  ShieldCheck,
  ShieldAlert,
  Settings,
  RefreshCw,
  Menu,
  X,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from '../Logo';
import { CrmTab, CrmAuthUser, CrmOverviewKpis } from './types';
import { CrmOverviewView } from './CrmOverviewView';
import { CrmLiveVisitorsView } from './CrmLiveVisitorsView';
import { CrmVisitorsView } from './CrmVisitorsView';
import { CrmSessionsView } from './CrmSessionsView';
import { CrmEventsView } from './CrmEventsView';
import { CrmPagesView } from './CrmPagesView';
import { CrmGeoView } from './CrmGeoView';
import { CrmLeadsView } from './CrmLeadsView';
import { CrmCampaignsView } from './CrmCampaignsView';
import { CrmFunnelsView } from './CrmFunnelsView';
import { CrmReportsView } from './CrmReportsView';
import { CrmDiagnosticsView } from './CrmDiagnosticsView';
import { CrmAuditLogsView } from './CrmAuditLogsView';
import { CrmSettingsView } from './CrmSettingsView';
import { CrmVisitorDetailDrawer } from './CrmVisitorDetailDrawer';

interface CrmPortalProps {
  onBackToWebsite: () => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
}

const DEFAULT_CRM_USER: CrmAuthUser = {
  email: 'admin@dstechagency.com',
  name: 'DS Tech Systems Administrator',
  role: 'CRM_SUPERADMIN'
};

const DEFAULT_CRM_TOKEN = 'crm_direct_access';

export const CrmPortal: React.FC<CrmPortalProps> = ({
  onBackToWebsite,
  theme = 'dark',
  setTheme
}) => {
  // Direct Authorized State (No login gate needed)
  const [authToken] = useState<string>(DEFAULT_CRM_TOKEN);
  const [authUser] = useState<CrmAuthUser>(DEFAULT_CRM_USER);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<CrmTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Date Range Filter
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'all'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Overview Data Cache
  const [overviewData, setOverviewData] = useState<{
    kpi: CrmOverviewKpis;
    trafficTrends: any[];
    deviceBreakdown: any[];
    trafficSources: any[];
    topPages: any[];
    recentEvents: any[];
  } | null>(null);

  // Visitor Drawer State
  const [inspectVisitorId, setInspectVisitorId] = useState<string | null>(null);
  const [, setInspectLeadId] = useState<string | null>(null);

  // Load Overview Data when Overview Tab is active or date range changes
  const loadOverviewData = async () => {
    try {
      setIsRefreshing(true);
      setOverviewError(null);
      let startDate: string | undefined;
      const now = new Date();

      if (dateRange === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = start.toISOString();
      } else if (dateRange === 'yesterday') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        startDate = start.toISOString();
      } else if (dateRange === '7d') {
        const start = new Date(now.getTime() - 7 * 86400000);
        startDate = start.toISOString();
      } else if (dateRange === '30d') {
        const start = new Date(now.getTime() - 30 * 86400000);
        startDate = start.toISOString();
      }

      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout safety

      const res = await fetch(`/api/crm/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!res.ok) {
        throw new Error(`Server status ${res.status}: ${res.statusText}`);
      }

      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        setOverviewData(resJson.data);
      } else {
        throw new Error(resJson.error || 'Unable to retrieve telemetry overview from server');
      }
    } catch (err: any) {
      console.warn('Failed to load CRM overview data:', err);
      setOverviewError(err.name === 'AbortError' ? 'Request timed out after 10s. Please retry.' : (err.message || 'Error communicating with analytics engine'));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewData();
    }
  }, [activeTab, dateRange]);

  const formatDuration = (sec: number): string => {
    if (!sec || sec < 60) return `${sec || 0}s`;
    const mins = Math.floor(sec / 60);
    const remainSec = sec % 60;
    return remainSec > 0 ? `${mins}m ${remainSec}s` : `${mins}m`;
  };

  // Navigation Items Catalog (14 comprehensive sections)
  const navItems: Array<{ id: CrmTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'live', label: 'Live Visitors', icon: <Radio className="w-4 h-4 text-emerald-400" />, badge: 'Live' },
    { id: 'visitors', label: 'Visitors', icon: <Users className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Layers className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Activity className="w-4 h-4" /> },
    { id: 'pages', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
    { id: 'geo', label: 'Geographic Analytics', icon: <Globe className="w-4 h-4" /> },
    { id: 'leads', label: 'Leads', icon: <UserCheck className="w-4 h-4 text-amber-400" />, badge: 'CRM' },
    { id: 'campaigns', label: 'Campaigns', icon: <Compass className="w-4 h-4" /> },
    { id: 'funnels', label: 'Funnels', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <Download className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'Tracking Health', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'audit', label: 'Audit Logs', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  // ==========================================
  // Render Direct CRM Dashboard
  // ==========================================
  return (
    <div className="min-h-screen w-full bg-[#070A11] text-slate-100 flex font-mono selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Desktop Collapsible Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-white/10 bg-slate-950/90 z-20 shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Logo size="sm" showText={false} variant="light" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                DS Tech CRM
              </span>
              <span className="text-[10px] text-amber-400 font-mono tracking-widest block">
                VISITOR INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Return to Website Bottom */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{authUser.name}</span>
              <span className="text-[10px] text-amber-400 truncate block">{authUser.email}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" title="Connected" />
          </div>

          <button
            onClick={onBackToWebsite}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Website</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Dashboard Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between gap-3">
          {/* Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-white/10"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Telemetry Live
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Date Range, Refresh, Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Global Date Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
              {(['today', '7d', '30d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                    dateRange === r
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'today' ? 'Today' : r === '7d' ? '7D' : r === '30d' ? '30D' : 'All'}
                </button>
              ))}
            </div>

            <button
              onClick={loadOverviewData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {setTheme && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            )}

            <button
              onClick={onBackToWebsite}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Website</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            overviewError ? (
              <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center font-mono space-y-4 max-w-lg mx-auto my-12">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-sm">Failed to Load CRM Overview Data</div>
                <div className="text-slate-400 text-xs bg-slate-950/80 p-3 rounded-xl border border-white/5">{overviewError}</div>
                <button
                  onClick={loadOverviewData}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Overview Request</span>
                </button>
              </div>
            ) : overviewData ? (
              <CrmOverviewView
                kpi={overviewData.kpi}
                trafficTrends={overviewData.trafficTrends}
                deviceBreakdown={overviewData.deviceBreakdown}
                trafficSources={overviewData.trafficSources}
                topPages={overviewData.topPages}
                recentEvents={overviewData.recentEvents}
                onNavigateTab={(tab) => setActiveTab(tab)}
                formatDuration={formatDuration}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                  Loading Live Telemetry Intelligence...
                </span>
              </div>
            )
          )}

          {activeTab === 'live' && (
            <CrmLiveVisitorsView
              onSelectVisitor={(vid) => setInspectVisitorId(vid)}
              formatDuration={formatDuration}
              authToken={authToken}
            />
          )}

          {activeTab === 'visitors' && (
            <CrmVisitorsView
              onSelectVisitor={(vid) => setInspectVisitorId(vid)}
              authToken={authToken}
            />
          )}

          {activeTab === 'sessions' && (
            <CrmSessionsView
              onSelectVisitor={(vid) => setInspectVisitorId(vid)}
              formatDuration={formatDuration}
              authToken={authToken}
            />
          )}

          {activeTab === 'events' && (
            <CrmEventsView
              onSelectVisitor={(vid) => setInspectVisitorId(vid)}
              authToken={authToken}
            />
          )}

          {activeTab === 'pages' && (
            <CrmPagesView
              authToken={authToken}
              formatDuration={formatDuration}
            />
          )}

          {activeTab === 'geo' && (
            <CrmGeoView
              authToken={authToken}
            />
          )}

          {activeTab === 'leads' && (
            <CrmLeadsView
              authToken={authToken}
            />
          )}

          {activeTab === 'campaigns' && (
            <CrmCampaignsView
              authToken={authToken}
            />
          )}

          {activeTab === 'funnels' && (
            <CrmFunnelsView
              authToken={authToken}
            />
          )}

          {activeTab === 'reports' && (
            <CrmReportsView
              authToken={authToken}
            />
          )}

          {activeTab === 'diagnostics' && (
            <CrmDiagnosticsView
              authToken={authToken}
            />
          )}

          {activeTab === 'audit' && (
            <CrmAuditLogsView
              authToken={authToken}
            />
          )}

          {activeTab === 'settings' && (
            <CrmSettingsView
              authToken={authToken}
            />
          )}
        </main>
      </div>

      {/* 3. Global Visitor Detail Drawer */}
      <CrmVisitorDetailDrawer
        visitorId={inspectVisitorId}
        onClose={() => setInspectVisitorId(null)}
        authToken={authToken}
        onSelectLead={(leadId) => {
          setInspectVisitorId(null);
          setInspectLeadId(leadId);
          setActiveTab('leads');
        }}
        formatDuration={formatDuration}
      />

      {/* 4. Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 h-full bg-slate-950 border-r border-white/10 flex flex-col justify-between z-10 p-4 font-mono text-xs"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <Logo size="sm" showText={false} variant="light" />
                    <span className="font-bold text-white uppercase">DS TECH CRM</span>
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 rounded-lg bg-slate-900 text-slate-400"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                        activeTab === item.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  onClick={onBackToWebsite}
                  className="w-full py-2 rounded-xl bg-slate-900 text-slate-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>Return to Website</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
