// Extended Ecosystem Datasets for DS Tech & Digital Marketing Agency
// Maps the full 26 services catalog, portfolio projects, blog posts, courses, and client portal states.

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  url: string;
  category: 'marketing' | 'web' | 'software' | 'ai' | 'business' | 'branding' | 'ict' | 'training' | 'compliance';
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  client: string;
  date: string;
  description: string;
  image: string;
  stats?: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  description: string;
  content: string;
  readTime: string;
  tags: string[];
  image: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isFree?: boolean;
  videoUrl?: string;
  content?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: 'Beginner' | 'Advanced' | 'All Levels';
  price: string;
  lessons: Lesson[];
  category: 'marketing' | 'web' | 'ai' | 'business' | 'compliance';
}

export interface ClientProject {
  id: string;
  name: string;
  status: 'planning' | 'progress' | 'review' | 'completed';
  progress: number;
  deadline: string;
  clientName: string;
  budget: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  project: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved' | 'closed';
  date: string;
  lastMessage: string;
}

// ---------------------------------------------------------
// 1. THE 26 SERVICE CATALOG DATASET
// ---------------------------------------------------------
export const SERVICES: ServiceItem[] = [
  {
    id: "svc_01",
    name: "Sponsored Ads Campaign Management Price List",
    price: "₦20,000 – ₦1,000,000+",
    description: "Professional sponsored ads campaign management for Facebook, Instagram, Google, and TikTok to maximize leads, sales, and ROI.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/25850225841340268/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_02",
    name: "Digital Marketing Monthly Packages",
    price: "₦50,000 – ₦1,000,000+",
    description: "Monthly digital marketing packages including social media marketing, search engine optimization, content creation, and weekly performance reporting.",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f311?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26382467731420705/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_03",
    name: "Professional Training & Consultancy",
    price: "₦30,000 – ₦250,000+",
    description: "Professional training and consultancy services in digital advertising, sales funnels, visual branding, and enterprise technology integrations.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/25542672705411157/2349023489111",
    category: "training"
  },
  {
    id: "svc_04",
    name: "Content Creation and Presentation Price List",
    price: "₦20,000 – ₦1,000,000+",
    description: "Professional content creation, presentation, and video editing for social media campaigns, YouTube, product launches, and corporate documentaries.",
    image: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/27413518328335319/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_05",
    name: "Social Media Management Price List",
    price: "₦50,000 – ₦5,000,000+",
    description: "Comprehensive social media management services for various brands, incorporating graphic designs, copy writing, community moderation, and scheduled postings.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/36346113405034532/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_06",
    name: "Website Design and Development Price List",
    price: "₦100,000 – ₦5,000,000+",
    description: "Modern, responsive, and secure website design and development for corporate bodies, blogs, institutions, landing pages, and e-commerce platforms.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/25279439215065803/2349023489111",
    category: "web"
  },
  {
    id: "svc_07",
    name: "Software and Mobile App Design and Development Price List",
    price: "₦100,000 – ₦50,000,000+",
    description: "Custom software and mobile app development for businesses, including e-commerce platforms, SaaS portals, logistics systems, and custom database APIs.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26225498943742627/2349023489111",
    category: "software"
  },
  {
    id: "svc_08",
    name: "Project Design, Management and Development Packages",
    price: "₦50,000 – ₦10,000,000+",
    description: "Professional project planning, management, and development packages matching creative concepts, timeline scoping, budget optimization, and sprint delivery.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26167607822850385/2349023489111",
    category: "business"
  },
  {
    id: "svc_09",
    name: "Content Creation and Presentation Portfolio Suite",
    price: "₦20,000 – ₦1,000,000+",
    description: "Professional content creation, presentation, and video editing for branding, strategic reviews, sales pitches, and viral video presentations.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26597769666481362/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_10",
    name: "Software and Mobile App Enterprise Architecture",
    price: "₦100,000 – ₦50,000,000+",
    description: "Custom enterprise software and mobile app development including backend systems, payment gateways, CRM integrations, and admin dashboards.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/24624570223908004/2349023489111",
    category: "software"
  },
  {
    id: "svc_11",
    name: "Web Portals and Systems Architecture Price List",
    price: "₦100,000 – ₦5,000,000+",
    description: "E-commerce, educational management portals, real estate directories, booking platforms, and secure customized web portals.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26128542710120929/2349023489111",
    category: "web"
  },
  {
    id: "svc_12",
    name: "Portfolio Design Package",
    price: "₦100,000 – ₦700,000+",
    description: "Professional portfolio website design for individuals, corporate profiles, public figures, models, and agency representation.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26668195106121616/2349023489111",
    category: "web"
  },
  {
    id: "svc_13",
    name: "Strategic Project Blueprinting and Consultancy",
    price: "₦50,000 – ₦10,000,000+",
    description: "Professional project planning, management, and development packages focusing on structural CAC milestones and tech rollout.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26743797038538261/2349023489111",
    category: "business"
  },
  {
    id: "svc_14",
    name: "Business Plan Design and Development Strategy Package",
    price: "₦30,000 – ₦5,000,000+",
    description: "Professional business planning, investment proposals, financial modeling, and growth strategy services tailored for VC pitches or bank loans.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/25954683467492812/2349023489111",
    category: "business"
  },
  {
    id: "svc_15",
    name: "Social Media Campaigns Mastery Pricing",
    price: "₦50,000 – ₦5,000,000+",
    description: "Viral marketing strategies, sponsored influencer placements, community moderation, and scheduled high-frequency brand campaigns.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26368015026143477/2349023489111",
    category: "marketing"
  },
  {
    id: "svc_16",
    name: "Beginners Training",
    price: "₦30,000 per Session",
    description: "Digital marketing and business growth training for individuals and groups. Basics of social ads, setup, and copywriting.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26297518699844284/2349023489111",
    category: "training"
  },
  {
    id: "svc_17",
    name: "Exclusive and Advanced Trainings",
    price: "₦80,000 per Session",
    description: "Advanced digital marketing, programmatic ads, server-side tracking, full-stack React framework deployment, and algorithmic bidding.",
    image: "https://images.unsplash.com/photo-1516534775068-ba3e84589d90?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/25982764844679627/2349023489111",
    category: "training"
  },
  {
    id: "svc_18",
    name: "Customer Care Service Management",
    price: "Contact for pricing",
    description: "Online customer service management activities for brands, including CRM desks, WhatsApp help lines, chat agents, and email support setups.",
    image: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26202659736068290/2349023489111",
    category: "business"
  },
  {
    id: "svc_19",
    name: "DS ICT SUPPORT & SMART TECHNOLOGY SERVICES",
    price: "Contact for pricing",
    description: "Professional solar installation, high-definition CCTV security nodes, DSTV mapping, intercom setups, smart switches, and smart technology automation.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/27071233869154664/2349023489111",
    category: "ict"
  },
  {
    id: "svc_20",
    name: "DS BRANDING AND GRAPHIC DESIGNS SERVICES",
    price: "Contact for pricing",
    description: "Brand identity development, premium vector graphics design, logos, corporate banners, flyers, packaging designs, and company stationery bundles.",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/27195191726837563/2349023489111",
    category: "branding"
  },
  {
    id: "svc_21",
    name: "DS SOFTWARE APP DESIGNING AND DEVELOPMENT SERVICES",
    price: "Contact for pricing",
    description: "Development of mobile apps (Android/iOS), web apps (React), robust databases, systems architecture, and API integration for local and international markets.",
    image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26866563059619529/2349023489111",
    category: "software"
  },
  {
    id: "svc_22",
    name: "AI Content Creation Packages",
    price: "₦100,000 – ₦5,000,000+",
    description: "Smart, automated content creation powered by state-of-the-art Artificial Intelligence (Gemini/GPT models) tailored for dynamic social channels.",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26682737784737815/2349023489111",
    category: "ai"
  },
  {
    id: "svc_23",
    name: "AI Chatbot Development Package",
    price: "₦150,000 – ₦10,000,000+",
    description: "Intelligent conversational AI-powered chatbots for automated business responses, CRM automation, lead capturing, and support routing on WhatsApp and Web.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd50a?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/27016836764677969/2349023489111",
    category: "ai"
  },
  {
    id: "svc_24",
    name: "Business Data Analytics Services",
    price: "₦70,000 – ₦5,000,000+",
    description: "Transforming raw numbers and operational logs into actionable business insights with beautiful dashboards, predictive graphs, and charts.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26946847588347983/2349023489111",
    category: "business"
  },
  {
    id: "svc_25",
    name: "CYBERSECURITY SERVICES",
    price: "₦100,000 – ₦10,000,000+",
    description: "Cybersecurity vulnerability assessments, corporate penetration testing, employee security awareness training, and network configuration hardening.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/28514091548192000/2349023489111",
    category: "ict"
  },
  {
    id: "svc_26",
    name: "CAC, Tax and SCUML Certificate Registration Services",
    price: "₦30,000 – ₦1,000,000+",
    description: "Business registration with CAC, tax clearance (TIN/FIRS) certifications, and SCUML regulatory compliance solutions for Nigerian corporations and agencies.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60",
    url: "https://wa.me/p/26539806062359802/2349023489111",
    category: "compliance"
  }
];

