const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Briefcase, FileText, Wallet, Settings, Bell, MessageSquare, 
  LogOut, Heart, Star, CheckCircle2, Clock, MapPin, Activity, 
  Award, ChevronRight, Menu, X, Sparkles, LayoutGrid, Zap, 
  ArrowUpRight, Shield, Calendar, LifeBuoy, FileCheck, BrainCircuit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Logo } from './Logo';

interface FreelancerDashboardProps {
  currentUser: { fullName: string; email: string; id: string; role?: string; profilePhoto?: string } | null;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

export const CandidateEnterpriseDashboard: React.FC<FreelancerDashboardProps> = ({
  currentUser,
  onLogout,
  isDarkMode,
  setIsDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'proposals' | 'contracts' | 'messages' | 'earnings' | 'portfolio' | 'certificates' | 'calendar' | 'support' | 'settings' | 'ai'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Freelancer Data
  const [availableConnects, setAvailableConnects] = useState(145);
  const [availableBalance, setAvailableBalance] = useState(2450.00);
  const [pendingPayments, setPendingPayments] = useState(1200.00);
  const [successScore, setSuccessScore] = useState(98);
  const [profileCompletion, setProfileCompletion] = useState(85);
  
  // Theme styling (Navy + Orange + Purple Accent + Glassmorphism)
  const bgClass = isDarkMode ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const textClass = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const cardBgClass = isDarkMode ? 'bg-[#131A2B]/80 backdrop-blur-xl border border-white/5 shadow-2xl' : 'bg-white border border-slate-200 shadow-sm';
  const sidebarClass = isDarkMode ? 'bg-[#0B0F19]/95 backdrop-blur-2xl border-white/5' : 'bg-white border-slate-200';
  const headerClass = isDarkMode ? 'bg-[#0B0F19]/80 backdrop-blur-xl border-white/5' : 'bg-white/90 backdrop-blur-xl border-slate-200';
  const accentPrimary = 'text-orange-500';
  const accentSecondary = 'text-purple-500';
  const bgAccentPrimary = 'bg-orange-500';
  
  const earningsData = [
    { name: 'Mon', amount: 120 },
    { name: 'Tue', amount: 350 },
    { name: 'Wed', amount: 200 },
    { name: 'Thu', amount: 500 },
    { name: 'Fri', amount: 450 },
    { name: 'Sat', amount: 0 },
    { name: 'Sun', amount: 0 },
  ];

  const jobs = [
    { id: 'j1', title: 'Senior Next.js Engineer for FinTech MVP', budget: '$5,000 - $8,000', type: 'Fixed', level: 'Expert', time: '1-3 months', posted: '2 hours ago', description: 'Looking for a senior frontend engineer with experience in highly secure web environments to build our dashboard MVP.', skills: ['Next.js', 'React', 'Tailwind', 'Web3'], rating: 4.9, location: 'United States' },
    { id: 'j2', title: 'React Native Mobile App Developer', budget: '$45-$70/hr', type: 'Hourly', level: 'Intermediate', time: '30+ hrs/week', posted: '4 hours ago', description: 'Need an experienced React Native developer to help finish our iOS and Android applications. Must be available for daily standups.', skills: ['React Native', 'TypeScript', 'Redux'], rating: 5.0, location: 'United Kingdom' },
  ];

  const activeContracts = [
    { id: 'c1', title: 'Frontend Developer for Crypto Wallet', client: 'Aether Dynamics', type: 'Hourly', rate: '$65.00/hr', progress: 65, deadline: 'Jul 20, 2026', unread: 2 },
    { id: 'c2', title: 'E-commerce Redesign', client: 'Nexus Retail', type: 'Fixed', rate: '$5,000.00', progress: 30, deadline: 'Aug 5, 2026', unread: 0 }
  ];

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'home', label: 'Dashboard', icon: LayoutGrid },
        { id: 'ai', label: 'AI Assistant', icon: BrainCircuit, badge: 'New' },
      ]
    },
    {
      title: 'Work',
      items: [
        { id: 'jobs', label: 'Browse Jobs', icon: Search },
        { id: 'proposals', label: 'My Proposals', icon: FileText },
        { id: 'contracts', label: 'Contracts', icon: Briefcase },
      ]
    },
    {
      title: 'Manage',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
        { id: 'earnings', label: 'Wallet & Earnings', icon: Wallet },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
      ]
    },
    {
      title: 'Profile',
      items: [
        { id: 'portfolio', label: 'Portfolio', icon: FileCheck },
        { id: 'certificates', label: 'Certificates', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'support', label: 'Support', icon: LifeBuoy },
      ]
    }
  ];

  return (
    <div className={\`min-h-screen \${bgClass} \${textClass} font-sans flex flex-col transition-colors duration-300\`}>
      
      {/* Top Navbar */}
      <header className={\`w-full sticky top-0 z-50 border-b \${headerClass} px-4 py-3 flex items-center justify-between\`}>
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Logo size="sm" variant={isDarkMode ? 'light' : 'dark'} showText />
        </div>

        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search for jobs, clients, or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={\`w-full pl-10 pr-4 py-2 rounded-full text-sm font-medium border \${isDarkMode ? 'bg-[#131A2B] border-white/10 text-slate-200 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50' : 'bg-slate-100 border-transparent text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white'} focus:outline-none transition-all shadow-inner\`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className={\`relative p-2 rounded-full \${isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-600'} transition-colors\`}>
            <Bell size={20} />
            <span className={\`absolute top-1.5 right-1.5 w-2 h-2 rounded-full \${bgAccentPrimary} animate-pulse\`} />
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <button onClick={onLogout} className={\`hidden sm:flex items-center gap-3 p-1.5 pr-3 rounded-full \${isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-600'} transition-colors border border-transparent dark:hover:border-white/5\`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 overflow-hidden flex items-center justify-center text-white shadow-md">
              {currentUser?.profilePhoto ? (
                <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-sm">{currentUser?.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <span className="text-sm font-bold hidden md:block">{currentUser?.fullName?.split(' ')[0] || 'User'}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={\`
          fixed lg:static inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 ease-in-out mt-[65px] lg:mt-0 flex flex-col
          \${sidebarClass}
          \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        \`}>
          <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
            
            {menuGroups.map((group, idx) => (
              <div key={idx} className="mb-6 px-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">{group.title}</h4>
                <nav className="space-y-1">
                  {group.items.map(item => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                        className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 \${
                          isActive 
                            ? (isDarkMode ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-600 border border-orange-200') 
                            : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent')
                        }\`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') : 'text-slate-400'} />
                          {item.label}
                        </div>
                        {item.badge && (
                          <span className={\`text-[10px] px-1.5 py-0.5 rounded-md font-bold \${item.badge === 'New' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}\`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <button 
              onClick={onLogout}
              className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 \${isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'} transition-all\`}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden mt-[65px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth relative">
          
          {/* Subtle background glow effect for dark mode */}
          {isDarkMode && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-6xl mx-auto space-y-8"
            >
              
              {/* HOME DASHBOARD TAB */}
              {activeTab === 'home' && (
                <>
                  {/* Welcome Section */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">{currentUser?.fullName?.split(' ')[0] || 'Freelancer'}</span>
                      </h1>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                        Here's what's happening with your freelance business today.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveTab('jobs')} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2">
                        <Search size={16} /> Browse Jobs
                      </button>
                    </div>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={\`p-5 rounded-2xl \${cardBgClass} relative overflow-hidden group\`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                        <Wallet size={64} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Available Balance</p>
                      <h2 className="text-3xl font-black">$\${availableBalance.toLocaleString()}</h2>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">+\$450 this week</span>
                      </div>
                    </div>
                    
                    <div className={\`p-5 rounded-2xl \${cardBgClass} relative overflow-hidden group\`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                        <Briefcase size={64} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Active Contracts</p>
                      <h2 className="text-3xl font-black">{activeContracts.length}</h2>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">$\${pendingPayments.toLocaleString()} in escrow</span>
                      </div>
                    </div>

                    <div className={\`p-5 rounded-2xl \${cardBgClass} relative overflow-hidden group\`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                        <Star size={64} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Job Success Score</p>
                      <div className="flex items-baseline gap-1">
                        <h2 className="text-3xl font-black">{successScore}</h2>
                        <span className="text-xl font-bold">%</span>
                      </div>
                      <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 w-[98%]" />
                      </div>
                    </div>

                    <div className={\`p-5 rounded-2xl \${cardBgClass} relative overflow-hidden group\`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Zap size={64} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Available Connects</p>
                      <h2 className="text-3xl font-black">{availableConnects}</h2>
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                        <button className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1">
                          Buy Connects <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Projects & Proposals */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className={\`rounded-3xl \${cardBgClass} overflow-hidden\`}>
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                          <h3 className="text-lg font-bold">Active Projects</h3>
                          <button onClick={() => setActiveTab('contracts')} className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">View All</button>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-white/5">
                          {activeContracts.length > 0 ? activeContracts.map(contract => (
                            <div key={contract.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                  <Briefcase size={20} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-base hover:text-orange-500 cursor-pointer transition-colors">{contract.title}</h4>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{contract.client} • {contract.type}</p>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end gap-2">
                                <div className="text-sm font-bold">{contract.rate}</div>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: \`\${contract.progress}%\` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{contract.progress}%</span>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="p-12 text-center">
                              <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="text-slate-400" size={24} />
                              </div>
                              <h4 className="text-base font-bold mb-1">No active contracts</h4>
                              <p className="text-sm text-slate-500">Browse jobs and submit proposals to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Earnings Chart */}
                      <div className={\`rounded-3xl \${cardBgClass} p-6\`}>
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-lg font-bold">Earnings Overview</h3>
                            <p className="text-xs text-slate-500 mt-1">Your income over the last 7 days</p>
                          </div>
                          <select className={\`text-xs font-bold px-3 py-1.5 rounded-lg border \${isDarkMode ? 'bg-[#0B0F19] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}\`}>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                          </select>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={earningsData}>
                              <CartesianGrid vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} strokeDasharray="3 3" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => \`\$\${val}\`} />
                              <Tooltip 
                                cursor={{fill: isDarkMode ? '#1e293b' : '#f1f5f9'}}
                                contentStyle={{ 
                                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                                  borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }} 
                                itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {earningsData.map((entry, index) => (
                                  <Cell key={\`cell-\${index}\`} fill={entry.amount > 0 ? '#f97316' : (isDarkMode ? '#1e293b' : '#e2e8f0')} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Profile & AI */}
                    <div className="space-y-6">
                      {/* Profile Card */}
                      <div className={\`p-6 rounded-3xl \${cardBgClass} text-center relative overflow-hidden\`}>
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-purple-600/20 to-orange-500/20" />
                        <div className="relative z-10">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-purple-600 p-0.5 shadow-xl shadow-orange-500/20 mb-4">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center text-white">
                               {currentUser?.profilePhoto ? (
                                <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-2xl">{currentUser?.fullName?.charAt(0) || 'U'}</span>
                              )}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold">{currentUser?.fullName || 'Freelancer'}</h3>
                          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center justify-center gap-1">
                            <MapPin size={12} /> Silicon Valley, CA
                          </p>

                          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 text-left">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-500">Profile Completion</span>
                              <span className="text-xs font-black">{profileCompletion}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                              <div className="h-full bg-purple-500" style={{ width: \`\${profileCompletion}%\` }} />
                            </div>
                            <button className="w-full py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              Complete Profile
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Assistant Promo */}
                      <div className={\`p-6 rounded-3xl \${isDarkMode ? 'bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'} relative overflow-hidden\`}>
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                          <BrainCircuit size={80} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                          <Sparkles size={18} className="text-purple-500" /> AI Career Guide
                        </h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4 relative z-10">
                          Get personalized proposal drafts, salary estimates, and market insights based on your skills.
                        </p>
                        <button onClick={() => setActiveTab('ai')} className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25 transition-all relative z-10">
                          Ask Assistant
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* JOBS DISCOVERY TAB */}
              {activeTab === 'jobs' && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">Find Work</h1>
                      <p className="text-sm text-slate-500 mt-1">Discover opportunities that match your skills.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className={\`px-4 py-2 rounded-xl text-sm font-bold border \${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-colors\`}>Saved Jobs</button>
                      <button className={\`px-4 py-2 rounded-xl text-sm font-bold border \${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-colors\`}>Filters</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div key={job.id} className={\`p-6 rounded-3xl \${cardBgClass} hover:border-orange-500/50 transition-colors cursor-pointer group\`}>
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">{job.title}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">Posted {job.posted} • {job.location}</p>
                          </div>
                          <button className="p-2.5 rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-colors">
                            <Heart size={20} />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 text-sm font-bold">
                          <div className="flex items-center gap-1.5"><Wallet size={16} className="text-slate-400" /> {job.budget} ({job.type})</div>
                          <div className="flex items-center gap-1.5"><Award size={16} className="text-slate-400" /> {job.level}</div>
                          <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {job.time}</div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.skills.map(skill => (
                            <span key={skill} className={\`px-3 py-1.5 rounded-lg text-xs font-bold \${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}\`}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span>{job.rating} Client Rating</span>
                          </div>
                          <button className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">
                            Submit Proposal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                <div className={\`h-[calc(100vh-140px)] rounded-3xl \${cardBgClass} flex overflow-hidden\`}>
                  {/* Message List Sidebar */}
                  <div className="w-80 border-r border-slate-200 dark:border-white/5 flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5">
                      <h2 className="text-lg font-bold mb-3">Messages</h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Search chats..." className={\`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border \${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500\`} />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className={\`p-4 border-b border-slate-200 dark:border-white/5 cursor-pointer \${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}\`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">Aether Dynamics</span>
                          <span className="text-[10px] text-slate-500 font-bold">10:12 AM</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">Are we still on track for Phase 2 delivery?</p>
                      </div>
                      <div className="p-4 border-b border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-600 dark:text-slate-400">Nexus Retail</span>
                          <span className="text-[10px] text-slate-400 font-bold">Yesterday</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">Thanks for the update. The designs look great.</p>
                      </div>
                    </div>
                  </div>
                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">AD</div>
                        <div>
                          <h3 className="font-bold text-sm">Aether Dynamics</h3>
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</span>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white"><Settings size={18}/></button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex shrink-0" />
                        <div className={\`p-3 rounded-2xl rounded-tl-sm text-sm \${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}\`}>
                          Are we still on track for Phase 2 delivery tomorrow?
                          <div className="text-[9px] text-slate-400 font-bold mt-2 text-right">10:12 AM</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-white/5">
                      <div className="relative">
                        <input type="text" placeholder="Type a message..." className={\`w-full pl-4 pr-12 py-3 rounded-2xl text-sm border \${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-slate-50 border-slate-200'} focus:outline-none focus:border-orange-500\`} />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback Empty State for other tabs */}
              {['proposals', 'contracts', 'portfolio', 'certificates', 'calendar', 'support', 'settings', 'ai'].includes(activeTab) && (
                <div className={\`flex flex-col items-center justify-center h-96 rounded-3xl \${cardBgClass} text-center p-8\`}>
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 text-slate-400">
                    <LifeBuoy size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 capitalize">{activeTab}</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    This section is currently being upgraded to the new premium experience. Check back soon for exciting new features.
                  </p>
                  <button onClick={() => setActiveTab('home')} className="mt-6 px-6 py-2.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold transition-colors">
                    Back to Dashboard
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
`

fs.writeFileSync('src/components/CandidateEnterpriseDashboard.tsx', content);
console.log('Created CandidateEnterpriseDashboard.tsx');
