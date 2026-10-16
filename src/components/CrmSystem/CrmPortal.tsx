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
  LogOut,
  Calendar,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Lock,
  ArrowLeft,
  Sparkles,
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

const CRM_TOKEN_KEY = 'dst_crm_auth_token';

export const CrmPortal: React.FC<CrmPortalProps> = ({
  onBackToWebsite,
  theme = 'dark',
  setTheme
}) => {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CRM_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [authUser, setAuthUser] = useState<CrmAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@dstechagency.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<CrmTab>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Date Range Filter
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'all'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const [inspectLeadId, setInspectLeadId] = useState<string | null>(null);

  // Verify Auth on mount
  useEffect(() => {
    if (authToken) {
      fetch('/api/crm/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setAuthUser(data.user);
          } else {
            // Expired or invalid token
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [authToken]);

  // Load Overview Data when Overview Tab is active or date range changes
  const loadOverviewData = async () => {
    if (!authToken) return;
    try {
      setIsRefreshing(true);
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

      const res = await fetch(`/api/crm/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        setOverviewData(resJson.data);
      }
    } catch (err) {
      console.warn('Failed to load CRM overview data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (authToken && activeTab === 'overview') {
      loadOverviewData();
    }
  }, [authToken, activeTab, dateRange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/crm/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setAuthToken(data.token);
        setAuthUser(data.user);
        try {
          localStorage.setItem(CRM_TOKEN_KEY, data.token);
        } catch {}
      } else {
        setLoginError(data.error || 'Invalid administrative credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication server connection error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/crm/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(() => {});
    }
    setAuthToken(null);
    setAuthUser(null);
    try {
      localStorage.removeItem(CRM_TOKEN_KEY);
    } catch {}
  };

  const formatDuration = (sec: number): string => {
    if (!sec || sec < 60) return `${sec || 0}s`;
    const mins = Math.floor(sec / 60);
    const remainSec = sec % 60;
    return remainSec > 0 ? `${mins}m ${remainSec}s` : `${mins}m`;
  };

  // Nav Items
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
  // Render Unauthenticated State (Login Guard)
  // ==========================================
  if (!authToken || !authUser) {
    return (
      <div className="min-h-screen w-full bg-[#070A11] text-slate-100 flex flex-col justify-between font-mono selection:bg-amber-500 selection:text-slate-950">
        {/* Top Minimal Bar */}
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} variant="light" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                DS Tech & Digital Marketing Agency
              </span>
              <span className="text-[10px] text-amber-500/90 tracking-widest uppercase">
                Enterprise Intelligence Core
              </span>
            </div>
          </div>

          <button
            onClick={onBackToWebsite}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Public Website</span>
          </button>
        </header>

        {/* Login Form Center Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden text-left"
          >
            {/* Subtle Gold Gradient Glow in background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-extrabold uppercase tracking-wide text-white">
                DS Tech CRM & Analytics
              </h1>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Enter authorized administrator credentials to access real-time visitor intelligence, lead funnels, and CRM records.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Administrator Email / Account
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@dstechagency.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Access Key / Passcode
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Dashboard Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/5 text-[10px] text-slate-500">
              Session is encrypted & protected under server-side token authorization.
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <footer className="p-4 text-center border-t border-white/5 text-[11px] text-slate-500">
          CAC RC No. 9550925 · DS Tech & Digital Marketing Agency Limited · Protected CRM Environment
        </footer>
      </div>
    );
  }

  // ==========================================
  // Render Authenticated CRM Dashboard
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
                DS TECH CRM
              </span>
              <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase block">
                Visitor Intelligence
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
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

        {/* User Card & Logout Bottom */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{authUser.name}</span>
              <span className="text-[10px] text-amber-400 truncate block">{authUser.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 cursor-pointer transition-colors"
              title="Logout from CRM"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'overview' && overviewData && (
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
              onSelectLeadId={inspectLeadId}
              onClearSelectedLead={() => setInspectLeadId(null)}
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
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl bg-slate-900 text-rose-400 font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
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