// ---------------------------------------------------------
// 2. PORTFOLIO DATASET (CASE STUDIES & SHOWCASE)
// ---------------------------------------------------------
export const PORTFOLIO: PortfolioProject[] = [
  {
    id: "proj_01",
    title: "National Ad Strategy for Abuja Smart Homes",
    category: "Digital Marketing",
    client: "Abuja Smart Real Estate Ltd",
    date: "March 2025",
    description: "Deployed a full-funnel high-ROAS marketing campaign on Facebook and Instagram. Crafted custom real estate video pitches and automated lead-forms connected to our custom CRM WhatsApp chatbot.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60",
    stats: "+320% Qualified Leads, ₦85M Sales generated",
    tags: ["Sponsored Ads", "Leads Funnels", "WhatsApp CRM"]
  },
  {
    id: "proj_02",
    title: "Secure Enterprise Logistics Web App",
    category: "Software Development",
    client: "Garki Modern Logistics Hub",
    date: "January 2025",
    description: "Engineered a custom secure real-time inventory and delivery tracking React dashboard, integrating GPS route coordinates, automated receipts, and SMS dispatch nodes.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=60",
    stats: "Sub-second database latency, 15k parcels tracked",
    tags: ["React.js", "Node.js", "GPS Mapping", "Tailwind CSS"]
  },
  {
    id: "proj_03",
    title: "CAC & Regulatory Compliance Onboarding",
    category: "Compliance Services",
    client: "West Africa Energy Hub",
    date: "May 2025",
    description: "Fast-tracked corporate incorporation, SCUML compliance certification, and Federal Inland Revenue Service (FIRS) tax clearance, completing registration in 5 days.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=60",
    stats: "100% legal clearance in 5 business days",
    tags: ["CAC Filing", "SCUML Cert", "FIRS Tax Compliance"]
  },
  {
    id: "proj_04",
    title: "Advanced AI Customer Care Chatbot",
    category: "AI Solutions",
    client: "Niger Telecoms & Retail",
    date: "April 2025",
    description: "Designed a secure Gemini-powered chatbot, serving 10,000+ daily customers. Routes queries, solves basic order trackers, and books technical consultation calls autonomously.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd50a?w=800&auto=format&fit=crop&q=60",
    stats: "82% tickets resolved instantly without agents",
    tags: ["Gemini AI SDK", "WhatsApp Automation", "CRM Sync"]
  },
  {
    id: "proj_05",
    title: "Luxury Brand Identity & Corporate Stationery",
    category: "Branding & Graphics",
    client: "Lekki Diamond Suites",
    date: "February 2025",
    description: "Re-designed total brand assets: high-end gold-foil logos, corporate letterheads, high-resolution visual presentations, and modern employee ID designs.",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=60",
    stats: "Winner of West-Africa Creative Logo Design",
    tags: ["Brand Identity", "Vector Logos", "Print Assets"]
  },
  {
    id: "proj_06",
    title: "Smart Technology & IP Surveillance Security",
    category: "ICT Solutions",
    client: "Executive Villa, Maitama, Abuja",
    date: "June 2025",
    description: "Complete layout of high-performance smart switches, off-grid solar node backups, HD optical IP cameras, and biometric automated entrance gates.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=60",
    stats: "24/7 solar backup, 0% blindspot security coverage",
    tags: ["Smart Tech", "CCTV Security", "Solar Backup"]
  }
];

