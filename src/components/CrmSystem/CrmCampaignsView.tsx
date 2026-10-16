import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Users,
  Target,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface CampaignStat {
  campaign: string;
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  leads: number;
  conversions: number;
  conversion_rate: number;
}

interface CrmCampaignsViewProps {
  authToken: string;
}

export const CrmCampaignsView: React.FC<CrmCampaignsViewProps> = ({ authToken }) => {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/campaigns', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.warn('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [authToken]);

  const filtered = campaigns.filter(c =>
    c.campaign.toLowerCase().includes(search.toLowerCase()) ||
    c.source.toLowerCase().includes(search.toLowerCase()) ||
    c.medium.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            Marketing Campaigns & Traffic Source Attribution
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-time attribution matching UTM parameters (utm_source, utm_medium, utm_campaign) to visitor sessions and converted leads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaign, source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 font-bold">Campaign Name</th>
                <th className="py-3 px-3 font-bold">UTM Source</th>
                <th className="py-3 px-3 font-bold">UTM Medium</th>
                <th className="py-3 px-3 font-bold text-right">Visitors</th>
                <th className="py-3 px-3 font-bold text-right">Sessions</th>
                <th className="py-3 px-3 font-bold text-right">Leads Acquired</th>
                <th className="py-3 px-3 font-bold text-right">Won Customers</th>
                <th className="py-3 px-4 font-bold text-right">Conv. Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length > 0 ? (
                filtered.map((c, idx) => (
                  <tr key={`${c.campaign}-${c.source}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-amber-500 font-mono text-[10px]">#{idx + 1}</span>
                      <span className="truncate max-w-[200px]">{c.campaign}</span>
                    </td>

                    <td className="py-3 px-3 text-amber-400">{c.source}</td>
                    <td className="py-3 px-3 text-slate-400">{c.medium}</td>

                    <td className="py-3 px-3 text-right font-bold text-white">{c.visitors.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{c.sessions.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400">{c.leads}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">{c.conversions}</td>

                    <td className="py-3 px-4 text-right font-bold text-white">
                      {c.conversion_rate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {loading ? 'Analyzing campaign attribution...' : 'No UTM campaign sessions detected yet'}
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
