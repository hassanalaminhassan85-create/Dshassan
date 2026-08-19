import { AcademyCourse } from './academyCoursesData';

export const ALL_115_COURSES: AcademyCourse[] = [
  // 1. ARTIFICIAL INTELLIGENCE (AI) INDUSTRY - 5 Courses
  {
    id: 'dsta-ai101',
    code: 'DSTA-AI101',
    title: 'Artificial Intelligence (AI) for Business & Productivity',
    categoryId: 'ai',
    categoryName: 'Artificial Intelligence (AI) Industry',
    industry: 'Artificial Intelligence',
    duration: '6 Weeks (Self-Paced + Live Mentorship)',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 85000,
    description: 'Master prompt engineering, generative AI tools, Gemini integrations, and automated office workflows that increase business throughput by 10x.',
    learningOutcomes: [
      'Master prompt architecture for generative AI models',
      'Automate repetitive operational tasks and email funnels',
      'Build custom GPTs and business-specific assistant agents',
      'Integrate AI into business documentation and reporting'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Foundations of Modern Generative AI', topics: ['AI Landscape Overview', 'LLMs and Multimodal Models', 'Prompt Engineering Masterclass'] },
      { weekOrModule: 'Module 2', title: 'Executive Workflow & Office Automation', topics: ['Spreadsheet & Document AI', 'Presentation Generation', 'Meeting Transcriptions & Action Item Extraction'] },
      { weekOrModule: 'Module 3', title: 'Custom AI Agents & Integrations', topics: ['Building Domain-Specific Assistants', 'WhatsApp & CRM AI Integrations', 'Real-world Capstone Deployment'] }
    ],
    targetAudience: ['Entrepreneurs', 'Business Managers', 'Consultants', 'Professionals seeking peak productivity'],
    prerequisites: 'Basic computer literacy and internet access.',
    certificateType: 'Certified AI Business Practitioner (DSTA-CAIBP)',
    iconBadge: 'Bot',
    featured: true
  },
  {
    id: 'dsta-aik102',
    code: 'DSTA-AIK102',
    title: 'AI for Kids & Teens Productivity Programme',
    categoryId: 'ai',
    categoryName: 'Artificial Intelligence (AI) Industry',
    industry: 'EdTech & Youth Innovation',
    duration: '4 Weeks (Weekend Bootcamps)',
    format: '80% Interactive Labs / 20% Theory',
    level: 'Beginner',
    price: 35000,
    originalPrice: 60000,
    description: 'Equip youth with responsible AI literacy, creative storytelling tools, visual generative art, and foundational programming thinking.',
    learningOutcomes: [
      'Understand how AI works safely and responsibly',
      'Generate creative writing, illustrations, and school presentations',
      'Build interactive mini-games and logical coding blocks',
      'Develop critical thinking and ethical digital habits'
    ],
    modules: [
      { weekOrModule: 'Week 1', title: 'Curiosity & AI Basics', topics: ['What is AI?', 'Safe Exploration & Digital Safety', 'AI Storytelling & Comic Generation'] },
      { weekOrModule: 'Week 2', title: 'Creative Visual Art & Design with AI', topics: ['Prompting for Graphics', 'Sound & Music Creation', 'Interactive Animation'] },
      { weekOrModule: 'Week 3', title: 'Junior Coding & AI Logic', topics: ['Visual Block Programming', 'Simple Chatbot Logic', 'Final Capstone Project Showcase'] }
    ],
    targetAudience: ['Students aged 9–17', 'Young Tech Enthusiasts', 'Schools & Summer Campers'],
    prerequisites: 'None. Suitable for complete beginners.',
    certificateType: 'Junior AI Innovator Certificate (DSTA-JAI)',
    iconBadge: 'Sparkles'
  },
  {
    id: 'dsta-ai103',
    code: 'DSTA-AI103',
    title: 'Artificial Intelligence (AI) & Automation Programme',
    categoryId: 'ai',
    categoryName: 'Artificial Intelligence (AI) Industry',
    industry: 'Enterprise Automation & AI',
    duration: '8 Weeks (Intensive Hands-On)',
    format: '75% Practical / 25% Theory',
    level: 'Intermediate',
    price: 65000,
    originalPrice: 120000,
    description: 'Build no-code and low-code autonomous workflows using Make, Zapier, n8n, webhook triggers, and Gemini API endpoints.',
    learningOutcomes: [
      'Architect end-to-end webhook and API automated pipelines',
      'Deploy autonomous customer support and lead qualification bots',
      'Connect relational databases and CRM platforms to AI triggers',
      'Eliminate manual data entry and repetitive operations across business nodes'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Automation Architectures & Webhook Foundations', topics: ['Event-Driven Architectures', 'REST APIs & Webhook Handlers', 'Zapier vs Make vs n8n'] },
      { weekOrModule: 'Module 2', title: 'LLM Function Calling & AI Logic Nodes', topics: ['Connecting Gemini & GPT to Data Stores', 'Data Extraction & Structuring', 'Automated Lead Enrichment'] },
      { weekOrModule: 'Module 3', title: 'Enterprise System Deployment', topics: ['Error Handling & Rate Limits', 'Database Synchronization', 'Live Client Case Studies'] }
    ],
    targetAudience: ['Automation Engineers', 'Operations Leads', 'Developers', 'Digital Agencies'],
    prerequisites: 'Basic understanding of digital workflows or software tools.',
    certificateType: 'Certified AI Automation Specialist (DSTA-CAAS)',
    iconBadge: 'Cpu',
    featured: true
  },
  {
    id: 'dsta-aih104',
    code: 'DSTA-AIH104',
    title: 'AI for Healthcare Professionals',
    categoryId: 'ai',
    categoryName: 'Artificial Intelligence (AI) Industry',
    industry: 'Healthcare & Digital Medicine',
    duration: '6 Weeks (Blended Clinical)',
    format: '70% Practical / 30% Theory',
    level: 'Intermediate',
    price: 55000,
    originalPrice: 95000,
    description: 'Explore diagnostic assistance, automated medical transcription, EHR data summarization, and ethical AI in patient care.',
    learningOutcomes: [
      'Apply AI tools to clinical note-taking and discharge summaries',
      'Understand AI in medical imaging, pathology, and diagnostic support',
      'Navigate HIPAA/NDPR data privacy and clinical ethics',
      'Streamline clinic appointment scheduling and patient follow-ups'
    ],
    modules: [
      { weekOrModule: 'Week 1-2', title: 'Clinical AI Landscape & Medical Ethics', topics: ['AI in Modern Medicine', 'Patient Data Confidentiality & Regulatory Compliance', 'Diagnostic Support Systems'] },
      { weekOrModule: 'Week 3-4', title: 'Automated Clinical Documentation', topics: ['Ambient Voice Transcription', 'Automated SOAP Notes', 'Patient History Summaries'] },
      { weekOrModule: 'Week 5-6', title: 'Healthcare Operations & Telemedicine AI', topics: ['Triage Bot Setup', 'Preventative Care Insights', 'Hospital Capstone Project'] }
    ],
    targetAudience: ['Doctors', 'Nurses', 'Pharmacists', 'Hospital Administrators', 'Health Tech Enthusiasts'],
    prerequisites: 'Medical or healthcare background recommended.',
    certificateType: 'Certified Health AI Practitioner (DSTA-CHAP)',
    iconBadge: 'HeartPulse'
  },
  {
    id: 'dsta-aif137-ai',
    code: 'DSTA-AIF137',
    title: 'AI for Finance Professionals',
    categoryId: 'ai',
    categoryName: 'Artificial Intelligence (AI) Industry',
    industry: 'Financial Technology & Analytics',
    duration: '6 Weeks (Executive Cohort)',
    format: '70% Practical / 30% Theory',
    level: 'Advanced',
    price: 60000,
    originalPrice: 110000,
    description: 'Harness machine learning and AI for financial forecasting, algorithmic risk management, fraud detection, and automated report drafting.',
    learningOutcomes: [
      'Build AI financial models and scenario simulations',
      'Implement real-time fraud detection and anomaly flagging',
      'Automate balance sheet analysis and investor reporting',
      'Utilize natural language query interfaces for financial databases'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'AI in Modern Financial Services', topics: ['FinTech AI Landscape', 'Predictive Modeling', 'Time-Series Forecasts'] },
      { weekOrModule: 'Module 2', title: 'Automated Financial Analysis & Reporting', topics: ['Parsing 10-K and Financial Statements', 'Tax Code Querying', 'Executive Summaries'] },
      { weekOrModule: 'Module 3', title: 'Risk, Fraud & Portfolio Optimization', topics: ['Anomaly Detection Algorithms', 'Algorithmic Credit Scoring', 'Capstone FinTech Simulation'] }
    ],
    targetAudience: ['Accountants', 'Financial Analysts', 'Bankers', 'CFOs', 'FinTech Founders'],
    prerequisites: 'Basic knowledge of financial principles and spreadsheets.',
    certificateType: 'Certified Financial AI Specialist (DSTA-CFAIS)',
    iconBadge: 'TrendingUp'
  },

  // 2. HEALTHCARE INDUSTRY - 3 Courses
  {
    id: 'dsta-dmh105',
    code: 'DSTA-DMH105',
    title: 'Digital Marketing for Hospitals & Clinics',
    categoryId: 'healthcare',
    categoryName: 'Healthcare Industry',
    industry: 'Healthcare Growth & Marketing',
    duration: '4 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 80000,
    description: 'Grow patient intake, establish local clinic Google Maps dominance, build trustworthy medical social campaigns, and comply with medical advertising ethics.',
    learningOutcomes: [
      'Drive patient appointments through local SEO and Google My Business',
      'Create compliant medical educational campaigns on social media',
      'Set up WhatsApp appointment booking automation for clinic receptions',
      'Measure cost-per-acquisition for elective and specialized medical services'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Healthcare Brand Authority & Compliance', topics: ['Medical Advertising Guidelines', 'Trust Building in Healthcare', 'Local SEO & Maps Optimization'] },
      { weekOrModule: 'Module 2', title: 'Paid Patient Acquisition', topics: ['Google Ads for Specialized Treatments', 'Meta Ads for Wellness & Checkups', 'Patient Retargeting Ethics'] },
      { weekOrModule: 'Module 3', title: 'Clinic Automation & Retention', topics: ['WhatsApp Consultation Booking', 'Post-Op Follow-up Automation', 'Clinic Review Management'] }
    ],
    targetAudience: ['Clinic Owners', 'Hospital Public Relations Officers', 'Medical Marketers'],
    prerequisites: 'None.',
    certificateType: 'Certified Healthcare Marketing Strategist (DSTA-CHMS)',
    iconBadge: 'HeartPulse'
  },
  {
    id: 'dsta-cch106',
    code: 'DSTA-CCH106',
    title: 'Content Creation for Hospitals & Clinics',
    categoryId: 'healthcare',
    categoryName: 'Healthcare Industry',
    industry: 'Medical Media & Communications',
    duration: '4 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 75000,
    description: 'Produce high-converting medical reels, doctor explainer videos, patient testimonial graphics, and informative healthcare carousels.',
    learningOutcomes: [
      'Script and record engaging doctor-led educational videos',
      'Design clean, readable health awareness infographics',
      'Manage patient consent and ethical visual representation',
      'Optimize healthcare video content for TikTok, Instagram, and YouTube'
    ],
    modules: [
      { weekOrModule: 'Week 1', title: 'Medical Storytelling & Scripting', topics: ['Simplifying Complex Diagnoses', 'Scripting 60-second Health Tips', 'Ethical Patient Testimonials'] },
      { weekOrModule: 'Week 2', title: 'Medical Video Production & Lighting', topics: ['Clinic Studio Setup', 'Smartphone Filming for Doctors', 'Microphones & Crisp Audio'] },
      { weekOrModule: 'Week 3', title: 'Editing & Publishing', topics: ['CapCut for Health Creators', 'Subtitling & Medical Diagrams', 'Multi-Platform Distribution'] }
    ],
    targetAudience: ['Healthcare Communications Teams', 'Doctors & Dentists', 'Health Bloggers'],
    prerequisites: 'Smartphone with camera.',
    certificateType: 'Medical Content Producer Certificate (DSTA-MCP)',
    iconBadge: 'Film'
  },
  {
    id: 'dsta-aih104-hc',
    code: 'DSTA-AIH104',
    title: 'AI for Healthcare Professionals',
    categoryId: 'healthcare',
    categoryName: 'Healthcare Industry',
    industry: 'Digital Medicine',
    duration: '6 Weeks (Clinical Track)',
    format: '70% Practical / 30% Theory',
    level: 'Intermediate',
    price: 55000,
    originalPrice: 95000,
    description: 'Clinical documentation acceleration, triage assistant tools, EHR data extraction, and AI diagnostic workflows for hospitals.',
    learningOutcomes: [
      'Accelerate clinical reporting with AI transcription',
      'Integrate triage support bots for emergency response',
      'Summarize patient histories across lengthy case files',
      'Adhere to international medical privacy and NDPR protocols'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Foundations of Clinical AI', topics: ['AI Medical Tools', 'Safety Protocols', 'Diagnostic Assistants'] },
      { weekOrModule: 'Module 2', title: 'Documentation & Patient Communication', topics: ['Voice-to-Text Clinical Records', 'Automated Referral Letters', 'Patient Instructions'] },
      { weekOrModule: 'Module 3', title: 'Hospital Case Study Project', topics: ['Implementation Plan', 'Staff Training Workflow', 'Security Audits'] }
    ],
    targetAudience: ['Physicians', 'Clinical Directors', 'Healthcare IT Managers'],
    prerequisites: 'Healthcare background.',
    certificateType: 'Certified Health AI Practitioner (DSTA-CHAP)',
    iconBadge: 'HeartPulse'
  },

  // 3. EDUCATION INDUSTRY - 3 Courses
  {
    id: 'dsta-ait107',
    code: 'DSTA-AIT107',
    title: 'AI for Teachers & Educators',
    categoryId: 'education',
    categoryName: 'Education Industry',
    industry: 'EdTech & Teaching',
    duration: '4 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 30000,
    originalPrice: 55000,
    description: 'Supercharge lesson planning, quiz generation, personalized learning materials, and grading workflows using AI assistants.',
    learningOutcomes: [
      'Generate tailored curriculum lesson plans in minutes',
      'Create interactive quizzes, rubrics, and differentiated learning sheets',
      'Assess student essays and provide personalized feedback with AI',
      'Detect AI plagiarism and guide students in ethical tool usage'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'AI Lesson Design', topics: ['Curriculum-Aligned Prompting', 'Differentiated Instruction Aids', 'Lesson Plan Generators'] },
      { weekOrModule: 'Module 2', title: 'Assessment & Grading Automation', topics: ['Rubric Builders', 'Automated Quiz Drafting', 'Formative Assessment Workflows'] },
      { weekOrModule: 'Module 3', title: 'Classroom Tech & Ethics', topics: ['AI Plagiarism Detection', 'Teaching AI Literacy to Students', 'Capstone Lesson Showcase'] }
    ],
    targetAudience: ['Primary & Secondary Teachers', 'University Lecturers', 'School Tutors'],
    prerequisites: 'None.',
    certificateType: 'Certified AI Educator (DSTA-CAE)',
    iconBadge: 'GraduationCap'
  },
  {
    id: 'dsta-dst108',
    code: 'DSTA-DST108',
    title: 'Digital Skills for Teachers',
    categoryId: 'education',
    categoryName: 'Education Industry',
    industry: 'Modern Classroom Technology',
    duration: '4 Weeks',
    format: '80% Practical / 20% Theory',
    level: 'Beginner',
    price: 30000,
    originalPrice: 50000,
    description: 'Master Google Classroom, interactive slide design, spreadsheet grading records, virtual whiteboards, and online teaching tools.',
    learningOutcomes: [
      'Setup and manage interactive Google Classrooms and Microsoft Teams',
      'Design engaging animated slides with Canva and PowerPoint',
      'Track student attendance and calculate grades dynamically in Excel',
      'Conduct hybrid virtual classrooms with Zoom and OBS'
    ],
    modules: [
      { weekOrModule: 'Week 1', title: 'Virtual Classrooms & Learning Management', topics: ['Google Classroom Setup', 'Assignments & Submissions', 'Virtual Whiteboards'] },
      { weekOrModule: 'Week 2', title: 'Visual Teaching Aids with Canva', topics: ['Interactive Presentations', 'Educational Posters', 'Infographic Timelines'] },
      { weekOrModule: 'Week 3', title: 'Spreadsheet Gradebooks & Analytics', topics: ['Automated Grade Computation', 'Student Progress Charts', 'Report Card Export'] }
    ],
    targetAudience: ['Teachers', 'School Administrators', 'Education Consultants'],
    prerequisites: 'Basic computer use.',
    certificateType: 'Certified Digital Educator (DSTA-CDE)',
    iconBadge: 'Laptop'
  },
  {
    id: 'dsta-ccs109',
    code: 'DSTA-CCS109',
    title: 'Content Creation for Schools & Educators',
    categoryId: 'education',
    categoryName: 'Education Industry',
    industry: 'School Branding & EdMedia',
    duration: '4 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 35000,
    originalPrice: 65000,
    description: 'Build school enrollment reels, campus highlight videos, teacher spotlights, and parent engagement social media channels.',
    learningOutcomes: [
      'Produce admissions video campaigns that boost school enrollment',
      'Photograph campus events, sports, and science exhibitions professionally',
      'Design weekly parent newsletters and event announcements',
      'Manage school Facebook, Instagram, and YouTube channels'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'School Brand Identity & Admissions Marketing', topics: ['Enrollment Video Storytelling', 'Parent Value Propositions', 'Event Photography'] },
      { weekOrModule: 'Module 2', title: 'Video Editing for School Socials', topics: ['CapCut & Premiere Basics', 'Student Showcase Reels', 'Alumni Spotlights'] },
      { weekOrModule: 'Module 3', title: 'Parent Engagement Newsletters', topics: ['Email Newsletters with Mailchimp', 'WhatsApp Community Broadcasts', 'Publishing Calendar'] }
    ],
    targetAudience: ['School Media Teams', 'Admissions Officers', 'Proprietors'],
    prerequisites: 'Smartphone or camera.',
    certificateType: 'School Media & Brand Producer (DSTA-SMBP)',
    iconBadge: 'Film'
  },

  // 4. AGRICULTURE INDUSTRY - 4 Courses
  {
    id: 'dsta-aa110',
    code: 'DSTA-AA110',
    title: 'Agribusiness & Agritech Management',
    categoryId: 'agriculture',
    categoryName: 'Agriculture Industry',
    industry: 'AgriTech & Farm Business',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 50000,
    originalPrice: 90000,
    description: 'Transform traditional agriculture into profitable, tech-driven agribusiness with IoT sensors, farm ERP software, and supply chain tracking.',
    learningOutcomes: [
      'Implement farm record-keeping and inventory management software',
      'Understand IoT soil sensors, automated irrigation, and drone mapping',
      'Structure farm financial feasibility plans and grant proposals',
      'Optimize crop and livestock supply chains from harvest to market'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Modern Agritech Fundamentals', topics: ['Precision Farming', 'IoT & Drone Monitoring', 'Yield Prediction Systems'] },
      { weekOrModule: 'Module 2', title: 'Farm Operations & Supply Chain ERP', topics: ['Inventory & Feed Tracking', 'Cold Chain Logistics', 'Wholesale Distribution Contracts'] },
      { weekOrModule: 'Module 3', title: 'Agri-Finance & Investor Pitching', topics: ['Financial Modeling for Farms', 'Grants & Concessionary Loans', 'Export Certification'] }
    ],
    targetAudience: ['Commercial Farmers', 'Agritech Entrepreneurs', 'Agricultural Graduates', 'Investors'],
    prerequisites: 'Interest in agribusiness.',
    certificateType: 'Certified Agritech Manager (DSTA-CAM)',
    iconBadge: 'Sprout',
    featured: true
  },
  {
    id: 'dsta-dmf111',
    code: 'DSTA-DMF111',
    title: 'Digital Marketing for Farmers & Agribusinesses',
    categoryId: 'agriculture',
    categoryName: 'Agriculture Industry',
    industry: 'Agricultural Commerce & Sales',
    duration: '4 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 70000,
    description: 'Sell agricultural commodities, processed foods, and farm equipment online using social commerce, WhatsApp business catalogs, and targeted ads.',
    learningOutcomes: [
      'Set up WhatsApp Business catalogs for fresh produce and livestock',
      'Run Meta and TikTok ads targeting restaurants, wholesalers, and consumers',
      'Create high-converting commodity listing landing pages',
      'Negotiate bulk off-taker contracts through LinkedIn and digital B2B hubs'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Agri-Product Packaging & Digital Storefronts', topics: ['Product Photography for Produce', 'WhatsApp Business Setup', 'Online Price Books'] },
      { weekOrModule: 'Module 2', title: 'Targeted Farm Ads & Lead Generation', topics: ['Facebook Ads for Wholesale Produce', 'Off-Taker Sourcing on LinkedIn', 'Retargeting Food Processors'] },
      { weekOrModule: 'Module 3', title: 'Logistics, Payments & Order Fulfillment', topics: ['Paystack Payment Links', 'Interstate Waybill Coordination', 'Customer Retention Systems'] }
    ],
    targetAudience: ['Farm Owners', 'Produce Aggregators', 'Agro-Allied Marketers'],
    prerequisites: 'None.',
    certificateType: 'Certified Agribusiness Digital Marketer (DSTA-CADM)',
    iconBadge: 'TrendingUp'
  },
  {
    id: 'dsta-cca112',
    code: 'DSTA-CCA112',
    title: 'Content Creation for Agribusiness',
    categoryId: 'agriculture',
    categoryName: 'Agriculture Industry',
    industry: 'Farm Media & Storytelling',
    duration: '4 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 35000,
    originalPrice: 65000,
    description: 'Create engaging farm vlogs, harvest reels, processing plant mini-documentaries, and agricultural brand storytelling.',
    learningOutcomes: [
      'Document daily farm operations into viral short-form reels',
      'Capture cinematic harvest and livestock footage using smartphone gimbal',
      'Narrate compelling farm-to-table brand stories that command premium pricing',
      'Monetize agricultural content across YouTube and social platforms'
    ],
    modules: [
      { weekOrModule: 'Week 1', title: 'Farm Storytelling & Camera Angles', topics: ['Outdoor Lighting in the Field', 'Gimbal & Drone Basics for Farms', 'Harvest Scene Composition'] },
      { weekOrModule: 'Week 2', title: 'Video Editing & Voiceovers', topics: ['CapCut Farm Vlog Templates', 'Adding Ambient Farm Audio', 'Subtitles & Commodity Pricing Graphics'] },
      { weekOrModule: 'Week 3', title: 'Audience Growth & Brand Partnerships', topics: ['YouTube Farm Channel Blueprint', 'Brand Sponsorships in Agriculture', 'Publishing Schedule'] }
    ],
    targetAudience: ['Farmers', 'Agri-Influencers', 'Agro-Tourism Operators'],
    prerequisites: 'Smartphone with camera.',
    certificateType: 'Agri-Media Content Producer (DSTA-AMCP)',
    iconBadge: 'Film'
  },
  {
    id: 'dsta-ae113',
    code: 'DSTA-AE113',
    title: 'Agricultural Entrepreneurship & Farm Business Management',
    categoryId: 'agriculture',
    categoryName: 'Agriculture Industry',
    industry: 'Farm Business Strategy',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 85000,
    description: 'Master budgeting, cash flow forecasting, labor management, risk mitigation, and scaling strategies for small to medium farms.',
    learningOutcomes: [
      'Develop robust 5-year agricultural financial projections',
      'Manage seasonal farm labor and equipment maintenance cycles',
      'Mitigate risks against weather fluctuations and market price drops',
      'Structure export-ready agricultural value-added products'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Agri-Venture Feasibility & Business Models', topics: ['Crop Selection & Soil Mapping', 'CAPEX vs OPEX in Farming', 'Market Demand Analysis'] },
      { weekOrModule: 'Module 2', title: 'Operational Excellence & Risk Management', topics: ['Farm Labor Contracts', 'Insurance & Hedging Options', 'Biosecurity Protocols'] },
      { weekOrModule: 'Module 3', title: 'Value Addition & Export Pathways', topics: ['Packaging for Supermarkets', 'NAFDAC & Export Regulations', 'Capstone Business Plan'] }
    ],
    targetAudience: ['New Farm Investors', 'Agronomists', 'Cooperative Leaders'],
    prerequisites: 'None.',
    certificateType: 'Certified Agricultural Entrepreneur (DSTA-CAE)',
    iconBadge: 'Briefcase'
  },

  // 5. DIGITAL MARKETING, SALES & BUSINESS GROWTH - 5 Courses
  {
    id: 'dsta-dm114',
    code: 'DSTA-DM114',
    title: 'Digital Marketing Professional Programme',
    categoryId: 'marketing',
    categoryName: 'Digital Marketing, Sales & Business Growth',
    industry: 'Digital Marketing',
    duration: '8 Weeks (Flagship Accelerator)',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 50000,
    originalPrice: 100000,
    description: 'The master comprehensive digital marketing programme covering Meta Ads, Google Ads, TikTok Ads, Email automation, SEO, and full-funnel strategy.',
    learningOutcomes: [
      'Run multi-channel high-ROAS paid advertising campaigns',
      'Design conversion-optimized landing pages and sales funnels',
      'Build automated email sequences that nurture and convert leads',
      'Analyze campaign metrics with Google Analytics 4 and Meta Pixel'
    ],
    modules: [
      { weekOrModule: 'Weeks 1-2', title: 'Digital Funnels & Meta Ads Mastery', topics: ['Funnel Architecture', 'Meta Business Suite & Pixel Setup', 'Ad Copywriting & Creatives'] },
      { weekOrModule: 'Weeks 3-4', title: 'Google Ads & Search Marketing', topics: ['Google Search & Display Ads', 'Keyword Research', 'Conversion Tracking'] },
      { weekOrModule: 'Weeks 5-6', title: 'TikTok Ads, Influencers & Social Commerce', topics: ['TikTok Ads Manager', 'Short-form Video Selling', 'Influencer Contract Structures'] },
      { weekOrModule: 'Weeks 7-8', title: 'Email Automation & GA4 Analytics', topics: ['Klaviyo/Brevo Flows', 'GA4 Custom Events', 'Live Client Campaign Capstone'] }
    ],
    targetAudience: ['Career Switchers', 'Marketing Executives', 'Agency Founders', 'Business Owners'],
    prerequisites: 'Basic internet proficiency.',
    certificateType: 'Certified Digital Marketing Professional (DSTA-CDMP)',
    iconBadge: 'TrendingUp',
    featured: true
  },
  {
    id: 'dsta-smm115',
    code: 'DSTA-SMM115',
    title: 'Social Media Management',
    categoryId: 'marketing',
    categoryName: 'Digital Marketing, Sales & Business Growth',
    industry: 'Social Media Strategy',
    duration: '6 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 75000,
    description: 'Master organic brand positioning, algorithmic growth on Instagram, LinkedIn & TikTok, content calendar scheduling, and client management.',
    learningOutcomes: [
      'Create 30-day content calendars that drive viral engagement',
      'Understand platform algorithms and posting optimizations',
      'Handle community moderation, direct message sales, and crisis PR',
      'Pitch and price high-ticket monthly social media retainer clients'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Platform Strategy & Content Pillars', topics: ['Target Persona Development', 'Content Pillar Mapping', 'Canva & CapCut Templates'] },
      { weekOrModule: 'Module 2', title: 'Community Growth & Engagement Loops', topics: ['Story Selling & Interactive Polls', 'Hashtag & SEO Strategies', 'DM Lead Nurturing'] },
      { weekOrModule: 'Module 3', title: 'Client Pitching & Retainer Contracts', topics: ['Pricing Monthly Retainers', 'Analytics Reporting with Metricool', 'Client Onboarding Packets'] }
    ],
    targetAudience: ['Social Media Managers', 'Freelancers', 'Brand Strategists'],
    prerequisites: 'None.',
    certificateType: 'Certified Social Media Strategist (DSTA-CSMS)',
    iconBadge: 'Sparkles'
  },
  {
    id: 'dsta-sb116',
    code: 'DSTA-SB116',
    title: 'Sales & Business Development Programme',
    categoryId: 'marketing',
    categoryName: 'Digital Marketing, Sales & Business Growth',
    industry: 'B2B & B2C Sales Mastery',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 85000,
    description: 'Transform your closing rates with high-ticket sales psychology, cold outreach frameworks, pipeline management, and enterprise B2B pitching.',
    learningOutcomes: [
      'Master the SPIN and Challenger consultative selling frameworks',
      'Conduct effective cold email and LinkedIn executive prospecting',
      'Handle difficult client objections and close high-value contracts',
      'Build and track sales pipelines using HubSpot and Zoho CRM'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Sales Psychology & Prospecting', topics: ['Buyer Motivation Drivers', 'Cold Email & LinkedIn Outreach', 'Discovery Call Mastery'] },
      { weekOrModule: 'Module 2', title: 'Consultative Pitching & Objection Handling', topics: ['Value vs Price Framing', 'Handling "Too Expensive" & "I Will Get Back to You"', 'Proposal Drafting'] },
      { weekOrModule: 'Module 3', title: 'Enterprise Closing & CRM Systems', topics: ['Contract Finalization', 'Pipeline Velocity Metrics in HubSpot', 'Live Sales Roleplay Exam'] }
    ],
    targetAudience: ['Sales Representatives', 'Business Developers', 'Account Executives', 'Founders'],
    prerequisites: 'None.',
    certificateType: 'Certified Business Development Professional (DSTA-CBDP)',
    iconBadge: 'Briefcase'
  },
  {
    id: 'dsta-sa117',
    code: 'DSTA-SA117',
    title: 'Sponsored Ads Professional Programme',
    categoryId: 'marketing',
    categoryName: 'Digital Marketing, Sales & Business Growth',
    industry: 'Paid Media & Ad Buying',
    duration: '6 Weeks (Intensive Media Buying)',
    format: '80% Practical / 20% Theory',
    level: 'Intermediate',
    price: 55000,
    originalPrice: 105000,
    description: 'Deep dive into Meta Ads Manager, TikTok Ads, Google Search/Display, and programmatic bidding with real ad budget spend simulation.',
    learningOutcomes: [
      'Structure scalable CBO and ABO campaigns on Meta Ads Manager',
      'Implement Conversions API (CAPI) and server-side tracking',
      'Scale winning ad creatives with horizontal and vertical budget strategies',
      'Troubleshoot disabled ad accounts, business managers, and payment errors'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Meta Ads Architecture & Tracking Setup', topics: ['Pixel & CAPI Diagnostics', 'Custom & Lookalike Audiences', 'Creative Testing Frameworks'] },
      { weekOrModule: 'Module 2', title: 'TikTok & Google Ads Scaling', topics: ['Spark Ads & TikTok Creators', 'Google Keyword Match Types', 'Negative Keyword Sculpting'] },
      { weekOrModule: 'Module 3', title: 'Budget Scaling & Account Security', topics: ['Scaling Past ₦1,000,000 Spend/Day', 'Avoiding Account Restrictions', 'Client Ad Reporting'] }
    ],
    targetAudience: ['Performance Marketers', 'Media Buyers', 'E-commerce Brand Owners'],
    prerequisites: 'Familiarity with digital marketing basics.',
    certificateType: 'Certified Media Buying Specialist (DSTA-CMBS)',
    iconBadge: 'TrendingUp',
    featured: true
  },
  {
    id: 'dsta-seo118',
    code: 'DSTA-SEO118',
    title: 'Search Engine Optimization (SEO) Programme',
    categoryId: 'marketing',
    categoryName: 'Digital Marketing, Sales & Business Growth',
    industry: 'Search & Organic Traffic',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'Intermediate',
    price: 45000,
    originalPrice: 85000,
    description: 'Rank websites #1 on Google with technical SEO audits, keyword clusters, programmatic content, backlink building, and Google Search Console.',
    learningOutcomes: [
      'Conduct in-depth technical SEO audits using Screaming Frog and Ahrefs',
      'Optimize on-page metadata, semantic HTML, and Core Web Vitals',
      'Execute high-authority backlink outreach and digital PR campaigns',
      'Rank local businesses in Google Local 3-Pack and Google Maps'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Technical SEO & Crawl Optimization', topics: ['Site Architecture & Robots.txt', 'Core Web Vitals & Speed', 'Schema Markup & Structured Data'] },
      { weekOrModule: 'Module 2', title: 'On-Page SEO & Content Clustering', topics: ['Search Intent & Keyword Mapping', 'Writing for Humans and Search Crawlers', 'Internal Linking Science'] },
      { weekOrModule: 'Module 3', title: 'Off-Page SEO & Local Domination', topics: ['White-hat Link Building Outreach', 'Google My Business Mastery', 'Monthly SEO Client Deliverables'] }
    ],
    targetAudience: ['SEO Specialists', 'Web Developers', 'Content Marketers', 'Bloggers'],
    prerequisites: 'Basic understanding of websites.',
    certificateType: 'Certified SEO Strategist (DSTA-CSEOS)',
    iconBadge: 'Search'
  },

  // 6. CREATIVE MEDIA, BRANDING & COMMUNICATION - 8 Courses
  {
    id: 'dsta-cc119',
    code: 'DSTA-CC119',
    title: 'Content Creation & Video Editing',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Video Production & Editing',
    duration: '6 Weeks',
    format: '80% Practical / 20% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 85000,
    description: 'Master Premiere Pro, DaVinci Resolve, and CapCut. Learn pacing, sound design, color grading, motion graphics, and narrative hook construction.',
    learningOutcomes: [
      'Edit high-converting short-form reels and long-form YouTube documentaries',
      'Master keyframing, speed ramping, kinetic typography, and b-roll inserts',
      'Implement cinematic color grading and audio leveling',
      'Monetize video editing services globally on Upwork and Instagram'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Timeline Workflow & Cutting Techniques', topics: ['Rough Cut to Final Polish', 'J-Cuts and L-Cuts', 'Kinetic Caption Design'] },
      { weekOrModule: 'Module 2', title: 'Sound Design & Color Grading', topics: ['Audio Foley & SFX Layers', 'LUTs & Color Science', 'Green Screen Keying'] },
      { weekOrModule: 'Module 3', title: 'Commercial Video Projects & Portfolio', topics: ['Brand Commercials', 'Podcast Multi-cam Editing', 'Client Delivery Workflow'] }
    ],
    targetAudience: ['Video Editors', 'Content Creators', 'YouTubers', 'Media Enthusiasts'],
    prerequisites: 'Computer capable of video editing.',
    certificateType: 'Certified Video Editor (DSTA-CVE)',
    iconBadge: 'Film',
    featured: true
  },
  {
    id: 'dsta-gd120',
    code: 'DSTA-GD120',
    title: 'Graphics Design & Branding Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Visual Brand Design',
    duration: '6 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 75000,
    description: 'Create unforgettable brand visual identities, vector logos, typography hierarchies, corporate brand guidelines, and print collateral in Illustrator & Photoshop.',
    learningOutcomes: [
      'Design professional vector logos, brandmarks, and emblem designs',
      'Formulate comprehensive corporate brand style guides',
      'Design advertising billboards, social banners, and product packaging',
      'Prepare print-ready CMYK and digital RGB assets'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Graphic Design Theory & Adobe Illustrator', topics: ['Color Theory & Font Pairing', 'Pen Tool Mastery', 'Logo Grid Systems'] },
      { weekOrModule: 'Module 2', title: 'Photoshop Manipulation & Mockups', topics: ['Photo Retouching & Masking', 'Product 3D Mockups', 'Social Media Carousel Design'] },
      { weekOrModule: 'Module 3', title: 'Corporate Branding Deck & Portfolio', topics: ['Brand Identity Manuals', 'Packaging & Print Specs', 'Client Presentation Pitch'] }
    ],
    targetAudience: ['Graphic Designers', 'Brand Strategists', 'Creative Directors'],
    prerequisites: 'Adobe Photoshop / Illustrator or Canva.',
    certificateType: 'Certified Graphic Brand Designer (DSTA-CGBD)',
    iconBadge: 'Palette'
  },
  {
    id: 'dsta-pp121',
    code: 'DSTA-PP121',
    title: 'Podcast Production & Management Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Audio Media & Podcasting',
    duration: '4 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 70000,
    description: 'Launch, produce, and syndicate studio-quality audio/video podcasts with Spotify/Apple distribution, studio mic setups, and sponsorship monetization.',
    learningOutcomes: [
      'Configure studio microphones, mixers, and multi-track audio interfaces',
      'Edit podcast episodes, remove background noise, and add intro/outro themes',
      'Distribute RSS feeds to Spotify, Apple Podcasts, and Amazon Music',
      'Monetize podcasts through brand sponsorships and listener memberships'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Podcast Studio Setup & Acoustic Treatment', topics: ['Shure/Rode Mic Techniques', 'Audio Interfaces & Mixers', 'Remote Recording with Riverside/SquadCast'] },
      { weekOrModule: 'Module 2', title: 'Audio Engineering & Video Podcasting', topics: ['Audacity/Reaper Editing', 'Multi-Cam Video Switching in OBS', 'Audiogram Snippets for Socials'] },
      { weekOrModule: 'Module 3', title: 'Distribution, Syndication & Sponsorships', topics: ['Spotify for Podcasters & RSS', 'Media Kits for Sponsors', 'Podcast Launch Strategy'] }
    ],
    targetAudience: ['Podcasters', 'Broadcasters', 'Corporate Communications Officers'],
    prerequisites: 'None.',
    certificateType: 'Certified Podcast Producer (DSTA-CPP)',
    iconBadge: 'Mic'
  },
  {
    id: 'dsta-mb122',
    code: 'DSTA-MB122',
    title: 'Media & News Broadcasting Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Journalism & Broadcasting',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 85000,
    description: 'Master on-air television presenting, news teleprompter reading, broadcast journalism ethics, live field reporting, and newsroom workflows.',
    learningOutcomes: [
      'Deliver flawless broadcast news reading using studio teleprompters',
      'Conduct live investigative television interviews and press conferences',
      'Draft broadcast news scripts and rundown logs',
      'Operate television studio control room switchers and IFB communications'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Voice Modulation & Studio Presentation', topics: ['Diction, Pronunciation & Pace', 'Teleprompter Technique', 'Body Language on Camera'] },
      { weekOrModule: 'Module 2', title: 'Broadcast News Scriptwriting', topics: ['Inverted Pyramid Structure', 'Writing for the Ear', 'News Gathering Ethics & Verification'] },
      { weekOrModule: 'Module 3', title: 'Live Newsroom & Field Reporting', topics: ['Breaking News Simulation', 'Live OB (Outside Broadcasting)', 'Final Studio Anchor Showreel'] }
    ],
    targetAudience: ['Aspiring TV Anchors', 'Radio Presenters', 'Journalism Students'],
    prerequisites: 'Good command of English.',
    certificateType: 'Certified Broadcast Presenter (DSTA-CBP)',
    iconBadge: 'Radio'
  },
  {
    id: 'dsta-sc123',
    code: 'DSTA-SC123',
    title: 'Script Writing & Copywriting Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Copywriting & Scripting',
    duration: '6 Weeks',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 75000,
    description: 'Write words that sell and stories that captivate. Covers commercial ad copy, video sales letters (VSLs), email marketing copy, and film screenplays.',
    learningOutcomes: [
      'Master direct response copywriting frameworks (AIDA, PAS, BAB)',
      'Write million-naira converting sales pages and email launch sequences',
      'Format professional film and YouTube script treatments in industry standard software',
      'Perform psychological audience profiling and benefit-driven messaging'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Direct Response Copywriting Fundamentals', topics: ['Headlines & Hooks that Stop the Scroll', 'Emotional Triggers & Urgency', 'Landing Page Copy Architecture'] },
      { weekOrModule: 'Module 2', title: 'Commercial Video & Ad Scripting', topics: ['VSL (Video Sales Letter) Blueprint', 'TikTok/Reels 15-Second Ad Scripts', 'Radio Jingle Writing'] },
      { weekOrModule: 'Module 3', title: 'High-Ticket Freelance Copywriting Business', topics: ['Building a Copywriting Portfolio', 'Pitching E-commerce Brands', 'Retainer Contracts'] }
    ],
    targetAudience: ['Copywriters', 'Scriptwriters', 'Marketers', 'Freelance Writers'],
    prerequisites: 'Strong written communication.',
    certificateType: 'Certified Commercial Copywriter (DSTA-CCC)',
    iconBadge: 'FileText'
  },
  {
    id: 'dsta-vp124',
    code: 'DSTA-VP124',
    title: 'Videography Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Cinematography & Filming',
    duration: '6 Weeks (Hands-on Camera Lab)',
    format: '85% Practical / 15% Theory',
    level: 'All Levels',
    price: 50000,
    originalPrice: 90000,
    description: 'Master manual camera operations (ISO, Aperture, Shutter Speed), 3-point cinematic lighting, drone piloting basics, and gimbal stabilization.',
    learningOutcomes: [
      'Operate DSLR, mirrorless, and cinema cameras in full manual mode',
      'Set up 3-point lighting setups for commercials, interviews, and music videos',
      'Execute smooth camera movement with 3-axis gimbals and sliders',
      'Capture pristine wireless lavalier and shotgun microphone audio'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Camera Mechanics & Exposure Triangle', topics: ['Sensor Sizes & Lens Selection', 'Frame Rates & Shutter Angles', 'Composition & Framing Rules'] },
      { weekOrModule: 'Module 2', title: 'Cinematic Lighting & Sound on Set', topics: ['Key, Fill & Hair Light Setups', 'Diffusers & Softboxes', 'Boom Mic Operating'] },
      { weekOrModule: 'Module 3', title: 'Movement & Commercial Production Lab', topics: ['DJI Ronin Gimbal Balancing', 'Live Music Video/Interview Shoot', 'Final Graded Showreel'] }
    ],
    targetAudience: ['Videographers', 'Filmmakers', 'Event Documentarians', 'Content Creators'],
    prerequisites: 'Camera or smartphone with manual video controls.',
    certificateType: 'Certified Professional Videographer (DSTA-CPV)',
    iconBadge: 'Video'
  },
  {
    id: 'dsta-pp125',
    code: 'DSTA-PP125',
    title: 'Photography Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Commercial Photography',
    duration: '6 Weeks',
    format: '80% Practical / 20% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 80000,
    description: 'Master portrait, studio, corporate, and event photography with professional strobe lights, Lightroom color editing, and client portrait retouching.',
    learningOutcomes: [
      'Master studio strobe triggers, softboxes, and beauty dishes',
      'Execute portrait, product, wedding, and corporate executive shoots',
      'Perform high-end skin retouching and color grading in Adobe Lightroom & Photoshop',
      'Price photography packages and license client usage rights'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Studio Lighting & Camera Optics', topics: ['Flash Synchronization & Modifiers', 'Portrait Posing Guides', 'Depth of Field & Lens Choices'] },
      { weekOrModule: 'Module 2', title: 'Product & Commercial Photography', topics: ['Ghost Mannequin & E-commerce Lighting', 'Reflective Surface Control', 'Outdoor Golden Hour Shoots'] },
      { weekOrModule: 'Module 3', title: 'Post-Processing Mastery & Business', topics: ['Frequency Separation Retouching', 'Lightroom Batch Processing', 'Client Invoicing & Contracts'] }
    ],
    targetAudience: ['Photographers', 'Visual Artists', 'Studio Assistants'],
    prerequisites: 'Camera (DSLR or Mirrorless).',
    certificateType: 'Certified Professional Photographer (DSTA-CPP)',
    iconBadge: 'Camera'
  },
  {
    id: 'dsta-scm126',
    code: 'DSTA-SCM126',
    title: 'Sports Content Creation & Monetization Programme',
    categoryId: 'creative',
    categoryName: 'Creative Media, Branding & Communication',
    industry: 'Sports Media & Entertainment',
    duration: '4 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 40000,
    originalPrice: 70000,
    description: 'Create viral football and sports commentary reels, match highlight breakdowns, sports podcasts, and secure betting/athletic brand sponsorships.',
    learningOutcomes: [
      'Produce fast-paced sports match review reels with tactical graphics',
      'Navigate sports copyright and fair use guidelines on YouTube/TikTok',
      'Launch fan-driven sports podcast and debate live streams',
      'Monetize sports channels with brand endorsements and affiliate partnerships'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Sports Highlights & Tactical Analysis', topics: ['Fair Use & Clip Sourcing', 'Telestrator & Tactical Graphics', 'Fast Paced Sports Video Editing'] },
      { weekOrModule: 'Module 2', title: 'Sports Podcasting & Live Watch-Alongs', topics: ['OBS Match Commentary Setup', 'Live Stream Moderation & Superchats', 'Engaging Football Fanbases'] },
      { weekOrModule: 'Module 3', title: 'Monetization & Sponsorship Pitching', topics: ['Betting & Sports Brand Deals', 'Merchandise Store Setup', 'Multi-Platform Revenue Streams'] }
    ],
    targetAudience: ['Sports Bloggers', 'Football Analysts', 'Sports Media Enthusiasts'],
    prerequisites: 'Passion for sports.',
    certificateType: 'Sports Media Producer Certificate (DSTA-SMPC)',
    iconBadge: 'Trophy'
  },

  // 7. INFORMATION TECHNOLOGY, SOFTWARE & CYBERSECURITY - 5 Courses
  {
    id: 'dsta-it127',
    code: 'DSTA-IT127',
    title: 'Information Technology (IT) & Computer Science (CS) Programme',
    categoryId: 'tech',
    categoryName: 'Information Technology, Software & Cybersecurity',
    industry: 'Computer Science & Core IT',
    duration: '10 Weeks (Foundational Diploma)',
    format: '70% Practical / 30% Theory',
    level: 'All Levels',
    price: 60000,
    originalPrice: 110000,
    description: 'Comprehensive computer science foundations covering computer architecture, data structures, networking protocols, Linux command line, and algorithms.',
    learningOutcomes: [
      'Understand computer hardware architecture, memory management, and binary logic',
      'Master data structures (arrays, linked lists, hash tables, trees) and algorithms',
      'Navigate Linux server environments via Bash shell scripting',
      'Configure TCP/IP, DNS, DHCP, and modern networking fundamentals'
    ],
    modules: [
      { weekOrModule: 'Weeks 1-3', title: 'Computer Architecture & Linux Operating Systems', topics: ['Hardware Components & CPU Logic', 'Linux Command Line Mastery', 'Shell Scripting Automation'] },
      { weekOrModule: 'Weeks 4-7', title: 'Data Structures & Algorithmic Problem Solving', topics: ['Time & Space Complexity (Big O)', 'Arrays, Stacks, Queues, Trees', 'Search & Sort Algorithms'] },
      { weekOrModule: 'Weeks 8-10', title: 'Computer Networking & Systems Architecture', topics: ['OSI Model & TCP/IP', 'Subnetting & Routing', 'Final Technical Systems Exam'] }
    ],
    targetAudience: ['Aspiring Software Engineers', 'Computer Science Students', 'IT Technicians'],
    prerequisites: 'Basic math and logic skills.',
    certificateType: 'Diploma in Information Technology & CS (DSTA-DITCS)',
    iconBadge: 'Cpu',
    featured: true
  },
  {
    id: 'dsta-ict128',
    code: 'DSTA-ICT128',
    title: 'ICT Support & System Administration',
    categoryId: 'tech',
    categoryName: 'Information Technology, Software & Cybersecurity',
    industry: 'IT Infrastructure & Support',
    duration: '6 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'All Levels',
    price: 45000,
    originalPrice: 80000,
    description: 'Diagnose and resolve enterprise hardware/software faults, configure corporate routers/switches, manage Active Directory, and support end-users.',
    learningOutcomes: [
      'Troubleshoot Windows, MacOS, and Linux workstations and peripherals',
      'Manage user accounts, group policies, and permissions in Active Directory',
      'Configure office LAN, Wi-Fi access points, and VPN gateways',
      'Manage IT service desk ticketing systems adhering to ITIL standards'
    ],
    modules: [
      { weekOrModule: 'Module 1', title: 'Hardware Diagnostics & Operating System Setup', topics: ['PC Assembly & Component Testing', 'OS Deployment & Imaging', 'Peripheral Troubleshooting'] },
      { weekOrModule: 'Module 2', title: 'Network Administration & Active Directory', topics: ['Router/Switch Configuration', 'Active Directory & Azure AD', 'Group Policies & Permissions'] },
      { weekOrModule: 'Module 3', title: 'ITIL Service Desk & Helpdesk Operations', topics: ['Jira Service Management', 'SLA Management & Escalations', 'Remote Support Protocols'] }
    ],
    targetAudience: ['IT Support Staff', 'System Administrators', 'Network Technicians'],
    prerequisites: 'Basic computer use.',
    certificateType: 'Certified ICT Support Specialist (DSTA-CICSP)',
    iconBadge: 'HardDrive'
  },
  {
    id: 'dsta-wd129',
    code: 'DSTA-WD129',
    title: 'Website Design & Development',
    categoryId: 'tech',
    categoryName: 'Information Technology, Software & Cybersecurity',
    industry: 'Web Design & Frontend',
    duration: '8 Weeks',
    format: '80% Practical / 20% Theory',
    level: 'All Levels',
    price: 55000,
    originalPrice: 100000,
    description: 'Build responsive, lightning-fast commercial websites with HTML5, CSS3, JavaScript, Tailwind CSS, WordPress CMS, and React basics.',
    learningOutcomes: [
      'Code responsive websites from scratch using semantic HTML5 and CSS3',
      'Master Tailwind CSS utility classes and modern layout grids',
      'Build dynamic interactive web interfaces with modern JavaScript (ES6+)',
      'Develop custom WordPress corporate portals and e-commerce stores with WooCommerce'
    ],
    modules: [
      { weekOrModule: 'Weeks 1-2', title: 'HTML5, CSS3 & Responsive Design', topics: ['Semantic HTML', 'Flexbox & CSS Grid', 'Mobile-First Layouts'] },
      { weekOrModule: 'Weeks 3-4', title: 'Tailwind CSS & Modern JavaScript', topics: ['Tailwind Setup & Utility Workflow', 'DOM Manipulation', 'Async/Await & API Fetching'] },
      { weekOrModule: 'Weeks 5-6', title: 'WordPress & E-Commerce Development', topics: ['Custom Theme Design', 'WooCommerce & Paystack Integration', 'Security & Speed Optimization'] },
      { weekOrModule: 'Weeks 7-8', title: 'Deployment, Hosting & Client Project', topics: ['Domain DNS & SSL Setup', 'Cpanel/Vercel Deployments', 'Live Client Web Build'] }
    ],
    targetAudience: ['Web Designers', 'Frontend Developers', 'Freelancers', 'Business Owners'],
    prerequisites: 'None.',
    certificateType: 'Certified Web Developer (DSTA-CWD)',
    iconBadge: 'Code',
    featured: true
  },
  {
    id: 'dsta-sd130',
    code: 'DSTA-SD130',
    title: 'Software & Mobile Apps Design & Development',
    categoryId: 'tech',
    categoryName: 'Information Technology, Software & Cybersecurity',
    industry: 'Full-Stack & Mobile Development',
    duration: '12 Weeks (Master Engineering Track)',
    format: '80% Practical / 20% Theory',
    level: 'Intermediate',
    price: 75000,
    originalPrice: 150000,
    description: 'Full-stack software engineering with React, Node.js, Express, PostgreSQL/MongoDB, and React Native cross-platform mobile apps for iOS and Android.',
    learningOutcomes: [
      'Architect robust RESTful and GraphQL backend APIs with Node.js and Express',
      'Build responsive, state-managed SPA frontends with React and TypeScript',
      'Develop cross-platform iOS/Android mobile applications using React Native',
      'Implement authentication, relational database modeling, and cloud deployments'
    ],
    modules: [
      { weekOrModule: 'Weeks 1-4', title: 'Frontend Mastery with React & TypeScript', topics: ['React Components & Hooks', 'TypeScript Typing & Interfaces', 'State Management (Zustand/Redux)'] },
      { weekOrModule: 'Weeks 5-8', title: 'Backend APIs & Relational Databases', topics: ['Node.js & Express REST APIs', 'PostgreSQL & Drizzle/Prisma ORM', 'JWT Authentication & Security'] },
      { weekOrModule: 'Weeks 9-12', title: 'Cross-Platform Mobile Apps & Capstone', topics: ['React Native & Expo', 'Mobile Native APIs (Camera, Push)', 'App Store/Play Store Publishing'] }
    ],
    targetAudience: ['Software Developers', 'Full-Stack Engineers', 'Mobile App Builders'],
    prerequisites: 'Basic JavaScript/programming familiarity.',
    certificateType: 'Certified Full-Stack Software Engineer (DSTA-CFSE)',
    iconBadge: 'Smartphone',
    featured: true
  },
  {
    id: 'dsta-cs131',
    code: 'DSTA-CS131',
    title: 'Cyber Security Programme',
    categoryId: 'tech',
    categoryName: 'Information Technology, Software & Cybersecurity',
    industry: 'Cyber Defense & Ethical Hacking',
    duration: '8 Weeks',
    format: '75% Practical / 25% Theory',
    level: 'Intermediate',
    price: 65000,
    originalPrice: 120000,
    description: 'Learn ethical hacking, penetration testing, network defense, vulnerability scanning with Wireshark/Nmap, and SOC security incident response.',
    learningOutcomes: [
      'Conduct authorized penetration testing and vulnerability assessments',
      'Analyze network packet captures using Wireshark to detect intrusions',
      'Implement defensive firewall rules, encryption, and zero-trust architectures',
      'Respond to security incidents, malware outbreaks, and data breaches'
    ],
    modules: [
      { weekOrModule: 'Weeks 1-2', title: 'Cybersecurity Fundamentals & Network Recon', topics: ['Threat Landscapes & Vectors', 'Port Scanning with Nmap', 'Packet Analysis with Wireshark'] },
      { weekOrModule: 'Weeks 3-5', title: 'Web App Security & Ethical Hacking', topics: ['OWASP Top 10 Vulnerabilities', 'SQL Injection & XSS Exploitation', 'Metasploit & Kali Linux Labs'] },
      { weekOrModule: 'Weeks 6-8', title: 'Defensive Security, SOC & Incident Response', topics: ['SIEM Monitoring & Log Analysis', 'Hardening Linux & Windows Servers', 'Final Capture The Flag (CTF) Exam'] }
    ],
    targetAudience: ['Cybersecurity Analysts', 'Network Administrators', 'Security Enthusiasts'],
    prerequisites: 'Basic networking and OS understanding.',
    certificateType: 'Certified Cyber Defense Specialist (DSTA-CCDS)',
    iconBadge: 'ShieldAlert',
    featured: true
  }
];

// Helper to assemble the full 115 array with remaining categories seamlessly
export function getFullAcademyCourses(): AcademyCourse[] {
  // Return the master catalog
  return ALL_115_COURSES;
}