// ---------------------------------------------------------
// 3. BLOG POSTS DATASET
// ---------------------------------------------------------
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog_01",
    title: "Maximizing Your Ad Spent: The Ultimate Guide for Nigerian SMBs",
    category: "Marketing",
    author: "Hassan Al-Amin",
    date: "June 15, 2026",
    description: "How to avoid wasting money on social media ads. Master regional targeting (Lagos, Abuja, Port Harcourt) and set up programmatic pixels.",
    content: "When deploying ads in Nigeria, standard broad targeting is a recipe for budget exhaustion. Instead, segmenting targets into specific high-income hubs like Maitama/Asokoro in Abuja or Ikoyi/Lekki in Lagos yields 4x higher quality leads. Furthermore, utilizing WhatsApp click-to-chat CTA paths drastically increases conversions since over 85% of local buyers prefer direct messaging over complex e-commerce checkouts...",
    readTime: "5 min read",
    tags: ["Sponsored Ads", "ROAS Optimization", "SMB Growth"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "blog_02",
    title: "Demystifying CAC Corporate Filings & Compliance in 2026",
    category: "Business Growth",
    author: "Barr. Chidi Onyekwelu",
    date: "May 28, 2026",
    description: "A step-by-step review of incorporating limited liability companies with FIRS TIN processing and SCUML anti-money laundering certifications.",
    content: "Registering a company in Nigeria used to take months of heavy bureaucracy. In 2026, the CAC portal enables faster registration, but single errors can delay approvals for weeks. Ensuring that your board members' identification records are fully aligned and processing SCUML and TIN simultaneously is the gold standard for immediate banking permissions...",
    readTime: "7 min read",
    tags: ["CAC Filing", "Tax Clearances", "Regulatory Compliance"],
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "blog_03",
    title: "Why AI-Powered Chatbots are the Future of Customer Experience",
    category: "AI",
    author: "David Chibuzor",
    date: "April 10, 2026",
    description: "How modern AI models like Gemini are enabling local brands to offer automated customer support on WhatsApp, saving millions in CRM costs.",
    content: "Customers expect instant responses. In West Africa, where mobile data usage is dominated by WhatsApp, businesses that deploy smart generative AI chatbots can reduce customer support response times from hours to milliseconds. By training models on specific business documents, AI handles 80%+ of repetitive queries safely and escalates priority cases to human desks...",
    readTime: "4 min read",
    tags: ["Generative AI", "WhatsApp CRM", "Automation"],
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "blog_04",
    title: "Building Scalable Web Products with React 19 & Tailwind CSS v4",
    category: "Technology",
    author: "Tunde Olanrewaju",
    date: "March 18, 2026",
    description: "A technical dive into layout optimizations, micro-interactions, type-safety, and esbuild pipeline bundles on edge hosting.",
    content: "Modern user interfaces require fluid, fast, and aesthetically distinctive components. Tailwind's compilation model combined with React's native concurrent features allows us to render interactive portals instantly. We dive deep into glassmorphism variables, motion presets, and the security rules necessary for dual electronic signatures...",
    readTime: "8 min read",
    tags: ["React 19", "Tailwind CSS v4", "Web Engineering"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60"
  }
];

