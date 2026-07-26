import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Mail, Phone, Calendar, Award, 
  MapPin, Globe, ChevronRight, X, Heart, Shield, Cpu, 
  Linkedin, Twitter, Github, Star, Sparkles, Network,
  Briefcase, GraduationCap, ChevronDown
} from 'lucide-react';
import { Department, StaffMember } from '../types';
import { apiGetDepartments, apiGetStaff, resolveStaffImageUrl } from '../lib/api';

// Seeded/Fallback data to ensure the page looks stunning instantly and handles local preview gracefully
const FALLBACK_DEPARTMENTS: Department[] = [
  {
    id: 'dept_exec',
    name: 'Executive Leadership',
    description: 'Corporate strategy, enterprise governance, and global expansion initiatives.',
    display_order: 1,
    is_published: 1
  },
  {
    id: 'dept_engineering',
    name: 'Advanced Engineering',
    description: 'Cloud native computing, cryptography, biometric gateways, and secure ledgers.',
    display_order: 2,
    is_published: 1
  },
  {
    id: 'dept_security',
    name: 'Cyber Security & Biometrics',
    description: 'Zero-trust architecture, identity security, WebAuthn integration, and digital vault protection.',
    display_order: 3,
    is_published: 1
  },
  {
    id: 'dept_operations',
    name: 'Operations & Academics',
    description: 'Campaign deployment, physical centers, CAC verification, and technical training.',
    display_order: 4,
    is_published: 1
  }
];

const FALLBACK_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    employee_id: 'DST-EXEC-001',
    full_name: 'Dr. Hassan Al-Amin',
    job_title: 'Chief Executive Officer',
    role: 'CEO',
    department_id: 'dept_exec',
    specialization: 'Distributed Enterprise Systems & Cryptography',
    biography: 'With over two decades of engineering and leadership experience, Dr. Al-Amin guides the strategic vision of DS Tech. He previously spearheaded cryptographic security solutions for international financial consortiums and pioneered decentralized identity models in West Africa.',
    skills: 'Strategic Leadership, Cryptography, Enterprise Architecture, High-Scale Infrastructure',
    qualifications: 'Ph.D. in Computer Science (MIT), M.Sc. in Distributed Systems',
    certifications: 'CISSP, Certified Blockchain Solution Architect',
    date_joined: '2021-03-15',
    years_of_experience: 22,
    email: 'h.alamin@dstech.com',
    phone: '+234 803 111 2222',
    social_links: '{"linkedin":"https://linkedin.com","twitter":"https://twitter.com","github":"https://github."}',
    reports_to: null,
    team: 'Executive Board',
    display_order: 1,
    status: 'Active',
    is_published: 1,
    show_phone_publicly: 1,
    show_email_publicly: 1,
    show_bio_publicly: 1,
    show_qualifications_publicly: 1,
    show_social_publicly: 1,
    profile_photo_key: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff_2',
    employee_id: 'DST-ENG-001',
    full_name: 'Amara Nwosu',
    job_title: 'Director of Advanced Engineering',
    role: 'Department Head',
    department_id: 'dept_engineering',
    specialization: 'Cloud Engineering & Microservices',
    biography: 'Amara manages DS Tech\'s multi-region Cloudflare Worker and D1 ecosystem. She is a passionate advocate for serverless architectures, performance optimization, and edge computing, ensuring our core biometric endpoints maintain sub-10ms response times.',
    skills: 'Cloudflare Workers, Rust, TypeScript, Distributed SQL, Performance Profiling',
    qualifications: 'B.Eng. in Software Engineering (UNN)',
    certifications: 'AWS Certified Solutions Architect - Professional',
    date_joined: '2022-06-01',
    years_of_experience: 12,
    email: 'a.nwosu@dstech.com',
    phone: '+234 812 345 6789',
    social_links: '{"linkedin":"https://linkedin.com","github":"https://github."}',
    reports_to: 'staff_1',
    team: 'Core Platform Group',
    display_order: 2,
    status: 'Active',
    is_published: 1,
    show_phone_publicly: 0,
    show_email_publicly: 1,
    show_bio_publicly: 1,
    show_qualifications_publicly: 1,
    show_social_publicly: 1,
    profile_photo_key: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff_3',
    employee_id: 'DST-SEC-001',
    full_name: 'Tunde Yusuf',
    job_title: 'Head of Cyber Security & Biometrics',
    role: 'Department Head',
    department_id: 'dept_security',
    specialization: 'Identity Security & FIDO2/WebAuthn',
    biography: 'Tunde leads the security defense programs at DS Tech. His work focuses on biometric vault hardening, WebAuthn secure passkey setups, and ensuring zero-trust credential pathways. He was previously an independent security researcher and white-hat penetration tester.',
    skills: 'Zero-Trust Architecture, WebAuthn Server Validation, Penetration Testing, Risk Compliance',
    qualifications: 'B.Sc. in Cybersecurity (Federal University of Technology, Minna)',
    certifications: 'CEH (Certified Ethical Hacker), OSCP',
    date_joined: '2022-10-10',
    years_of_experience: 10,
    email: 't.yusuf@dstech.com',
    phone: '+234 816 777 8888',
    social_links: '{"linkedin":"https://linkedin.com","twitter":"https://twitter.com"}',
    reports_to: 'staff_1',
    team: 'SecOps',
    display_order: 3,
    status: 'Active',
    is_published: 1,
    show_phone_publicly: 0,
    show_email_publicly: 1,
    show_bio_publicly: 1,
    show_qualifications_publicly: 1,
    show_social_publicly: 1,
    profile_photo_key: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'staff_4',
    employee_id: 'DST-ENG-002',
    full_name: 'Fatima Bello',
    job_title: 'Senior Cryptographic Engineer',
    role: 'Staff Member',
    department_id: 'dept_engineering',
    specialization: 'Asymmetric Cryptography & Zero-Knowledge Proofs',
    biography: 'Fatima is responsible for designing the secure cryptographic signatures on DS Tech educational ledger entries. Her mathematical background helps design elegant zero-knowledge verifications for candidate credentials.',
    skills: 'Asymmetric Key Management, RSA/ECC, Rust, Zero-Knowledge Frameworks',
    qualifications: 'M.Sc. in Pure Mathematics (ABU Zaria)',
    certifications: 'Cryptographic Security Specialist (CSS)',
    date_joined: '2023-01-15',
    years_of_experience: 8,
    email: 'f.bello@dstech.com',
    phone: '+234 905 555 4444',
    social_links: '{"linkedin":"https://linkedin.com","github":"https://github."}',
    reports_to: 'staff_2',
    team: 'Core Platform Group',
    display_order: 4,
    status: 'Active',
    is_published: 1,
    show_phone_publicly: 0,
    show_email_publicly: 1,
    show_bio_publicly: 1,
    show_qualifications_publicly: 1,
    show_social_publicly: 1,
    profile_photo_key: 'https://images.unsplash.com/photo-1534751516642-a131ffd473fd?w=500&auto=format&fit=crop&q=80'
  }
];

