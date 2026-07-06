import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Search, Filter, CheckCircle2, XCircle, Clock, Eye, Download, 
  Mail, Phone, RefreshCw, LogOut, Sun, Moon, Bell, Shield, ChevronRight, Sparkles, UserCheck, Trash2
} from 'lucide-react';
import { JobApplication } from '../types';
import { Logo } from './Logo';
import { apiGetApplications, apiUpdateApplication, apiDeleteApplication } from '../lib/storage';

interface RecruiterDashboardProps {
  currentUser: { fullName: string; email: string; id: string; role?: string } | null;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser,
  onLogout,
  isDarkMode,
  setIsDarkMode
}) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load application registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await apiUpdateApplication(id, { status: newStatus });
      
      // Update local state
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert("Error updating application status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this applicant profile? This action is irreversible.")) {
      return;
    }
    try {
      await apiDeleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    }
  };

  // Filter calculations
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.targetRole?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesRole = roleFilter === 'all' || app.targetRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(applications.map(app => app.targetRole).filter(Boolean)));

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Top Navigation Bar */}
      <nav className={`border-b sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between ${isDarkMode ? 'bg-slate-950/80 border-slate-900 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <Logo size="sm" variant={isDarkMode ? 'light' : 'dark'} showText={true} />
          <span className="h-4 w-px bg-slate-300 dark:bg-slate-800" />
          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
            Recruiter Node
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{currentUser?.fullName || 'Recruiter'}</p>
              <p className="text-[9px] text-slate-400 font-mono">{currentUser?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Shield className="text-indigo-400" size={22} />
              <span>Recruiter Command Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400">Manage incoming applicants, screen credentials, and update decision boards.</p>
          </div>
          
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Synchronize Registry</span>
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Submissions", count: stats.total, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" },
            { label: "Pending Assessment", count: stats.pending, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
            { label: "Approved Talents", count: stats.approved, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
            { label: "Rejected Enclaves", count: stats.rejected, color: "text-rose-400 border-rose-500/20 bg-rose-500/5" }
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border text-left ${stat.color} transition-all hover:scale-[1.02]`}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{stat.label}</p>
              <p className="text-2xl font-black mt-1 font-mono">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center gap-3.5 ${isDarkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200'}`}>
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, email, or core role..."
              className="w-full bg-white dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl py-2 pl-11 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-indigo-500 dark:text-indigo-200"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-black/30 border border-transparent dark:border-white/5 rounded-xl px-2 py-1">
              <Filter size={12} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">All Statuses</option>
                <option value="pending" className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">Pending</option>
                <option value="approved" className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">Approved</option>
                <option value="rejected" className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-black/30 border border-transparent dark:border-white/5 rounded-xl px-2 py-1">
              <Briefcase size={12} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">All Roles</option>
                {uniqueRoles.map((role, i) => (
                  <option key={i} value={role} className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Applicants Registry List */}
          <div className={`lg:col-span-7 rounded-3xl border p-4 md:p-6 text-left ${isDarkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'} max-h-[700px] overflow-y-auto`}>
            <div className="border-b border-slate-200 dark:border-slate-850 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="text-indigo-400" size={14} />
                <span>Talent Registry ({filteredApps.length})</span>
              </h3>
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="animate-spin text-indigo-400 mx-auto" size={24} />
                <p className="text-xs text-slate-400">Decrypting applicant datablocks...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <Briefcase className="text-slate-600 mx-auto" size={32} />
                <p className="text-xs font-bold text-slate-400">No applicants found matching filter guidelines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/5 shadow-lg' 
                          : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-black/20 hover:border-slate-400 dark:hover:border-slate-750'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-300">{app.fullName}</h4>
                          <p className="text-[10px] text-slate-400 font-medium font-mono">{app.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded text-[8px] font-black uppercase tracking-wide">
                              {app.targetRole || "Developer"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            app.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : app.status === 'rejected' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {app.status || 'pending'}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">{new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Active Candidate Profile Details */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedApp ? (
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className={`rounded-3xl border p-6 text-left space-y-6 ${isDarkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'}`}
                >
                  {/* Title & Actions */}
                  <div className="border-b border-slate-200 dark:border-slate-850 pb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-indigo-500 dark:text-indigo-400">{selectedApp.fullName}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{selectedApp.targetRole}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteApplication(selectedApp.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Key Details Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                        <p className="text-xs font-medium font-mono text-indigo-500 dark:text-indigo-300 break-all">{selectedApp.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Created Date</span>
                        <p className="text-xs font-semibold">{new Date(selectedApp.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
                      <h4 className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Sparkles size={11} />
                        <span>Core Capabilities & Bio</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {selectedApp.summary || "Applicant provided profile information, verified and secured on Cloudflare D1 nodes."}
                      </p>
                    </div>
                  </div>

                  {/* Decision Controls */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-850 space-y-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Executive Board Decision</span>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                        disabled={updatingId === selectedApp.id}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve Applicant</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                        disabled={updatingId === selectedApp.id}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        <span>Reject Applicant</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'pending')}
                      disabled={updatingId === selectedApp.id}
                      className="w-full py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Clock size={13} className="text-amber-400" />
                      <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>Revert to Review Pending</span>
                    </button>
                  </div>

                </motion.div>
              ) : (
                <div className={`rounded-3xl border p-12 text-center space-y-3 ${isDarkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'}`}>
                  <Eye className="text-slate-500 mx-auto animate-pulse" size={32} />
                  <p className="text-xs font-bold text-slate-400">Select an applicant to review their credentials, secure nodes, and make an evaluation decision.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* DEDICATED PREMIUM SHELL FOOTER */}
        <footer className={`mt-auto border-t py-6 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
          isDarkMode 
            ? 'border-slate-800/80 bg-[#0B0F19]/40 text-slate-500' 
            : 'border-slate-200 bg-white text-slate-600'
        } font-sans`}>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">Recruiter Cockpit Terminal</span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-[10px] font-mono">Node ID: <span className="font-bold text-indigo-400 select-all">DST-REC-{currentUser?.uid?.substring(0, 8).toUpperCase() || 'RE9A1F'}</span></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-medium">
            <a href="#compliance" onClick={(e) => { e.preventDefault(); }} className="hover:text-indigo-400 dark:hover:text-slate-300 transition-colors">Compliance</a>
            <a href="#audit" onClick={(e) => { e.preventDefault(); }} className="hover:text-indigo-400 dark:hover:text-slate-300 transition-colors">Security Ledger</a>
            <a href="#status" onClick={(e) => { e.preventDefault(); }} className="hover:text-indigo-400 dark:hover:text-slate-300 transition-colors">System Status</a>
            <span className="hidden xs:inline text-slate-700">|</span>
            <span className="text-[11px] font-mono">© 2026 DS Tech Recruiter Cockpit</span>
          </div>
        </footer>

      </main>

    </div>
  );
};
