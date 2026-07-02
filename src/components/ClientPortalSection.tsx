import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Layers, CheckCircle2, AlertCircle, FileText, Download, 
  MessageSquare, Plus, Ticket, Landmark, Clock, Send 
} from 'lucide-react';
import { 
  CLIENT_PROJECTS, CLIENT_INVOICES, CLIENT_TICKETS, 
  ClientProject, Invoice, SupportTicket 
} from '../lib/data';

export const ClientPortalSection: React.FC = () => {
  const [projects, setProjects] = useState<ClientProject[]>(CLIENT_PROJECTS);
  const [invoices, setInvoices] = useState<Invoice[]>(CLIENT_INVOICES);
  const [tickets, setTickets] = useState<SupportTicket[]>(CLIENT_TICKETS);
  
  // Interactive Ticket Filing state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newMsg, setNewMsg] = useState('');

  // Selected ticket for chat
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMsg) return;
    const newTkt: SupportTicket = {
      id: "tkt_" + Math.random().toString(36).substring(2, 6),
      subject: newSubject,
      priority: newPriority,
      status: "open",
      date: new Date().toISOString().split('T')[0],
      lastMessage: newMsg
    };
    setTickets(prev => [newTkt, ...prev]);
    setIsNewTicketOpen(false);
    setNewSubject('');
    setNewMsg('');
  };

  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    // update ticket's last message
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, lastMessage: replyText } : t));
    setSelectedTicket(prev => prev ? { ...prev, lastMessage: replyText } : null);
    setReplyText('');
    alert("Support representative has been notified via secure messaging pipeline.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-12 animate-fade-in text-left text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <span className="text-orange-500 text-xs uppercase tracking-widest font-black">CLIENT PANEL</span>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-serif tracking-tight text-[#000E32] dark:text-white">
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-extrabold italic">Dashboard</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl font-light">
            Welcome back! Monitor your active CAC corporate incorporation status, review ad campaign conversions, download invoice sheets, and coordinate support tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-xs font-bold font-mono">
          <Building2 size={14} className="text-orange-500" />
          <span>Client Node: Garki Logistics Ltd</span>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div className="text-left">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Active projects</span>
            <span className="text-xl font-serif font-black text-slate-900 dark:text-white">
              {projects.filter(p => p.status !== 'completed').length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="text-left">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-serif font-black text-slate-900 dark:text-white">
              {projects.filter(p => p.status === 'completed').length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
            <Landmark size={18} />
          </div>
          <div className="text-left">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Unpaid Invoices</span>
            <span className="text-xl font-serif font-black text-slate-900 dark:text-white">
              {invoices.filter(i => i.status === 'unpaid').length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
            <Ticket size={18} />
          </div>
          <div className="text-left">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Support Tickets</span>
            <span className="text-xl font-serif font-black text-slate-900 dark:text-white">
              {tickets.filter(t => t.status === 'open').length}
            </span>
          </div>
        </div>
      </div>

      {/* PROJECT TRACKING MODULE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Project progress milestones column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
            Milestones & Deliverables Roadmap
          </h3>

          <div className="space-y-6">
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wide font-serif">{proj.name}</h4>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Deadline: {proj.deadline} • Budget: {proj.budget}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                    proj.status === 'progress' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Task Completion</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                {/* Visual steps */}
                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-200/10 text-center text-[9px] font-black uppercase text-slate-400">
                  <div className="text-orange-500">Planning</div>
                  <div className={proj.progress >= 30 ? "text-orange-500" : ""}>Design</div>
                  <div className={proj.progress >= 60 ? "text-orange-500" : ""}>Review</div>
                  <div className={proj.progress === 100 ? "text-emerald-500" : ""}>Deploy</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial ledger & documents column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
            Invoices & Documents
          </h3>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs">
                <div className="space-y-0.5 text-left">
                  <span className="font-extrabold text-slate-900 dark:text-white block font-serif uppercase">{inv.number}</span>
                  <span className="text-[10px] text-slate-400 block font-bold">{inv.project}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Due: {inv.dueDate}</span>
                </div>
                <div className="text-right space-y-1.5 shrink-0">
                  <span className="text-xs font-mono font-black text-slate-800 dark:text-orange-400 block">{inv.amount}</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'
                    }`}>
                      {inv.status}
                    </span>
                    <button 
                      onClick={() => alert(`Invoice ${inv.number} downloaded successfully.`)}
                      className="text-slate-400 hover:text-orange-500 transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT TICKETS SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-[#000E32] dark:text-white text-xs sm:text-sm uppercase font-serif tracking-tight">
            Support Desk & Secure Messaging
          </h3>
          <button
            onClick={() => setIsNewTicketOpen(!isNewTicketOpen)}
            className="px-3 py-1.5 bg-[#000E32] dark:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-xl tracking-wider flex items-center gap-1 shadow-sm"
          >
            <Plus size={12} />
            <span>File New Ticket</span>
          </button>
        </div>

        {/* Conditional New Ticket Form */}
        <AnimatePresence>
          {isNewTicketOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateTicket}
              className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject Title</label>
                  <input 
                    type="text" 
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                    placeholder="e.g. Host billing node mismatch"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority Level</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Message Detail</label>
                <textarea 
                  required
                  rows={3}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                  placeholder="Detail the issue or help requested..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-[11px] font-black uppercase"
                >
                  Submit Ticket
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tickets Grid / Active Chat Port */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-2.5">
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Your Filed Support Tickets</span>
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`w-full text-left p-4 rounded-2xl border transition-all text-xs space-y-2 block ${
                  selectedTicket?.id === t.id
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200/50 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold font-serif uppercase line-clamp-1">{t.subject}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    t.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-slate-400/10 text-slate-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-300 text-[11px] font-light line-clamp-1">{t.lastMessage}</p>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span className="font-mono">{t.date}</span>
                  <span className="uppercase text-orange-500">{t.status}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 p-5 rounded-2xl h-[280px] flex flex-col justify-between relative overflow-hidden">
            {selectedTicket ? (
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                  <div className="text-[10px] font-mono font-bold text-slate-400 border-b border-slate-200/10 pb-1.5">
                    TICKET VERIFIED NODE: {selectedTicket.id.toUpperCase()}
                  </div>
                  
                  {/* Mock message logs */}
                  <div className="space-y-2.5">
                    <div className="bg-indigo-50/40 dark:bg-indigo-950/25 p-3 rounded-2xl border border-indigo-100/10 text-xs text-left max-w-[85%] self-start">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Garki Logistics Support (Representative)</span>
                      <p className="text-slate-600 dark:text-slate-300">How can we assist you with this ticketing milestone? Please specify any code repo access or billing slips.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/10 text-xs text-left max-w-[85%] ml-auto text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">You (Client Admin)</span>
                      <p>{selectedTicket.lastMessage}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleTicketReply} className="relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-1 rounded-xl flex items-center">
                  <input 
                    type="text" 
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply and coordinate support..." 
                    className="w-full bg-transparent text-xs px-3 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button 
                    type="submit"
                    className="p-1.5 rounded-lg bg-[#000E32] dark:bg-orange-600 text-white"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                <MessageSquare size={30} className="text-slate-300 animate-pulse" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">No Ticket Selected</span>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Click any filed ticket on the left to review support logs or communicate directly with our representative managers.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
