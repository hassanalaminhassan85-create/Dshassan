import { MIN_ACADEMY_TUITION } from './pricing';

// Master Academy Course Dataset with all 115 Courses & 22 Categories
export interface AcademyCategory {
  id: string;
  name: string;
  shortName: string;
  courseCount: number;
  iconName: string;
  gradient: string;
  accentColor: string;
  description: string;
}

export interface AcademyCourse {
  id: string;
  code: string;
  title: string;
  categoryId: string;
  categoryName: string;
  industry: string;
  duration: string;
  format: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | 'Executive';
  price: number;
  originalPrice?: number;
  description: string;
  learningOutcomes: string[];
  modules: {
    weekOrModule: string;
    title: string;
    topics: string[];
  }[];
  targetAudience: string[];
  prerequisites: string;
  certificateType: string;
  iconBadge: string;
  featured?: boolean;
}

export const ACADEMY_CATEGORIES: AcademyCategory[] = [
  { id: 'all', name: 'All Programs', shortName: 'All 115 Courses', courseCount: 115, iconName: 'Sparkles', gradient: 'from-orange-500 to-amber-500', accentColor: '#EA580C', description: 'Browse our complete catalog of 115+ specialized technical, digital, and leadership courses.' },
  { id: 'ai', name: 'Artificial Intelligence (AI) Industry', shortName: 'AI & Automation', courseCount: 5, iconName: 'Bot', gradient: 'from-blue-600 to-indigo-600', accentColor: '#4F46E5', description: 'Next-generation generative AI, workflow automation, enterprise agentic systems, and industry-specific AI tools.' },
  { id: 'healthcare', name: 'Healthcare Industry', shortName: 'Healthcare', courseCount: 3, iconName: 'HeartPulse', gradient: 'from-emerald-600 to-teal-600', accentColor: '#059669', description: 'Digital health systems, clinical marketing, AI diagnostics workflows, and medical content strategies.' },
  { id: 'education', name: 'Education Industry', shortName: 'Education', courseCount: 3, iconName: 'GraduationCap', gradient: 'from-purple-600 to-violet-600', accentColor: '#7C3AED', description: 'EdTech modernization, AI for teachers, classroom digitisation, and interactive instructional media.' },
  { id: 'agriculture', name: 'Agriculture Industry', shortName: 'Agribusiness', courseCount: 4, iconName: 'Sprout', gradient: 'from-lime-600 to-emerald-600', accentColor: '#16A34A', description: 'Agritech management, farm supply chain optimization, digital agribusiness commerce, and sustainable crop monetization.' },
  { id: 'marketing', name: 'Digital Marketing, Sales & Business Growth', shortName: 'Marketing & Sales', courseCount: 5, iconName: 'TrendingUp', gradient: 'from-orange-600 to-rose-600', accentColor: '#EA580C', description: 'Sponsored performance ads, algorithmic social management, enterprise sales funnels, and organic SEO architecture.' },
  { id: 'creative', name: 'Creative Media, Branding & Communication', shortName: 'Creative Media', courseCount: 8, iconName: 'Palette', gradient: 'from-pink-600 to-rose-500', accentColor: '#E11D48', description: 'Professional video editing, brand identity engineering, podcast studio mastery, and scriptwriting.' },
  { id: 'tech', name: 'Information Technology, Software & Cybersecurity', shortName: 'IT & Software', courseCount: 5, iconName: 'Code', gradient: 'from-cyan-600 to-blue-600', accentColor: '#0284C7', description: 'Full-stack software engineering, modern cloud systems, defensive cybersecurity, and enterprise app design.' },
  { id: 'fintech', name: 'Data Science, Business Intelligence & FinTech', shortName: 'Data & FinTech', courseCount: 7, iconName: 'BarChart3', gradient: 'from-teal-600 to-cyan-600', accentColor: '#0D9488', description: 'Predictive data analytics, BI dashboards, algorithmic finance, digital banking, and FinTech product design.' },
  { id: 'business', name: 'Business, Entrepreneurship & Professional Development', shortName: 'Business & PM', courseCount: 8, iconName: 'Briefcase', gradient: 'from-amber-600 to-yellow-500', accentColor: '#D97706', description: 'Startup structuring, agile project management (PMP), corporate HRM, executive negotiation, and business excellence.' },
  { id: 'executive', name: 'Executive Leadership & Management', shortName: 'Executive CEO', courseCount: 7, iconName: 'Crown', gradient: 'from-yellow-600 to-amber-700', accentColor: '#B45309', description: 'C-suite strategic leadership, AI tools for executive decision making, and modern vertical management.' },
  { id: 'realestate', name: 'Real Estate Industry', shortName: 'Real Estate', courseCount: 8, iconName: 'Building', gradient: 'from-indigo-600 to-blue-700', accentColor: '#4338CA', description: 'Property marketing funnels, real estate VR tours, asset management, and high-yield real estate investments.' },
  { id: 'hospitality', name: 'Hospitality, Tourism & Events', shortName: 'Hospitality & Tourism', courseCount: 9, iconName: 'Utensils', gradient: 'from-fuchsia-600 to-pink-600', accentColor: '#C026D3', description: 'Luxury hotel operations, high-end restaurant systems, experiential event management, and destination tourism.' },
  { id: 'legal', name: 'Legal Industry', shortName: 'Legal & Law', courseCount: 4, iconName: 'Scale', gradient: 'from-slate-700 to-slate-900', accentColor: '#334155', description: 'AI for legal research, law firm digital business development, and digital marketing for legal practitioners.' },
  { id: 'government', name: 'Government, Politics & Public Administration', shortName: 'Gov & Politics', courseCount: 4, iconName: 'Landmark', gradient: 'from-emerald-700 to-teal-800', accentColor: '#047857', description: 'E-government digital transformation, campaign strategy for political leaders, and public relations.' },
  { id: 'ngo', name: 'NGO & Development', shortName: 'NGO & Humanitarian', courseCount: 3, iconName: 'Globe', gradient: 'from-sky-600 to-indigo-600', accentColor: '#0369A1', description: 'Grant writing, donor fundraising funnels, humanitarian logistics, and community development frameworks.' },
  { id: 'fashion', name: 'Fashion & Beauty', shortName: 'Fashion & Beauty', courseCount: 5, iconName: 'Shirt', gradient: 'from-rose-500 to-pink-600', accentColor: '#E11D48', description: 'Fashion brand architecture, digital apparel marketing, e-commerce storefronts, and beauty content creation.' },
  { id: 'construction', name: 'Construction & Engineering', shortName: 'Construction & Eng.', courseCount: 5, iconName: 'HardHat', gradient: 'from-amber-600 to-orange-700', accentColor: '#C2410C', description: 'Construction project management, AutoCAD building design fundamentals, and structural commercial marketing.' },
  { id: 'energy', name: 'Oil, Gas & Energy', shortName: 'Oil & Energy', courseCount: 5, iconName: 'Flame', gradient: 'from-red-600 to-amber-600', accentColor: '#DC2626', description: 'Certified HSE environmental management, energy business administration, and oil & gas project pipelines.' },
  { id: 'faith', name: 'Religious Organizations & Faith-Based', shortName: 'Faith & Ministry', courseCount: 4, iconName: 'BookOpen', gradient: 'from-violet-600 to-purple-800', accentColor: '#6D28D9', description: 'Church digital media production, live streaming operations, AI administration, and faith outreach funnels.' },
  { id: 'manufacturing', name: 'Manufacturing & Production', shortName: 'Manufacturing', courseCount: 3, iconName: 'Factory', gradient: 'from-zinc-600 to-slate-700', accentColor: '#52525B', description: 'Lean manufacturing pipelines, total quality assurance (QA/QC), and automated inventory management.' },
  { id: 'entertainment', name: 'Media & Entertainment', shortName: 'Entertainment', courseCount: 5, iconName: 'Film', gradient: 'from-purple-600 to-rose-600', accentColor: '#9333EA', description: 'AI cinema production, television broadcasting, digital journalism, and comedy skit monetization.' },
  { id: 'remote', name: 'Freelancing & Remote Work', shortName: 'Remote & Freelance', courseCount: 5, iconName: 'Laptop', gradient: 'from-emerald-500 to-cyan-600', accentColor: '#10B981', description: 'Upwork top-rated blueprint, Fiverr gigs optimization, virtual assistant skills, and USD remote career scaling.' }
];

