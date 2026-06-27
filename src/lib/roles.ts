export interface CareerRole {
  id: string;
  title: string;
  category: 'tech' | 'marketing' | 'creative' | 'operations';
  description: string;
  skills: string[];
  tools: string[];
  estimatedSalary: string;
}

export const CATEGORIES = {
  tech: {
    label: 'Tech & Software Engineering',
    color: 'border-l-orange-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500 dark:text-orange-400',
  },
  marketing: {
    label: 'Digital Marketing & SEO',
    color: 'border-l-indigo-500',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-500 dark:text-indigo-400',
  },
  creative: {
    label: 'Creative Branding & Design',
    color: 'border-l-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500 dark:text-emerald-400',
  },
  operations: {
    label: 'Operations & Admin Support',
    color: 'border-l-pink-500',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-500 dark:text-pink-400',
  }
};

export const CAREER_ROLES: CareerRole[] = [
  // Tech & Engineering
  {
    id: 'lead-frontend',
    title: 'Lead Frontend Engineer (React/Vite)',
    category: 'tech',
    description: 'Build high-performance, fluid responsive web applications using React, Vite, and modern state architectures.',
    skills: ['Component Design', 'SPA Routing', 'HMR Opts', 'Bundle Optimization'],
    tools: ['React.js', 'Vite', 'Tailwind CSS', 'TypeScript'],
    estimatedSalary: '₦450,000'
  },
  {
    id: 'backend-systems',
    title: 'Backend Systems Developer (Node.js)',
    category: 'tech',
    description: 'Design robust server architectures, secure APIs, database modeling, and automated cloud infrastructure.',
    skills: ['RESTful APIs', 'SQL Database Modeling', 'Node Lifecycle', 'Security Audits'],
    tools: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    estimatedSalary: '₦400,000'
  },
  {
    id: 'fullstack-architect',
    title: 'Full-Stack Web Architect',
    category: 'tech',
    description: 'Oversee end-to-end fullstack structures, serverless cloud models, and secure OAuth portal systems.',
    skills: ['Distributed Systems', 'Security Architecture', 'API Proxying', 'DevSecOps'],
    tools: ['Next.js', 'TypeScript', 'Node.js', 'Cloud Run'],
    estimatedSalary: '₦550,000'
  },
  {
    id: 'mobile-engineer',
    title: 'Mobile App Engineer (Flutter/React Native)',
    category: 'tech',
    description: 'Develop fast cross-platform applications with native integrations, persistent storage, and offline capabilities.',
    skills: ['Mobile UI Patterns', 'Native Bridges', 'Local Persistence', 'App Store Pipelines'],
    tools: ['React Native', 'Flutter', 'Redux Toolkit', 'Firebase'],
    estimatedSalary: '₦380,000'
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud Infrastructure Specialist',
    category: 'tech',
    description: 'Monitor cloud hosting environments, optimize CI/CD pipelines, and scale dockerized applications.',
    skills: ['Infrastructure as Code', 'Server Monitoring', 'Scalability', 'Load Balancing'],
    tools: ['Google Cloud', 'Terraform', 'Kubernetes', 'GitHub Actions'],
    estimatedSalary: '₦480,000'
  },
  {
    id: 'devops-automation',
    title: 'DevOps & Automation Engineer',
    category: 'tech',
    description: 'Streamline build pipelines, test suites, and deploy environments for continuous delivery cycles.',
    skills: ['CI/CD Orchestration', 'Scripting', 'Containerization', 'Secrets Management'],
    tools: ['GitHub Actions', 'Docker', 'AWS', 'Bash scripting'],
    estimatedSalary: '₦450,000'
  },
  {
    id: 'qa-automation',
    title: 'QA Automation Specialist',
    category: 'tech',
    description: 'Write comprehensive automated test suites to validate application integrity and user journeys.',
    skills: ['Integration Testing', 'E2E Suites', 'Regression Diagnostics', 'Performance Profiling'],
    tools: ['Playwright', 'Jest', 'Cypress', 'Postman'],
    estimatedSalary: '₦300,000'
  },
  {
    id: 'ui-prototyping-eng',
    title: 'UI/UX Prototyping Engineer',
    category: 'tech',
    description: 'Bridge design and development by turning high-fidelity visual canvases into fluid interactive code structures.',
    skills: ['Micro-Animations', 'Responsive Layouts', 'CSS Engineering', 'Component Libraries'],
    tools: ['React', 'Framer Motion', 'Tailwind', 'Figma'],
    estimatedSalary: '₦350,000'
  },

  // Marketing & SEO
  {
    id: 'seo-coordinator',
    title: 'Senior SEO Strategy Coordinator',
    category: 'marketing',
    description: 'Drive high-volume organic search traffic through advanced on-page, off-page, and technical search optimizations.',
    skills: ['Keyword Auditing', 'Technical Crawling', 'Link Building', 'Search Algorithms'],
    tools: ['SEMrush', 'Ahrefs', 'Google Search Console', 'Screaming Frog'],
    estimatedSalary: '₦300,000'
  },
  {
    id: 'ppc-campaign-spec',
    title: 'Pay-Per-Click (PPC) Specialist',
    category: 'marketing',
    description: 'Manage paid advertisement accounts, design landing page copy, and optimize conversion metrics across platforms.',
    skills: ['A/B Testing', 'Ad Auction Logic', 'Conversion Attribution', 'Budget Management'],
    tools: ['Google Ads', 'Meta Ad Manager', 'LinkedIn Ads', 'Google Analytics'],
    estimatedSalary: '₦320,000'
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing Lead',
    category: 'marketing',
    description: 'Design, deploy, and scale direct-response advertising campaigns to achieve strict ROI metrics.',
    skills: ['Growth Hacking', 'Media Buying', 'Funnel Optimization', 'Retargeting Architecture'],
    tools: ['Meta Business Suite', 'TikTok Ads', 'Google Tag Manager', 'Excel'],
    estimatedSalary: '₦400,000'
  },
  {
    id: 'social-growth-exec',
    title: 'Social Media Growth Executive',
    category: 'marketing',
    description: 'Scale corporate and brand audiences through trend analysis, viral scheduling, and active social media interactions.',
    skills: ['Community Building', 'Virality Analytics', 'Social Listening', 'Content Curation'],
    tools: ['Buffer', 'Hootsuite', 'Canva', 'Sprout Social'],
    estimatedSalary: '₦250,000'
  },
  {
    id: 'content-copy-lead',
    title: 'Content Marketing & Copywriting Lead',
    category: 'marketing',
    description: 'Write highly engaging, search-optimized articles, whitepapers, social threads, and ad copies.',
    skills: ['Storytelling', 'Copyediting', 'SEO Writing', 'Brand Alignment'],
    tools: ['Grammarly', 'Jasper AI', 'WordPress', 'Google Docs'],
    estimatedSalary: '₦280,000'
  },
  {
    id: 'influencer-relations',
    title: 'Influencer Relations Manager',
    category: 'marketing',
    description: 'Coordinate digital creator relationships, campaign contracts, and product integration schedules.',
    skills: ['Contract Negotiation', 'Creator Scouting', 'Brand Alignment', 'Campaign Tracking'],
    tools: ['Grin', 'HypeAuditor', 'Slack', 'Asana'],
    estimatedSalary: '₦260,000'
  },
  {
    id: 'email-automation',
    title: 'Email Automation & Lifecycle Specialist',
    category: 'marketing',
    description: 'Build complex email flows, newsletter templates, and trigger-based notifications to nurture leads.',
    skills: ['List Segmentation', 'CRM Automation', 'A/B Testing Copy', 'Deliverability Auditing'],
    tools: ['Klaviyo', 'Mailchimp', 'ActiveCampaign', 'HTML/CSS'],
    estimatedSalary: '₦280,000'
  },
  {
    id: 'digital-analytics',
    title: 'Digital Analytics Specialist',
    category: 'marketing',
    description: 'Track, compile, and visualize marketing campaign attribution, web traffic, and user events.',
    skills: ['Data Visualization', 'Event Tagging', 'Cohort Analysis', 'Attribution Modeling'],
    tools: ['Google Analytics 4', 'Mixpanel', 'Looker Studio', 'BigQuery'],
    estimatedSalary: '₦350,000'
  },

  // Creative & Design
  {
    id: 'brand-director',
    title: 'Brand Identity & Visual Director',
    category: 'creative',
    description: 'Define the cohesive aesthetic guidelines, logos, typography, and visual assets of high-performance corporate entities.',
    skills: ['Creative Direction', 'Corporate Guidelines', 'Asset Layouts', 'Brand Alignment'],
    tools: ['Adobe Illustrator', 'Figma', 'InDesign', 'Midjourney'],
    estimatedSalary: '₦400,000'
  },
  {
    id: 'senior-graphic-designer',
    title: 'Senior Graphic Designer',
    category: 'creative',
    description: 'Generate beautiful promotional flyers, ad banners, corporate collateral, and social media media cards.',
    skills: ['Typography Pairing', 'Composition Layout', 'Color Harmonies', 'Pre-Press Prep'],
    tools: ['Photoshop', 'Illustrator', 'Canva Pro', 'Figma'],
    estimatedSalary: '₦250,000'
  },
  {
    id: 'ui-ux-designer',
    title: 'High-Fidelity UI/UX Designer',
    category: 'creative',
    description: 'Design pixel-perfect layout interfaces, wireframes, component libraries, and interactive prototype flows.',
    skills: ['User Personas', 'Wireframing', 'Interactive Prototypes', 'Design Systems'],
    tools: ['Figma', 'Sketch', 'Adobe XD', 'Principle'],
    estimatedSalary: '₦350,000'
  },
  {
    id: 'motion-graphics-artist',
    title: '2D/3D Motion Graphics Artist',
    category: 'creative',
    description: 'Animate commercial promos, dynamic typography, explainer sequences, and UI interaction animations.',
    skills: ['Keyframe Rigging', 'Character Animation', '3D Modeling', 'Video Rendering'],
    tools: ['After Effects', 'Cinema 4D', 'Blender', 'Premiere Pro'],
    estimatedSalary: '₦320,000'
  },
  {
    id: 'video-editor-lead',
    title: 'Video Editor & Post-Production Lead',
    category: 'creative',
    description: 'Assemble high-engagement social media reels, corporate documentaries, ads, and presentations with audio design.',
    skills: ['Color Grading', 'Sound Design', 'Storyboarding', 'Video Compression'],
    tools: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'Audition'],
    estimatedSalary: '₦300,000'
  },
  {
    id: 'content-presentation',
    title: 'Content Presentation Specialist',
    category: 'creative',
    description: 'Format, layout, and polish agency case studies, pitch decks, and commercial proposals.',
    skills: ['Slide Typography', 'Visual Formatting', 'Information Hierarchy', 'Data Presenting'],
    tools: ['Google Slides', 'Keynote', 'Pitch.com', 'PowerPoint'],
    estimatedSalary: '₦240,000'
  },
  {
    id: 'illustrator-digital-artist',
    title: 'Illustrator & Digital Artist',
    category: 'creative',
    description: 'Sketch custom artwork, characters, storyboards, and editorial vector icons for digital brand products.',
    skills: ['Vector Illustration', 'Digital Painting', 'Concept Mockups', 'Hand Lettering'],
    tools: ['Procreate', 'Photoshop', 'Adobe Illustrator', 'Wacom Hardware'],
    estimatedSalary: '₦260,000'
  },
  {
    id: 'audio-sound-designer',
    title: 'Audio & Sound Designer',
    category: 'creative',
    description: 'Produce high-quality voiceover recordings, background loops, podcast tracks, and interface sound effects.',
    skills: ['Audio Mastering', 'Foley Recording', 'Noise Reduction', 'Sfx Synthesis'],
    tools: ['Pro Tools', 'Ableton Live', 'Logic Pro', 'Audition'],
    estimatedSalary: '₦280,000'
  },

  // Operations & Support
  {
    id: 'exec-admin-assistant',
    title: 'Executive Administrative Assistant',
    category: 'operations',
    description: 'Support day-to-day operations, executive schedules, travel plans, and formal communication channels.',
    skills: ['Schedule Management', 'Business Writing', 'Client Intake', 'Document Archiving'],
    tools: ['Google Workspace', 'Zoom', 'Notion', 'Microsoft Office'],
    estimatedSalary: '₦220,000'
  },
  {
    id: 'client-relationship',
    title: 'Client Relationship Manager',
    category: 'operations',
    description: 'Manage onboarding processes, ongoing communications, service deliverables, and account satisfaction.',
    skills: ['Customer Support', 'Upselling', 'Incident Management', 'Feedback Loops'],
    tools: ['HubSpot CRM', 'Zendesk', 'Intercom', 'Slack'],
    estimatedSalary: '₦280,000'
  },
  {
    id: 'operations-logistics',
    title: 'Operations & Logistics Lead',
    category: 'operations',
    description: 'Monitor agency metrics, team resource allocation, service timelines, and hardware/software assets.',
    skills: ['Resource Optimization', 'Workflow Auditing', 'Procurement', 'Agile Methodologies'],
    tools: ['ClickUp', 'Jira', 'Monday.com', 'Excel'],
    estimatedSalary: '₦320,000'
  },
  {
    id: 'technical-project-mgr',
    title: 'Technical Project Manager',
    category: 'operations',
    description: 'Facilitate software sprints, technical scoping, timelines, and communications between design & dev teams.',
    skills: ['Scrum Ceremonies', 'Scope Definition', 'Risk Mitigations', 'Velocity Metrics'],
    tools: ['Jira Software', 'Asana', 'Linear', 'Miro'],
    estimatedSalary: '₦420,000'
  },
  {
    id: 'hr-talent-specialist',
    title: 'HR Recruitment & Talent Specialist',
    category: 'operations',
    description: 'Evaluate incoming candidate credentials, schedule interviews, draft contracts, and run staff onboarding.',
    skills: ['Interviews Conducting', 'Talent Evaluation', 'Employment Law', 'Onboarding Flows'],
    tools: ['Breezy HR', 'BambooHR', 'LinkedIn Recruiter', 'DocuSign'],
    estimatedSalary: '₦280,000'
  },
  {
    id: 'billing-finance',
    title: 'Billing & Agency Finance Officer',
    category: 'operations',
    description: 'Manage client billing records, payroll disbursements, expense tracking, and monthly ledger reviews.',
    skills: ['Bookkeeping', 'Invoicing Procedures', 'Payroll Flow', 'Tax Filings'],
    tools: ['QuickBooks', 'Xero', 'Wave Billing', 'Excel'],
    estimatedSalary: '₦300,000'
  },
  {
    id: 'virtual-office-coord',
    title: 'Virtual Office Coordinator',
    category: 'operations',
    description: 'Streamline virtual collaboration, maintain team directories, calendar invites, and run team-building activities.',
    skills: ['Digital Community Management', 'Meeting Minutes', 'Calendar Management', 'Team Onboarding'],
    tools: ['Google Calendar', 'Gather.town', 'Discord', 'Notion'],
    estimatedSalary: '₦200,000'
  },
  {
    id: 'tech-support-rep',
    title: 'Technical Support Representative',
    category: 'operations',
    description: 'Resolve customer problems regarding email setup, domains, web access, forms, and portal credentials.',
    skills: ['Troubleshooting Protocols', 'Technical Writing', 'Ticketing Flow', 'SLA Adherence'],
    tools: ['Zendesk Support', 'Freshdesk', 'LogMeIn', 'LiveChat'],
    estimatedSalary: '₦180,000'
  }
];
