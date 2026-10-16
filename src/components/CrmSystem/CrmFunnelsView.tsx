import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowDown,
  Layers,
  Users,
  Eye,
  MousePointer,
  FileText,
  UserCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface FunnelStep {
  step: number;
  name: string;
  count: number;
  drop_off_pct: number;
}

interface CrmFunnelsViewProps {
  authToken: string;
}

export const CrmFunnelsView: React.FC<CrmFunnelsViewProps> = ({ authToken }) => {
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm/funnels', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.steps) {
        setFunnelSteps(data.steps);
      }
    } catch (err) {
      console.warn('Error fetching funnels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, [authToken]);

  const maxCount = funnelSteps[0]?.count || 1;

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase">
              Full Visitor-to-Customer Conversion Funnel
            </h2>
            <p className="text-[11px] text-slate-400">
              Measure drop-off rates at every touchpoint: Landing → Service Discovery → CTA Click → Form Start → Submission → Qualification → Sale.
            </p>
          </div>
        </div>

        <button
          onClick={fetchFunnels}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Funnel Steps Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
        {funnelSteps.map((step, idx) => {
          const widthPct = Math.max(12, Math.round((step.count / maxCount) * 100));
          const stepConversionFromStart = Math.round((step.count / maxCount) * 100);

          return (
            <div key={step.step} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                    {step.step}
                  </span>
                  <span className="font-bold text-white">{step.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">{step.count.toLocaleString()} visitors</span>
                  <span className="text-slate-400 text-[10px]">({stepConversionFromStart}% of total)</span>
                  {idx > 0 && (
                    <span className="text-rose-400 text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      -{step.drop_off_pct}% drop-off
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-8 bg-slate-950 rounded-xl overflow-hidden p-1 border border-white/5 relative">
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, #F59E0B 0%, #D97706 100%)`
                  }}
                >
                  <span className="text-[10px] font-extrabold text-slate-950 truncate">
                    {step.count.toLocaleString()}
                  </span>
                </div>
              </div>

              {idx < funnelSteps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