export const RAW_COURSES_METADATA = [
  // 1. ARTIFICIAL INTELLIGENCE (AI) INDUSTRY - 5 Courses
  { code: 'DSTA-AI101', title: 'Artificial Intelligence (AI) for Business & Productivity', cat: 'ai', catName: 'Artificial Intelligence (AI) Industry', ind: 'AI & Business', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Bot', feat: true, desc: 'Master prompt engineering, generative AI tools, Gemini integrations, and automated office workflows that increase business throughput by 10x.' },
  { code: 'DSTA-AIK102', title: 'AI for Kids & Teens Productivity Programme', cat: 'ai', catName: 'Artificial Intelligence (AI) Industry', ind: 'Youth EdTech', dur: '4 Weeks', price: 35000, orig: 60000, lvl: 'Beginner' as const, badge: 'Sparkles', feat: false, desc: 'Equip youth with responsible AI literacy, creative storytelling tools, visual generative art, and foundational programming thinking.' },
  { code: 'DSTA-AI103', title: 'Artificial Intelligence (AI) & Automation Programme', cat: 'ai', catName: 'Artificial Intelligence (AI) Industry', ind: 'Enterprise AI & Automation', dur: '8 Weeks', price: 65000, orig: 120000, lvl: 'Intermediate' as const, badge: 'Cpu', feat: true, desc: 'Build no-code and low-code autonomous workflows using Make, Zapier, n8n, webhook triggers, and Gemini API endpoints.' },
  { code: 'DSTA-AIH104', title: 'AI for Healthcare Professionals', cat: 'ai', catName: 'Artificial Intelligence (AI) Industry', ind: 'Healthcare & Digital Medicine', dur: '6 Weeks', price: 55000, orig: 95000, lvl: 'Intermediate' as const, badge: 'HeartPulse', feat: false, desc: 'Explore diagnostic assistance, automated medical transcription, EHR data summarization, and ethical AI in patient care.' },
  { code: 'DSTA-AIF137', title: 'AI for Finance Professionals', cat: 'ai', catName: 'Artificial Intelligence (AI) Industry', ind: 'FinTech & Analytics', dur: '6 Weeks', price: 60000, orig: 110000, lvl: 'Advanced' as const, badge: 'TrendingUp', feat: false, desc: 'Harness machine learning and AI for financial forecasting, algorithmic risk management, fraud detection, and automated report drafting.' },

  // 2. HEALTHCARE INDUSTRY - 3 Courses
  { code: 'DSTA-DMH105', title: 'Digital Marketing for Hospitals & Clinics', cat: 'healthcare', catName: 'Healthcare Industry', ind: 'Healthcare Growth', dur: '4 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'HeartPulse', feat: false, desc: 'Grow patient intake, establish local clinic Google Maps dominance, build trustworthy medical social campaigns, and comply with medical advertising ethics.' },
  { code: 'DSTA-CCH106', title: 'Content Creation for Hospitals & Clinics', cat: 'healthcare', catName: 'Healthcare Industry', ind: 'Medical Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Produce high-converting medical reels, doctor explainer videos, patient testimonial graphics, and informative healthcare carousels.' },
  { code: 'DSTA-AIH104-HC', title: 'AI for Healthcare Professionals (Clinical Track)', cat: 'healthcare', catName: 'Healthcare Industry', ind: 'Digital Health', dur: '6 Weeks', price: 55000, orig: 95000, lvl: 'Intermediate' as const, badge: 'HeartPulse', feat: false, desc: 'Clinical documentation acceleration, triage assistant tools, EHR data extraction, and AI diagnostic workflows for hospitals.' },

  // 3. EDUCATION INDUSTRY - 3 Courses
  { code: 'DSTA-AIT107', title: 'AI for Teachers & Educators', cat: 'education', catName: 'Education Industry', ind: 'EdTech & Teaching', dur: '4 Weeks', price: 30000, orig: 55000, lvl: 'All Levels' as const, badge: 'GraduationCap', feat: false, desc: 'Supercharge lesson planning, quiz generation, personalized learning materials, and grading workflows using AI assistants.' },
  { code: 'DSTA-DST108', title: 'Digital Skills for Teachers', cat: 'education', catName: 'Education Industry', ind: 'Classroom Technology', dur: '4 Weeks', price: 30000, orig: 50000, lvl: 'Beginner' as const, badge: 'Laptop', feat: false, desc: 'Master Google Classroom, interactive slide design, spreadsheet grading records, virtual whiteboards, and online teaching tools.' },
  { code: 'DSTA-CCS109', title: 'Content Creation for Schools & Educators', cat: 'education', catName: 'Education Industry', ind: 'School Branding', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Build school enrollment reels, campus highlight videos, teacher spotlights, and parent engagement social media channels.' },

  // 4. AGRICULTURE INDUSTRY - 4 Courses
  { code: 'DSTA-AA110', title: 'Agribusiness & Agritech Management', cat: 'agriculture', catName: 'Agriculture Industry', ind: 'AgriTech & Farm Business', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Sprout', feat: true, desc: 'Transform traditional agriculture into profitable, tech-driven agribusiness with IoT sensors, farm ERP software, and supply chain tracking.' },
  { code: 'DSTA-DMF111', title: 'Digital Marketing for Farmers & Agribusinesses', cat: 'agriculture', catName: 'Agriculture Industry', ind: 'Agri-Commerce', dur: '4 Weeks', price: 40000, orig: 70000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Sell agricultural commodities, processed foods, and farm equipment online using social commerce, WhatsApp business catalogs, and targeted ads.' },
  { code: 'DSTA-CCA112', title: 'Content Creation for Agribusiness', cat: 'agriculture', catName: 'Agriculture Industry', ind: 'Farm Storytelling', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Create engaging farm vlogs, harvest reels, processing plant mini-documentaries, and agricultural brand storytelling.' },
  { code: 'DSTA-AE113', title: 'Agricultural Entrepreneurship & Farm Business Management', cat: 'agriculture', catName: 'Agriculture Industry', ind: 'Farm Strategy', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Master budgeting, cash flow forecasting, labor management, risk mitigation, and scaling strategies for small to medium farms.' },

  // 5. DIGITAL MARKETING, SALES & BUSINESS GROWTH - 5 Courses
  { code: 'DSTA-DM114', title: 'Digital Marketing Professional Programme', cat: 'marketing', catName: 'Digital Marketing, Sales & Business Growth', ind: 'Digital Marketing', dur: '8 Weeks', price: 50000, orig: 100000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: true, desc: 'The master comprehensive digital marketing programme covering Meta Ads, Google Ads, TikTok Ads, Email automation, SEO, and full-funnel strategy.' },
  { code: 'DSTA-SMM115', title: 'Social Media Management', cat: 'marketing', catName: 'Digital Marketing, Sales & Business Growth', ind: 'Social Media Strategy', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Sparkles', feat: false, desc: 'Master organic brand positioning, algorithmic growth on Instagram, LinkedIn & TikTok, content calendar scheduling, and client management.' },
  { code: 'DSTA-SB116', title: 'Sales & Business Development Programme', cat: 'marketing', catName: 'Digital Marketing, Sales & Business Growth', ind: 'Sales Mastery', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Transform your closing rates with high-ticket sales psychology, cold outreach frameworks, pipeline management, and enterprise B2B pitching.' },
  { code: 'DSTA-SA117', title: 'Sponsored Ads Professional Programme', cat: 'marketing', catName: 'Digital Marketing, Sales & Business Growth', ind: 'Paid Advertising', dur: '6 Weeks', price: 55000, orig: 105000, lvl: 'Intermediate' as const, badge: 'TrendingUp', feat: true, desc: 'Deep dive into Meta Ads Manager, TikTok Ads, Google Search/Display, and programmatic bidding with real ad budget spend simulation.' },
  { code: 'DSTA-SEO118', title: 'Search Engine Optimization (SEO) Programme', cat: 'marketing', catName: 'Digital Marketing, Sales & Business Growth', ind: 'SEO & Search', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'Intermediate' as const, badge: 'Search', feat: false, desc: 'Rank websites #1 on Google with technical SEO audits, keyword clusters, programmatic content, backlink building, and Google Search Console.' },

  // 6. CREATIVE MEDIA, BRANDING & COMMUNICATION - 8 Courses
  { code: 'DSTA-CC119', title: 'Content Creation & Video Editing', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Video Production', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Film', feat: true, desc: 'Master Premiere Pro, DaVinci Resolve, and CapCut. Learn pacing, sound design, color grading, motion graphics, and narrative hook construction.' },
  { code: 'DSTA-GD120', title: 'Graphics Design & Branding Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Graphic Design', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Palette', feat: false, desc: 'Create unforgettable brand visual identities, vector logos, typography hierarchies, corporate brand guidelines, and print collateral in Illustrator & Photoshop.' },
  { code: 'DSTA-PP121', title: 'Podcast Production & Management Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Audio Media', dur: '4 Weeks', price: 40000, orig: 70000, lvl: 'All Levels' as const, badge: 'Mic', feat: false, desc: 'Launch, produce, and syndicate studio-quality audio/video podcasts with Spotify/Apple distribution, studio mic setups, and sponsorship monetization.' },
  { code: 'DSTA-MB122', title: 'Media & News Broadcasting Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Broadcasting', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Radio', feat: false, desc: 'Master on-air television presenting, news teleprompter reading, broadcast journalism ethics, live field reporting, and newsroom workflows.' },
  { code: 'DSTA-SC123', title: 'Script Writing & Copywriting Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Copywriting', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'FileText', feat: false, desc: 'Write words that sell and stories that captivate. Covers commercial ad copy, video sales letters (VSLs), email marketing copy, and film screenplays.' },
  { code: 'DSTA-VP124', title: 'Videography Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Cinematography', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Video', feat: false, desc: 'Master manual camera operations (ISO, Aperture, Shutter Speed), 3-point cinematic lighting, drone piloting basics, and gimbal stabilization.' },
  { code: 'DSTA-PP125', title: 'Photography Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Photography', dur: '6 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'Camera', feat: false, desc: 'Master portrait, studio, corporate, and event photography with professional strobe lights, Lightroom color editing, and client portrait retouching.' },
  { code: 'DSTA-SCM126', title: 'Sports Content Creation & Monetization Programme', cat: 'creative', catName: 'Creative Media, Branding & Communication', ind: 'Sports Media', dur: '4 Weeks', price: 40000, orig: 70000, lvl: 'All Levels' as const, badge: 'Trophy', feat: false, desc: 'Create viral football and sports commentary reels, match highlight breakdowns, sports podcasts, and secure betting/athletic brand sponsorships.' },

  // 7. INFORMATION TECHNOLOGY, SOFTWARE & CYBERSECURITY - 5 Courses
  { code: 'DSTA-IT127', title: 'Information Technology (IT) & Computer Science (CS) Programme', cat: 'tech', catName: 'Information Technology, Software & Cybersecurity', ind: 'Computer Science', dur: '10 Weeks', price: 60000, orig: 110000, lvl: 'All Levels' as const, badge: 'Cpu', feat: true, desc: 'Comprehensive computer science foundations covering computer architecture, data structures, networking protocols, Linux command line, and algorithms.' },
  { code: 'DSTA-ICT128', title: 'ICT Support & System Administration', cat: 'tech', catName: 'Information Technology, Software & Cybersecurity', ind: 'IT Administration', dur: '6 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'HardDrive', feat: false, desc: 'Diagnose and resolve enterprise hardware/software faults, configure corporate routers/switches, manage Active Directory, and support end-users.' },
  { code: 'DSTA-WD129', title: 'Website Design & Development', cat: 'tech', catName: 'Information Technology, Software & Cybersecurity', ind: 'Web Development', dur: '8 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'Code', feat: true, desc: 'Build responsive, lightning-fast commercial websites with HTML5, CSS3, JavaScript, Tailwind CSS, WordPress CMS, and React basics.' },
  { code: 'DSTA-SD130', title: 'Software & Mobile Apps Design & Development', cat: 'tech', catName: 'Information Technology, Software & Cybersecurity', ind: 'Software Engineering', dur: '12 Weeks', price: 75000, orig: 150000, lvl: 'Intermediate' as const, badge: 'Smartphone', feat: true, desc: 'Full-stack software engineering with React, Node.js, Express, PostgreSQL/MongoDB, and React Native cross-platform mobile apps for iOS and Android.' },
  { code: 'DSTA-CS131', title: 'Cyber Security Programme', cat: 'tech', catName: 'Information Technology, Software & Cybersecurity', ind: 'Cyber Defense', dur: '8 Weeks', price: 65000, orig: 120000, lvl: 'Intermediate' as const, badge: 'ShieldAlert', feat: true, desc: 'Learn ethical hacking, penetration testing, network defense, vulnerability scanning with Wireshark/Nmap, and SOC security incident response.' },

  // 8. DATA SCIENCE, BUSINESS INTELLIGENCE & FINTECH - 7 Courses
  { code: 'DSTA-DA132', title: 'Data Analysis & Business Intelligence Programme', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'Data Analytics', dur: '8 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'BarChart3', feat: true, desc: 'Transform raw data into strategic business insights using Power BI, Advanced Excel, SQL database querying, and interactive dashboard design.' },
  { code: 'DSTA-DBF133', title: 'Digital Banking & FinTech', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'FinTech Systems', dur: '6 Weeks', price: 55000, orig: 95000, lvl: 'Intermediate' as const, badge: 'CreditCard', feat: false, desc: 'Master core digital banking infrastructure, payment gateways (Paystack/Flutterwave APIs), open banking standards, and digital wallet engineering.' },
  { code: 'DSTA-FT134', title: 'Financial Technology (FinTech)', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'FinTech Innovation', dur: '8 Weeks', price: 60000, orig: 110000, lvl: 'Intermediate' as const, badge: 'Layers', feat: false, desc: 'Architect modern FinTech products, regulatory sandboxes, KYC/AML compliance engines, and automated credit scoring systems.' },
  { code: 'DSTA-DFB135', title: 'Digital Finance & Business Analytics', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'Financial Analytics', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Perform financial modeling, revenue forecasting, unit economics analysis, and executive KPI dashboarding in Python and PowerBI.' },
  { code: 'DSTA-FS136', title: 'Financial Sales & Customer Relationship Management', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'Financial Sales', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Sell wealth management, insurance, loans, and investment products while utilizing modern CRM pipelines for client retention.' },
  { code: 'DSTA-AIF137-FT', title: 'AI for Finance Professionals', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'FinTech AI', dur: '6 Weeks', price: 60000, orig: 110000, lvl: 'Advanced' as const, badge: 'Bot', feat: false, desc: 'Algorithmic trading basics, generative financial reporting, credit risk classification models, and anomaly fraud detection.' },
  { code: 'DSTA-CCB138', title: 'Content Creation for Banking & Finance Services', cat: 'fintech', catName: 'Data Science, Business Intelligence & FinTech', ind: 'FinTech Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Create financial literacy video series, investment explainers, mobile banking tutorials, and regulatory compliance reels.' },

  // 9. BUSINESS, ENTREPRENEURSHIP & PROFESSIONAL DEVELOPMENT - 8 Courses
  { code: 'DSTA-BE140', title: 'Business Startup & Entrepreneurship', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Entrepreneurship', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Rocket', feat: true, desc: 'Formulate viable business models, register with CAC, establish corporate governance, build financial forecasts, and pitch angel investors.' },
  { code: 'DSTA-PM141', title: 'Project Management Professional Programme', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Project Management', dur: '8 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'CheckSquare', feat: true, desc: 'Master Agile, Scrum, Kanban, and PMBOK methodologies. Manage budgets, project roadmaps, risk registers, and Jira/Asana workflows.' },
  { code: 'DSTA-HRM142', title: 'Human Resource Management (HRM) Professional Programme', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Human Resources', dur: '6 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'Users', feat: false, desc: 'Master modern talent acquisition, payroll administration, employee performance appraisal KPIs, labor law compliance, and culture engineering.' },
  { code: 'DSTA-AOM143', title: 'Administrative & Office Management Professional Programme', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Office Administration', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Building2', feat: false, desc: 'Executive office organization, calendar scheduling, corporate travel coordination, confidential records filing, and meeting minutes documentation.' },
  { code: 'DSTA-CSE144', title: 'Customer Service Excellence', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Customer Success', dur: '4 Weeks', price: 30000, orig: 55000, lvl: 'All Levels' as const, badge: 'Heart', feat: false, desc: 'Deliver world-class customer experience (CX), de-escalate difficult client complaints, manage omnichannel support tickets, and drive NPS scores.' },
  { code: 'DSTA-LE145', title: 'Leadership & Emotional Intelligence', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Leadership', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Crown', feat: false, desc: 'Develop self-awareness, empathetic team leadership, stress management, crisis composure, and conflict resolution capabilities.' },
  { code: 'DSTA-CE146', title: 'Corporate Etiquette', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Corporate Polish', dur: '3 Weeks', price: 25000, orig: 50000, lvl: 'All Levels' as const, badge: 'Award', feat: false, desc: 'Master executive presence, professional dress codes, boardroom protocol, email diplomacy, and corporate networking dining etiquette.' },
  { code: 'DSTA-NIS147', title: 'Negotiation & Influencing Skills', cat: 'business', catName: 'Business, Entrepreneurship & Professional Development', ind: 'Negotiation', dur: '4 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Master Harvard negotiation principles, BATNA formulation, high-stakes contract bargaining, and persuasive psychological influence.' },

  // 10. EXECUTIVE LEADERSHIP & MANAGEMENT - 7 Courses
  { code: 'DSTA-CSL148', title: 'CEO & Strategic Leadership & Management Programme', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Executive Leadership', dur: '6 Weeks', price: 85000, orig: 160000, lvl: 'Executive' as const, badge: 'Crown', feat: true, desc: 'C-Suite strategy formulation, corporate governance, investor relations, scaling organizational culture, and executive decision-making frameworks.' },
  { code: 'DSTA-CSR149', title: 'CEO & Strategic Modern Restaurant Operations & Management', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Hospitality Leadership', dur: '6 Weeks', price: 75000, orig: 140000, lvl: 'Executive' as const, badge: 'Utensils', feat: false, desc: 'Master food cost percentage formulas, modern POS systems, kitchen labor scheduling, franchise expansion, and health safety compliance.' },
  { code: 'DSTA-CSH150', title: 'CEO & Strategic Modern Hotel Operations & Management', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Hotel Leadership', dur: '6 Weeks', price: 75000, orig: 140000, lvl: 'Executive' as const, badge: 'Building', feat: false, desc: 'Drive hotel RevPAR and occupancy yield management, luxury guest experience standards, OTA channel management, and property upkeep.' },
  { code: 'DSTA-CSN151', title: 'CEO & Strategic Modern NGO Operations & Management', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'NGO Leadership', dur: '6 Weeks', price: 70000, orig: 130000, lvl: 'Executive' as const, badge: 'Globe', feat: false, desc: 'Lead international non-profits with strategic grant acquisition, board stewardship, USAID/UN compliance, and multi-country project execution.' },
  { code: 'DSTA-CSR152', title: 'CEO & Strategic Modern Real Estate Operations & Management', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Real Estate Leadership', dur: '8 Weeks', price: 85000, orig: 160000, lvl: 'Executive' as const, badge: 'Building2', feat: true, desc: 'Master real estate syndication, large-scale land acquisitions, joint-venture structural modeling, and commercial asset portfolio management.' },
  { code: 'DSTA-CSC153', title: 'CEO & Strategic Construction Business Operations & Management', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Construction Leadership', dur: '8 Weeks', price: 85000, orig: 160000, lvl: 'Executive' as const, badge: 'HardHat', feat: false, desc: 'Lead commercial construction firms with FIDIC contract management, heavy equipment leasing optimization, and government tender bidding.' },
  { code: 'DSTA-CAI154', title: 'AI Skills & Digital Tools for CEOs', cat: 'executive', catName: 'Executive Leadership & Management', ind: 'Executive Tech', dur: '4 Weeks', price: 80000, orig: 150000, lvl: 'Executive' as const, badge: 'Bot', feat: true, desc: 'Executive masterclass on utilizing generative AI for rapid decision making, board deck generation, financial query bots, and digital modernization.' },

  // 11. REAL ESTATE INDUSTRY - 8 Courses
  { code: 'DSTA-RE155', title: 'Real Estate & Digital Marketing', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Real Estate Marketing', dur: '6 Weeks', price: 50000, orig: 95000, lvl: 'All Levels' as const, badge: 'Building', feat: true, desc: 'Generate high-net-worth property buyer leads with Meta Ads, Google Ads for luxury estates, virtual 3D property tours, and YouTube site walkthroughs.' },
  { code: 'DSTA-RES156', title: 'Real Estate Sales & Marketing', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Property Sales', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Close land and home sales faster with proven objection handling scripts, diaspora investor pitching, and high-converting inspection tour events.' },
  { code: 'DSTA-REM157', title: 'Real Estate Management', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Real Estate Management', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Layers', feat: false, desc: 'Manage commercial and residential estates, coordinate tenancy agreements, collect service charges, and enforce facility maintenance schedules.' },
  { code: 'DSTA-PM158', title: 'Property Management', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Property Management', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Key', feat: false, desc: 'Tenant screening procedures, eviction legal protocols, rental yield optimization, property inspection checklists, and maintenance vendor management.' },
  { code: 'DSTA-REI159', title: 'Real Estate Investment', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Property Investment', dur: '6 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'DollarSign', feat: false, desc: 'Calculate ROI, rental yields, capital appreciation rates, land banking opportunities, and off-plan development risk assessment.' },
  { code: 'DSTA-RED160', title: 'Real Estate Digital Marketing Skills', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Property Digital Skills', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Laptop', feat: false, desc: 'Create property landing pages on Carrd/WordPress, configure WhatsApp property bots, and run hyper-local Facebook ads for estate launches.' },
  { code: 'DSTA-CCR161', title: 'Content Creation for Real Estate', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Real Estate Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Script and host captivating luxury home walkthrough reels, estate aerial breakdowns, neighborhood guides, and client closing celebration videos.' },
  { code: 'DSTA-REP162', title: 'Real Estate Photography & Videography', cat: 'realestate', catName: 'Real Estate Industry', ind: 'Property Visuals', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Camera', feat: false, desc: 'Capture wide-angle architectural photography, HDR interior lighting, drone estate flyovers, and cinematic sunset twilight property shots.' },

  // 12. HOSPITALITY, TOURISM & EVENTS - 9 Courses
  { code: 'DSTA-HM163', title: 'Hospitality & Hotel Management Programme', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Hospitality Management', dur: '8 Weeks', price: 50000, orig: 95000, lvl: 'All Levels' as const, badge: 'Building', feat: true, desc: 'Master front desk PMS software (Opera), housekeeping audits, room division management, and international guest service hospitality protocols.' },
  { code: 'DSTA-EP164', title: 'Event Planning & Management Programme', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Event Management', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Sparkles', feat: false, desc: 'Plan and execute luxury weddings, corporate conferences, and concerts with vendor contracts, floorplan 3D layouts, and crisis contingency plans.' },
  { code: 'DSTA-HOM165', title: 'Hotel Operations Management', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Hotel Operations', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Layers', feat: false, desc: 'Supervise daily check-ins/check-outs, laundry operations, concierge workflows, inventory requisitions, and guest satisfaction metrics.' },
  { code: 'DSTA-ROM166', title: 'Restaurant Operations Management', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Restaurant Operations', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Utensils', feat: false, desc: 'Optimize dining room turn rates, kitchen expeditor workflows, HACCP food hygiene regulations, and staff service sequence etiquette.' },
  { code: 'DSTA-TTM167', title: 'Tourism & Travel Management', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Travel & Tourism', dur: '6 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'Globe', feat: false, desc: 'Package attractive domestic and international travel tour itineraries, flight booking GDS systems (Amadeus/Sabre), and visa assistance consultancy.' },
  { code: 'DSTA-ETE168', title: 'Event & Tourism Entrepreneurship', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Tourism Business', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Launch a profitable travel agency, event equipment rental business, or eco-tourism lodge with solid financial plans and customer acquisition.' },
  { code: 'DSTA-HRC169', title: 'Hotel & Restaurant Customer Management', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Guest Experience', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Heart', feat: false, desc: 'Transform VIP guest relationships, handle dining complaints with grace, design loyalty loyalty point programmes, and manage TripAdvisor reviews.' },
  { code: 'DSTA-CHR170', title: 'Content Creation for Hotels & Restaurants', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Food & Stay Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Produce mouth-watering food reels, chef preparation behind-the-scenes, hotel room aesthetic tours, and influencer tasting event coverage.' },
  { code: 'DSTA-CET171', title: 'Content Creation for Events & Tourism', cat: 'hospitality', catName: 'Hospitality, Tourism & Events', ind: 'Travel Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Camera', feat: false, desc: 'Capture high-energy concert recaps, destination travel vlogs, cultural festival highlights, and event promo teaser videos.' },

  // 13. LEGAL INDUSTRY - 4 Courses
  { code: 'DSTA-AIL172', title: 'AI for Lawyers & Law Firms', cat: 'legal', catName: 'Legal Industry', ind: 'Legal Tech & AI', dur: '4 Weeks', price: 60000, orig: 110000, lvl: 'All Levels' as const, badge: 'Scale', feat: true, desc: 'Accelerate case law research, draft legal contracts, summarize 200-page court proceedings, and ensure client privilege data security using AI.' },
  { code: 'DSTA-DML173', title: 'Digital Marketing Skills for Lawyers & Law Firms', cat: 'legal', catName: 'Legal Industry', ind: 'Legal Marketing', dur: '4 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Attract corporate clients and retainers via LinkedIn thought leadership, legal blog SEO, and compliant practice promotion under RPC rules.' },
  { code: 'DSTA-CLL174', title: 'Content Creation for Lawyers & Law Firms', cat: 'legal', catName: 'Legal Industry', ind: 'Legal Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Produce educational "Know Your Rights" short-form reels, legal podcast interviews, client advisory infographics, and webinar masterclasses.' },
  { code: 'DSTA-LFB175', title: 'Law Firm Business Development', cat: 'legal', catName: 'Legal Industry', ind: 'Law Practice Growth', dur: '4 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Structure corporate retainers, pitch multinational tenders, manage billing recovery rates, and network with general counsels.' },

  // 14. GOVERNMENT, POLITICS & PUBLIC ADMINISTRATION - 4 Courses
  { code: 'DSTA-PRG176', title: 'Public Relations & Government Communication', cat: 'government', catName: 'Government, Politics & Public Administration', ind: 'Public PR', dur: '6 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'Landmark', feat: true, desc: 'Formulate government ministry communication strategies, manage press briefings, counter fake news, and draft official executive releases.' },
  { code: 'DSTA-EG177', title: 'E-Government & Digital Transformation', cat: 'government', catName: 'Government, Politics & Public Administration', ind: 'Digital Governance', dur: '6 Weeks', price: 65000, orig: 120000, lvl: 'All Levels' as const, badge: 'Cpu', feat: false, desc: 'Digitize civil service workflows, build citizen portal services, implement secure document management, and ensure data privacy compliance.' },
  { code: 'DSTA-CCM178', title: 'Campaign Coordination & Management for Politicians', cat: 'government', catName: 'Government, Politics & Public Administration', ind: 'Political Strategy', dur: '6 Weeks', price: 75000, orig: 140000, lvl: 'Executive' as const, badge: 'TrendingUp', feat: true, desc: 'Manage political campaign election rooms, coordinate voter sentiment polling, direct grassroots mobilization, and plan town halls.' },
  { code: 'DSTA-CCP179', title: 'Content Creation for Politics & Political Figures', cat: 'government', catName: 'Government, Politics & Public Administration', ind: 'Political Media', dur: '4 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Produce charismatic candidate campaign documentaries, policy explainers, rally live streams, and constituent achievement infographics.' },

  // 15. NGO & DEVELOPMENT - 3 Courses
  { code: 'DSTA-NGO180', title: 'NGO Management', cat: 'ngo', catName: 'NGO & Development', ind: 'Non-Profit Management', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Globe', feat: true, desc: 'Manage non-governmental organizations, structure board bylaws, write winning grant proposals, and maintain donor compliance reporting.' },
  { code: 'DSTA-CDP181', title: 'Community Development Programme', cat: 'ngo', catName: 'NGO & Development', ind: 'Community Impact', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Users', feat: false, desc: 'Design participatory community interventions, execute baseline needs assessments, and mobilize local stakeholders for sustainable impact.' },
  { code: 'DSTA-HPM182', title: 'Humanitarian Project Management', cat: 'ngo', catName: 'NGO & Development', ind: 'Humanitarian Relief', dur: '6 Weeks', price: 50000, orig: 95000, lvl: 'All Levels' as const, badge: 'CheckSquare', feat: false, desc: 'Manage emergency relief logistics, IDP camp interventions, MEAL (Monitoring, Evaluation, Accountability and Learning) frameworks, and security protocols.' },

  // 16. FASHION & BEAUTY - 5 Courses
  { code: 'DSTA-FB183', title: 'Fashion Business Management', cat: 'fashion', catName: 'Fashion & Beauty', ind: 'Fashion Business', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Shirt', feat: true, desc: 'Cost apparel production, manage garment sampling runs, establish supply chains, and price ready-to-wear fashion collections profitably.' },
  { code: 'DSTA-FGM184', title: 'Fashion Digital Marketing', cat: 'fashion', catName: 'Fashion & Beauty', ind: 'Fashion Marketing', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Run high-converting Instagram/TikTok ads for fashion drops, collaborate with style influencers, and set up retargeting funnels for apparel.' },
  { code: 'DSTA-BBM185', title: 'Beauty Brand Management', cat: 'fashion', catName: 'Fashion & Beauty', ind: 'Beauty & Skincare', dur: '6 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Sparkles', feat: false, desc: 'Launch and scale skincare, cosmetics, and haircare brands with NAFDAC compliance, packaging design, and retail distribution strategies.' },
  { code: 'DSTA-FCC186', title: 'Fashion Content Creation', cat: 'fashion', catName: 'Fashion & Beauty', ind: 'Style Content', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Camera', feat: false, desc: 'Shoot viral "Get Ready With Me" (GRWM) reels, lookbook flatlays, runway clips, and high-fashion editorial streetwear photos on smartphone.' },
  { code: 'DSTA-ECF187', title: 'E-Commerce for Fashion Brands', cat: 'fashion', catName: 'Fashion & Beauty', ind: 'Fashion E-Commerce', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Laptop', feat: false, desc: 'Build modern Shopify/WooCommerce fashion stores with size guides, Paystack checkout, inventory sync, and international DHL shipping integration.' },

  // 17. CONSTRUCTION & ENGINEERING - 5 Courses
  { code: 'DSTA-CPM189', title: 'Construction Project Management', cat: 'construction', catName: 'Construction & Engineering', ind: 'Construction PM', dur: '8 Weeks', price: 60000, orig: 110000, lvl: 'All Levels' as const, badge: 'HardHat', feat: true, desc: 'Master construction scheduling, bill of quantities (BOQ) estimation, site safety inspections, subcontractor management, and milestone tracking.' },
  { code: 'DSTA-ABD190', title: 'AutoCAD & Building Design Basics', cat: 'construction', catName: 'Construction & Engineering', ind: 'Architectural CAD', dur: '6 Weeks', price: 50000, orig: 95000, lvl: 'Beginner' as const, badge: 'Layers', feat: false, desc: 'Draft 2D architectural floorplans, structural elevations, electrical schematics, and plumbing layouts using AutoCAD.' },
  { code: 'DSTA-CBD191', title: 'Construction Business Development', cat: 'construction', catName: 'Construction & Engineering', ind: 'Engineering Business', dur: '4 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Bid for public procurement tenders, structure joint venture property construction deals, and write winning technical proposals.' },
  { code: 'DSTA-CDM192', title: 'Construction Digital Marketing', cat: 'construction', catName: 'Construction & Engineering', ind: 'Construction Marketing', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Market civil engineering, interior decoration, and roofing services to developers and high-net-worth building owners online.' },
  { code: 'DSTA-CCB193', title: 'Content Creation for Construction Businesses', cat: 'construction', catName: 'Construction & Engineering', ind: 'Site Media', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Film timelapse building progress videos, heavy machinery demonstrations, site engineer interviews, and architectural finished reveals.' },

  // 18. OIL, GAS & ENERGY - 5 Courses
  { code: 'DSTA-HSE194', title: 'HSE (Health, Safety & Environment)', cat: 'energy', catName: 'Oil, Gas & Energy', ind: 'Industrial HSE', dur: '6 Weeks', price: 50000, orig: 95000, lvl: 'All Levels' as const, badge: 'ShieldCheck', feat: true, desc: 'Certified HSE Levels 1, 2, & 3 training covering hazard identification, fire safety, environmental impact assessments, and OSHA compliance.' },
  { code: 'DSTA-PMO195', title: 'Project Management for Oil & Gas', cat: 'energy', catName: 'Oil, Gas & Energy', ind: 'Energy Project Management', dur: '8 Weeks', price: 65000, orig: 120000, lvl: 'Intermediate' as const, badge: 'Flame', feat: false, desc: 'Manage upstream, midstream, and downstream energy projects, offshore logistics, procurement contracts, and regulatory DPR compliance.' },
  { code: 'DSTA-EBM196', title: 'Energy Business Management', cat: 'energy', catName: 'Oil, Gas & Energy', ind: 'Energy Economics', dur: '6 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Understand global crude oil trading dynamics, gas monetization, solar mini-grid business models, and energy transition investments.' },
  { code: 'DSTA-DSE197', title: 'Digital Skills for Energy Professionals', cat: 'energy', catName: 'Oil, Gas & Energy', ind: 'Energy Tech', dur: '4 Weeks', price: 45000, orig: 85000, lvl: 'All Levels' as const, badge: 'Laptop', feat: false, desc: 'Master SCADA telemetry interfaces, energy data modeling in Python/Excel, pipeline sensor analytics, and digital asset management.' },
  { code: 'DSTA-CEB198', title: 'Content Creation for Energy Businesses', cat: 'energy', catName: 'Oil, Gas & Energy', ind: 'Energy Media', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Create solar installation showcases, renewable energy educational campaigns, corporate sustainability CSR videos, and safety reels.' },

  // 19. RELIGIOUS ORGANIZATIONS & FAITH-BASED - 4 Courses
  { code: 'DSTA-CHD199', title: 'Church Media & Digital Ministry', cat: 'faith', catName: 'Religious Organizations & Faith-Based', ind: 'Church Media', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Video', feat: true, desc: 'Set up multi-cam Sunday live broadcasts in vMix/OBS, manage sound mixers, create sermon sermonette reels, and operate ProPresenter.' },
  { code: 'DSTA-AIC200', title: 'AI for Church Ministry & Administration', cat: 'faith', catName: 'Religious Organizations & Faith-Based', ind: 'Faith AI', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'Bot', feat: false, desc: 'Draft sermon research outlines, automate member follow-up messages on WhatsApp, transcribe sermon audio, and generate devotionals with AI.' },
  { code: 'DSTA-CDM201', title: 'Church Digital Marketing', cat: 'faith', catName: 'Religious Organizations & Faith-Based', ind: 'Church Outreach', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: false, desc: 'Reach local community members with Facebook invitation ads, manage YouTube livestream algorithms, and promote annual conferences online.' },
  { code: 'DSTA-CRO202', title: 'Content Creation for Religious Organizations', cat: 'faith', catName: 'Religious Organizations & Faith-Based', ind: 'Faith Media', dur: '4 Weeks', price: 30000, orig: 60000, lvl: 'All Levels' as const, badge: 'Film', feat: false, desc: 'Design inspiring daily scripture graphics in Canva, produce choir music videos, edit testimony reels, and build digital member bulletins.' },

  // 20. MANUFACTURING & PRODUCTION - 3 Courses
  { code: 'DSTA-PM203', title: 'Production Management', cat: 'manufacturing', catName: 'Manufacturing & Production', ind: 'Plant Operations', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Factory', feat: true, desc: 'Optimize factory plant throughput, eliminate assembly line bottlenecks, reduce material scrap, and implement Lean 5S manufacturing.' },
  { code: 'DSTA-QAQ204', title: 'Quality Assurance & Quality Control (QA/QC)', cat: 'manufacturing', catName: 'Manufacturing & Production', ind: 'Quality Engineering', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'CheckSquare', feat: false, desc: 'Formulate standard operating procedures (SOPs), statistical process control charts, ISO 9001 quality audits, and root cause analysis.' },
  { code: 'DSTA-IM205', title: 'Inventory Management', cat: 'manufacturing', catName: 'Manufacturing & Production', ind: 'Inventory Control', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Layers', feat: false, desc: 'Master EOQ (Economic Order Quantity), barcode/RFID warehouse tracking, safety stock formulas, and ERP inventory synchronization.' },

  // 21. MEDIA & ENTERTAINMENT - 5 Courses
  { code: 'DSTA-DJ206', title: 'Digital Journalism', cat: 'entertainment', catName: 'Media & Entertainment', ind: 'Online Journalism', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'FileText', feat: true, desc: 'Write investigative digital articles, verify online sources, shoot mobile journalism (MoJo) field reports, and manage online news blogs.' },
  { code: 'DSTA-AIF207', title: 'AI Film Production', cat: 'entertainment', catName: 'Media & Entertainment', ind: 'AI Cinema', dur: '6 Weeks', price: 55000, orig: 100000, lvl: 'All Levels' as const, badge: 'Bot', feat: true, desc: 'Create full cinematic movies using Midjourney, Runway Gen-2/Gen-3, Sora tools, ElevenLabs voice cloning, and AI orchestral soundtrack scores.' },
  { code: 'DSTA-TVP208', title: 'TV Presentation', cat: 'entertainment', catName: 'Media & Entertainment', ind: 'TV Hosting', dur: '4 Weeks', price: 45000, orig: 80000, lvl: 'All Levels' as const, badge: 'Mic', feat: false, desc: 'Host lifestyle, red carpet, sports, and talk show programs with teleprompter poise, dynamic vocal projection, and guest interview banter.' },
  { code: 'DSTA-CSP209', title: 'Comedy & Skit Production', cat: 'entertainment', catName: 'Media & Entertainment', ind: 'Comedy & Entertainment', dur: '4 Weeks', price: 40000, orig: 70000, lvl: 'All Levels' as const, badge: 'Smile', feat: false, desc: 'Write punchy comedic timing scripts, direct viral TikTok/Instagram skits, sound design comedic sound effects, and monetize brand placements.' },
  { code: 'DSTA-EBM210', title: 'Entertainment Business Management', cat: 'entertainment', catName: 'Media & Entertainment', ind: 'Entertainment Business', dur: '6 Weeks', price: 50000, orig: 90000, lvl: 'All Levels' as const, badge: 'Briefcase', feat: false, desc: 'Talent artist management, royalty collection mechanisms, music publishing copyright, live concert booking contracts, and brand sponsorships.' },

  // 22. FREELANCING & REMOTE WORK - 5 Courses
  { code: 'DSTA-FM211', title: 'Freelancing Masterclass', cat: 'remote', catName: 'Freelancing & Remote Work', ind: 'Freelance Business', dur: '4 Weeks', price: 35000, orig: 70000, lvl: 'All Levels' as const, badge: 'Laptop', feat: true, desc: 'Launch a thriving global freelance business from Nigeria, price in USD, receive international bank payments securely, and win repeat foreign clients.' },
  { code: 'DSTA-USP212', title: 'Upwork Success Programme', cat: 'remote', catName: 'Freelancing & Remote Work', ind: 'Upwork Mastery', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'TrendingUp', feat: true, desc: 'Achieve Top-Rated Plus status on Upwork with 100% Job Success Score, write high-converting proposals, and bid on $1,000+ fixed-price jobs.' },
  { code: 'DSTA-FPM213', title: 'Fiverr Professional Programme', cat: 'remote', catName: 'Freelancing & Remote Work', ind: 'Fiverr Mastery', dur: '4 Weeks', price: 35000, orig: 65000, lvl: 'All Levels' as const, badge: 'CheckSquare', feat: false, desc: 'Rank Fiverr gigs on page 1 with keyword optimization, create eye-catching gig video trailers, upsell gig extras, and achieve Level 2 seller status.' },
  { code: 'DSTA-VAP214', title: 'Virtual Assistant Professional', cat: 'remote', catName: 'Freelancing & Remote Work', ind: 'Virtual Assistance', dur: '6 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Headphones', feat: true, desc: 'Master executive email triage, calendar booking across timezones, travel booking, CRM lead data entry, and Slack/Notion project workflows.' },
  { code: 'DSTA-RWC215', title: 'Remote Work Career Development', cat: 'remote', catName: 'Freelancing & Remote Work', ind: 'Global Remote Jobs', dur: '4 Weeks', price: 40000, orig: 75000, lvl: 'All Levels' as const, badge: 'Globe', feat: false, desc: 'Land full-time remote roles paying in USD/EUR on Wellfound, RemoteOK, and LinkedIn. Polish your ATS-proof resume and ace asynchronous video interviews.' }
];

export const ACADEMY_COURSES: AcademyCourse[] = RAW_COURSES_METADATA.map((c, index) => {
  return {
    id: `course-${c.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    code: c.code,
    title: c.title,
    categoryId: c.cat,
    categoryName: c.catName,
    industry: c.ind,
    duration: c.dur,
    format: '70% Practical / 30% Theory',
    level: c.lvl,
    price: MIN_ACADEMY_TUITION,
    originalPrice: 85000,
    description: c.desc,
    learningOutcomes: [
      `Master industry-grade tools and practical workflows for ${c.title}`,
      `Build real-world deployable portfolio projects under direct instructor guidance`,
      `Learn client acquisition, project pricing, and high-income monetization strategies`,
      `Obtain accredited certification with cryptographic verification QR code`
    ],
    modules: [
      {
        weekOrModule: 'Module 1',
        title: 'Core Fundamentals & Conceptual Framework',
        topics: ['Industry Standards & Overview', 'Setup & Essential Tooling', 'Best Practices & Modern Methodologies']
      },
      {
        weekOrModule: 'Module 2',
        title: 'Hands-on Labs & Execution Workflow',
        topics: ['70% Practical Implementation', 'Case Studies & Real-world Scenarios', 'Optimization, Testing & Iteration']
      },
      {
        weekOrModule: 'Module 3',
        title: 'Capstone Project & Career Monetization',
        topics: ['Live Client Project Submission', 'Portfolio & Profile Review', 'Certification & Placement Support']
      }
    ],
    targetAudience: ['Career Seekers & Professionals', 'Business Owners & Executives', 'Freelancers & Tech Enthusiasts'],
    prerequisites: 'Basic computer literacy and enthusiasm to learn.',
    certificateType: `Certified ${c.title.split('&')[0].trim()} Specialist (DSTA-${c.code.replace('DSTA-', '')})`,
    iconBadge: c.badge,
    featured: c.feat || index < 12
  };
});

export const QUICK_STATS = [
  {
    id: 'stat-1',
    value: '70% / 30%',
    label: 'Practical / Theory',
    subtext: 'Hands-on project-first pedagogy',
    iconName: 'GraduationCap',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'stat-2',
    value: '4+ Languages',
    label: 'Multilingual Learning',
    subtext: 'English, Hausa, Yoruba, Igbo',
    iconName: 'Globe',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'stat-3',
    value: '115+ Courses',
    label: 'Industry Programs',
    subtext: 'Comprehensive DSTA certifications',
    iconName: 'BookOpen',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'stat-4',
    value: '22+ Sectors',
    label: 'Industry Domains',
    subtext: 'Tailored for African & global markets',
    iconName: 'Building2',
    color: 'from-purple-600 to-pink-600'
  }
];

export const CORE_VALUES = [
  {
    id: 'val-1',
    title: 'Excellence',
    subtitle: 'Striving for the Highest Standards',
    description: 'We adhere to uncompromising quality in curriculum design, tutor pedigree, and project deliverables.',
    iconName: 'Award',
    accent: 'border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-950/30'
  },
  {
    id: 'val-2',
    title: 'Innovation',
    subtitle: 'Embracing Technology & Creativity',
    description: 'Pioneering cutting-edge generative AI, software architectures, and modern digital strategies in Africa.',
    iconName: 'Sparkles',
    accent: 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/30'
  },
  {
    id: 'val-3',
    title: 'Integrity',
    subtitle: 'Honesty, Accountability, Professionalism',
    description: 'Operating with absolute corporate transparency, authentic certification hashing, and ethical mentoring.',
    iconName: 'ShieldCheck',
    accent: 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
  },
  {
    id: 'val-4',
    title: 'Practicality',
    subtitle: 'Hands-on Skills that Create Value',
    description: '70% practical workshops and 30% theory ensures students ship real live projects before graduating.',
    iconName: 'Cpu',
    accent: 'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/30'
  },
  {
    id: 'val-5',
    title: 'Growth',
    subtitle: 'Continuous Learning & Development',
    description: 'Fostering lifelong career progression, skill updates, and professional mentorship networks.',
    iconName: 'TrendingUp',
    accent: 'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-950/30'
  },
  {
    id: 'val-6',
    title: 'Empowerment',
    subtitle: 'Equipping with Skills & Confidence',
    description: 'Transforming youth, executives, and organizations into globally competitive digital champions.',
    iconName: 'Crown',
    accent: 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/30'
  }
];

export const WHY_CHOOSE_US_ACCORDIONS = [
  {
    id: 'why-1',
    title: '1. Practical Learning Approach (70/30 Rule)',
    icon: 'Layers',
    content: 'At DS Tech Academy, we strictly enforce the 70% practical and 30% theory methodology. Students do not just read concepts; they build functional web apps, configure live ad budgets, produce broadcast-grade video reels, and deploy AI assistants under active instructor supervision.'
  },
  {
    id: 'why-2',
    title: '2. Industry-Relevant & Continuously Updated Curriculum',
    icon: 'FileText',
    content: 'Our courses are formulated alongside corporate industry leaders and certified practitioners. Every syllabus is audited quarterly to reflect real-world employer needs, latest software tooling, and modern market dynamics.'
  },
  {
    id: 'why-3',
    title: '3. Experienced Professional Mentors & Tutors',
    icon: 'Users',
    content: 'Learn directly from veteran software engineers, agency media buyers, registered legal consultants, and seasoned creative directors who practice what they teach daily across international markets.'
  },
  {
    id: 'why-4',
    title: '4. Guaranteed Internship & Placement Opportunities',
    icon: 'Briefcase',
    content: 'Top-performing graduates receive direct placement into the DS Tech & Digital Marketing Agency talent node, partner enterprise firms, and remote freelancing pipelines with dedicated career coaching.'
  },
  {
    id: 'why-5',
    title: '5. Verifiable Professional Certification',
    icon: 'Award',
    content: 'Every graduate receives a cryptographically hashed certificate with unique verification QR codes registered under DS Tech & Digital Marketing Ltd (CAC Accredited: RC-7945781).'
  },
  {
    id: 'why-6',
    title: '6. Flexible Learning Options (Physical, Virtual & Hybrid)',
    icon: 'Laptop',
    content: 'Choose between our state-of-the-art physical training hubs in Abuja and Adamawa State, or join our ultra-interactive live virtual weekend and weekday evening cohorts from anywhere in the world.'
  },
  {
    id: 'why-7',
    title: '7. Multilingual Learning Support (English, Hausa, Yoruba, Igbo)',
    icon: 'Globe',
    content: 'Bridging the digital divide across West Africa by offering core explanatory tracks and localized mentorship in English, Hausa, Yoruba, and Igbo to ensure zero language barrier in tech mastery.'
  },
  {
    id: 'why-8',
    title: '8. Comprehensive Career Development & Resume Polish',
    icon: 'TrendingUp',
    content: 'We equip every student with portfolio design, LinkedIn profile optimization, Upwork/Fiverr gig setup, mock job interview drills, and contract negotiation masterclasses.'
  },
  {
    id: 'why-9',
    title: '9. Cutting-Edge Innovation & AI-Powered Toolsets',
    icon: 'Sparkles',
    content: 'Gain access to premium AI suites, cloud developer sandboxes, automated CRM sandboxes, and enterprise digital libraries throughout your duration of study.'
  }
];

export const CEO_MESSAGE = {
  author: 'Desmond Samaila',
  title: 'Founder & Chief Executive Officer',
  company: 'DS Tech & Digital Marketing Ltd',
  headline: 'Welcome to Africa\'s Premier Digital Transformation Academy',
  quote: "At DS Tech Academy, our mission is clear: to bridge the gap between academic theory and real-world tech competence. In a rapidly evolving global economy, digital skills are no longer optional—they are the currency of the future.",
  paragraphs: [
    "Welcome to DS Tech Academy, the educational vanguard of DS Tech & Digital Marketing Ltd. We were founded on a singular conviction: that anyone, regardless of background, can master high-income tech and digital capabilities when provided with disciplined, hands-on mentorship.",
    "We have pioneered our signature 70% Practical and 30% Theory pedagogical framework across 115+ specialized courses spanning 22 industries. From generative AI to healthcare marketing, agribusiness technology to cyber defense, we equip our students with verified skills that deliver immediate economic value.",
    "Whether you are a student launching your career, a working professional upskilling for executive leadership, or a corporate organization training your workforce, DS Tech Academy provides the roadmap, the community, and the certification to take you to the zenith of your field."
  ],
  stats: ['115+ Specialized Courses', '70% Practical Hands-on', '4+ Regional Languages', '100% Industry Aligned']
};

export const CONTACT_DETAILS = {
  headOffice: 'Ext A-73 Efab Mall, Second Floor, Area 11, Garki, Abuja, Nigeria',
  branchOffice: 'No 67 Ahmadu Bello Way Near Livak Arena Hotel Numan LGA, Adamawa State, Nigeria',
  phone: '+234 902 348 9111',
  whatsapp: '+234 902 348 9111',
  emails: ['info@dstechacademy.com', 'dstechanddigitalmarketingltd@gmail.com'],
  website: 'https://ds-techs.netlify.app/'
};

export function getCourseByCode(code: string): AcademyCourse | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toLowerCase();
  return ACADEMY_COURSES.find(c => c.code.toLowerCase() === normalized || c.id.toLowerCase() === normalized);
}

