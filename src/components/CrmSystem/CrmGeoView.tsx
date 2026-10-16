import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Users,
  Layers,
  Eye,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CrmGeoViewProps {
  authToken: string;
}

export const CrmGeoView: React.FC<CrmGeoViewProps> = ({ authToken }) => {
  const [geoData, setGeoData] = useState<{
    countries: Array<{ country: string; code: string; visitors: number; sessions: number; pageViews: number; leads: number }>;
    cities: Array<{ city: string; country: string; visitors: number }>;
  }>({
    countries: [],
    cities: []
  });
  const [loading, setLoading] = useState(false);

  const fetchGeo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/geo', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeoData(data.data);
      }
    } catch (err) {
      console.warn('Error fetching geo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeo();
  }, [authToken]);

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">
              Geographic Traffic & Audience Intelligence
            </h2>
            <p className="text-[11px] text-slate-400">
              Aggregated from server-side edge geolocation headers (Country, State/Region, City & Timezone).
            </p>
          </div>
        </div>

        <button
          onClick={fetchGeo}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top Countries Bar Chart */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10">
        <h3 className="text-xs font-bold uppercase text-white mb-3 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          Top Country Distribution
        </h3>
        <div className="h-56 w-full">
          {geoData.countries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData.countries.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="country" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="visitors" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              No geographic metadata available yet
            </div>
          )}
        </div>
      </div>

      {/* Tables: Countries & Cities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Countries Table (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
          <h3 className="text-xs font-bold uppercase text-white pb-2 border-b border-white/10">
            Country Rankings & Conversions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 border-b border-white/5 pb-1">
                  <th className="py-2 font-medium">Country</th>
                  <th className="py-2 font-medium text-right">Visitors</th>
                  <th className="py-2 font-medium text-right">Sessions</th>
                  <th className="py-2 font-medium text-right">Page Views</th>
                  <th className="py-2 font-medium text-right">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {geoData.countries.length > 0 ? (
                  geoData.countries.map((c) => (
                    <tr key={c.country} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 font-bold text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-400">
                          {c.code}
                        </span>
                        <span>{c.country}</span>
                      </td>
                      <td className="py-2 text-right font-bold text-amber-400">{c.visitors}</td>
                      <td className="py-2 text-right text-slate-300">{c.sessions}</td>
                      <td className="py-2 text-right text-slate-300">{c.pageViews}</td>
                      <td className="py-2 text-right font-bold text-emerald-400">{c.leads}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">
                      No country breakdown available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Cities Table (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
          <h3 className="text-xs font-bold uppercase text-white pb-2 border-b border-white/10 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            Top Cities Generating Traffic
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {geoData.cities.length > 0 ? (
              geoData.cities.map((city, idx) => (
                <div
                  key={`${city.city}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-amber-500 font-bold">#{idx + 1}</span>
                    <div>
                      <span className="text-white font-bold block truncate">{city.city}</span>
                      <span className="text-[10px] text-slate-400">{city.country}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold shrink-0">
                    {city.visitors} visitors
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500">
                Awaiting geographic city resolution...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
