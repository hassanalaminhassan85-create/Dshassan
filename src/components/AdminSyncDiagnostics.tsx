import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, CheckCircle, AlertTriangle, RefreshCw, Server, 
  Wifi, WifiOff, Terminal, Database, Clock, Zap
} from 'lucide-react';
import { apiSubscribeToRealtimeSync } from '../lib/api';

interface LogEvent {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  data: any;
  status: 'success' | 'warning' | 'error' | 'info';
}

export const AdminSyncDiagnostics: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastPing, setLastPing] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (log: Omit<LogEvent, 'id' | 'timestamp'>) => {
    setLogs(prev => {
      const newLogs = [...prev, {
        ...log,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString()
      }];
      return newLogs.slice(-100); // Keep last 100 logs
    });
  };

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    let eventSource: EventSource | null = null;
    let isSubscribed = true;

    const connectSSE = () => {
      if (!isSubscribed) return;
      
      setConnectionStatus('connecting');
      addLog({
        type: 'CONNECTION_ATTEMPT',
        source: 'Client SSE',
        data: { url: '/api/events' },
        status: 'info'
      });

      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setConnectionStatus('connected');
        addLog({
          type: 'CONNECTED',
          source: 'Client SSE',
          data: { status: 'Live connection established' },
          status: 'success'
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'ping') {
            setLastPing(new Date().toISOString());
            addLog({
              type: 'PING',
              source: 'Server SSE',
              data: { timestamp: data.timestamp },
              status: 'info'
            });
            return;
          }

          addLog({
            type: data.type || 'UNKNOWN_EVENT',
            source: 'Server SSE',
            data: data,
            status: 'success'
          });
        } catch (e: any) {
          addLog({
            type: 'PARSE_ERROR',
            source: 'Client SSE',
            data: { error: e.message, raw: event.data },
            status: 'error'
          });
        }
      };

      eventSource.onerror = (err) => {
        setConnectionStatus('disconnected');
        addLog({
          type: 'DISCONNECTED',
          source: 'Client SSE',
          data: { error: 'Connection lost or error occurred' },
          status: 'error'
        });
        eventSource?.close();
        
        // Auto-reconnect after 3 seconds
        retryTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      isSubscribed = false;
      clearTimeout(retryTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold uppercase font-serif tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Activity className="text-indigo-500" size={28} />
            Real-Time Sync Diagnostics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
            Monitor live WebSocket/SSE events and database broadcasting telemetry.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : connectionStatus === 'connecting' ? (
              <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-500" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          
          <button
            onClick={clearLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            title="Clear Logs"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Server size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Broker Status</span>
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Active
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Events processing normally
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Clock size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Last Heartbeat</span>
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {lastPing ? new Date(lastPing).toLocaleTimeString() : 'Waiting...'}
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            30s keep-alive interval
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Database size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Total Events</span>
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {logs.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Events captured this session
          </div>
        </div>
      </div>

      <div className="bg-[#0D1117] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[500px]">
        <div className="bg-[#161B22] px-4 py-3 flex items-center gap-2 border-b border-slate-800">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-300">live_sync_telemetry.log</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="text-slate-500 flex flex-col items-center justify-center h-full space-y-3">
                <Activity size={32} className="opacity-50 animate-pulse" />
                <p>Waiting for real-time synchronization events...</p>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-3 leading-relaxed border-b border-slate-800/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.status === 'error' ? 'bg-rose-500/10 text-rose-400' :
                      log.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {log.type}
                    </span>

                    <span className="text-slate-400 font-semibold">{log.source}</span>
                  </div>
                  
                  <div className="pl-0 sm:pl-24 text-slate-300 whitespace-pre-wrap break-all">
                    {JSON.stringify(log.data, null, 2)}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={logsEndRef} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
