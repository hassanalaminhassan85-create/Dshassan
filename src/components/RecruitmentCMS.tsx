import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, CheckCircle2, XCircle, Clock, Eye, Trash2, 
  FileSpreadsheet, Users, UserCheck, AlertCircle, Mail, Briefcase, 
  Landmark, Sparkles, RefreshCw, GraduationCap, MessageSquare, 
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { JobApplication } from '../types';
import { apiGetApplications, apiUpdateApplication, apiDeleteApplication } from '../lib/storage';
import { apiAnalyzeCandidate } from '../lib/api';
import { CareersFormPDFView } from './CareersFormPDFView';

interface RecruitmentCMSProps {
  applications: JobApplication[];
  loading: boolean;
  onRefresh: () => void;
  onViewApplicant: (id: string) => void;
}

export const RecruitmentCMS: React.FC<RecruitmentCMSProps> = ({ 
  applications, 
  loading, 
  onRefresh, 
  onViewApplicant 
}) => {
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [eduFilter, setEduFilter] = useState<'all' | 'student' | 'graduate'>('all');
  
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [adminDetailTab, setAdminDetailTab] = useState<'actions' | 'pdf' | 'ai'>('actions');
  const [candidateAnalysisLoading, setCandidateAnalysisLoading] = useState(false);
  const [candidateAnalyses, setCandidateAnalyses] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('candidate_analyses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('candidate_analyses', JSON.stringify(candidateAnalyses));
    } catch (e) {}
  }, [candidateAnalyses]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const fullName = app.personalInfo?.fullName?.toLowerCase() || '';
      const email = app.personalInfo?.emailAddress?.toLowerCase() || '';
      const phone = app.personalInfo?.phoneNumbers?.toLowerCase() || '';
      const role = app.positionSkills?.majorRole?.toLowerCase() || '';
      const id = app.id.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query) || role.includes(query) || id.includes(query);
      const matchesStatus = statusFilter === 'all' || (app.status || 'pending') === statusFilter;
      const matchesRole = roleFilter === 'all' || app.positionSkills?.majorRole === roleFilter;
      const matchesEdu = eduFilter === 'all' || app.educationalBg?.isStudentOrGraduate === eduFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesEdu;
    });
  }, [applications, searchQuery, statusFilter, roleFilter, eduFilter]);

  const uniqueRoles = useMemo(() => {
    const roles = applications.map(a => a.positionSkills?.majorRole).filter(Boolean);
    return Array.from(new Set(roles));
  }, [applications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => !a.status || a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      accepted: applications.filter(a => a.appointmentAccepted).length,
    };
  }, [applications]);

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('🚨 CRITICAL ACTION REQUIRED:\n\nAre you absolutely sure you want to completely purge and delete this candidate\'s record?')) {
      return;
    }
    try {
      await apiDeleteApplication(id);
      if (selectedApp && selectedApp.id === id) setSelectedApp(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error purging application.');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiUpdateApplication(id, { status });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status } as any);
      }
      onRefresh();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role Applied', 'Status', 'Date Applied', 'Accepted'];
    const rows = filteredApps.map(app => [
      app.id,
      app.personalInfo?.fullName || '',
      app.personalInfo?.emailAddress || '',
      app.personalInfo?.phoneNumbers || '',
      app.positionSkills?.majorRole || '',
      app.status || 'pending',
      app.submittedAt || '',
      app.appointmentAccepted ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recruitment_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runAiAnalysis = async (app: JobApplication) => {
    setCandidateAnalysisLoading(true);
    try {
      const result = await apiAnalyzeCandidate(app);
      setCandidateAnalyses(prev => ({ ...prev, [app.id]: result }));
    } catch (err) {
      alert("Failed to run AI analysis. Check API credentials.");
    } finally {
      setCandidateAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Recruitment Control</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage job applications, AI screenings, and offer processing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#000E32] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Signed', value: stats.accepted, icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center md:items-start gap-2"
          >
            <div className={`p-2 ${stat.bg} dark:bg-slate-800 rounded-lg ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List Column */}
        <div className={`${selectedApp ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <RefreshCw size={40} className="text-indigo-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Human Resource Databases...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-20 text-center text-slate-400 space-y-4">
                <Users size={48} className="mx-auto opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No candidates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApps.map((app) => (
                      <motion.tr
                        layout
                        key={app.id}
                        className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedApp?.id === app.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                              {app.personalInfo?.passportPhoto ? (
                                <img src={app.personalInfo.passportPhoto} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                  {app.personalInfo?.fullName?.[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{app.personalInfo?.fullName}</div>
                              <div className="text-[10px] font-mono text-slate-500 line-clamp-1">{app.personalInfo?.emailAddress}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{app.positionSkills?.majorRole}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Applied {new Date(app.submittedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            (app.status || 'pending') === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            (app.status || 'pending') === 'rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              (app.status || 'pending') === 'approved' ? 'bg-emerald-500' :
                              (app.status || 'pending') === 'rejected' ? 'bg-rose-500' :
                              'bg-amber-500 animate-pulse'
                            }`} />
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); onViewApplicant(app.id); }}
                              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-500 transition-all border border-transparent hover:border-slate-200"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteRecord(app.id); }}
                              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-slate-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Side Panel */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-200px)] lg:sticky lg:top-8"
            >
              {/* Profile Header */}
              <div className="p-6 bg-[#000E32] text-white space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 p-0.5 overflow-hidden">
                      {selectedApp.personalInfo?.passportPhoto ? (
                        <img src={selectedApp.personalInfo.passportPhoto} className="w-full h-full object-cover rounded-[14px]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{selectedApp.personalInfo?.fullName}</h3>
                      <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{selectedApp.positionSkills?.majorRole}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <XCircle size={20} className="text-white/40 hover:text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} className="text-orange-400" />
                    {selectedApp.personalInfo?.emailAddress}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 mx-6 mt-6 rounded-2xl">
                {['actions', 'ai', 'pdf'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAdminDetailTab(tab as any)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      adminDetailTab === tab ? 'bg-white dark:bg-slate-900 text-[#000E32] dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'actions' && 'Actions'}
                    {tab === 'ai' && 'AI Screening'}
                    {tab === 'pdf' && 'Document'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {adminDetailTab === 'actions' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Status Management</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                          className={`py-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                            selectedApp.status === 'approved' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 size={20} />
                          <span className="text-[10px] font-black uppercase">Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                          className={`py-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                            selectedApp.status === 'rejected' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-100 hover:border-rose-200 text-slate-400'
                          }`}
                        >
                          <XCircle size={20} />
                          <span className="text-[10px] font-black uppercase">Reject</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Documents & Printing</h4>
                      <button
                        onClick={() => onViewApplicant(selectedApp.id)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-[#000E32] dark:text-white group-hover:scale-110 transition-transform">
                            <Eye size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">View Full Profile</span>
                            <p className="text-[10px] text-slate-400 font-medium">Render letters & print agreements</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => handleDeleteRecord(selectedApp.id)}
                        className="w-full py-3 text-rose-600 text-[10px] font-black uppercase tracking-widest border-2 border-rose-100 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        Delete Applicant Permanently
                      </button>
                    </div>
                  </div>
                )}

                {adminDetailTab === 'ai' && (
                  <div className="space-y-6">
                    {candidateAnalysisLoading ? (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-indigo-900 animate-pulse uppercase tracking-wider">AI Engines Screening...</p>
                          <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">Parsing resume, checking educational alignment and credential matching...</p>
                        </div>
                      </div>
                    ) : candidateAnalyses[selectedApp.id] ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-4 border-indigo-500/20 text-indigo-600 shadow-inner">
                            <span className="text-xl font-black">{candidateAnalyses[selectedApp.id].compatibilityScore}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Match Quality</span>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Gemini Cognitive Score</h5>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h6 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={14} /> Strengths
                            </h6>
                            <div className="grid gap-2">
                              {candidateAnalyses[selectedApp.id].keyStrengths?.map((s: string, i: number) => (
                                <div key={i} className="p-3 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-[10px] font-medium text-slate-700 dark:text-slate-300">
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h6 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle size={14} /> Risks
                            </h6>
                            <div className="grid gap-2">
                              {candidateAnalyses[selectedApp.id].potentialRisks?.map((r: string, i: number) => (
                                <div key={i} className="p-3 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-[10px] font-medium text-slate-700 dark:text-slate-300">
                                  {r}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => runAiAnalysis(selectedApp)}
                          className="w-full py-3 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-dashed border-indigo-200 hover:bg-indigo-50 rounded-2xl transition-all"
                        >
                          Recalculate AI Screening
                        </button>
                      </motion.div>
                    ) : (
                      <div className="py-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                          <Sparkles size={24} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-bold text-slate-900 dark:text-white text-sm">Automated Cognitive Screening</h5>
                          <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                            Generate a comprehensive match profile using secure Gemini 1.5 neural evaluation of resume and background.
                          </p>
                        </div>
                        <button
                          onClick={() => runAiAnalysis(selectedApp)}
                          className="px-6 py-3 bg-[#000E32] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 mx-auto"
                        >
                          <Sparkles size={14} className="text-amber-400" />
                          Screen with Gemini AI
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {adminDetailTab === 'pdf' && (
                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl h-full bg-slate-50 dark:bg-slate-900">
                    <div className="bg-white dark:bg-slate-800 h-full rounded-xl shadow-inner overflow-y-auto p-4 scale-90 origin-top">
                      <CareersFormPDFView application={selectedApp} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
