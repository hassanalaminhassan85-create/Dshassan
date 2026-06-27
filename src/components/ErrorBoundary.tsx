import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DS Tech Portal - Uncaught exception:', error, errorInfo);
  }

  private handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
            
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold text-white tracking-tight mb-2">
              Application Render Crash Detected
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The DS Tech Career Portal encountered an unexpected runtime error. This might be due to stale local caches or a temporary network disruption.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs text-red-300 overflow-x-auto max-h-40 mb-6 leading-normal">
                <span className="text-rose-400 font-semibold">Error:</span> {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap leading-normal">
                    {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors text-white font-medium text-sm shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                </svg>
                Reload Page
              </button>
              
              <button
                onClick={this.handleClearCache}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-all text-slate-300 font-medium text-xs border border-slate-700/50"
              >
                Clear Local Storage & Diagnostics
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
