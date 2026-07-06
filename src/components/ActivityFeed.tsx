import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, FileText, CreditCard, CheckCircle2, Filter,
  Trash2, RefreshCw, Clock, ChevronDown, ChevronUp, ShieldCheck, HelpCircle
} from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'Job Posted' | 'Proposal Received' | 'Payment Processed' | 'Milestone Completed';
  title: string;
  detail: string;
  amount?: string;
  time: string;
  timestamp: string;
  txHash?: string;
  isNew?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onClearFeed?: () => void;
  onResetFeed?: () => void;
  isDarkMode: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onClearFeed,
  onResetFeed,
  isDarkMode
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getEventIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'Job Posted':
        return <Briefcase size={14} className="text-purple-400" />;
      case 'Proposal Received':
        return <FileText size={14} className="text-indigo-400" />;
      case 'Payment Processed':
        return <CreditCard size={14} className="text-emerald-400" />;
      case 'Milestone Completed':
        return <CheckCircle2 size={14} className="text-orange-400" />;
      default:
        return <HelpCircle size={14} className="text-slate-400" />;
    }
  };

  const getEventBadgeClass = (type: ActivityItem['type']) => {
    switch (type) {
      case 'Job Posted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      case 'Proposal Received':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'Payment Processed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Milestone Completed':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const filteredActivities = activities.filter(act => {
    if (filter === 'All') return true;
    return act.type === filter;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className={`rounded-3xl border ${isDarkMode ? 'bg-[#0B132B]/45 border-slate-800/80' : 'bg-white border-slate-200'} p-5 space-y-4 shadow-xl relative overflow-hidden transition-all duration-300`}>
      {/* Dynamic light accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/15 via-transparent to-transparent rounded-full pointer-events-none" />

      {/* Header and tools */}
      <div className="flex justify-between items-center pb-2">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Activity Log Stream
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Chronological client-side workspace telemetry</p>
        </div>
        <div className="flex items-center gap-1.5">
          {onResetFeed && (
            <button
              onClick={onResetFeed}
              title="Reset feed to template logs"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <RefreshCw size={11} />
            </button>
          )}
          {onClearFeed && (
            <button
              onClick={onClearFeed}
              title="Clear all logs"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap gap-1.5">
        {['All', 'Job Posted', 'Proposal Received', 'Payment Processed', 'Milestone Completed'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
              filter === cat
                ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-300'
            }`}
          >
            {cat === 'All' ? 'All Logs' : cat}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-3.5 space-y-4">
        {/* Connector vertical pipeline line */}
        {filteredActivities.length > 1 && (
          <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-gradient-to-b from-indigo-500/25 via-emerald-500/20 to-orange-500/10 pointer-events-none" />
        )}

        <AnimatePresence initial={false}>
          {filteredActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-slate-500 text-xs"
            >
              No activities found in this channel segment.
            </motion.div>
          ) : (
            filteredActivities.map((act, index) => {
              const isExpanded = expandedId === act.id;
              return (
                <motion.div
                  key={act.id}
                  initial={act.isNew ? { opacity: 0, x: -10, scale: 0.95 } : undefined}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative flex flex-col p-3 rounded-2xl border ${
                    isDarkMode
                      ? 'bg-[#060B18]/50 border-slate-900/80 hover:border-slate-800/80'
                      : 'bg-white border-slate-200/50 hover:border-slate-300'
                  } transition-all cursor-pointer select-none`}
                  onClick={() => toggleExpand(act.id)}
                >
                  {/* Outer Event Category indicator dot */}
                  <div className="absolute -left-5 top-4.5 w-2 h-2 rounded-full border border-slate-950 bg-white flex items-center justify-center">
                    <div className={`w-1 h-1 rounded-full ${
                      act.type === 'Job Posted' ? 'bg-purple-400' :
                      act.type === 'Proposal Received' ? 'bg-indigo-400' :
                      act.type === 'Payment Processed' ? 'bg-emerald-400' :
                      'bg-orange-400'
                    }`} />
                  </div>

                  {/* Main Header Item Line */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Rounded Badge with Icon */}
                      <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getEventBadgeClass(act.type)}`}>
                        {getEventIcon(act.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-200 dark:text-slate-100 truncate">{act.title}</span>
                          {act.amount && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/20">
                              {act.amount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{act.detail}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock size={10} /> {act.time}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={12} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Technical Detail Node */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 10 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden text-[10px] border-t border-slate-800/60 pt-2 space-y-1.5 text-slate-400 font-mono"
                        onClick={(e) => e.stopPropagation()} // stop toggle on clicking detail info
                      >
                        <div className="flex justify-between">
                          <span>Event Class:</span>
                          <span className="text-slate-200 font-bold">{act.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ISO Timestamp:</span>
                          <span>{act.timestamp}</span>
                        </div>
                        {act.txHash && (
                          <div className="flex justify-between flex-wrap gap-1">
                            <span>Telemetry SHA-256:</span>
                            <span className="text-[9px] text-indigo-400 select-all truncate max-w-[150px]" title={act.txHash}>
                              {act.txHash}
                            </span>
                          </div>
                        )}
                        <div className="pt-1.5 flex items-center gap-1.5 border-t border-slate-800/40 text-[9px] text-emerald-500/80 font-bold">
                          <ShieldCheck size={11} className="text-emerald-500" />
                          <span>Securely cryptographically locked into client state session.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