export const MeetOurTeamSection: React.FC<{ language?: string }> = ({ language = 'en' }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<'grid' | 'org'>('grid');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [deptsData, staffData] = await Promise.all([
          apiGetDepartments(false),
          apiGetStaff(false)
        ]);
        
        if (deptsData && deptsData.length > 0) {
          setDepartments(deptsData);
        } else {
          setDepartments(FALLBACK_DEPARTMENTS);
        }

        if (staffData && staffData.length > 0) {
          setStaff(staffData);
        } else {
          setStaff(FALLBACK_STAFF);
        }
      } catch (err) {
        console.warn('Could not load live staff/departments. Using fallback.', err);
        setDepartments(FALLBACK_DEPARTMENTS);
        setStaff(FALLBACK_STAFF);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStaff = staff.filter(m => {
    const matchesDept = selectedDeptId === 'all' || m.department_id === selectedDeptId;
    const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.specialization && m.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (m.skills && m.skills.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  // Organize staff hierarchy
  const buildHierarchy = () => {
    const rootNodes = staff.filter(m => !m.reports_to);
    const getChildren = (parentId: string): any[] => {
      return staff
        .filter(m => m.reports_to === parentId)
        .map(child => ({
          ...child,
          children: getChildren(child.id)
        }));
    };

    return rootNodes.map(root => ({
      ...root,
      children: getChildren(root.id)
    }));
  };

  const hierarchyData = buildHierarchy();

  const getDepartmentName = (deptId: string | null | undefined) => {
    if (!deptId) return 'N/A';
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown Department';
  };

  // Render modern hierarchy tree branch recursively
  const renderTreeNode = (node: any, level: number = 0) => {
    const parsedSocials = node.social_links ? JSON.parse(node.social_links) : {};
    return (
      <div key={node.id} className="flex flex-col items-center">
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          onClick={() => setSelectedMember(node)}
          className={`relative z-10 p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
            node.role === 'CEO' 
              ? 'border-orange-500/60 shadow-orange-500/10 shadow-lg' 
              : node.role === 'Department Head'
              ? 'border-indigo-500/60 shadow-indigo-500/10 shadow-md'
              : 'border-slate-200/60 dark:border-slate-800'
          } text-center cursor-pointer max-w-[240px] shadow-sm`}
        >
          {node.role === 'CEO' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] uppercase font-black flex items-center gap-1 shadow-md">
              <Star size={9} className="fill-white" />
              <span>CEO</span>
            </div>
          )}
          {node.role === 'Department Head' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] uppercase font-black flex items-center gap-1 shadow-md">
              <Shield size={9} className="fill-white" />
              <span>HOD</span>
            </div>
          )}

          <div className="w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-slate-100 dark:border-slate-800 mb-3">
            <img 
              src={resolveStaffImageUrl(node.profile_photo_key)} 
              alt={node.full_name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate font-serif uppercase tracking-wide">{node.full_name}</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 line-clamp-1 mt-0.5">{node.job_title}</p>
          <div className="text-[9px] text-indigo-500 font-bold uppercase mt-1">{getDepartmentName(node.department_id)}</div>
        </motion.div>

        {node.children && node.children.length > 0 && (
          <div className="relative flex gap-8 pt-10 mt-2">
            {/* Connecting Vertical Line downwards */}
            <div className="absolute top-0 left-1/2 w-0.5 h-10 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />
            
            {/* Connecting Horizontal Line across children */}
            {node.children.length > 1 && (
              <div className="absolute top-10 left-[12%] right-[12%] h-0.5 bg-slate-200 dark:bg-slate-800" />
            )}

            {node.children.map((child: any) => (
              <div key={child.id} className="relative">
                {/* Connector up to horizontal line */}
                <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />
                {renderTreeNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="meet-our-team" className="py-20 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-500/5 dark:indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-orange-500/5 dark:orange-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header Block with mathematical tracking */}
        <div className="text-center space-y-4 mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-500 text-[10px] uppercase tracking-[0.25em] font-black block"
          >
            // ORGANIZATIONAL ROSTER
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#000E32] dark:text-white uppercase font-serif tracking-tight"
          >
            MEET OUR TEAM
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-light"
          >
            Discover the cybersecurity experts, system architects, and platform developers driving the enterprise security ecosystem at DS Tech.
          </motion.p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 mb-12 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Department Chips Filters */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            <button
              onClick={() => setSelectedDeptId('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedDeptId === 'all' 
                  ? 'bg-[#000E32] dark:bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              All Departments
            </button>
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedDeptId === dept.id 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Search bar & View toggle */}
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members, skills..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* View Tab Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setCurrentTab('grid')}
                className={`p-1.5 rounded-lg transition-all ${currentTab === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-[#000E32] dark:text-white' : 'text-slate-400'}`}
                title="Grid View"
              >
                <Users size={14} />
              </button>
              <button
                onClick={() => setCurrentTab('org')}
                className={`p-1.5 rounded-lg transition-all ${currentTab === 'org' ? 'bg-white dark:bg-slate-800 shadow-sm text-[#000E32] dark:text-white' : 'text-slate-400'}`}
                title="Organization Chart"
              >
                <Network size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-4"
            >
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              <p className="text-slate-400 text-xs">Authenticating team dossier indexes...</p>
            </motion.div>
          ) : currentTab === 'org' ? (
            <motion.div
              key="org-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="overflow-x-auto py-12 flex justify-center bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-900 rounded-3xl"
            >
              <div className="min-w-[800px] flex justify-center px-8">
                {hierarchyData.map(root => renderTreeNode(root))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {filteredStaff.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl">
                  <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={40} />
                  <h3 className="font-serif font-black text-slate-800 dark:text-white uppercase tracking-wide text-sm">No team members match</h3>
                  <p className="text-slate-400 text-xs mt-1">Try refining your filter chips or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredStaff.map((member) => {
                    const isHod = member.role === 'CEO' || member.role === 'Department Head';
                    return (
                      <motion.div
                        layout
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMember(member)}
                        key={member.id}
                        className={`bg-white dark:bg-slate-900 rounded-3xl border ${
                          isHod 
                            ? 'border-orange-500/40 dark:border-orange-500/20' 
                            : 'border-slate-200/50 dark:border-slate-800/80'
                        } overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full cursor-pointer group`}
                      >
                        {/* Profile Image Wrap */}
                        <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-950">
                          <img 
                            src={resolveStaffImageUrl(member.profile_photo_key)} 
                            alt={member.full_name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Top Tag */}
                          {member.role === 'CEO' && (
                            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-xl text-[9px] uppercase font-black flex items-center gap-1.5 shadow-md">
                              <Star size={10} className="fill-white" />
                              <span>CHIEF OFFICER</span>
                            </div>
                          )}
                          {member.role === 'Department Head' && (
                            <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-xl text-[9px] uppercase font-black flex items-center gap-1.5 shadow-md">
                              <Shield size={10} className="fill-indigo-300" />
                              <span>HOD DEPT</span>
                            </div>
                          )}

                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                            <span className="text-[10px] text-orange-400 font-extrabold uppercase flex items-center gap-1">
                              View Secure Dossier <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>

                        {/* Roster Details */}
                        <div className="p-5 text-left flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-extrabold block">
                              {getDepartmentName(member.department_id)}
                            </span>
                            <h3 className="font-extrabold text-[#000E32] dark:text-white text-sm uppercase font-serif tracking-wide truncate group-hover:text-orange-500 transition-colors">
                              {member.full_name}
                            </h3>
                            <p className="text-slate-400 dark:text-slate-300 text-[11px] font-medium leading-relaxed">
                              {member.job_title}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                            {member.specialization && (
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[9px] text-slate-500 dark:text-slate-300">
                                {member.specialization.split('&')[0]}
                              </span>
                            )}
                            {member.years_of_experience && (
                              <span className="bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md text-[9px] text-orange-600 dark:text-orange-400 font-bold">
                                {member.years_of_experience} yrs exp
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BIOMETRIC DOSSIER POPUP MODAL */}
        <AnimatePresence>
          {selectedMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Dark frosted overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMember(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              {/* Dossier Card Box */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-[85vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 hover:scale-105 transition-all"
                >
                  <X size={14} />
                </button>

                {/* Left Profile Media Frame */}
                <div className="w-full md:w-2/5 relative bg-slate-100 dark:bg-slate-950 shrink-0 h-64 md:h-auto">
                  <img 
                    src={resolveStaffImageUrl(selectedMember.profile_photo_key)} 
                    alt={selectedMember.full_name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Decorative digital overlays to invoke the security theme */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-6 flex flex-col justify-end text-left">
                    <span className="text-[9px] font-mono tracking-widest text-orange-400 font-extrabold uppercase">
                      SECURE CREDENTIAL ACTIVE
                    </span>
                    <h3 className="text-white font-serif font-extrabold uppercase text-lg leading-tight mt-1">
                      {selectedMember.full_name}
                    </h3>
                    <p className="text-slate-300 text-xs mt-0.5 font-light">
                      {selectedMember.job_title}
                    </p>
                    
                    {selectedMember.employee_id && (
                      <span className="text-[9px] font-mono text-slate-400 mt-2 block">
                        REF ID: {selectedMember.employee_id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Profile Details Scrollable */}
                <div className="p-6 md:p-8 flex-grow overflow-y-auto text-left space-y-6">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-indigo-500 dark:text-indigo-400 font-extrabold uppercase block mb-1">
                      // BIOMETRIC DEPT DOSSIER
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
                      {getDepartmentName(selectedMember.department_id)}
                    </h4>
                  </div>

                  {/* Biography text */}
                  {selectedMember.show_bio_publicly !== 0 && selectedMember.biography && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} className="text-orange-500" />
                        Executive Profile Biography
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                        {selectedMember.biography}
                      </p>
                    </div>
                  )}

                  {/* Skills tags */}
                  {selectedMember.skills && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Cpu size={12} className="text-indigo-500" />
                        Core Technical Specializations
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMember.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border border-indigo-100/50 dark:border-indigo-950/50">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications & Certifications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedMember.show_qualifications_publicly !== 0 && selectedMember.qualifications && (
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                          <GraduationCap size={12} className="text-orange-500" />
                          Academic Merits
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {selectedMember.qualifications}
                        </p>
                      </div>
                    )}
                    {selectedMember.certifications && (
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Award size={12} className="text-indigo-500" />
                          Professional Licenses
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {selectedMember.certifications}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Public contact / Details Row */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4">
                      {selectedMember.show_email_publicly !== 0 && selectedMember.email && (
                        <a 
                          href={`mailto:${selectedMember.email}`}
                          className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors"
                        >
                          <Mail size={12} />
                          <span>{selectedMember.email}</span>
                        </a>
                      )}
                      {selectedMember.show_phone_publicly !== 0 && selectedMember.phone && (
                        <a 
                          href={`tel:${selectedMember.phone}`}
                          className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors"
                        >
                          <Phone size={12} />
                          <span>{selectedMember.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Socials Link Row */}
                    {selectedMember.show_social_publicly !== 0 && (
                      <div className="flex gap-2.5">
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-500 transition-colors">
                          <Linkedin size={12} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-400 transition-colors">
                          <Twitter size={12} />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
                          <Github size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
