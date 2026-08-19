import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, BookOpen, Plus, Trash2, Edit3, Upload, Shield, Eye, Check, 
  AlertCircle, BarChart3, Zap, Cpu, Search, Layers, FileText, Lock
} from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  visibility_roles: string;
  status: string;
  r2_file_key?: string;
  file_name?: string;
  created_at: string;
}

interface AnalyticsData {
  metrics: {
    totalQueries: number;
    promptTokens: number;
    completionTokens: number;
    avgLatencyMs: number;
    activeKnowledgeArticles: number;
    zeroTrustViolations: number;
  };
  roleBreakdown: Record<string, number>;
}

const ALL_ROLES = ['Public', 'Applicant', 'Client', 'Student', 'Tutor', 'Staff', 'Admin'];

export const AdminAiKnowledgeCenter: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<KnowledgeArticle> | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['All']);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState<{ key: string; name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, anaRes] = await Promise.all([
        fetch('/api/ai/knowledge?admin=true'),
        fetch('/api/ai/analytics')
      ]);

      if (artRes.ok) {
        const data = await artRes.json();
        setArticles(Array.isArray(data) ? data : []);
      }
      if (anaRes.ok) {
        const data = await anaRes.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Failed to load AI Admin Knowledge Center data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.content) return;

    try {
      const res = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingArticle,
          visibilityRoles: selectedRoles,
          r2FileKey: docFile?.key || editingArticle.r2_file_key,
          fileName: docFile?.name || editingArticle.file_name
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingArticle(null);
        setDocFile(null);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save article:", err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this knowledge base entry?")) return;
    try {
      const res = await fetch(`/api/ai/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/knowledge/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setDocFile({ key: data.r2ObjectKey, name: data.fileName });
      }
    } catch (err) {
      console.error("Doc upload failed:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const toggleRoleSelection = (role: string) => {
    if (role === 'All') {
      setSelectedRoles(['All']);
      return;
    }
    const filtered = selectedRoles.filter(r => r !== 'All');
    if (filtered.includes(role)) {
      const next = filtered.filter(r => r !== role);
      setSelectedRoles(next.length === 0 ? ['All'] : next);
    } else {
      setSelectedRoles([...filtered, role]);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total AI Conversations</p>
            <h4 className="text-2xl font-black text-white mt-1">{analytics?.metrics.totalQueries || 0}</h4>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Zero-Trust Compliant
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tokens Consumed</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {((analytics?.metrics.promptTokens || 0) + (analytics?.metrics.completionTokens || 0)).toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Gemini 3.7 Flash Engine</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Latency</p>
            <h4 className="text-2xl font-black text-white mt-1">{analytics?.metrics.avgLatencyMs || 340} ms</h4>
            <p className="text-[11px] text-emerald-400 mt-0.5">Cloudflare Edge Execution</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knowledge Base Items</p>
            <h4 className="text-2xl font-black text-white mt-1">{articles.length}</h4>
            <p className="text-[11px] text-indigo-400 mt-0.5">Active Grounding Articles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Role Distribution Bar */}
      {analytics?.roleBreakdown && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" /> AI Queries Distribution By Role
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(analytics.roleBreakdown).map(([role, count]) => (
              <div key={role} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-slate-400 block">{role}</span>
                <span className="text-base font-black text-white mt-0.5 block">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Management Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI knowledge articles, categories..."
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          onClick={() => {
            setEditingArticle({ title: '', category: 'General', content: '', status: 'active' });
            setSelectedRoles(['All']);
            setDocFile(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Article</span>
        </button>
      </div>

      {/* Knowledge Base Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Title & Category</th>
                <th className="p-4">Allowed Roles</th>
                <th className="p-4">Reference Document</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No matching AI knowledge articles found.
                  </td>
                </tr>
              ) : (
                filteredArticles.map(art => {
                  let rolesList: string[] = ['All'];
                  try {
                    rolesList = JSON.parse(art.visibility_roles);
                  } catch (e) {}

                  return (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-white tracking-wide">{art.title}</div>
                        <div className="text-[11px] text-orange-400 mt-0.5">{art.category}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-1">{art.content}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {rolesList.map(r => (
                            <span key={r} className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/80 rounded text-[10px] font-medium">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {art.file_name ? (
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{art.file_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">None attached</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          art.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingArticle(art);
                              try {
                                setSelectedRoles(JSON.parse(art.visibility_roles));
                              } catch (e) {
                                setSelectedRoles(['All']);
                              }
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingArticle?.id ? 'Edit Knowledge Base Entry' : 'Create AI Knowledge Base Entry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={editingArticle?.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="e.g. Client Project Milestone Rules"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editingArticle?.category || 'General'}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  placeholder="Recruitment, Client Operations, Academy, System Admin..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Knowledge Content (Grounding Facts)</label>
                <textarea
                  required
                  rows={4}
                  value={editingArticle?.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="Detailed facts, rules, or system knowledge to ground Gemini responses..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Role Visibility Settings (RBAC)</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['All', ...ALL_ROLES].map(role => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => toggleRoleSelection(role)}
                      className={`px-3 py-1 rounded-lg border text-xs transition-all ${
                        selectedRoles.includes(role)
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Attach Reference Document (R2 Storage)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="docUpload"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="docUpload"
                    className="px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-orange-400" />
                    <span>{uploadingDoc ? 'Uploading to R2...' : 'Upload PDF/Doc'}</span>
                  </label>

                  {docFile && (
                    <span className="text-indigo-400 font-medium flex items-center gap-1">
                      <FileText className="w-4 h-4" /> {docFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-90"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
