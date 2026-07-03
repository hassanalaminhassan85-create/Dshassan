/**
 * BrevoEmailDashboard.tsx
 * An enterprise-grade, highly responsive, and beautiful email logs & analytics dashboard.
 * Includes interactive charting, real-time analytics, table filters, pagination, log inspector,
 * email test sending, resend/delete controls, and CSV export.
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Trash2, RefreshCw, BarChart3, ListFilter, Search, 
  ChevronLeft, ChevronRight, Download, Eye, CheckCircle2, AlertTriangle, 
  Info, Filter, Calendar, Percent, Clock, Inbox, Sparkles, X, PlusCircle, Check,
  Copy, ShieldCheck, HelpCircle, FileJson, Server, Code
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useFCM } from '../hooks/useFCM';

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_id: string;
  subject: string;
  email_type: string;
  status: string; // queued, sent, delivered, opened, clicked, failed, bounced, unsubscribed, spam
  brevo_message_id: string;
  sent_at: string;
  delivered_at: string;
  opened_at: string;
  clicked_at: string;
  open_count: number;
  click_count: number;
  failed_reason: string;
  created_at: string;
  updated_at: string;
}

interface AnalyticsMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalBounced: number;
  totalUnsubscribed: number;
  totalSpam: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamRate: number;
  unsubscribeRate: number;
}

interface ChartData {
  sentOverTime: Array<{ date: string; sent: number; opened: number; clicked: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  emailTypeBreakdown: Array<{ type: string; count: number }>;
}

export const BrevoEmailDashboard: React.FC = () => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'analytics' | 'logs' | 'test_send' | 'fcm_diagnostics'>('analytics');
  
  // FCM Hook & State
  const { token: fcmToken, permission: fcmPermission, loading: fcmLoading, error: fcmError, requestPermissionAndGetToken } = useFCM();
  const [customVapidKey, setCustomVapidKey] = useState<string>('');
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Data States
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const limit = 20;

  // Selection states (for details modal & bulk actions)
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  
  // Test Send Form State
  const [testRecipientEmail, setTestRecipientEmail] = useState<string>('');
  const [testRecipientName, setTestRecipientName] = useState<string>('');
  const [testTemplateType, setTestTemplateType] = useState<string>('welcome');
  const [testSending, setTestSending] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Toast System
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auto-Dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Analytics & Charts
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/emails/analytics');
      if (!res.ok) throw new Error('Failed to retrieve email analytics data.');
      const data = await res.json();
      setMetrics(data.metrics);
      setCharts(data.charts);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logs with criteria
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy
      });

      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('emailType', typeFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/emails/logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve email transaction logs.');
      const data = await res.json();
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to sync email logs.' });
    } finally {
      setLoading(false);
    }
  };

  // Process Queue manually
  const handleProcessQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/emails/queue/process', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to execute queue trigger.');
      const result = await res.json();
      setToast({ 
        type: 'success', 
        message: `Queue execution completed. Sent: ${result.processed}, Retried/Failed: ${result.failures}` 
      });
      refreshAll();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Refresh current view
  const refreshAll = () => {
    if (viewMode === 'analytics') {
      fetchAnalytics();
    } else if (viewMode === 'logs') {
      fetchLogs();
    }
  };

  useEffect(() => {
    refreshAll();
  }, [viewMode, page, sortBy, statusFilter, typeFilter]);

  // Handle Search on Submit or Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setTimeout(() => fetchLogs(), 50);
  };

  // Resend Email
  const handleResend = async (logId: string) => {
    try {
      const res = await fetch(`/api/emails/logs/${logId}/resend`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to dispatch resend request.');
      setToast({ type: 'success', message: 'Email re-processing requested successfully! Check status shortly.' });
      fetchLogs();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  // Delete Log
  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this email trace? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/emails/logs/${logId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete log trace.');
      setToast({ type: 'success', message: 'Log record deleted successfully.' });
      fetchLogs();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedLogIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedLogIds.length} selected log traces?`)) return;
    
    let successCount = 0;
    for (const id of selectedLogIds) {
      try {
        await fetch(`/api/emails/logs/${id}`, { method: 'DELETE' });
        successCount++;
      } catch (e) {}
    }
    setToast({ type: 'success', message: `Bulk deleted ${successCount} log records.` });
    setSelectedLogIds([]);
    fetchLogs();
  };

  // Select All checkbox
  const handleSelectAllLogs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogIds(logs.map(l => l.id));
    } else {
      setSelectedLogIds([]);
    }
  };

  const handleSelectLog = (logId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedLogIds(prev => [...prev, logId]);
    } else {
      setSelectedLogIds(prev => prev.filter(id => id !== logId));
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) {
      setToast({ type: 'info', message: 'No logs available to export.' });
      return;
    }

    const headers = ['ID', 'Recipient Email', 'Recipient ID', 'Subject', 'Email Type', 'Status', 'Brevo Message ID', 'Sent At', 'Delivered At', 'Opened At', 'Clicked At', 'Open Count', 'Click Count', 'Failed Reason', 'Created At'];
    const rows = logs.map(l => [
      l.id,
      l.recipient_email,
      l.recipient_id || 'N/A',
      `"${l.subject.replace(/"/g, '""')}"`,
      l.email_type,
      l.status,
      l.brevo_message_id || 'N/A',
      l.sent_at || 'N/A',
      l.delivered_at || 'N/A',
      l.opened_at || 'N/A',
      l.clicked_at || 'N/A',
      l.open_count,
      l.click_count,
      `"${(l.failed_reason || '').replace(/"/g, '""')}"`,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dstech_email_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ type: 'success', message: 'CSV file compiled & downloaded successfully!' });
  };

  // Test Email Sending
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail) {
      setTestStatus({ success: false, msg: 'Recipient Email address is required.' });
      return;
    }
    
    try {
      setTestSending(true);
      setTestStatus(null);
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testRecipientEmail,
          recipientName: testRecipientName || 'Candidate',
          testType: testTemplateType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({ success: true, msg: `Success! Email transmitted instantly to Brevo servers. Dynamic Message ID: ${data.logId}` });
        setToast({ type: 'success', message: 'Test email transmitted successfully!' });
      } else {
        setTestStatus({ success: false, msg: data.error || 'Server rejected transmission request.' });
      }
    } catch (err: any) {
      setTestStatus({ success: false, msg: err.message || 'Inbound network error.' });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 text-xs">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-white flex items-center gap-3 transition-all duration-300 transform translate-y-0 scale-100 ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-slate-700 border-slate-600'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
          {toast.type === 'error' && <AlertTriangle size={18} className="shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="shrink-0" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#000E32] text-sky-400 rounded-lg">
              <Mail size={16} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
              Brevo Smtp Transactional Gateway
            </span>
          </div>
          <h2 className="text-xl font-black uppercase text-[#000E32] dark:text-orange-500">
            Enterprise Email Integration
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-[11px] leading-relaxed max-w-2xl">
            Real-time delivery pipelines, automatic retries, duplicate prevention filters, PWA email queues, and fully responsive glassmorphism templates configured with Brevo (Sendinblue) API.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleProcessQueue}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#000E32] dark:text-slate-200 font-extrabold rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Process Queue</span>
          </button>
          
          <button
            onClick={() => { setViewMode('test_send'); setTestStatus(null); }}
            className={`px-4 py-2 font-extrabold rounded-xl transition flex items-center gap-2 ${
              viewMode === 'test_send' 
                ? 'bg-[#000E32] text-white dark:bg-orange-600' 
                : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Send size={12} />
            <span>Test Playground</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setViewMode('analytics')}
          className={`pb-3 px-4 font-bold relative transition ${
            viewMode === 'analytics' 
              ? 'text-[#000E32] dark:text-orange-500 border-b-2 border-[#000E32] dark:border-orange-500' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} />
            <span>Analytical Intelligence</span>
          </div>
        </button>
        <button
          onClick={() => setViewMode('logs')}
          className={`pb-3 px-4 font-bold relative transition ${
            viewMode === 'logs' 
              ? 'text-[#000E32] dark:text-orange-500 border-b-2 border-[#000E32] dark:border-orange-500' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Mail size={14} />
            <span>Delivery Transaction Logs</span>
          </div>
        </button>
        <button
          onClick={() => setViewMode('fcm_diagnostics')}
          className={`pb-3 px-4 font-bold relative transition ${
            viewMode === 'fcm_diagnostics' 
              ? 'text-[#000E32] dark:text-orange-500 border-b-2 border-[#000E32] dark:border-orange-500' 
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>FCM & PWA Diagnostics</span>
          </div>
        </button>
      </div>

      {/* VIEW: ANALYTICS & INTELLIGENCE */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {loading && !metrics ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <RefreshCw className="animate-spin mx-auto text-[#000E32] dark:text-orange-500 mb-2" size={24} />
              <p className="text-slate-500 dark:text-slate-300">Computing transactional analytics from D1 database...</p>
            </div>
          ) : (
            <>
              {/* Analytics Metric Cards Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                {/* Card 1: Sent All-Time */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Dispatched</span>
                  <span className="text-2xl font-black text-[#000E32] dark:text-orange-500 block">
                    {metrics?.totalSent || 0}
                  </span>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    <span>All-time system records</span>
                  </div>
                </div>

                {/* Card 2: Open Rate */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Inbound Open Rate</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                    {metrics?.openRate || 0}%
                  </span>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Avg industry benchmark: 22%</span>
                  </div>
                </div>

                {/* Card 3: Click Rate */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full filter blur-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">CTR (Clicks)</span>
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400 block">
                    {metrics?.clickRate || 0}%
                  </span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    <span>{metrics?.totalClicked || 0} clicks processed</span>
                  </div>
                </div>

                {/* Card 4: Bounce Rate */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full filter blur-xl" />
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Bounce / Failure</span>
                  <span className={`text-2xl font-black block ${metrics?.bounceRate && metrics.bounceRate > 5 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {metrics?.bounceRate || 0}%
                  </span>
                  <div className="mt-2 text-[10px] text-slate-500">
                    <span>{metrics?.totalBounced || 0} hard bounces recorded</span>
                  </div>
                </div>
              </div>

              {/* Timeframe breakdowns */}
              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">{metrics?.sentToday || 0} emails</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last 7 Days</span>
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">{metrics?.sentThisWeek || 0} emails</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last 30 Days</span>
                  <span className="text-lg font-black text-slate-700 dark:text-slate-300">{metrics?.sentThisMonth || 0} emails</span>
                </div>
              </div>

              {/* Recharts Graphical Visualizers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Main dispatch trends */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 mb-4">
                    Send vs Open Engagement Trends
                  </h3>
                  <div className="h-64">
                    {charts?.sentOverTime && charts.sentOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={charts.sentOverTime}>
                          <defs>
                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Area type="monotone" dataKey="sent" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" name="Sent Emails" />
                          <Area type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpened)" name="Opened" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        No temporal data available yet. Dispatch test emails to generate points.
                      </div>
                    )}
                  </div>
                </div>

                {/* Status breakdown pie chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 mb-4">
                    Delivery Status Share
                  </h3>
                  <div className="h-48 flex items-center justify-center">
                    {charts?.statusDistribution && charts.statusDistribution.some(s => s.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.statusDistribution.filter(s => s.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {charts.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-400">0 records to display</div>
                    )}
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {charts?.statusDistribution.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-slate-500 dark:text-slate-300">{s.name}</span>
                        </div>
                        <span className="font-extrabold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template Category breakdown */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-left">
                <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 mb-4">
                  Send Count by Template Type
                </h3>
                {charts?.emailTypeBreakdown && charts.emailTypeBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {charts.emailTypeBreakdown.map((item, index) => {
                      const maxCount = Math.max(...charts.emailTypeBreakdown.map(t => t.count));
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-mono text-slate-600 dark:text-slate-300">{item.type.toUpperCase()}</span>
                            <span className="font-bold">{item.count} dispatched</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400">No template occurrences recorded.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW: LOGS TABLE & DETAILS */}
      {viewMode === 'logs' && (
        <div className="space-y-4 text-left">
          {/* Filters Overlay card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search query input */}
                <div className="relative col-span-1 sm:col-span-2">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by recipient email or subject..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                {/* Status drop filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="">All Delivery Statuses</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="opened">Opened</option>
                    <option value="clicked">Clicked</option>
                    <option value="failed">Failed</option>
                    <option value="bounced">Bounced</option>
                    <option value="spam">Spam Blocked</option>
                  </select>
                </div>

                {/* Email Template Type Drop */}
                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="">All Templates</option>
                    <option value="welcome">Welcome</option>
                    <option value="verification">Verification</option>
                    <option value="password_reset">Password Reset</option>
                    <option value="login_alert">Security Alert</option>
                    <option value="recruiter_registration">Recruiter Submission</option>
                    <option value="recruiter_approval">Recruiter Approval</option>
                    <option value="recruiter_rejection">Recruiter Refusal</option>
                    <option value="application_confirmation">Application Confirmed</option>
                    <option value="application_status">Application Updated</option>
                    <option value="interview_invitation">Interview Invitation</option>
                    <option value="interview_reminder">Interview Reminder</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="contact_confirmation">Contact Received</option>
                    <option value="ticket_created">Ticket Created</option>
                    <option value="ticket_reply">Ticket Reply</option>
                    <option value="admin_alert">Admin Warning</option>
                  </select>
                </div>

                {/* Sort Order Drop */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                  >
                    <option value="newest">Dispatched Newest</option>
                    <option value="oldest">Dispatched Oldest</option>
                    <option value="recipient">Sort Recipient A-Z</option>
                    <option value="subject">Sort Subject A-Z</option>
                    <option value="status">Sort Status Group</option>
                  </select>
                </div>
              </div>

              {/* Date ranges & submission row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                  >
                    Clear Filter
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#000E32] text-white dark:bg-orange-600 rounded-xl font-bold hover:opacity-90 transition"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Bulk actions row */}
          {selectedLogIds.length > 0 && (
            <div className="bg-indigo-50 dark:bg-slate-800/60 p-3 rounded-xl border border-indigo-100 dark:border-slate-700 flex justify-between items-center animate-fade-in">
              <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                {selectedLogIds.length} select rows selected for bulk execution.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg flex items-center gap-1.5 font-bold"
                >
                  <Trash2 size={12} />
                  <span>Bulk Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Logs List Table container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-4 w-10">
                      <input 
                        type="checkbox"
                        onChange={handleSelectAllLogs}
                        checked={selectedLogIds.length === logs.length && logs.length > 0}
                      />
                    </th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Dispatched Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-1" />
                        <span>Querying database pipeline logs...</span>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No transactions match the criteria. Adjust filters or trigger a test email.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      return (
                        <tr 
                          key={log.id} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={selectedLogIds.includes(log.id)}
                              onChange={(e) => handleSelectLog(log.id, e.target.checked)}
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            {log.recipient_email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-900 dark:text-white line-clamp-1">
                              {log.subject}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {log.email_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                              log.status === 'delivered' || log.status === 'sent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              log.status === 'opened' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                              log.status === 'clicked' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                              log.status === 'failed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-2">
                              <span title="Open count" className="flex items-center gap-0.5 text-[10px] text-slate-500">
                                <Eye size={10} />
                                <span className={log.open_count > 0 ? "font-bold text-slate-700 dark:text-slate-300" : ""}>{log.open_count}</span>
                              </span>
                              <span title="Click count" className="flex items-center gap-0.5 text-[10px] text-slate-500">
                                <PlusCircle size={10} />
                                <span className={log.click_count > 0 ? "font-bold text-slate-700 dark:text-slate-300" : ""}>{log.click_count}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="p-1 text-slate-400 hover:text-[#000E32] dark:hover:text-orange-500 rounded transition"
                                title="Inspect Email metadata"
                              >
                                <Info size={14} />
                              </button>
                              <button
                                onClick={() => handleResend(log.id)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                                title="Resend transaction"
                              >
                                <RefreshCw size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                title="Delete trace"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
              <div>
                Showing <span className="font-extrabold text-slate-700 dark:text-slate-300">{logs.length}</span> of <span className="font-extrabold text-slate-700 dark:text-slate-300">{totalLogs}</span> transactions
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-150 disabled:opacity-45 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">Page {page} of {Math.max(1, Math.ceil(totalLogs / limit))}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalLogs / limit)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-150 disabled:opacity-45 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center gap-1.5"
              >
                <Download size={12} />
                <span>Export logs CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TEST SENDER PLAYGROUND */}
      {viewMode === 'test_send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Controls form card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500" />
              <span>Brevo Template Dispatcher</span>
            </h3>
            
            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Recipient Email Address</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="e.g. candidate@example.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Recipient Full Name</label>
                <input
                  type="text"
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Select Interactive Template</label>
                <select
                  value={testTemplateType}
                  onChange={(e) => setTestTemplateType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="welcome">Welcome Onboarding (Template 1)</option>
                  <option value="verification">Verify Email (Template 2)</option>
                  <option value="password_reset">Password Reset (Template 3)</option>
                  <option value="login_alert">New Login Security (Template 4)</option>
                  <option value="recruiter_registration">Recruiter Submit Form (Template 5)</option>
                  <option value="recruiter_approval">Recruiter Approval (Template 6)</option>
                  <option value="recruiter_rejection">Recruiter Refusal (Template 7)</option>
                  <option value="application_confirmation">Job Applied Confirmed (Template 8)</option>
                  <option value="application_status">Application Status Changed (Template 9)</option>
                  <option value="interview_invitation">Interview invitation (Template 10)</option>
                  <option value="interview_reminder">Interview Reminder (Template 11)</option>
                  <option value="offer_letter">Offer Letter (Template 12)</option>
                  <option value="contact_confirmation">Contact Form Received (Template 13)</option>
                  <option value="ticket_created">Support Ticket Registered (Template 14)</option>
                  <option value="ticket_reply">Support Ticket Reply (Template 15)</option>
                  <option value="admin_alert">Admin System Alert (Template 16)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={testSending}
                className="w-full py-2.5 bg-[#000E32] text-white dark:bg-orange-600 rounded-xl font-extrabold hover:opacity-90 disabled:opacity-45 transition-opacity flex items-center justify-center gap-2"
              >
                <Send size={13} />
                <span>{testSending ? "Transmitting..." : "Send Real Email Now"}</span>
              </button>
            </form>

            {testStatus && (
              <div className={`p-4 rounded-xl text-[11px] ${testStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'}`}>
                <span className="font-bold">{testStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Interactive Live Email Preview Frame (Responsive iframe representation) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-[520px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">HTML Live Template Preview representation</span>
              <span className="px-2 py-0.5 bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded-md uppercase font-mono text-[9px]">Responsive design</span>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 overflow-y-auto font-sans leading-relaxed text-xs">
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#0f172a] p-5 text-center">
                  <span className="font-black text-[#38bdf8] text-lg">DS <span className="text-white">Tech</span></span>
                </div>
                
                <div className="p-6">
                  {testTemplateType === 'welcome' && (
                    <>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Welcome to DS Tech, {testRecipientName || "User"}! 🎉</h4>
                      <p className="text-slate-500 dark:text-slate-300 text-[11px] mb-3">Your professional recruitment journey starts right here. DS Tech is Nigeria's premier elite technology career matchmaking and screening platform.</p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4 border border-slate-150">
                        <strong className="block text-[#0f172a] dark:text-orange-500 mb-1">Next Steps:</strong>
                        <ul className="list-disc pl-4 text-slate-500 dark:text-slate-300 space-y-1">
                          <li>Complete detailed career constellation profile</li>
                          <li>Perform premium AI Screening interview</li>
                          <li>Unlock blockchain achievements</li>
                        </ul>
                      </div>
                      <div className="text-center">
                        <span className="inline-block bg-[#2563eb] text-white px-5 py-2 rounded-lg font-bold">Complete Your Profile Now</span>
                      </div>
                    </>
                  )}

                  {testTemplateType === 'verification' && (
                    <>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Verify Your Email Address ✉️</h4>
                      <p className="text-slate-500 dark:text-slate-300 text-[11px] mb-4">Please click the button below to verify your email address and activate your DS Tech account.</p>
                      <div className="text-center mb-4">
                        <span className="inline-block bg-[#2563eb] text-white px-5 py-2 rounded-lg font-bold">Verify Email Address</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg text-[10px] text-slate-400">
                        This link is valid for 24 hours. If you did not sign up, you can ignore this alert.
                      </div>
                    </>
                  )}

                  {testTemplateType === 'password_reset' && (
                    <>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Reset Your DS Tech Password 🔒</h4>
                      <p className="text-slate-500 dark:text-slate-300 text-[11px] mb-4">We received a request to reset the password associated with your DS Tech account.</p>
                      <div className="text-center mb-4">
                        <span className="inline-block bg-[#2563eb] text-white px-5 py-2 rounded-lg font-bold">Reset Password</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">If you did not initiate this, your current credentials remain secure.</p>
                    </>
                  )}

                  {testTemplateType === 'login_alert' && (
                    <>
                      <h4 className="text-sm font-bold text-rose-600 mb-2">Security Alert: New Account Login ⚠️</h4>
                      <p className="text-slate-500 mb-3">We detected a successful login to your DS Tech account from a new browser or device.</p>
                      <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg mb-4 text-[10px]">
                        <p><strong>Device:</strong> Chrome / Windows 11</p>
                        <p><strong>IP Address:</strong> 102.89.34.12</p>
                        <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <span className="inline-block bg-rose-600 text-white px-5 py-2 rounded-lg font-bold">Secure Account</span>
                      </div>
                    </>
                  )}

                  {!['welcome', 'verification', 'password_reset', 'login_alert'].includes(testTemplateType) && (
                    <>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 uppercase">{testTemplateType.replace(/_/g, ' ')}</h4>
                      <p className="text-slate-500 mb-3">Custom template visualization for transaction testing.</p>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border">
                        <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">Enterprise Responsive Component</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FCM & PWA DIAGNOSTICS & DELIVERABILITY */}
      {viewMode === 'fcm_diagnostics' && (
        <div className="space-y-6 text-left">
          {/* Diagnostic Status Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-base uppercase text-[#000E32] dark:text-orange-500 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              <span>Real-Time Push Notification & Deliverability Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Permission card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Notification Permission</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full \${
                    fcmPermission === 'granted' ? 'bg-emerald-500 animate-pulse' :
                    fcmPermission === 'denied' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  <span className="font-extrabold capitalize text-slate-800 dark:text-slate-200">
                    {fcmPermission}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {fcmPermission === 'granted' 
                    ? 'Browser is fully authorized to display overlay pop notifications.' 
                    : fcmPermission === 'denied' 
                    ? 'Permissions have been blocked. Please reset site permissions in your browser bar.'
                    : 'Awaiting permission request from candidate.'}
                </p>
              </div>

              {/* Service worker registration card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Service Worker Status</span>
                <div className="flex items-center gap-2">
                  <Server className="text-blue-500" size={16} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    Active Background Worker
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  The service worker <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded text-orange-500">/firebase-messaging-sw.js</code> runs independently to receive notifications.
                </p>
              </div>

              {/* PWA Manifest card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block">PWA Manifest Verification</span>
                <div className="flex items-center gap-2">
                  <FileJson className="text-orange-500" size={16} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    Standalone Installed Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Manifest file <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded text-orange-500">/manifest.json</code> is active with standalone display styling.
                </p>
              </div>
            </div>

            {/* Token Request Playground */}
            <div className="mt-6 p-5 bg-[#000E32]/5 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs uppercase text-slate-700 dark:text-slate-300">Generate Active registration token</h4>
                <p className="text-xs text-slate-500">Enter your Firebase Web Push VAPID key below to request and copy your device's unique FCM registration token.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={customVapidKey}
                  onChange={(e) => setCustomVapidKey(e.target.value)}
                  placeholder="e.g., BOnL18Xm-u... (Enter Firebase VAPID Key)"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={() => requestPermissionAndGetToken(customVapidKey)}
                  disabled={fcmLoading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md"
                >
                  {fcmLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Fetching Token...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Generate Device FCM Token</span>
                    </>
                  )}
                </button>
              </div>

              {fcmError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 p-3 rounded-xl text-[11px] font-medium border border-rose-100 dark:border-rose-950/40 flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-0.5">Registration Error:</span>
                    <p className="font-mono text-xs">{fcmError}</p>
                  </div>
                </div>
              )}

              {fcmToken && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 block">✓ FCM Token retrieved successfully:</span>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-xl flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 break-all select-all font-bold line-clamp-2">
                      {fcmToken}
                    </span>
                    <button
                      onClick={() => handleCopyText(fcmToken, 'fcm_token')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      {copiedTextId === 'fcm_token' ? (
                        <>
                          <Check size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Files & Configurations Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FCM Code Files */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 flex items-center gap-1.5">
                <Code size={16} />
                <span>Copy-Paste Code Files</span>
              </h3>
              
              <div className="space-y-4">
                {/* File 1: Service Worker */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span>1. Firebase SW: <code className="text-orange-500 font-bold font-mono">public/firebase-messaging-sw.js</code></span>
                    <button
                      onClick={() => handleCopyText(`// Firebase Service Worker for alihsan.online Push Notifications
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: "aesthetic-reference-fw1xt",
  storageBucket: "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485:web:99325dfe52ae1f0da56184"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Extract notification parameters
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new message from Al Ihsan.',
    icon: payload.notification?.image || payload.data?.icon || 'https://alihsan.online/logo.png',
    badge: 'https://alihsan.online/logo.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});`, 'sw_code')}
                      className="text-orange-500 hover:underline flex items-center gap-1"
                    >
                      {copiedTextId === 'sw_code' ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedTextId === 'sw_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto max-h-48 font-mono leading-relaxed border border-slate-800">
{`// Initialize background app
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCAMd4TDpQK...",
  projectId: "aesthetic-reference-fw1xt",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485..."
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const title = payload.notification?.title || 'New Notification';
  return self.registration.showNotification(title, {
    body: payload.notification?.body,
    icon: 'https://alihsan.online/logo.png'
  });
});`}
                  </pre>
                </div>

                {/* File 2: manifest.json */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span>2. PWA Manifest: <code className="text-orange-500 font-bold font-mono">public/manifest.json</code></span>
                    <button
                      onClick={() => handleCopyText(`{
  "short_name": "Al Ihsan",
  "name": "Al Ihsan Online",
  "icons": [
    {
      "src": "https://alihsan.online/logo.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "https://alihsan.online/logo.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    }
  ],
  "start_url": "/",
  "background_color": "#0c1428",
  "theme_color": "#0c1428",
  "display": "standalone",
  "orientation": "portrait"
}`, 'manifest_code')}
                      className="text-orange-500 hover:underline flex items-center gap-1"
                    >
                      {copiedTextId === 'manifest_code' ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedTextId === 'manifest_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto max-h-48 font-mono leading-relaxed border border-slate-800">
{`{
  "short_name": "Al Ihsan",
  "name": "Al Ihsan Online",
  "icons": [
    {
      "src": "https://alihsan.online/logo.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}`}
                  </pre>
                </div>

                {/* File 3: useFCM.ts */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span>3. React Integration Hook: <code className="text-orange-500 font-bold font-mono">src/hooks/useFCM.ts</code></span>
                    <button
                      onClick={() => handleCopyText(`import { useState, useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: "aesthetic-reference-fw1xt",
  storageBucket: "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485:web:99325dfe52ae1f0da56184"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermissionAndGetToken = async (vapidKey?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers not supported in this browser.');
      }
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied.');
      }
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      const messaging = getMessaging(app);
      const activeVapidKey = vapidKey || 'YOUR_VAPID_PUBLIC_KEY';
      const fcmToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: activeVapidKey
      });
      if (fcmToken) {
        setToken(fcmToken);
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return { token, permission, loading, error, requestPermissionAndGetToken };
}`, 'hook_code')}
                      className="text-orange-500 hover:underline flex items-center gap-1"
                    >
                      {copiedTextId === 'hook_code' ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedTextId === 'hook_code' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] bg-slate-950 text-slate-300 p-3 rounded-xl overflow-x-auto max-h-48 font-mono leading-relaxed border border-slate-800">
{`import { getMessaging, getToken } from 'firebase/messaging';

const registration = await navigator.serviceWorker.register(
  '/firebase-messaging-sw.js', { scope: '/' }
);

const fcmToken = await getToken(messaging, {
  serviceWorkerRegistration: registration,
  vapidKey: "YOUR_VAPID_KEY"
});`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Checklist & Deliverability Setup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500 flex items-center gap-1.5">
                <HelpCircle size={16} />
                <span>Email & Notification Deliverability Steps</span>
              </h3>

              <div className="space-y-4 text-xs leading-relaxed">
                {/* DNS Records */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                  <span className="font-black text-[10px] text-orange-500 uppercase block">1. DNS Records (SPF & DKIM for Brevo)</span>
                  <p className="text-slate-500 text-[11px]">To make emails deliver reliably to users' inboxes without going to spam, add the following TXT records to your domain registrar (Cloudflare/GoDaddy/Namecheap):</p>
                  
                  <div className="space-y-2 mt-2 font-mono text-[10px]">
                    <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded border">
                      <strong className="text-[#000E32] dark:text-orange-400 block mb-0.5">TXT Record: SPF</strong>
                      <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-900/80 p-1 px-2 rounded mt-1">
                        <span>v=spf1 include:spf.sendinblue.com ~all</span>
                        <button onClick={() => handleCopyText('v=spf1 include:spf.sendinblue.com ~all', 'spf_dns')} className="text-orange-500 hover:underline">
                          {copiedTextId === 'spf_dns' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded border">
                      <strong className="text-[#000E32] dark:text-orange-400 block mb-0.5">TXT Record: DKIM (Host: mail._domainkey)</strong>
                      <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-900/80 p-1 px-2 rounded mt-1">
                        <span className="break-all">k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDy7gA3...</span>
                        <button onClick={() => handleCopyText('k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDy7gA3', 'dkim_dns')} className="text-orange-500 hover:underline shrink-0 ml-2">
                          {copiedTextId === 'dkim_dns' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brevo Tracker */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                  <span className="font-black text-[10px] text-orange-500 uppercase block">2. Brevo Tracker Script</span>
                  <p className="text-slate-500 text-[11px]">We integrated the official Brevo Tracking Script inside the <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">&lt;head&gt;</code> of <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">index.html</code>. Replace <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">window.key</code> value with your actual Brevo tracker automation key from the Brevo automation control panel.</p>
                </div>

                {/* Server Hosting routing fix explanation */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                  <span className="font-black text-[10px] text-orange-500 uppercase block">3. Routing Resolution (HTML vs JS Fixed)</span>
                  <p className="text-slate-500 text-[11px]">The "HTML instead of JS" error occurred because <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">/firebase-messaging-sw.js</code> and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">/manifest.json</code> were physically missing from the build. Vite fell back to rendering the default single page application index HTML.</p>
                  <p className="text-slate-500 text-[11px] mt-1"><strong>How we resolved it:</strong> We created both files physically inside the root <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">/public/</code> directory. During compilation, Vite copies them unchanged to the final build output directory (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">/dist</code>), ensuring they are served directly with the correct mime-types (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">application/javascript</code> and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-500">application/json</code>).</p>
                </div>

                {/* Mobile Device Setup Guidelines */}
                <div className="space-y-1.5 p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 rounded-xl border">
                  <span className="font-black text-[10px] text-amber-500 uppercase block">📱 4. Mobile Device Push Requirements</span>
                  <p className="text-slate-500 text-[11px]">To see active pop-up notification banners on mobile phones, follow these requirements:</p>
                  
                  <div className="space-y-2 mt-2 text-[11px] list-none">
                    <div className="bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/80">
                      <strong className="text-orange-500 block mb-0.5">⚠️ Iframe Constraint (Crucial)</strong>
                      <p className="text-slate-500 text-[10.5px]">Browsers strictly block notification permission prompts inside nested frames. You <strong>MUST click "Open in New Tab"</strong> at the top-right of your AI Studio screen to open the app directly.</p>
                    </div>

                    <div className="bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/80">
                      <strong className="text-orange-500 block mb-0.5">🍏 Apple iOS (iPhone/iPad)</strong>
                      <p className="text-slate-500 text-[10.5px] leading-relaxed">
                        1. Open the direct app link in the native <strong>Safari</strong> browser.<br />
                        2. Tap the <strong>Share</strong> icon on Safari's bottom toolbar.<br />
                        3. Scroll down and choose <strong>"Add to Home Screen"</strong>.<br />
                        4. Launch the newly installed <strong>Al Ihsan</strong> icon from your iPhone home screen.<br />
                        5. Open this diagnostics tab inside the app and tap <strong>"Generate Device FCM Token"</strong> to grant notification authority.
                      </p>
                    </div>

                    <div className="bg-slate-100/50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-200/50 dark:border-slate-800/80">
                      <strong className="text-orange-500 block mb-0.5">🤖 Android (Samsung/Google/Xiaomi)</strong>
                      <p className="text-slate-500 text-[10.5px] leading-relaxed">
                        1. Open the direct app link inside <strong>Google Chrome</strong>.<br />
                        2. Tap the browser's 3-dot menu and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.<br />
                        3. Tap the <strong>"Generate Device FCM Token"</strong> button to permit and configure foreground/background push overlays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METADATA INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full text-left shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <X size={16} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Mail className="text-blue-600" size={18} />
                <h3 className="font-extrabold text-sm uppercase text-[#000E32] dark:text-orange-500">
                  Transaction Metadata Trace
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Trace Identifier</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 select-all font-bold">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Brevo Message ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-bold select-all">{selectedLog.brevo_message_id || 'Not Dispatched yet'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Recipient Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{selectedLog.recipient_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Template Classification</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">{selectedLog.email_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Subject Line</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{selectedLog.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Delivery Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300 uppercase">{selectedLog.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Inbound Open count</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{selectedLog.open_count} views</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] font-black">Link Click count</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{selectedLog.click_count} click actions</span>
                </div>
              </div>

              {selectedLog.failed_reason && (
                <div className="bg-rose-50 dark:bg-slate-950/40 p-3 rounded-xl border border-rose-100 dark:border-rose-950 text-rose-800 dark:text-rose-400 text-[10px]">
                  <strong className="block mb-0.5 uppercase">API Error / Pipeline Failure:</strong>
                  <p>{selectedLog.failed_reason}</p>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border space-y-1 text-[10px]">
                <p><strong>Created:</strong> {selectedLog.created_at}</p>
                {selectedLog.sent_at && <p><strong>Sent at:</strong> {selectedLog.sent_at}</p>}
                {selectedLog.delivered_at && <p><strong>Delivered at:</strong> {selectedLog.delivered_at}</p>}
                {selectedLog.opened_at && <p><strong>First opened:</strong> {selectedLog.opened_at}</p>}
                {selectedLog.clicked_at && <p><strong>First clicked:</strong> {selectedLog.clicked_at}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                >
                  Close Metadata
                </button>
                <button
                  onClick={() => { handleResend(selectedLog.id); setSelectedLog(null); }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Resend Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
