import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Settings, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { StudentSession } from '../../lib/academyStorage';

interface StudentSupportSettingsTabProps {
  session: StudentSession;
}

export const StudentSupportSettingsTab: React.FC<StudentSupportSettingsTabProps> = ({
  session
}) => {
  const [activeSection, setActiveSection] = useState<'support' | 'handbook' | 'settings'>('handbook');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Academic Advisor');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [expandedHandbookTopic, setExpandedHandbookTopic] = useState<number | null>(0);

  // Student Handbook: 10 topics, 12 benefits, 7 certification criteria
  const handbookTopics = [
    {
      id: 1,
      title: '1. Academic Integrity & Anti-Plagiarism Policy',
      content: 'All source code, design assets, and architectural documents submitted for module grading must be original student work. Any verbatim copying from unauthorized external repositories without proper attribution will result in project disqualification and disciplinary tribunal.'
    },
    {
      id: 2,
      title: '2. The 70/30 Practical Training Model',
      content: 'DS Tech Academy enforces a strict 70% Practical Project Implementation and 30% Foundational Theory curriculum. Every student is required to push functional, clean, type-safe repositories for each syllabus module.'
    },
    {
      id: 3,
      title: '3. 80% Minimum Attendance Requirement',
      content: 'A cumulative 80% attendance rate across both physical hub workshops and virtual live coding streams is required to sit for the final comprehensive diploma examination.'
    },
    {
      id: 4,
      title: '4. Tuition Installment & Clearance Deadlines',
      content: 'Students on installment plans must pay the 70% Initial Admission Deposit prior to lecture access, and the remaining 30% Balance prior to mid-term assessments and graduation capstone defense.'
    },
    {
      id: 5,
      title: '5. Mentorship & Code Review Protocol',
      content: 'Each student is assigned a dedicated Lead Industry Tutor. Weekly code reviews and feedback must be addressed within 72 hours of receiving tutor notes in the portal.'
    },
    {
      id: 6,
      title: '6. Campus Hub Conduct & Computer Laboratory Access',
      content: 'Physical students in Abuja and Adamawa campuses enjoy 24/7 dedicated high-speed fiber internet and uninterrupted solar power. Hub rules require ID badge display at all entry terminals.'
    },
    {
      id: 7,
      title: '7. Capstone Project Defense & Evaluation',
      content: 'Final diploma conferment requires defending an enterprise-grade software, AI, or cybersecurity project before the DS Tech Academy Academic Review Board.'
    },
    {
      id: 8,
      title: '8. Internship Placement & Career Acceleration',
      content: 'Top-performing students with ≥85% cumulative grade are automatically recommended for direct 6-month paid internships with DS Tech partner enterprises in Nigeria, the UK, and Germany.'
    },
    {
      id: 9,
      title: '9. Student Grievance & Appeal Procedure',
      content: 'Any grade or attendance dispute may be formally escalated through this portal support ticket channel within 7 days of result publication.'
    },
    {
      id: 10,
      title: '10. Alumni Network & Lifelong Masterclasses',
      content: 'Graduates retain lifetime access to the DS Tech Academy Alumni community, tech job boards, and quarterly advanced masterclasses.'
    }
  ];

  const studentBenefits = [
    'Enterprise Cloud Sandbox Access',
    'GitHub Student & Pro Tools Integration',
    'Direct 1-on-1 Lead Tutor Mentorship',
    'Verified CAC Registered Diploma (RC-1849204)',
    '24/7 High-Speed Solar Powered Innovation Hub Access',
    'Live Virtual Coding Terminals & Recorded Archives',
    'Direct Tech Career Placement & Resume Coaching',
    'Capstone Incubation & Seed Funding Opportunities',
    'Global University Transfer Credit Eligibility',
    'Lifetime Access to Tech Alumni Community',
    'Free Access to 115+ Tech Track Syllabi',
    'Discounted Multi-Course Certification Packages'
  ];

  const certificationRequirements = [
    'Minimum 80% Cumulative Attendance across lectures and labs',
    'Completion of all Module Code Deliverables (70% Practical model)',
    'Attaining at least 70% Pass Mark in Mid-Term & Final Assessments',
    'Successful Defense of Enterprise Capstone Project',
    'Zero Disciplinary or Academic Integrity Violations',
    '100% Financial Tuition Settlement & Clearance',
    'Verification by Academic Board & Lead Instructor'
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const generatedId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
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
            Support Desk, Handbook & Portal Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access official academic policies, submit support inquiries, or customize portal preferences.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('handbook')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'handbook' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Academic Handbook
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('support')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'support' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Advisor Helpdesk
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Portal Settings
          </button>
        </div>
      </div>

      {/* SECTION: ACADEMIC HANDBOOK */}
      {activeSection === 'handbook' && (
        <div className="space-y-6">
          {/* 7 Certification Requirements Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-blue-800/40 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Award size={22} className="text-amber-400" />
              <h3 className="text-lg font-bold font-display text-white">
                Official 7 Certification & Graduation Criteria
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              In accordance with DS Tech Academy Academic Senate guidelines, the following 7 criteria must be satisfied for diploma conferment:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {certificationRequirements.map((req, idx) => (
                <div
                  key={req}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Core Handbook Policy Topics Accordion */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-500" />
              <span>Official Student Handbook: 10 Policy Articles</span>
            </h3>

            {handbookTopics.map((topic, idx) => {
              const isExpanded = expandedHandbookTopic === idx;

              return (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedHandbookTopic(isExpanded ? null : idx)}
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

          {/* 12 Student Benefits Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>12 Enrolled Student Entitlements & Benefits</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {studentBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ADVISOR HELPDESK */}
      {activeSection === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Inquiry Ticket */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                <span>Submit Academic Inquiry or Ticket</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Directly contact your assigned Academic Advisor, Bursary Desk, or Tech Support.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Ticket Logged: {ticketId}</span>
                </div>
                <p>An academic advisor will respond to your registered institutional email within 24 hours.</p>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Recipient
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Academic Advisor">Academic Advisor & Course Lead</option>
                  <option value="Bursary & Payments">Bursary & Payment Clearance</option>
                  <option value="Physical Hub Access">Physical Hub Pass & Security</option>
                  <option value="Exam & Transcript">Exam, Transcript & Certification</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Schedule clarification for React module"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your inquiry with module name and details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={15} />
                <span>Submit Inquiry to Faculty</span>
              </button>
            </form>
          </div>

          {/* Contact Direct Hotlines */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Direct Academy Contact Hotlines
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Student WhatsApp Desk</span>
                    <span className="font-bold text-slate-900 dark:text-white">+234 810 000 9999</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Faculty Academic Office</span>
                    <span className="font-bold text-slate-900 dark:text-white">academic.office@dstech.agency</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Campus Hub Locations</span>
                    <span className="font-bold text-slate-900 dark:text-white">Abuja HQ • Adamawa Tech Hub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PORTAL SETTINGS */}
      {activeSection === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            <span>Student Portal Configuration</span>
          </h3>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Instant Email Notifications</p>
                <p className="text-slate-500 mt-0.5">Receive immediate lecture schedule alerts and graded code review feedback.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">SMS Assessment Reminders</p>
                <p className="text-slate-500 mt-0.5">Get 24-hour advance SMS notifications for practical capstone deadlines.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