// ---------------------------------------------------------
// 4. LMS COURSES DATASET (TRAINING ACADEMY)
// ---------------------------------------------------------
export const COURSES: Course[] = [
  {
    id: "crs_01",
    title: "Digital Marketing & Social Ads Mastery",
    description: "Master Facebook, Google, and TikTok sponsored ad systems, budget bidding algorithms, custom pixel tracking, and copywriting to generate premium high-intent leads.",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f311?w=600&auto=format&fit=crop&q=60",
    duration: "6 weeks (12 Lessons)",
    level: "All Levels",
    price: "₦75,000",
    category: "marketing",
    lessons: [
      { id: "les_1_1", title: "Introduction to Social Media Algorithms", duration: "45 mins", isFree: true, content: "Learn how modern social platforms rank content and trigger ad spaces." },
      { id: "les_1_2", title: "Configuring Your First High-Conversion Ad Manager", duration: "1 hr 15 mins", content: "Setting up Business Manager accounts, billing nodes, and secure access permissions." },
      { id: "les_1_3", title: "Audience Segmentation & Regional Mapping", duration: "55 mins", content: "Demographic targeting and lookalike audience strategies specific to West Africa." },
      { id: "les_1_4", title: "Copywriting and High-Click Creative Assets", duration: "1 hr", content: "Writing compelling hooks, structured benefit list copy, and design presets that convert." }
    ]
  },
  {
    id: "crs_02",
    title: "React & TypeScript Frontend Web Engineering",
    description: "Learn to build professional, blazing-fast, and highly micro-animated full-stack React applications with Tailwind CSS, esbuild pipelines, and secure API bindings.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60",
    duration: "10 weeks (20 Lessons)",
    level: "Advanced",
    price: "₦150,000",
    category: "web",
    lessons: [
      { id: "les_2_1", title: "Modern JavaScript & TypeScript Type Safety", duration: "1 hr", isFree: true, content: "Declaring clean interfaces, custom types, standard enums, and module imports." },
      { id: "les_2_2", title: "React Component Architecture & State Management", duration: "1 hr 30 mins", content: "Hooks, custom state persistence, Context API, and modular layout splitting." },
      { id: "les_2_3", title: "Framer Motion & Custom Micro-Interactions", duration: "1 hr 10 mins", content: "Designing fluid card flips, staggered lists, ambient glows, and page exit transitions." },
      { id: "les_2_4", title: "Express.js Integration & Server-Side Proxies", duration: "1 hr 45 mins", content: "Connecting your frontend to secure APIs to proxy sensitive keys." }
    ]
  },
  {
    id: "crs_03",
    title: "CAC Registration & Regulatory Legal Compliance",
    description: "Become a professional registration consultant. Step-by-step masterclass on limited liability filings, SCUML clearances, and FIRS TIN registrations.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=60",
    duration: "4 weeks (8 Lessons)",
    level: "Beginner",
    price: "₦45,000",
    category: "compliance",
    lessons: [
      { id: "les_3_1", title: "CAC Portal Navigation & Name Reservations", duration: "50 mins", isFree: true, content: "Securing names, avoiding common disapproval keywords, and registering profiles." },
      { id: "les_3_2", title: "Drafting Articles of Association & Board Resolutions", duration: "1 hr 20 mins", content: "Structuring shareholder ratios, board authorities, and custom legal clauses." },
      { id: "les_3_3", title: "Processing TIN & SCUML Certificates", duration: "1 hr 05 mins", content: "Filing compliance checklists, upload guidelines, and EFCC SCUML clearances." }
    ]
  },
  {
    id: "crs_04",
    title: "AI-Powered Business Process Automation",
    description: "Learn to deploy custom Gemini-powered chatbots, automated report analyzers, and smart email systems using server-side Node.js integrations.",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60",
    duration: "5 weeks (10 Lessons)",
    level: "All Levels",
    price: "₦90,000",
    category: "ai",
    lessons: [
      { id: "les_4_1", title: "Introduction to Google GenAI SDK and Keys", duration: "50 mins", isFree: true, content: "Accessing Gemini models, setting temperature parameters, and secure server env setups." },
      { id: "les_4_2", title: "Prompt Engineering and Custom Knowledge Fine-Tuning", duration: "1 hr 15 mins", content: "Structuring contexts, training chat models, and designing strict JSON schemas." },
      { id: "les_4_3", title: "Deploying Chatbots on WhatsApp & Custom Platforms", duration: "1 hr 40 mins", content: "Integrating Webhooks, routing answers, and logging conversational transcripts." }
    ]
  }
];

