import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { TutorSession } from '../../lib/academyStorage';

interface TutorSupportSettingsTabProps {
  session: TutorSession;
}

export const TutorSupportSettingsTab: React.FC<TutorSupportSettingsTabProps> = ({
  session
}) => {
  const [activeSection, setActiveSection] = useState<'policy' | 'support' | 'settings'>('policy');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Academic Senate');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [expandedTopic, setExpandedTopic] = useState<number | null>(0);

  const facultyPolicies = [
    {
      id: 1,
      title: '1. 70/30 Practical Teaching Delivery Protocol',
      content: 'Instructors must allocate 70% of contact hours to hands-on project implementation, code live-typing, and interactive labs, reserving at most 30% for theoretical concepts.'
    },
    {
      id: 2,
      title: '2. 72-Hour Grading & Review Turnaround SLA',
      content: 'All student practical project deliverables and assignments must be reviewed, graded with constructive feedback, and committed in the faculty portal within 72 hours of submission.'
    },
    {
      id: 3,
      title: '3. Attendance Verification & Anti-Proxy Safeguards',
      content: 'Class attendance must be marked during the live session or physical lab workshop. Tutors must reconcile roll calls to prevent unauthorized proxies.'
    },
    {
      id: 4,
      title: '4. Honorarium Calculation & Disbursement Schedule',
      content: 'Teaching honoraria are calculated on a per-cohort contact basis and approved by the DS Tech Academy Bursary. Payout requests are settled every 2 weeks via direct commercial bank transfer.'
    },
    {
      id: 5,
      title: '5. Student Mentorship & Office Hours',
      content: 'Lead instructors are required to maintain a weekly 2-hour virtual office hour for 1-on-1 student assistance and capstone guidance.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const generatedId = `FAC-TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(generatedId);
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            Faculty Governance, Support & Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access teaching protocols, communicate with the Academic Senate, or configure portal alerts.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('policy')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'policy' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Faculty Handbook
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('support')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'support' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Senate Helpdesk
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'settings' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Preferences
          </button>
        </div>
      </div>

      {activeSection === 'policy' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-purple-500" />
              <span>Official Faculty Teaching & Evaluation Guidelines</span>
            </h3>

            {facultyPolicies.map((topic, idx) => {
              const isExpanded = expandedTopic === idx;
              return (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTopic(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between transition-colors bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {topic.title}
                    </span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      {topic.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-purple-500" />
                <span>Contact Academic Senate & Bursary</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Direct communication regarding curriculum updates, lab facilities, or honorarium inquiries.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Inquiry Logged: {ticketId}</span>
                </div>
                <p>The Academic Dean and Bursary Secretariat have received your dispatch.</p>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Body
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Academic Senate">Academic Senate & Curriculum Dean</option>
                  <option value="Bursary">Bursary & Financial Controller</option>
                  <option value="Hub Ops">Physical Hub Infrastructure & Lab Systems</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Summary
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Request for additional cloud sandbox quota"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide complete details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={15} />
                <span>Submit to Academic Board</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Faculty Executive Contacts
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Dean Office</span>
                    <span className="font-bold text-slate-900 dark:text-white">dean.academic@dstech.agency</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Bursary Executive Line</span>
                    <span className="font-bold text-slate-900 dark:text-white">+234 809 111 4444</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            <span>Faculty Workspace Configuration</span>
          </h3>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Real-Time Submission Alerts</p>
                <p className="text-slate-500 mt-0.5">Receive immediate notifications whenever a student commits a module deliverable.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Honorarium Payout SMS Confirmations</p>
                <p className="text-slate-500 mt-0.5">Receive CBN bank credit notification SMS for settled disbursements.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
