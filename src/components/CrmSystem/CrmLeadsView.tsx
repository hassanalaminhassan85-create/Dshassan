import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { CrmLead } from '../../server/crmStore';

interface CrmLeadsViewProps {
  authToken: string;
  onSelectLeadId?: string | null;
  onClearSelectedLead?: () => void;
}

const STAGES: Array<CrmLead['stage']> = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

export const CrmLeadsView: React.FC<CrmLeadsViewProps> = ({
  authToken,
  onSelectLeadId,
  onClearSelectedLead
}) => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [loading, setLoading] = useState(false);
  const [activeLead, setActiveLead] = useState<CrmLead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating lead
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    service_interest: '',
    enquiry_details: '',
    priority: 'Medium' as CrmLead['priority'],
    stage: 'New' as CrmLead['stage'],
    assigned_to: 'Unassigned',
    follow_up_date: ''
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (stageFilter !== 'all') params.set('stage', stageFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/crm/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setStageCounts(data.stage_counts || {});
      }
    } catch (err) {
      console.warn('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stageFilter, priorityFilter, authToken]);

  // Handle external selection prop (from visitor drawer)
  useEffect(() => {
    if (onSelectLeadId) {
      const match = leads.find(l => l.id === onSelectLeadId);
      if (match) setActiveLead(match);
      else {
        // Fetch specific lead
        fetch(`/api/crm/leads/${onSelectLeadId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data?.lead) {
              setActiveLead(data.data.lead);
            }
          });
      }
    }
  }, [onSelectLeadId, leads, authToken]);

  const handleUpdateStage = async (leadId: string, newStage: CrmLead['stage']) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads(prev => prev.map(l => (l.id === leadId ? data.lead : l)));
        if (activeLead && activeLead.id === leadId) {
          setActiveLead(data.lead);
        }
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !newNote.trim()) return;

    try {
      const res = await fetch(`/api/crm/leads/${activeLead.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: newNote.trim() })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setActiveLead(data.lead);
        setLeads(prev => prev.map(l => (l.id === activeLead.id ? data.lead : l)));
        setNewNote('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...createForm,
          source_page: '/crm',
          traffic_source: 'Manual Staff Input',
          tags: ['Manual Staff Entry'],
          notes: [
            {
              id: `note_${Date.now()}`,
              author: 'Staff Admin',
              content: 'Lead record manually provisioned through CRM.',
              created_at: new Date().toISOString()
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          service_interest: '',
          enquiry_details: '',
          priority: 'Medium',
          stage: 'New',
          assigned_to: 'Unassigned',
          follow_up_date: ''
        });
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase">
                Customer Relationship & Lead Pipeline CRM
              </h2>
              <p className="text-[11px] text-slate-400">
                Track enquiries from first contact to qualification, proposal, and confirmed customer acquisition.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lead</span>
            </button>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lead name, email, interest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* View Mode Buttons */}
            <div className="p-0.5 rounded-xl bg-slate-950 border border-white/10 flex items-center">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  viewMode === 'kanban' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pipeline Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lead Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const count = stageCounts[stage] || stageLeads.length;

            return (
              <div
                key={stage}
                className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 flex flex-col justify-between min-w-[210px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <h4 className="text-xs font-bold uppercase text-white truncate">{stage}</h4>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {count}
                  </span>
                </div>

                <div className="space-y-2 flex-1 min-h-[350px]">
                  {stageLeads.length > 0 ? (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setActiveLead(lead)}
                        className="p-2.5 rounded-xl bg-slate-950/90 border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all space-y-1.5 text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[130px]">
                            {lead.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            lead.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' :
                            lead.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {lead.priority}
                          </span>
                        </div>

                        <div className="text-[11px] text-amber-400/90 truncate font-semibold">
                          {lead.service_interest}
                        </div>

                        <div className="text-[10px] text-slate-400 truncate">
                          {lead.email || lead.phone || 'No direct phone'}
                        </div>

                        <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{lead.traffic_source}</span>
                          <span className="text-slate-400">{lead.notes.length} notes</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-[11px] py-10">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-white/10">
                  <th className="py-3 px-4 font-bold">Name & Contact</th>
                  <th className="py-3 px-3 font-bold">Service Interest</th>
                  <th className="py-3 px-3 font-bold">Stage</th>
                  <th className="py-3 px-3 font-bold">Priority</th>
                  <th className="py-3 px-3 font-bold">Assigned</th>
                  <th className="py-3 px-3 font-bold">Source</th>
                  <th className="py-3 px-4 font-bold text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setActiveLead(l)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{l.name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{l.email || l.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-amber-400">{l.service_interest}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        {l.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' :
                        l.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {l.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{l.assigned_to}</td>
                    <td className="py-3 px-3 text-slate-400">{l.traffic_source}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(l.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail & Stage Pipeline Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {activeLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase">{activeLead.name}</h3>
                  <span className="text-[11px] text-slate-400">{activeLead.service_interest}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveLead(null);
                  if (onClearSelectedLead) onClearSelectedLead();
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stage Transition Bar */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Move Stage</span>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleUpdateStage(activeLead.id, stg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      activeLead.stage === stg
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Email Address</span>
                <span className="text-white font-bold truncate block">{activeLead.email || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Phone / WhatsApp</span>
                <span className="text-white font-bold truncate block">{activeLead.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Assigned Staff</span>
                <span className="text-amber-400 font-bold block">{activeLead.assigned_to}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Priority</span>
                <span className="text-white font-bold block">{activeLead.priority}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Source Page</span>
                <span className="text-white truncate block">{activeLead.source_page}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Follow-up Date</span>
                <span className="text-white block">{activeLead.follow_up_date || 'Not set'}</span>
              </div>
            </div>

            {/* Enquiry Details */}
            {activeLead.enquiry_details && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Enquiry / Scope</span>
                <p className="text-slate-200 leading-relaxed">{activeLead.enquiry_details}</p>
              </div>
            )}

            {/* Activity History & Notes Stream */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase block">CRM Activity & Notes</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeLead.notes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="text-amber-400 font-bold">{note.author}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200">{note.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type a follow-up note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Create New Lead Record
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Emeka Obi"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="lead@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+234 813..."
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Service or Course Interest</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise AI Solutions / Cyber Security 3-Mo"
                  value={createForm.service_interest}
                  onChange={(e) => setCreateForm({ ...createForm, service_interest: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Initial Stage</label>
                  <select
                    value={createForm.stage}
                    onChange={(e) => setCreateForm({ ...createForm, stage: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Enquiry Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter details of client requirements..."
                  value={createForm.enquiry_details}
                  onChange={(e) => setCreateForm({ ...createForm, enquiry_details: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