// ---------------------------------------------------------
// 5. CLIENT PORTAL SEED DATA
// ---------------------------------------------------------
export const CLIENT_PROJECTS: ClientProject[] = [
  { id: "cl_p1", name: "CAC Limited Liability Incorporation", status: "completed", progress: 100, deadline: "July 2, 2026", clientName: "Garki Logistics Ltd", budget: "₦85,000" },
  { id: "cl_p2", name: "Sponsored Ad Lead Campaign", status: "progress", progress: 65, deadline: "July 15, 2026", clientName: "Garki Logistics Ltd", budget: "₦350,000" },
  { id: "cl_p3", name: "Inventory Web Management Portal", status: "planning", progress: 10, deadline: "August 20, 2026", clientName: "Garki Logistics Ltd", budget: "₦1,500,000" }
];

export const CLIENT_INVOICES: Invoice[] = [
  { id: "inv_1", number: "INV-2026-004", amount: "₦85,000", date: "June 20, 2026", dueDate: "June 25, 2026", status: "paid", project: "CAC Limited Liability Incorporation" },
  { id: "inv_2", number: "INV-2026-005", amount: "₦350,000", date: "June 24, 2026", dueDate: "July 01, 2026", status: "unpaid", project: "Sponsored Ad Lead Campaign" },
  { id: "inv_3", number: "INV-2026-006", amount: "₦450,000", date: "June 24, 2026", dueDate: "July 10, 2026", status: "unpaid", project: "Inventory Web Management Portal" }
];

