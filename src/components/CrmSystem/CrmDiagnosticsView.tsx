import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Database,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Zap,
  Clock
} from 'lucide-react';

interface CrmDiagnosticsViewProps {
  authToken: string;
}

export const CrmDiagnosticsView: React.FC<CrmDiagnosticsViewProps> = ({ authToken }) => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/diagnostics', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.diagnostics) {
        setDiagnostics(data.diagnostics);
      }
    } catch (err) {
      console.warn('Error fetching diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [authToken]);

  const handleInjectTestEvent = async () => {
    try {
      setInjecting(true);
      setTestResult(null);
      const res = await fetch('/api/crm/test-event', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`Test Event Successfully Ingested (ID: ${data.event_id})`);
        fetchDiagnostics();
      } else {
        setTestResult(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">
              Tracking Infrastructure Health & Diagnostics
            </h2>
            <p className="text-[11px] text-slate-400">
              Verify real-time ingestion pipeline, database connectivity, and generate diagnostic test pings.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDiagnostics}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">Tracking Engine</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 uppercase">ACTIVE & LISTENING</div>
          <p className="text-[10px] text-slate-500">First-party script initialized</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">Database Ledger</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white uppercase">PERSISTENT DB</div>
          <p className="text-[10px] text-slate-500">
            Size: {diagnostics?.database_size_bytes ? `${Math.round(diagnostics.database_size_bytes / 1024)} KB` : 'Active Store'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">Total Stored Events</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-white">
            {diagnostics?.total_events?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-500">Across all sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">Last Ingestion</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-amber-400 truncate">
            {diagnostics?.last_ingestion_timestamp
              ? new Date(diagnostics.last_ingestion_timestamp).toLocaleTimeString()
              : 'None yet'}
          </div>
          <p className="text-[10px] text-slate-500">
            {diagnostics?.last_ingestion_timestamp
              ? new Date(diagnostics.last_ingestion_timestamp).toLocaleDateString()
              : 'Awaiting events'}
          </p>
        </div>
      </div>

      {/* Test Event Generator Tool */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Administrative Diagnostic Event Generator
            </h3>
            <p className="text-[11px] text-slate-400">
              Emit a verified diagnostic event to test telemetry pipeline latency and verify database writes without skewing production metrics.
            </p>
          </div>

          <button
            onClick={handleInjectTestEvent}
            disabled={injecting}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md"
          >
            <Play className={`w-3.5 h-3.5 ${injecting ? 'animate-spin' : ''}`} />
            <span>{injecting ? 'Emitting...' : 'Send Test Ping'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
