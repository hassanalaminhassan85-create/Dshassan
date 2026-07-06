import React from 'react';
import { 
  FileText, Briefcase, Calendar as CalendarIcon, Award, User, 
  LifeBuoy, Settings, BrainCircuit, CheckCircle2, Clock, 
  ChevronRight, MapPin, Activity, Search, Edit3, Trash2, 
  Download, ExternalLink, Plus, MessageSquare, Zap, Shield, Sparkles, LayoutGrid
} from 'lucide-react';

interface TabProps {
  isDarkMode: boolean;
  cardBgClass: string;
}

export const ProposalsTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold">My Proposals</h2>
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
        <Plus size={16} /> New Proposal
      </button>
    </div>
    
    <div className={`rounded-3xl ${cardBgClass} overflow-hidden`}>
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['All', 'Active', 'Submitted', 'Archived'].map(status => (
            <button key={status} className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap ${status === 'All' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search proposals..." className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs md:text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500`} />
        </div>
      </div>
      
      <div className="divide-y divide-slate-200 dark:divide-white/5">
        {[
          { title: "Senior React Developer", company: "TechCorp Inc.", date: "Oct 24, 2023", status: "Submitted", color: "blue" },
          { title: "Full Stack Engineer", company: "Nexus Dynamics", date: "Oct 20, 2023", status: "Viewed", color: "emerald" },
          { title: "Frontend Architect", company: "Aether Systems", date: "Oct 15, 2023", status: "Interviewing", color: "purple" },
        ].map((item, i) => (
          <div key={i} className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-800 dark:text-white mb-1">{item.title}</h3>
              <p className="text-xs md:text-sm text-slate-500 flex items-center gap-2">
                <Briefcase size={14} /> {item.company} <span className="text-slate-300 dark:text-white/20">•</span>
                <Clock size={14} /> {item.date}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${item.color}-500/10 text-${item.color}-500`}>
                {item.status}
              </span>
              <button className="text-slate-400 hover:text-orange-500 transition-colors p-2">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ContractsTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6">
    <h2 className="text-xl md:text-2xl font-bold">Active Contracts</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[
        { title: "Frontend Architecture Redesign", client: "Nexus Dynamics", rate: "$85/hr", hours: "32h logged this week", status: "Active" },
        { title: "Mobile App Development", client: "Aether Systems", rate: "$7,500 fixed", hours: "Milestone 2 of 4", status: "In Progress" }
      ].map((contract, i) => (
        <div key={i} className={`p-5 md:p-6 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-base md:text-lg mb-1">{contract.title}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1"><User size={14} /> {contract.client}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full">{contract.status}</span>
          </div>
          
          <div className={`p-4 rounded-2xl mb-4 ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-slate-50'} flex justify-between items-center`}>
            <div>
              <div className="text-xs text-slate-500 mb-1">Rate / Budget</div>
              <div className="font-bold text-sm md:text-base">{contract.rate}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Progress</div>
              <div className="font-bold text-sm md:text-base text-orange-500">{contract.hours}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs md:text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              View Work Diary
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-bold transition-colors">
              Submit Work
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PortfolioTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold">My Portfolio</h2>
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
        <Plus size={16} /> Add Project
      </button>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { title: "E-Commerce Dashboard", cat: "Web App", img: "bg-indigo-500" },
        { title: "Fintech Mobile App", cat: "Mobile Design", img: "bg-emerald-500" },
        { title: "Healthcare Platform", cat: "Full Stack", img: "bg-blue-500" },
      ].map((item, i) => (
        <div key={i} className={`rounded-3xl ${cardBgClass} overflow-hidden group border border-slate-200 dark:border-white/5`}>
          <div className={`h-40 md:h-48 ${item.img} relative`}>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40"><Edit3 size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
          <div className="p-4 md:p-5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 mb-1 block">{item.cat}</span>
            <h3 className="font-bold text-sm md:text-base mb-2">{item.title}</h3>
            <p className="text-xs md:text-sm text-slate-500 line-clamp-2">A comprehensive dashboard solution with real-time analytics and user management.</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CertificatesTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold">Certifications & Skills</h2>
      <button className="bg-slate-800 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
        <Award size={16} /> Verify New Skill
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "Issued: Jan 2023", icon: Award, color: "orange" },
        { title: "Advanced React Patterns", issuer: "Frontend Masters", date: "Issued: Mar 2023", icon: CheckCircle2, color: "blue" },
        { title: "Google Cloud Professional Developer", issuer: "Google", date: "Issued: Nov 2022", icon: CloudIcon, color: "emerald" },
      ].map((cert, i) => {
        const Icon = cert.icon;
        return (
          <div key={i} className={`p-4 md:p-6 rounded-3xl ${cardBgClass} flex items-start gap-4 border border-slate-200 dark:border-white/5`}>
            <div className={`w-12 h-12 rounded-2xl bg-${cert.color}-500/10 text-${cert.color}-500 flex items-center justify-center shrink-0`}>
              <Icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm md:text-base mb-1">{cert.title}</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-2">{cert.issuer}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400 font-medium">{cert.date}</span>
                <button className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  View Credential <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
);

// Fallback cloud icon if Cloud is not imported
const CloudIcon = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;

export const CalendarTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold">Schedule & Interviews</h2>
      <div className="flex gap-2 w-full sm:w-auto">
        <button className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs md:text-sm font-bold ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
          Sync Calendar
        </button>
        <button className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-colors">
          Add Event
        </button>
      </div>
    </div>
    
    <div className={`p-4 md:p-6 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5`}>
      <h3 className="font-bold text-base md:text-lg mb-6">Upcoming (Next 7 Days)</h3>
      <div className="space-y-4">
        {[
          { title: "Technical Interview with Nexus Dynamics", type: "Interview", time: "Tomorrow, 10:00 AM - 11:00 AM", color: "blue" },
          { title: "Project Kickoff: E-Commerce Redesign", type: "Meeting", time: "Thursday, 2:00 PM - 3:00 PM", color: "emerald" },
          { title: "Weekly Sync with Aether Systems", type: "Sync", time: "Friday, 11:30 AM - 12:00 PM", color: "purple" },
        ].map((event, i) => (
          <div key={i} className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-slate-50'} flex flex-col md:flex-row md:items-center gap-4`}>
            <div className={`w-2 h-12 rounded-full bg-${event.color}-500 shrink-0 hidden md:block`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider text-${event.color}-500`}>{event.type}</span>
              </div>
              <h4 className="font-bold text-sm md:text-base">{event.title}</h4>
              <p className="text-xs md:text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock size={14} /> {event.time}</p>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <button className={`px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'} transition-colors`}>
                Reschedule
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                Join Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SupportTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6 max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">How can we help you?</h2>
      <p className="text-slate-500 text-sm md:text-base">Search our knowledge base or reach out to our support team.</p>
    </div>
    
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input type="text" placeholder="Search for articles, tutorials, or FAQs..." className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm md:text-base border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-white border-slate-200 shadow-sm'} focus:outline-none focus:border-orange-500`} />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      {[
        { title: "Getting Started", icon: Zap, desc: "Basics of using the platform" },
        { title: "Payments & Billing", icon: Shield, desc: "Manage your earnings and methods" },
        { title: "Profile Optimization", icon: Sparkles, desc: "Stand out to clients" },
      ].map((cat, i) => {
        const Icon = cat.icon;
        return (
          <div key={i} className={`p-6 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5 text-center cursor-pointer hover:border-orange-500 transition-colors`}>
            <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center mb-4">
              <Icon size={24} />
            </div>
            <h3 className="font-bold text-sm md:text-base mb-1">{cat.title}</h3>
            <p className="text-xs text-slate-500">{cat.desc}</p>
          </div>
        )
      })}
    </div>
    
    <div className={`p-6 md:p-8 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5 text-center`}>
      <h3 className="text-lg md:text-xl font-bold mb-2">Still need help?</h3>
      <p className="text-slate-500 text-sm mb-6">Our support team is available 24/7 to assist you.</p>
      <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors hover:opacity-90">
        <MessageSquare size={18} /> Contact Support
      </button>
    </div>
  </div>
);

export const AiTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6 h-full flex flex-col">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <BrainCircuit className="text-orange-500" /> AI Career Assistant
      </h2>
      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-full">Premium Feature</span>
    </div>
    
    <div className={`flex-1 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col min-h-[500px]`}>
      <div className={`p-4 md:p-6 border-b border-slate-200 dark:border-white/5 ${isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          I'm your AI career assistant. I can help you draft proposals, optimize your profile, prepare for interviews, or analyze contract terms.
        </p>
      </div>
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
            <BrainCircuit size={20} />
          </div>
          <div className={`p-4 rounded-2xl rounded-tl-sm text-sm ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-slate-100'} max-w-[85%]`}>
            Hello! How can I help you advance your freelance career today? Here are some things you can ask me:
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-orange-500" /> Draft a proposal for the "Frontend Architect" role</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-orange-500" /> Review my profile and suggest improvements</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-orange-500" /> What are the standard rates for React developers?</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0B0F19]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            className={`w-full pl-4 pr-12 py-3 md:py-4 rounded-2xl text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500 shadow-sm`} 
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">
            <Zap size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const SettingsTab: React.FC<TabProps> = ({ isDarkMode, cardBgClass }) => (
  <div className="space-y-6 max-w-4xl">
    <h2 className="text-xl md:text-2xl font-bold mb-6">Account Settings</h2>
    
    <div className="flex flex-col md:flex-row gap-8">
      {/* Settings Navigation */}
      <div className="w-full md:w-64 space-y-1 shrink-0 overflow-x-auto md:overflow-visible flex md:flex-col pb-2 md:pb-0 hide-scrollbar">
        {['Profile', 'Preferences', 'Security', 'Billing', 'Notifications'].map((item, i) => (
          <button key={item} className={`px-4 py-3 rounded-xl text-sm font-bold text-left whitespace-nowrap ${i === 0 ? 'bg-orange-500 text-white' : `text-slate-600 dark:text-slate-400 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`} transition-colors`}>
            {item}
          </button>
        ))}
      </div>
      
      {/* Settings Content */}
      <div className="flex-1 space-y-6">
        <div className={`p-6 md:p-8 rounded-3xl ${cardBgClass} border border-slate-200 dark:border-white/5`}>
          <h3 className="text-lg font-bold mb-6">Personal Information</h3>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 border-4 border-white dark:border-[#0B0F19] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=transparent" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <button className={`px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors mb-2`}>
                Change Avatar
              </button>
              <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">First Name</label>
              <input type="text" defaultValue="Alex" className={`w-full px-4 py-3 rounded-xl text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Last Name</label>
              <input type="text" defaultValue="Chen" className={`w-full px-4 py-3 rounded-xl text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">Email Address</label>
              <input type="email" defaultValue="alex.chen@example.com" className={`w-full px-4 py-3 rounded-xl text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500`} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">Professional Title</label>
              <input type="text" defaultValue="Senior Frontend Architect" className={`w-full px-4 py-3 rounded-xl text-sm border ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500`} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button className={`px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
              Cancel
            </button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