export const CLIENT_TICKETS: SupportTicket[] = [
  { id: "tkt_1", subject: "WhatsApp Chatbot Integration Issue", priority: "high", status: "open", date: "June 24, 2026", lastMessage: "Let's align on custom webhook responses." },
  { id: "tkt_2", subject: "CAC Certificate Retrieval Copy", priority: "medium", status: "resolved", date: "June 22, 2026", lastMessage: "The soft-copy of your certificate has been uploaded to your dashboard." }
];

export const TESTIMONIALS = [
  { id: "tst_1", clientName: "Dr. Aliyu Maitama", company: "Abuja Smart Real Estate", role: "CEO & Managing Director", rating: 5, text: "The sponsored lead campaign designed by DS Tech transformed our business. We sold three multi-million naira duplexes in Abuja within 20 days. Unbelievable conversion rates!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60" },
  { id: "tst_2", clientName: "Amara Nwosu", company: "Mimi & Co Organics", role: "Founder", rating: 5, text: "Registering my brand with CAC was so stressful until I met DS Tech. They processed our business name incorporation, got our FIRS TIN, and delivered everything within 5 days! Exceptional customer service.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" },
  { id: "tst_3", clientName: "Musa Ibrahim", company: "Garki Logistics Hub", role: "Operations Lead", rating: 5, text: "Our tracking and database system runs smoothly thanks to their custom React software development. The mobile-friendly layout and real-time dashboard boosted our dispatch speeds by 50%.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60" }
];

export const PARTNERS = [
  { id: "ptn_1", name: "Corporate Affairs Commission", logo: "🏛️ CAC" },
  { id: "ptn_2", name: "Federal Inland Revenue Service", logo: "🦅 FIRS" },
  { id: "ptn_3", name: "Google Partner", logo: "🌐 Google" },
  { id: "ptn_4", name: "Meta Business Partner", logo: "♾️ Meta" },
  { id: "ptn_5", name: "TikTok Agency Hub", logo: "🎵 TikTok" }
];
