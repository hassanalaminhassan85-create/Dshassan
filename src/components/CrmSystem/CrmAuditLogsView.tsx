import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  User,
  Clock
} from 'lucide-react';
import { CrmAuditLog } from '../../server/crmStore';

interface CrmAuditLogsViewProps {
  authToken: string;
}

export const CrmAuditLogsView: React.FC<CrmAuditLogsViewProps> = ({ authToken }) => {
  const [logs, setLogs] = useState<CrmAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/audit-logs', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [authToken]);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Administrative Security Audit Logs
          </h2>
          <p className="text-[11px] text-slate-400">
            Immutable activity log recording administrator logins, lead status mutations, configuration updates, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search action or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-3 font-bold">Admin User</th>
                <th className="py-3 px-3 font-bold">Target</th>
                <th className="py-3 px-3 font-bold">Details</th>
                <th className="py-3 px-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{log.admin_email}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {log.target_type} {log.target_id ? `(#${log.target_id.slice(-6)})` : ''}
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[280px]" title={log.details}>
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {loading ? 'Retrieving audit logs...' : 'No security audit logs recorded yet'}
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
