import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Eye,
  CheckCircle2,
  Table,
  Sparkles
} from 'lucide-react';

interface CrmReportsViewProps {
  authToken: string;
}

export const CrmReportsView: React.FC<CrmReportsViewProps> = ({ authToken }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    try {
      setDownloading(type);
      const res = await fetch(`/api/crm/export?type=${type}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Export request failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dstech_${type}_report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setDownloading(null);
    }
  };

  const reportCards = [
    {
      id: 'leads',
      title: 'Leads & Enquiries CRM Report',
      description: 'Full database export of all captured inquiries, contact details, assigned staff, pipeline stages, and follow-up notes.',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      badge: 'High Value'
    },
    {
      id: 'visitors',
      title: 'Visitor Intelligence & Geolocation Docket',
      description: 'Pseudonymous visitor records, first seen, last active, location, device category, browser family, and landing routes.',
      icon: <Eye className="w-5 h-5 text-blue-400" />,
      badge: 'Audience'
    },
    {
      id: 'sessions',
      title: 'Session Duration & Engagement Ledger',
      description: 'Chronological session log with duration in seconds, bounce classification, entry/exit pages, and conversion outcomes.',
      icon: <Calendar className="w-5 h-5 text-emerald-400" />,
      badge: 'Engagement'
    },
    {
      id: 'pages',
      title: 'Content & Page Route Performance',
      description: 'Route breakdown: Total views, unique visitors, average time on page, exit rates, and call-to-action click-through rates.',
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      badge: 'Content'
    },
    {
      id: 'events',
      title: 'Raw Interaction Events Stream (5k Latest)',
      description: 'Audit log of all individual button clicks, WhatsApp clicks, phone dials, email inquiries, and form start events.',
      icon: <Table className="w-5 h-5 text-rose-400" />,
      badge: 'Telemetry'
    }
  ];

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">
              Business Intelligence Reports & CSV Data Exports
            </h2>
            <p className="text-[11px] text-slate-400">
              Download sanitized, formula-injection-safe CSV files formatted for Microsoft Excel, Google Sheets, or internal BI tools.
            </p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5">
                  {rep.icon}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {rep.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase">{rep.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  {rep.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <button
                onClick={() => handleExport(rep.id)}
                disabled={downloading === rep.id}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-white/10 cursor-pointer disabled:opacity-50 transition-all"
              >
                <Download className={`w-3.5 h-3.5 text-amber-400 ${downloading === rep.id ? 'animate-bounce' : ''}`} />
                <span>{downloading === rep.id ? 'Generating CSV...' : 'Download CSV Export'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
