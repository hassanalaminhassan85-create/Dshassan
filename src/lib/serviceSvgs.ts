// High-fidelity bespoke SVG illustrations for DS Tech Core Services
// 100% self-contained, real vector illustrations aligned specifically to each service.
// Zero external network dependencies, zero broken images, zero duplicate illustrations.

export const SERVICE_SVGS: Record<string, string> = {
  svc_web_dev: 'web_dev',
  svc_mobile_software: 'mobile_software',
  svc_landing_pages: 'landing_pages',
  svc_portfolio_design: 'portfolio_design',
  svc_ai_automation: 'ai_automation',
  svc_ads_management: 'ads_management',
  svc_seo: 'seo',
  svc_content_presentation: 'content_presentation',
  svc_ai_content: 'ai_content',
  svc_video_editing: 'video_editing',
  svc_digital_marketing: 'digital_marketing',
  svc_social_media_mgmt: 'social_media_mgmt',
  svc_graphic_branding: 'graphic_branding',
  svc_project_mgmt: 'project_mgmt',
  svc_cybersecurity: 'cybersecurity',
  svc_event_videography: 'event_videography'
};

interface Palette {
  bg1: string;
  bg2: string;
  accent: string;
  accent2: string;
  label: string;
  badgeBg: string;
}

const PALETTES: Record<string, Palette> = {
  svc_web_dev: { bg1: '#050c18', bg2: '#034375', accent: '#38bdf8', accent2: '#60a5fa', label: 'FULL-STACK WEB ARCHITECTURE', badgeBg: '#0369a1' },
  svc_mobile_software: { bg1: '#070a1a', bg2: '#312e81', accent: '#818cf8', accent2: '#c084fc', label: 'MOBILE & CLOUD SOFTWARE', badgeBg: '#4338ca' },
  svc_landing_pages: { bg1: '#031410', bg2: '#065f46', accent: '#34d399', accent2: '#6ee7b7', label: 'HIGH-CONVERTING FUNNELS', badgeBg: '#047857' },
  svc_portfolio_design: { bg1: '#0d071b', bg2: '#581c87', accent: '#c084fc', accent2: '#f472b6', label: 'BESPOKE PORTFOLIO DESIGN', badgeBg: '#7c3aed' },
  svc_ai_automation: { bg1: '#021314', bg2: '#115e59', accent: '#2dd4bf', accent2: '#5eead4', label: 'AI & WORKFLOW AUTOMATION', badgeBg: '#0d9488' },
  svc_ads_management: { bg1: '#140803', bg2: '#9a3412', accent: '#fb923c', accent2: '#f97316', label: 'HIGH-ROAS ADS MANAGEMENT', badgeBg: '#c2410c' },
  svc_seo: { bg1: '#120d03', bg2: '#854d0e', accent: '#fbbf24', accent2: '#fcd34d', label: 'SEARCH ENGINE OPTIMIZATION', badgeBg: '#b45309' },
  svc_content_presentation: { bg1: '#16040c', bg2: '#9f1239', accent: '#fb7185', accent2: '#fda4af', label: 'EXECUTIVE PRESENTATIONS & COPY', badgeBg: '#be123c' },
  svc_ai_content: { bg1: '#090518', bg2: '#3730a3', accent: '#a5b4fc', accent2: '#e879f9', label: 'GENERATIVE AI CONTENT CREATION', badgeBg: '#4f46e5' },
  svc_video_editing: { bg1: '#0e0419', bg2: '#6b21a8', accent: '#c084fc', accent2: '#e879f9', label: '4K CINEMA VIDEO EDITING', badgeBg: '#9333ea' },
  svc_digital_marketing: { bg1: '#140803', bg2: '#9a3412', accent: '#fdba74', accent2: '#fb923c', label: 'OMNICHANNEL DIGITAL MARKETING', badgeBg: '#ea580c' },
  svc_social_media_mgmt: { bg1: '#04101e', bg2: '#075985', accent: '#7dd3fc', accent2: '#38bdf8', label: 'SOCIAL MEDIA MANAGEMENT', badgeBg: '#0284c7' },
  svc_graphic_branding: { bg1: '#08061a', bg2: '#3730a3', accent: '#818cf8', accent2: '#a78bfa', label: 'CORPORATE BRANDING & IDENTITY', badgeBg: '#4f46e5' },
  svc_project_mgmt: { bg1: '#04140e', bg2: '#065f46', accent: '#6ee7b7', accent2: '#34d399', label: 'AGILE SPRINT PROJECT MANAGEMENT', badgeBg: '#059669' },
  svc_cybersecurity: { bg1: '#140303', bg2: '#991b1b', accent: '#f87171', accent2: '#fca5a5', label: 'ENTERPRISE CYBERSECURITY & AUDIT', badgeBg: '#dc2626' },
  svc_event_videography: { bg1: '#0d0418', bg2: '#581c87', accent: '#c4b5fd', accent2: '#a78bfa', label: 'EVENT COVERAGE & BROADCAST', badgeBg: '#7c3aed' }
};

// Generates dedicated semantic vector illustration for each service
function getIllustrationForService(id: string, p: Palette): string {
  switch (id) {
    case 'svc_web_dev':
      // Code Editor IDE + Modern Browser Wireframe + Connected Nodes
      return `
        <!-- Background Glow -->
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />
        
        <!-- Code Window IDE Layer -->
        <g transform="translate(140, 100)">
          <rect width="320" height="230" rx="12" fill="#090d16" stroke="${p.accent}" stroke-opacity="0.4" stroke-width="1.5" />
          <rect width="320" height="30" rx="12" fill="#0f172a" />
          <circle cx="18" cy="15" r="4.5" fill="#ef4444" />
          <circle cx="34" cy="15" r="4.5" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#10b981" />
          <text x="75" y="19" fill="#94a3b8" font-family="monospace" font-size="10">App.tsx — Next.js 15</text>
          
          <!-- Code Lines -->
          <text x="18" y="55" fill="${p.accent}" font-family="monospace" font-size="11" font-weight="700">import { Enterprise } from 'dstetch';</text>
          <text x="18" y="75" fill="#e2e8f0" font-family="monospace" font-size="11">export default function <tspan fill="#38bdf8">Portal</tspan>() {</text>
          <text x="32" y="95" fill="#a78bfa" font-family="monospace" font-size="11">const [status] = useState('online');</text>
          <text x="32" y="115" fill="#94a3b8" font-family="monospace" font-size="11">return (</text>
          <text x="46" y="135" fill="#34d399" font-family="monospace" font-size="11">&lt;<tspan fill="${p.accent}">SpeedCloudProvider</tspan> latency="1ms"&gt;</text>
          <text x="60" y="155" fill="#fef08a" font-family="monospace" font-size="11">&lt;<tspan fill="#38bdf8">SecureApiGateway</tspan> ssl={true} /&gt;</text>
          <text x="46" y="175" fill="#34d399" font-family="monospace" font-size="11">&lt;/<tspan fill="${p.accent}">SpeedCloudProvider</tspan>&gt;</text>
          <text x="32" y="195" fill="#94a3b8" font-family="monospace" font-size="11">);</text>
          <text x="18" y="215" fill="#e2e8f0" font-family="monospace" font-size="11">}</text>
          
          <!-- Blinking cursor -->
          <rect x="35" y="206" width="7" height="12" fill="${p.accent}" opacity="0.8" />
        </g>

        <!-- Connected Browser Layer (Overlapping right) -->
        <g transform="translate(390, 140)">
          <rect width="280" height="200" rx="12" fill="#0b1120" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1.5" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.6))" />
          <rect width="280" height="28" rx="12" fill="#1e293b" />
          <circle cx="16" cy="14" r="3.5" fill="#64748b" />
          <circle cx="28" cy="14" r="3.5" fill="#64748b" />
          <circle cx="40" cy="14" r="3.5" fill="#64748b" />
          <rect x="55" y="7" width="160" height="14" rx="4" fill="#0f172a" />
          <text x="65" y="18" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="9" font-weight="600">https://dstechagency.com</text>
          
          <!-- Browser Content Wireframe -->
          <rect x="16" y="42" width="130" height="14" rx="3" fill="#f8fafc" opacity="0.9" />
          <rect x="16" y="62" width="200" height="8" rx="2" fill="#64748b" opacity="0.6" />
          <rect x="16" y="75" width="160" height="8" rx="2" fill="#64748b" opacity="0.4" />
          <rect x="16" y="95" width="70" height="20" rx="6" fill="${p.accent}" />
          <text x="26" y="109" fill="#04101e" font-family="system-ui, sans-serif" font-size="9" font-weight="800">LAUNCH</text>
          
          <!-- Responsive grid cards -->
          <rect x="16" y="130" width="72" height="50" rx="6" fill="#1e293b" stroke="#334155" />
          <rect x="96" y="130" width="72" height="50" rx="6" fill="#1e293b" stroke="#334155" />
          <rect x="176" y="130" width="88" height="50" rx="6" fill="#1e293b" stroke="#334155" />
        </g>

        <!-- Connecting Data Nodes -->
        <path d="M 460 215 L 400 240" stroke="${p.accent}" stroke-width="2" stroke-dasharray="4 3" opacity="0.8" />
        <circle cx="460" cy="215" r="5" fill="${p.accent}" />
      `;

    case 'svc_mobile_software':
      // Mobile Smartphone + Cloud Database Nodes + Sync Pulse
      return `
        <circle cx="400" cy="230" r="150" fill="${p.accent}" opacity="0.1" />

        <!-- Smartphone Device Mockup -->
        <g transform="translate(290, 85)">
          <rect width="180" height="310" rx="28" fill="#090d16" stroke="${p.accent}" stroke-width="2.5" filter="drop-shadow(0 15px 35px rgba(0,0,0,0.8))" />
          
          <!-- Dynamic Island / Speaker Notch -->
          <rect x="58" y="10" width="64" height="14" rx="7" fill="#030712" />
          <circle cx="108" cy="17" r="2.5" fill="#1e293b" />
          
          <!-- Mobile Screen Content -->
          <g transform="translate(12, 34)">
            <!-- Header bar -->
            <rect width="156" height="24" rx="6" fill="#1e1b4b" />
            <text x="12" y="16" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="9" font-weight="700">DS Tech Mobile</text>
            <circle cx="140" cy="12" r="5" fill="${p.accent}" />

            <!-- Active Stat Card -->
            <rect y="32" width="156" height="65" rx="10" fill="#1e1b4b" stroke="#4338ca" stroke-width="1" />
            <text x="12" y="50" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="8" font-weight="600">LIVE SYSTEM LATENCY</text>
            <text x="12" y="70" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="900">0.08 ms</text>
            <path d="M 12 85 Q 40 70 80 82 T 144 68" fill="none" stroke="${p.accent}" stroke-width="2" />

            <!-- Feature Action Grid -->
            <rect y="105" width="74" height="60" rx="8" fill="#1e293b" />
            <circle cx="37" cy="125" r="10" fill="#4338ca" />
            <text x="18" y="152" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="8" font-weight="700">iOS Native</text>

            <rect x="82" y="105" width="74" height="60" rx="8" fill="#1e293b" />
            <circle cx="119" cy="125" r="10" fill="#0d9488" />
            <text x="96" y="152" fill="#99f6e4" font-family="system-ui, sans-serif" font-size="8" font-weight="700">Android API</text>

            <!-- Bottom Button -->
            <rect y="176" width="156" height="26" rx="8" fill="${p.accent}" />
            <text x="44" y="193" fill="#030712" font-family="system-ui, sans-serif" font-size="9" font-weight="800">EXECUTE CLOUD SYNC</text>
          </g>
          <!-- Home Indicator Bar -->
          <rect x="55" y="295" width="70" height="3" rx="1.5" fill="#64748b" />
        </g>

        <!-- Surrounding Cloud Microservice Nodes -->
        <g transform="translate(130, 160)">
          <rect width="110" height="60" rx="10" fill="#090d16" stroke="#4338ca" stroke-width="1.5" />
          <text x="15" y="28" fill="#818cf8" font-family="monospace" font-size="9" font-weight="700">POSTGRESQL</text>
          <text x="15" y="44" fill="#94a3b8" font-family="monospace" font-size="8">Replica 01 OK</text>
          <path d="M 110 30 L 160 30" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="3 3" />
        </g>

        <g transform="translate(530, 160)">
          <rect width="120" height="60" rx="10" fill="#090d16" stroke="#4338ca" stroke-width="1.5" />
          <text x="15" y="28" fill="#818cf8" font-family="monospace" font-size="9" font-weight="700">REST &amp; GRAPHQL</text>
          <text x="15" y="44" fill="#34d399" font-family="monospace" font-size="8">200ms Heartbeat</text>
          <path d="M 0 30 L -60 30" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="3 3" />
        </g>
      `;

    case 'svc_landing_pages':
      // High-Converting Landing Page with Hero CTA, Forms & Conversion Funnel
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <!-- Landing Page Artboard Frame -->
        <g transform="translate(150, 95)">
          <rect width="500" height="280" rx="14" fill="#041612" stroke="${p.accent}" stroke-width="1.5" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.7))" />
          <!-- Browser Nav -->
          <rect width="500" height="34" rx="14" fill="#062e24" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <rect x="70" y="9" width="220" height="16" rx="5" fill="#021c16" />
          <text x="82" y="21" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="700">offer.dstechagency.com/exclusive</text>
          <rect x="420" y="9" width="60" height="16" rx="4" fill="${p.accent}" />
          <text x="432" y="21" fill="#021c16" font-family="system-ui, sans-serif" font-size="8" font-weight="800">ENROLL</text>

          <!-- Hero Section Split Screen -->
          <!-- Left: Pitch & CTA -->
          <g transform="translate(24, 52)">
            <rect width="80" height="12" rx="3" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="0.8" />
            <text x="8" y="9" fill="#34d399" font-family="system-ui, sans-serif" font-size="8" font-weight="800">4.9x ROI GUARANTEE</text>
            <rect y="20" width="210" height="18" rx="4" fill="#ffffff" />
            <rect y="44" width="160" height="12" rx="3" fill="#a7f3d0" />
            <rect y="64" width="190" height="8" rx="2" fill="#6ee7b7" opacity="0.6" />
            <rect y="78" width="140" height="8" rx="2" fill="#6ee7b7" opacity="0.4" />
            
            <!-- High-Contrast CTA Button -->
            <g transform="translate(0, 98)">
              <rect width="160" height="34" rx="8" fill="${p.accent}" filter="drop-shadow(0 4px 12px rgba(52,211,153,0.4))" />
              <text x="24" y="22" fill="#021c16" font-family="system-ui, sans-serif" font-size="12" font-weight="900">CLAIM ACCESS &gt;</text>
              <circle cx="175" cy="17" r="14" fill="#10b981" opacity="0.2" />
            </g>

            <!-- Trust Badges -->
            <g transform="translate(0, 150)">
              <circle cx="8" cy="8" r="8" fill="#065f46" />
              <circle cx="22" cy="8" r="8" fill="#047857" />
              <circle cx="36" cy="8" r="8" fill="#059669" />
              <text x="52" y="12" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="9" font-weight="700">Verified by 500+ Clients</text>
            </g>
          </g>

          <!-- Right: Interactive Lead Form Box -->
          <g transform="translate(270, 48)">
            <rect width="206" height="175" rx="10" fill="#022119" stroke="#10b981" stroke-opacity="0.5" stroke-width="1" />
            <text x="14" y="24" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800">Instant Quote Form</text>
            
            <rect x="14" y="36" width="178" height="22" rx="4" fill="#043327" />
            <text x="24" y="51" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="8">Full Name: John Doe</text>
            
            <rect x="14" y="66" width="178" height="22" rx="4" fill="#043327" />
            <text x="24" y="81" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="8">Email: client@domain.com</text>
            
            <rect x="14" y="96" width="178" height="22" rx="4" fill="#043327" />
            <text x="24" y="111" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="8">WhatsApp: +234 902 348 9111</text>
            
            <rect x="14" y="128" width="178" height="28" rx="6" fill="#10b981" />
            <text x="48" y="146" fill="#021c16" font-family="system-ui, sans-serif" font-size="10" font-weight="800">SUBMIT BRIEF</text>
          </g>
        </g>
      `;

    case 'svc_portfolio_design':
      // Figma/Creative Artboard with Masonry Grid, Cursor and Color Palette
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 95)">
          <!-- Design Canvas Board -->
          <rect width="540" height="270" rx="14" fill="#0d071a" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Canvas Top Toolbar -->
          <rect width="540" height="32" rx="14" fill="#1a0f30" />
          <circle cx="20" cy="16" r="4" fill="#ef4444" />
          <circle cx="34" cy="16" r="4" fill="#f59e0b" />
          <circle cx="48" cy="16" r="4" fill="#10b981" />
          <text x="75" y="20" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="10" font-weight="700">DS Tech Studio Canvas — Showcase v4</text>
          
          <!-- Masonry Portfolio Artboards -->
          <!-- Card 1 (Large Featured) -->
          <g transform="translate(20, 50)">
            <rect width="210" height="190" rx="8" fill="#1e1038" stroke="#a855f7" stroke-width="1" />
            <rect x="12" y="12" width="186" height="100" rx="6" fill="#3b0764" />
            <!-- Graphic inside card -->
            <circle cx="105" cy="62" r="28" fill="${p.accent}" opacity="0.4" />
            <polygon points="105,42 125,78 85,78" fill="${p.accent}" />
            <rect x="12" y="124" width="140" height="14" rx="3" fill="#ffffff" />
            <rect x="12" y="146" width="90" height="8" rx="2" fill="#c084fc" />
            <rect x="12" y="162" width="60" height="16" rx="4" fill="#7c3aed" />
            <text x="22" y="174" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8" font-weight="700">CASE STUDY</text>
          </g>

          <!-- Card 2 (Top Right) -->
          <g transform="translate(245, 50)">
            <rect width="150" height="90" rx="8" fill="#1e1038" stroke="#7e22ce" stroke-width="1" />
            <rect x="10" y="10" width="130" height="42" rx="4" fill="#4c1d95" />
            <rect x="10" y="60" width="100" height="10" rx="2" fill="#ffffff" />
            <rect x="10" y="74" width="70" height="6" rx="2" fill="#a78bfa" />
          </g>

          <!-- Card 3 (Bottom Right) -->
          <g transform="translate(245, 150)">
            <rect width="150" height="90" rx="8" fill="#1e1038" stroke="#7e22ce" stroke-width="1" />
            <rect x="10" y="10" width="130" height="42" rx="4" fill="#581c87" />
            <rect x="10" y="60" width="90" height="10" rx="2" fill="#ffffff" />
            <rect x="10" y="74" width="60" height="6" rx="2" fill="#a78bfa" />
          </g>

          <!-- Floating Inspector Swatches Panel -->
          <g transform="translate(410, 50)">
            <rect width="110" height="190" rx="8" fill="#170c2a" stroke="#a855f7" stroke-width="1" />
            <text x="12" y="24" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="9" font-weight="800">PALETTE</text>
            <circle cx="24" cy="48" r="10" fill="#7c3aed" />
            <circle cx="50" cy="48" r="10" fill="#c084fc" />
            <circle cx="76" cy="48" r="10" fill="#f472b6" />
            <text x="12" y="80" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="8" font-weight="600">TYPOGRAPHY</text>
            <text x="12" y="100" fill="#ffffff" font-family="serif" font-size="14" font-weight="900">Syne Sans</text>
            <text x="12" y="120" fill="#d8b4fe" font-family="monospace" font-size="9">Weight: 800</text>
            <rect x="12" y="145" width="86" height="24" rx="6" fill="${p.accent}" />
            <text x="24" y="161" fill="#1e1038" font-family="system-ui, sans-serif" font-size="9" font-weight="800">EXPORT</text>
          </g>

          <!-- Vector Selection Cursor -->
          <g transform="translate(225, 120)">
            <polygon points="0,0 20,7 13,13 18,24 14,26 9,15 3,20" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
            <circle cx="26" cy="12" r="3" fill="${p.accent}" />
          </g>
        </g>
      `;

    case 'svc_ai_automation':
      // Glowing Neural Network Matrix + Microchip + Automation Logic Pipeline
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.1" />

        <!-- Central Microchip AI Processor -->
        <g transform="translate(330, 160)">
          <rect width="140" height="140" rx="16" fill="#021c17" stroke="${p.accent}" stroke-width="2" filter="drop-shadow(0 0 25px rgba(45,212,191,0.4))" />
          <rect x="20" y="20" width="100" height="100" rx="8" fill="#042f27" />
          
          <!-- Chip Circuit Lines -->
          <line x1="70" y1="20" x2="70" y2="120" stroke="${p.accent}" stroke-width="1" opacity="0.6" />
          <line x1="20" y1="70" x2="120" y2="70" stroke="${p.accent}" stroke-width="1" opacity="0.6" />
          <circle cx="70" cy="70" r="22" fill="#021c17" stroke="${p.accent}" stroke-width="2" />
          <text x="56" y="75" fill="${p.accent}" font-family="system-ui, sans-serif" font-size="14" font-weight="900">AI</text>

          <!-- Outer Pins -->
          <line x1="-15" y1="40" x2="0" y2="40" stroke="${p.accent}" stroke-width="3" />
          <line x1="-15" y1="70" x2="0" y2="70" stroke="${p.accent}" stroke-width="3" />
          <line x1="-15" y1="100" x2="0" y2="100" stroke="${p.accent}" stroke-width="3" />
          <line x1="140" y1="40" x2="155" y2="40" stroke="${p.accent}" stroke-width="3" />
          <line x1="140" y1="70" x2="155" y2="70" stroke="${p.accent}" stroke-width="3" />
          <line x1="140" y1="100" x2="155" y2="100" stroke="${p.accent}" stroke-width="3" />
        </g>

        <!-- Left Inflow Logic Block: Trigger -->
        <g transform="translate(130, 180)">
          <rect width="140" height="80" rx="10" fill="#04201b" stroke="#0d9488" stroke-width="1.5" />
          <circle cx="25" cy="30" r="10" fill="#0d9488" />
          <text x="21" y="34" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="900">⚡</text>
          <text x="45" y="34" fill="#5eead4" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Webhook Trigger</text>
          <text x="15" y="60" fill="#99f6e4" font-family="monospace" font-size="9">CRM Lead Inbound</text>
          <!-- Pathway to central chip -->
          <path d="M 140 40 L 195 40" stroke="${p.accent}" stroke-width="2" stroke-dasharray="4 3" />
        </g>

        <!-- Right Outflow Block: Automated Action -->
        <g transform="translate(530, 180)">
          <rect width="140" height="80" rx="10" fill="#04201b" stroke="#0d9488" stroke-width="1.5" />
          <circle cx="25" cy="30" r="10" fill="#14b8a6" />
          <text x="20" y="34" fill="#04201b" font-family="system-ui, sans-serif" font-size="10" font-weight="900">✓</text>
          <text x="45" y="34" fill="#5eead4" font-family="system-ui, sans-serif" font-size="11" font-weight="700">WhatsApp Bot</text>
          <text x="15" y="60" fill="#99f6e4" font-family="monospace" font-size="9">Zero-Manual Chat</text>
          <!-- Pathway from central chip -->
          <path d="M -60 40 L 0 40" stroke="${p.accent}" stroke-width="2" stroke-dasharray="4 3" />
        </g>

        <!-- Neural Synaptic Floating Nodes -->
        <circle cx="260" cy="120" r="8" fill="${p.accent}" opacity="0.6" />
        <circle cx="540" cy="120" r="8" fill="${p.accent}" opacity="0.6" />
        <circle cx="260" cy="340" r="8" fill="${p.accent}" opacity="0.6" />
        <circle cx="540" cy="340" r="8" fill="${p.accent}" opacity="0.6" />
        <line x1="260" y1="120" x2="330" y2="180" stroke="${p.accent}" stroke-width="1" opacity="0.4" />
        <line x1="540" y1="120" x2="470" y2="180" stroke="${p.accent}" stroke-width="1" opacity="0.4" />
      `;

    case 'svc_ads_management':
      // Ad Campaign Performance Dashboard + Bullseye Targeting + ROAS Chart
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(140, 90)">
          <!-- Ads Analytics Main Board -->
          <rect width="520" height="280" rx="14" fill="#130903" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="520" height="34" rx="14" fill="#241005" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#fed7aa" font-family="system-ui, sans-serif" font-size="10" font-weight="800">META &amp; GOOGLE ADS MANAGER — LIVE CAMPAIGNS</text>
          <rect x="420" y="9" width="80" height="16" rx="4" fill="#ea580c" />
          <text x="430" y="21" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8" font-weight="800">● LIVE BIDDING</text>

          <!-- Left: Targeting Bullseye & Metrics -->
          <g transform="translate(24, 50)">
            <!-- Precision Target Retargeting Crosshair -->
            <g transform="translate(50, 50)">
              <circle cx="0" cy="0" r="42" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.3" />
              <circle cx="0" cy="0" r="28" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.6" />
              <circle cx="0" cy="0" r="14" fill="#ea580c" fill-opacity="0.2" stroke="${p.accent}" stroke-width="2" />
              <circle cx="0" cy="0" r="4" fill="${p.accent}" />
              <line x1="-50" y1="0" x2="50" y2="0" stroke="${p.accent}" stroke-width="1" stroke-dasharray="2 2" />
              <line x1="0" y1="-50" x2="0" y2="50" stroke="${p.accent}" stroke-width="1" stroke-dasharray="2 2" />
            </g>
            <text x="120" y="34" fill="#ffedd5" font-family="system-ui, sans-serif" font-size="12" font-weight="900">AUDIENCE REACH</text>
            <text x="120" y="52" fill="#fdba74" font-family="system-ui, sans-serif" font-size="18" fontspan="900">842,500+</text>
            <text x="120" y="70" fill="#a8a29e" font-family="system-ui, sans-serif" font-size="9">Abuja &amp; Lagos High-Net-Worth</text>

            <!-- CTR / CPC Pill -->
            <rect y="120" width="180" height="60" rx="8" fill="#1f0c04" stroke="#c2410c" stroke-width="1" />
            <text x="16" y="142" fill="#fdba74" font-family="system-ui, sans-serif" font-size="9" font-weight="700">CLICK-THROUGH RATE</text>
            <text x="16" y="165" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900">8.42% <tspan fill="#34d399" font-size="11">▲ +340%</tspan></text>
          </g>

          <!-- Right: ROAS Surging Line Graph -->
          <g transform="translate(240, 50)">
            <rect width="255" height="170" rx="10" fill="#1b0a03" stroke="#ea580c" stroke-opacity="0.4" stroke-width="1" />
            <text x="16" y="24" fill="#fed7aa" font-family="system-ui, sans-serif" font-size="10" font-weight="800">RETURN ON AD SPEND (ROAS)</text>
            
            <!-- Graph Area -->
            <path d="M 16 140 L 50 110 L 90 120 L 140 70 L 190 85 L 235 35" fill="none" stroke="${p.accent}" stroke-width="3" />
            <path d="M 16 140 L 50 110 L 90 120 L 140 70 L 190 85 L 235 35 L 235 150 L 16 150 Z" fill="${p.accent}" fill-opacity="0.1" />
            
            <!-- Target Peak Marker -->
            <circle cx="235" cy="35" r="5" fill="#f97316" stroke="#ffffff" stroke-width="1.5" />
            <rect x="170" y="10" width="60" height="20" rx="4" fill="#ea580c" />
            <text x="178" y="24" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="900">6.8x ROAS</text>

            <!-- Bottom Ad Channel Badges -->
            <rect x="16" y="156" width="60" height="18" rx="4" fill="#291206" />
            <text x="24" y="169" fill="#fdba74" font-family="system-ui, sans-serif" font-size="8" font-weight="700">Instagram</text>

            <rect x="84" y="156" width="60" height="18" rx="4" fill="#291206" />
            <text x="96" y="169" fill="#fdba74" font-family="system-ui, sans-serif" font-size="8" font-weight="700">Google</text>

            <rect x="152" y="156" width="60" height="18" rx="4" fill="#291206" />
            <text x="162" y="169" fill="#fdba74" font-family="system-ui, sans-serif" font-size="8" font-weight="700">TikTok</text>
          </g>
        </g>
      `;

    case 'svc_seo':
      // Google SERP Snippet #1 Rank Badge + Search Bar + SEO Lighthouse 100%
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#120c02" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Search Bar at Top -->
          <g transform="translate(24, 20)">
            <rect width="492" height="42" rx="21" fill="#221705" stroke="${p.accent}" stroke-width="1" />
            <circle cx="26" cy="21" r="8" fill="none" stroke="${p.accent}" stroke-width="2" />
            <line x1="32" y1="27" x2="40" y2="35" stroke="${p.accent}" stroke-width="2" />
            <text x="50" y="26" fill="#fef08a" font-family="system-ui, sans-serif" font-size="12" font-weight="600">best software and digital marketing agency nigeria</text>
            <rect x="420" y="8" width="60" height="26" rx="13" fill="${p.accent}" />
            <text x="435" y="24" fill="#120c02" font-family="system-ui, sans-serif" font-size="10" font-weight="900">SEARCH</text>
          </g>

          <!-- Organic SERP Result #1 (Main Focus) -->
          <g transform="translate(24, 80)">
            <rect width="330" height="175" rx="10" fill="#1f1404" stroke="#eab308" stroke-width="1" />
            
            <!-- #1 Rank Trophy Badge -->
            <g transform="translate(14, 14)">
              <rect width="70" height="18" rx="4" fill="#eab308" />
              <text x="8" y="13" fill="#1c1917" font-family="system-ui, sans-serif" font-size="9" font-weight="900">★ #1 RANK</text>
              <text x="80" y="14" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9">https://dstechagency.com</text>
            </g>

            <text x="14" y="54" fill="#60a5fa" font-family="system-ui, sans-serif" font-size="13" font-weight="800">DS Tech &amp; Digital Marketing Agency — Official Portal</text>
            <text x="14" y="74" fill="#d6d3d1" font-family="system-ui, sans-serif" font-size="9.5" font-weight="400">RC 9550925 accredited agency delivering custom software development,</text>
            <text x="14" y="88" fill="#d6d3d1" font-family="system-ui, sans-serif" font-size="9.5" font-weight="400">high-converting ads management, and corporate CAC registration.</text>

            <!-- Star ratings -->
            <g transform="translate(14, 102)">
              <text x="0" y="12" fill="#fbbf24" font-size="12">★★★★★</text>
              <text x="60" y="12" fill="#a8a29e" font-family="system-ui, sans-serif" font-size="9">Rating: 4.9 · 150+ Reviews</text>
            </g>

            <!-- Sitelinks -->
            <rect x="14" y="126" width="90" height="22" rx="4" fill="#2d1c07" />
            <text x="22" y="140" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="9" font-weight="600">Core Services</text>

            <rect x="114" y="126" width="90" height="22" rx="4" fill="#2d1c07" />
            <text x="122" y="140" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="9" font-weight="600">Case Studies</text>
          </g>

          <!-- Right: Google Lighthouse Speed Score Circle -->
          <g transform="translate(375, 80)">
            <rect width="140" height="175" rx="10" fill="#1b1204" stroke="#d97706" stroke-width="1" />
            <text x="16" y="24" fill="#fef08a" font-family="system-ui, sans-serif" font-size="9" font-weight="800">LIGHTHOUSE SCORE</text>
            
            <circle cx="70" cy="85" r="42" fill="none" stroke="#291b05" stroke-width="6" />
            <circle cx="70" cy="85" r="42" fill="none" stroke="#10b981" stroke-width="6" stroke-dasharray="250" stroke-dashoffset="15" stroke-linecap="round" />
            <text x="54" y="92" fill="#10b981" font-family="system-ui, sans-serif" font-size="20" font-weight="900">99</text>
            
            <text x="24" y="145" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="700">● 100% Core Web Vitals</text>
            <text x="24" y="160" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="8">LCP 0.6s · FID 2ms</text>
          </g>
        </g>
      `;

    case 'svc_content_presentation':
      // Executive Pitch Deck Slide + Fountain Pen / Quill Nib + Typography Layout
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(140, 90)">
          <!-- Pitch Deck Slide Frame -->
          <rect width="520" height="280" rx="14" fill="#14040a" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Slide Header Bar -->
          <rect width="520" height="32" rx="14" fill="#240713" />
          <circle cx="20" cy="16" r="4" fill="#ef4444" />
          <circle cx="34" cy="16" r="4" fill="#f59e0b" />
          <circle cx="48" cy="16" r="4" fill="#10b981" />
          <text x="75" y="20" fill="#fecdd3" font-family="system-ui, sans-serif" font-size="10" font-weight="800">INVESTOR PITCH DECK — SERIES A BLUEPRINT</text>
          <text x="440" y="20" fill="#fb7185" font-family="monospace" font-size="9">SLIDE 04/18</text>

          <!-- Slide Content Wireframe -->
          <g transform="translate(30, 55)">
            <!-- Eyebrow & Headline -->
            <rect width="90" height="14" rx="3" fill="#be123c" />
            <text x="8" y="10.5" fill="#ffe4e6" font-family="system-ui, sans-serif" font-size="8" font-weight="800">STRATEGY 2026</text>
            
            <text x="0" y="44" fill="#ffffff" font-family="serif" font-size="20" font-weight="900">Accelerating Enterprise Growth</text>
            <rect y="58" width="220" height="8" rx="2" fill="#fda4af" opacity="0.6" />
            <rect y="72" width="180" height="8" rx="2" fill="#fda4af" opacity="0.4" />

            <!-- Key Metric Split Columns -->
            <g transform="translate(0, 95)">
              <rect width="105" height="70" rx="8" fill="#220612" stroke="#be123c" stroke-width="1" />
              <text x="12" y="26" fill="#fb7185" font-family="system-ui, sans-serif" font-size="9" font-weight="700">MARKET SIZE</text>
              <text x="12" y="52" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900">$4.2B</text>

              <rect x="115" width="105" height="70" rx="8" fill="#220612" stroke="#be123c" stroke-width="1" />
              <text x="127" y="26" fill="#fb7185" font-family="system-ui, sans-serif" font-size="9" font-weight="700">ANNUAL CAGR</text>
              <text x="127" y="52" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900">+38%</text>
            </g>
          </g>

          <!-- Right: Stylized Golden Pen & Creative Typography Board -->
          <g transform="translate(300, 55)">
            <rect width="190" height="175" rx="10" fill="#200612" stroke="#fb7185" stroke-opacity="0.5" stroke-width="1" />
            <text x="16" y="26" fill="#ffe4e6" font-family="system-ui, sans-serif" font-size="10" font-weight="800">COPYWRITING CADENCE</text>
            <path d="M 20 60 Q 70 40 120 70 T 170 50" fill="none" stroke="${p.accent}" stroke-width="2" />
            
            <!-- Fountain Pen Vector Nib -->
            <g transform="translate(125, 45) rotate(35)">
              <polygon points="0,0 12,30 6,38 0,34 -6,38 -12,30" fill="${p.accent}" stroke="#ffffff" stroke-width="1" />
              <circle cx="0" cy="20" r="2" fill="#14040a" />
              <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" stroke-width="1" />
            </g>

            <rect x="16" y="95" width="158" height="24" rx="4" fill="#38091e" />
            <text x="26" y="111" fill="#f43f5e" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700">High-Conversion Hooks &amp; CTA</text>

            <rect x="16" y="128" width="158" height="24" rx="4" fill="#38091e" />
            <text x="26" y="144" fill="#f43f5e" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700">Corporate Stakeholder Tone</text>
          </g>
        </g>
      `;

    case 'svc_ai_content':
      // Generative AI Prompt Stream + Sparkles + Neural Token Transformer
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.1" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#0b061e" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#180f38" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="10" font-weight="800">GENERATIVE AI MULTIMODAL STUDIO</text>
          
          <!-- AI Prompt Bar -->
          <g transform="translate(24, 50)">
            <rect width="492" height="44" rx="10" fill="#130b2c" stroke="#818cf8" stroke-width="1.5" />
            <text x="16" y="26" fill="#c7d2fe" font-family="monospace" font-size="11">Prompt: "Produce 4K ultra-sharp brand graphics &amp; viral copy"</text>
            <!-- Sparkle icon -->
            <g transform="translate(455, 14)">
              <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#f472b6" />
            </g>
          </g>

          <!-- Generated Multimodal Output Cards -->
          <!-- Card 1: AI Visual Graphics -->
          <g transform="translate(24, 110)">
            <rect width="150" height="135" rx="8" fill="#1a0f3d" stroke="#a5b4fc" stroke-width="1" />
            <rect x="10" y="10" width="130" height="80" rx="6" fill="#311c6d" />
            <circle cx="75" cy="50" r="22" fill="#c084fc" opacity="0.6" />
            <path d="M 50 65 Q 75 35 100 65" fill="none" stroke="#f472b6" stroke-width="2" />
            <text x="14" y="110" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="800">4K Synthesized Art</text>
            <text x="14" y="124" fill="#a5b4fc" font-family="monospace" font-size="7.5">Midjourney / Flux</text>
          </g>

          <!-- Card 2: AI Editorial Copy -->
          <g transform="translate(195, 110)">
            <rect width="160" height="135" rx="8" fill="#1a0f3d" stroke="#818cf8" stroke-width="1" />
            <rect x="12" y="14" width="100" height="12" rx="3" fill="#818cf8" />
            <rect x="12" y="34" width="136" height="8" rx="2" fill="#ffffff" />
            <rect x="12" y="48" width="120" height="8" rx="2" fill="#e0e7ff" opacity="0.6" />
            <rect x="12" y="62" width="130" height="8" rx="2" fill="#e0e7ff" opacity="0.6" />
            <rect x="12" y="76" width="90" height="8" rx="2" fill="#e0e7ff" opacity="0.4" />
            <rect x="12" y="98" width="80" height="20" rx="4" fill="#4338ca" />
            <text x="20" y="112" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8" font-weight="700">HUMAN QA: 100%</text>
          </g>

          <!-- Card 3: Neural Token Stream -->
          <g transform="translate(375, 110)">
            <rect width="140" height="135" rx="8" fill="#1a0f3d" stroke="#f472b6" stroke-width="1" />
            <text x="14" y="24" fill="#fbcfe8" font-family="system-ui, sans-serif" font-size="9" font-weight="800">TOKEN METRICS</text>
            <text x="14" y="46" fill="#ffffff" font-family="monospace" font-size="14" font-weight="900">128k <tspan font-size="9" fill="#34d399">CTX</tspan></text>
            <text x="14" y="68" fill="#c084fc" font-family="system-ui, sans-serif" font-size="8">Latency: 280ms</text>
            <line x1="14" y1="80" x2="126" y2="80" stroke="#4c1d95" stroke-width="1" />
            <text x="14" y="100" fill="#34d399" font-family="system-ui, sans-serif" font-size="8" font-weight="700">✓ Hallucination Checked</text>
            <text x="14" y="118" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="8">Enterprise Grounding</text>
          </g>
        </g>
      `;

    case 'svc_video_editing':
      // Multi-Track NLE Timeline Editor + Playhead Scrubber + 4K Monitor
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 85)">
          <rect width="540" height="290" rx="14" fill="#0d041a" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Top Editor Bar -->
          <rect width="540" height="32" rx="14" fill="#1a0833" />
          <circle cx="20" cy="16" r="4" fill="#ef4444" />
          <circle cx="34" cy="16" r="4" fill="#f59e0b" />
          <circle cx="48" cy="16" r="4" fill="#10b981" />
          <text x="75" y="20" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="10" font-weight="800">4K NLE TIMELINE EDITOR — 60FPS MASTER</text>
          <text x="440" y="20" fill="#c084fc" font-family="monospace" font-size="10">00:03:42:15</text>

          <!-- Top Section: 4K Preview Screen & Color Grade Scopes -->
          <g transform="translate(20, 44)">
            <!-- Video Preview Frame -->
            <rect width="260" height="120" rx="6" fill="#17072e" stroke="#7e22ce" stroke-width="1" />
            <rect x="8" y="8" width="244" height="104" rx="4" fill="#2d0a59" />
            <!-- Silhouette in monitor -->
            <circle cx="130" cy="50" r="18" fill="#a855f7" />
            <path d="M 90 95 C 105 70, 155 70, 170 95 Z" fill="#7e22ce" />
            <circle cx="22" cy="22" r="5" fill="#ef4444" />
            <text x="32" y="26" fill="#ffffff" font-family="monospace" font-size="8" font-weight="900">4K REC</text>

            <!-- Color Wheels / Scopes -->
            <g transform="translate(280, 0)">
              <rect width="220" height="120" rx="6" fill="#17072e" stroke="#7e22ce" stroke-width="1" />
              <text x="14" y="20" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="9" font-weight="800">COLOR GRADING &amp; LUT</text>
              <circle cx="50" cy="65" r="26" fill="none" stroke="#a855f7" stroke-width="2" />
              <circle cx="56" cy="60" r="4" fill="#f472b6" />
              
              <circle cx="140" cy="65" r="26" fill="none" stroke="#06b6d4" stroke-width="2" />
              <circle cx="136" cy="68" r="4" fill="#38bdf8" />
              <text x="24" y="108" fill="#94a3b8" font-family="monospace" font-size="8">Lift</text>
              <text x="120" y="108" fill="#94a3b8" font-family="monospace" font-size="8">Gamma</text>
            </g>
          </g>

          <!-- Bottom Section: Multi-Track Video & Audio Timeline -->
          <g transform="translate(20, 176)">
            <rect width="500" height="96" rx="6" fill="#140628" stroke="#581c87" stroke-width="1" />
            
            <!-- Video Track 1 -->
            <g transform="translate(10, 10)">
              <rect width="40" height="22" rx="3" fill="#2e1065" />
              <text x="8" y="15" fill="#c084fc" font-family="monospace" font-size="8" font-weight="700">V1</text>
              <rect x="48" width="130" height="22" rx="3" fill="#7c3aed" />
              <rect x="184" width="140" height="22" rx="3" fill="#6d28d9" />
              <rect x="330" width="145" height="22" rx="3" fill="#5b21b6" />
            </g>

            <!-- Video Track 2 (Overlay / B-roll) -->
            <g transform="translate(10, 36)">
              <rect width="40" height="22" rx="3" fill="#2e1065" />
              <text x="8" y="15" fill="#c084fc" font-family="monospace" font-size="8" font-weight="700">V2</text>
              <rect x="90" width="80" height="22" rx="3" fill="#ec4899" />
              <rect x="240" width="110" height="22" rx="3" fill="#d946ef" />
            </g>

            <!-- Audio Waveform Track A1 -->
            <g transform="translate(10, 62)">
              <rect width="40" height="22" rx="3" fill="#2e1065" />
              <text x="8" y="15" fill="#34d399" font-family="monospace" font-size="8" font-weight="700">A1</text>
              <rect x="48" width="427" height="22" rx="3" fill="#064e3b" />
              <!-- Audio waveform lines -->
              <path d="M 55 73 L 65 67 L 75 78 L 85 66 L 95 80 L 115 67 L 135 77 L 160 65 L 190 79 L 230 66 L 270 78 L 320 65 L 380 77 L 440 68" fill="none" stroke="#34d399" stroke-width="1.5" />
            </g>

            <!-- Red Playhead Scrubber Line -->
            <line x1="220" y1="0" x2="220" y2="96" stroke="#ef4444" stroke-width="2" />
            <polygon points="214,0 226,0 220,10" fill="#ef4444" />
          </g>
        </g>
      `;

    case 'svc_digital_marketing':
      // Omnichannel Growth Megaphone + Expanding Network + Funnel Lift
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#140702" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#241005" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#fed7aa" font-family="system-ui, sans-serif" font-size="10" font-weight="800">OMNICHANNEL REVENUE ENGINE &amp; CAMPAIGN BLUEPRINT</text>

          <!-- Left: High-Impact Megaphone / Broadcasting Hub -->
          <g transform="translate(30, 60)">
            <!-- Stylized Vector Megaphone -->
            <g transform="translate(40, 70) rotate(-15)">
              <polygon points="0,20 60,0 60,60 0,40" fill="#ea580c" stroke="#ffffff" stroke-width="1.5" />
              <rect x="-24" y="22" width="24" height="16" rx="4" fill="#c2410c" />
              <!-- Sound blast waves -->
              <path d="M 75 10 A 30 30 0 0 1 75 50" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round" />
              <path d="M 90 -2 A 50 50 0 0 1 90 62" fill="none" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" />
              <path d="M 105 -14 A 70 70 0 0 1 105 74" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" opacity="0.6" />
            </g>

            <rect x="0" y="145" width="180" height="45" rx="8" fill="#240f06" stroke="#ea580c" stroke-width="1" />
            <text x="14" y="165" fill="#fdba74" font-family="system-ui, sans-serif" font-size="9" font-weight="700">CAMPAIGN ROI SURGE</text>
            <text x="14" y="182" fill="#ffffff" font-family="system-ui, sans-serif" font-size="15" font-weight="900">+420% REVENUE</text>
          </g>

          <!-- Right: Omnichannel Growth Node Network -->
          <g transform="translate(240, 50)">
            <rect width="270" height="195" rx="10" fill="#1d0a03" stroke="#ea580c" stroke-opacity="0.4" stroke-width="1" />
            <text x="16" y="24" fill="#fed7aa" font-family="system-ui, sans-serif" font-size="10" font-weight="800">EXPONENTIAL REACH CHANNELS</text>

            <!-- Channel Nodes -->
            <!-- Search -->
            <g transform="translate(20, 44)">
              <rect width="105" height="42" rx="6" fill="#2d1306" stroke="#c2410c" />
              <text x="10" y="22" fill="#fdba74" font-family="system-ui, sans-serif" font-size="9" font-weight="800">🔍 Google Ads</text>
              <text x="10" y="34" fill="#a8a29e" font-family="monospace" font-size="8">Intent Leads</text>
            </g>

            <!-- Social -->
            <g transform="translate(140, 44)">
              <rect width="105" height="42" rx="6" fill="#2d1306" stroke="#c2410c" />
              <text x="10" y="22" fill="#fdba74" font-family="system-ui, sans-serif" font-size="9" font-weight="800">📱 Meta / TikTok</text>
              <text x="10" y="34" fill="#a8a29e" font-family="monospace" font-size="8">Viral Attention</text>
            </g>

            <!-- Email -->
            <g transform="translate(20, 96)">
              <rect width="105" height="42" rx="6" fill="#2d1306" stroke="#c2410c" />
              <text x="10" y="22" fill="#fdba74" font-family="system-ui, sans-serif" font-size="9" font-weight="800">✉️ Email CRM</text>
              <text x="10" y="34" fill="#a8a29e" font-family="monospace" font-size="8">Nurture Flow</text>
            </g>

            <!-- WhatsApp -->
            <g transform="translate(140, 96)">
              <rect width="105" height="42" rx="6" fill="#2d1306" stroke="#c2410c" />
              <text x="10" y="22" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="800">💬 WhatsApp</text>
              <text x="10" y="34" fill="#a8a29e" font-family="monospace" font-size="8">Instant Close</text>
            </g>

            <!-- Bottom Progress -->
            <g transform="translate(20, 154)">
              <rect width="225" height="24" rx="6" fill="#ea580c" />
              <text x="44" y="170" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="900">ACCELERATE CLIENT PIPELINE</text>
            </g>
          </g>
        </g>
      `;

    case 'svc_social_media_mgmt':
      // Smartphone Social Feed Cards + Heart Engagement Bubble + Content Calendar
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#040e1a" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#0a1e35" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="10" font-weight="800">SOCIAL CONTENT ENGINE &amp; COMMUNITY MODERATION</text>

          <!-- Left: Social Mobile Post Card -->
          <g transform="translate(30, 50)">
            <rect width="220" height="195" rx="12" fill="#081b2e" stroke="#0284c7" stroke-width="1.5" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.6))" />
            
            <!-- Creator Profile Header -->
            <g transform="translate(14, 14)">
              <circle cx="16" cy="16" r="16" fill="#38bdf8" />
              <text x="9" y="21" fill="#081b2e" font-family="system-ui, sans-serif" font-size="12" font-weight="900">DS</text>
              <text x="40" y="14" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="800">dstechagency</text>
              <circle cx="120" cy="11" r="4" fill="#0284c7" />
              <text x="40" y="28" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="8">Sponsored · Verified</text>
            </g>

            <!-- Post Graphic Thumbnail -->
            <rect x="14" y="56" width="192" height="78" rx="6" fill="#03446a" />
            <circle cx="110" cy="95" r="24" fill="#0284c7" opacity="0.6" />
            <polygon points="110,80 126,110 94,110" fill="#38bdf8" />

            <!-- Interaction Buttons: Heart, Comment, Share -->
            <g transform="translate(14, 144)">
              <!-- Red/Pink Heart -->
              <path d="M 12 6 C 12 2, 7 0, 4 3 C 1 0, -4 2, -4 6 C -4 11, 4 17, 4 17 C 4 17, 12 11, 12 6 Z" fill="#ef4444" transform="translate(4, 0)" />
              <text x="24" y="12" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="700">14.2k</text>

              <!-- Comment Bubble -->
              <rect x="70" y="2" width="16" height="12" rx="3" fill="#38bdf8" />
              <polygon points="74,14 78,14 74,18" fill="#38bdf8" />
              <text x="92" y="12" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="700">420</text>

              <!-- Share Plane -->
              <polygon points="135,2 150,8 142,16 138,10" fill="#7dd3fc" />
              <text x="156" y="12" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="700">1.8k</text>
            </g>

            <!-- Caption snippet -->
            <rect x="14" y="168" width="160" height="6" rx="2" fill="#64748b" />
            <rect x="14" y="178" width="100" height="6" rx="2" fill="#64748b" opacity="0.6" />
          </g>

          <!-- Right: 30-Day Publishing Calendar Matrix -->
          <g transform="translate(275, 50)">
            <rect width="235" height="195" rx="10" fill="#071829" stroke="#0284c7" stroke-opacity="0.4" stroke-width="1" />
            <text x="16" y="24" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="10" font-weight="800">CONTENT SCHEDULER</text>
            <text x="16" y="40" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="8">Daily Automated Deployment</text>

            <!-- Calendar Grid -->
            <g transform="translate(16, 52)">
              <!-- 4 columns of days -->
              <rect width="45" height="38" rx="6" fill="#03446a" />
              <text x="6" y="16" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="8" font-weight="700">MON</text>
              <circle cx="34" cy="26" r="4" fill="#10b981" />

              <rect x="52" width="45" height="38" rx="6" fill="#03446a" />
              <text x="58" y="16" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="8" font-weight="700">TUE</text>
              <circle cx="86" cy="26" r="4" fill="#10b981" />

              <rect x="104" width="45" height="38" rx="6" fill="#03446a" />
              <text x="110" y="16" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="8" font-weight="700">WED</text>
              <circle cx="138" cy="26" r="4" fill="#10b981" />

              <rect x="156" width="45" height="38" rx="6" fill="#03446a" />
              <text x="162" y="16" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="8" font-weight="700">THU</text>
              <circle cx="190" cy="26" r="4" fill="#10b981" />
            </g>

            <!-- Community Analytics Banner -->
            <g transform="translate(16, 110)">
              <rect width="201" height="60" rx="6" fill="#022a45" stroke="#0284c7" stroke-width="1" />
              <text x="12" y="24" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700">MONTHLY AUDIENCE EXPANSION</text>
              <text x="12" y="48" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="900">+38,400 <tspan fill="#34d399" font-size="10">Followers</tspan></text>
            </g>
          </g>
        </g>
      `;

    case 'svc_graphic_branding':
      // Vector Pen Tool + Bezier Curve Handles + Pantone Color Swatches
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#08071e" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#15123d" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="10" font-weight="800">CORPORATE IDENTITY &amp; VECTOR LOGO STUDIO</text>

          <!-- Left: Vector Pen Tool & Geometric Construction -->
          <g transform="translate(30, 50)">
            <rect width="250" height="195" rx="10" fill="#120e33" stroke="#6366f1" stroke-width="1" />
            
            <!-- Golden Ratio Geometry Construction -->
            <circle cx="125" cy="85" r="50" fill="none" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
            <circle cx="125" cy="85" r="30" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.8" />
            
            <!-- Curving Brand Logo Path -->
            <path d="M 70 115 C 70 55, 180 55, 180 115 S 70 175, 180 175" fill="none" stroke="${p.accent}" stroke-width="3.5" />
            
            <!-- Bezier Handles -->
            <line x1="70" y1="55" x2="180" y2="55" stroke="#a5b4fc" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="66" y="51" width="8" height="8" fill="#ffffff" stroke="#4f46e5" stroke-width="1" />
            <rect x="176" y="51" width="8" height="8" fill="#ffffff" stroke="#4f46e5" stroke-width="1" />
            
            <!-- Vector Pen Tool Icon -->
            <g transform="translate(145, 65) rotate(45)">
              <polygon points="0,0 12,32 6,40 0,36 -6,40 -12,32" fill="${p.accent}" stroke="#ffffff" stroke-width="1.5" />
              <circle cx="0" cy="22" r="3" fill="#08071e" />
              <line x1="0" y1="0" x2="0" y2="22" stroke="#ffffff" stroke-width="1" />
            </g>
          </g>

          <!-- Right: Pantone Swatches & Typography Brand Guide -->
          <g transform="translate(295, 50)">
            <rect width="215" height="195" rx="10" fill="#100b2e" stroke="#6366f1" stroke-opacity="0.4" stroke-width="1" />
            <text x="16" y="24" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="10" font-weight="800">BRAND GUIDELINES</text>

            <!-- Pantone Swatch Cards -->
            <g transform="translate(16, 40)">
              <!-- Swatch 1 -->
              <rect width="55" height="65" rx="4" fill="#4f46e5" />
              <rect y="42" width="55" height="23" rx="0 0 4 4" fill="#ffffff" />
              <text x="4" y="53" fill="#000000" font-family="monospace" font-size="7" font-weight="800">PANTONE</text>
              <text x="4" y="61" fill="#4f46e5" font-family="monospace" font-size="6.5" font-weight="700">#4F46E5</text>

              <!-- Swatch 2 -->
              <rect x="65" width="55" height="65" rx="4" fill="#f97316" />
              <rect x="65" y="42" width="55" height="23" rx="0 0 4 4" fill="#ffffff" />
              <text x="69" y="53" fill="#000000" font-family="monospace" font-size="7" font-weight="800">PANTONE</text>
              <text x="69" y="61" fill="#f97316" font-family="monospace" font-size="6.5" font-weight="700">#F97316</text>

              <!-- Swatch 3 -->
              <rect x="130" width="55" height="65" rx="4" fill="#10b981" />
              <rect x="130" y="42" width="55" height="23" rx="0 0 4 4" fill="#ffffff" />
              <text x="134" y="53" fill="#000000" font-family="monospace" font-size="7" font-weight="800">PANTONE</text>
              <text x="134" y="61" fill="#10b981" font-family="monospace" font-size="6.5" font-weight="700">#10B981</text>
            </g>

            <!-- Typography Specimens -->
            <g transform="translate(16, 122)">
              <text x="0" y="16" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="900">ABCDEF abcdef 123</text>
              <text x="0" y="32" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="8">Corporate Identity Deck &amp; Stationery</text>
              <rect y="42" width="185" height="18" rx="4" fill="${p.accent}" />
              <text x="24" y="55" fill="#08071e" font-family="system-ui, sans-serif" font-size="8.5" font-weight="900">EXPORT VECTOR ASSETS (.SVG, .AI)</text>
            </g>
          </g>
        </g>
      `;

    case 'svc_project_mgmt':
      // Agile Kanban Sprint Board + Gantt Milestones + Velocity Meter
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 90)">
          <rect width="540" height="280" rx="14" fill="#04160f" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#0b2e21" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#d1fae5" font-family="system-ui, sans-serif" font-size="10" font-weight="800">AGILE SPRINT DELIVERY &amp; SLA MILESTONE TRACKER</text>
          <text x="440" y="21" fill="#34d399" font-family="monospace" font-size="9">SPRINT 14 • 100%</text>

          <!-- 3 Kanban Columns: To Do, In Progress, Done -->
          <g transform="translate(20, 50)">
            <!-- Column 1: Backlog / To Do -->
            <g transform="translate(0, 0)">
              <rect width="155" height="200" rx="8" fill="#082218" stroke="#059669" stroke-opacity="0.3" stroke-width="1" />
              <text x="14" y="22" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="9" font-weight="800">BACKLOG (3)</text>
              
              <rect x="10" y="34" width="135" height="45" rx="6" fill="#0e3526" />
              <rect x="18" y="44" width="70" height="8" rx="2" fill="#6ee7b7" />
              <rect x="18" y="58" width="115" height="6" rx="2" fill="#a7f3d0" opacity="0.6" />

              <rect x="10" y="88" width="135" height="45" rx="6" fill="#0e3526" />
              <rect x="18" y="98" width="85" height="8" rx="2" fill="#6ee7b7" />
              <rect x="18" y="112" width="90" height="6" rx="2" fill="#a7f3d0" opacity="0.6" />
            </g>

            <!-- Column 2: In Progress -->
            <g transform="translate(170, 0)">
              <rect width="155" height="200" rx="8" fill="#082218" stroke="#10b981" stroke-opacity="0.6" stroke-width="1.5" />
              <text x="14" y="22" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="800">IN SPRINT (2)</text>
              
              <rect x="10" y="34" width="135" height="60" rx="6" fill="#0d3f2d" stroke="#10b981" stroke-width="1" />
              <rect x="18" y="44" width="60" height="12" rx="3" fill="#10b981" />
              <text x="24" y="53" fill="#04160f" font-family="system-ui, sans-serif" font-size="7.5" font-weight="900">HIGH PRIO</text>
              <rect x="18" y="62" width="115" height="6" rx="2" fill="#ffffff" />
              <rect x="18" y="74" width="80" height="6" rx="2" fill="#a7f3d0" opacity="0.7" />

              <rect x="10" y="104" width="135" height="45" rx="6" fill="#0e3526" />
              <rect x="18" y="114" width="95" height="8" rx="2" fill="#6ee7b7" />
              <rect x="18" y="128" width="80" height="6" rx="2" fill="#a7f3d0" opacity="0.6" />
            </g>

            <!-- Column 3: Done & Verified -->
            <g transform="translate(340, 0)">
              <rect width="155" height="200" rx="8" fill="#082218" stroke="#059669" stroke-opacity="0.3" stroke-width="1" />
              <text x="14" y="22" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="9" font-weight="800">DELIVERED (SLA ✓)</text>
              
              <rect x="10" y="34" width="135" height="45" rx="6" fill="#064e3b" />
              <circle cx="24" cy="56" r="8" fill="#10b981" />
              <text x="20" y="60" fill="#04160f" font-family="system-ui, sans-serif" font-size="10" font-weight="900">✓</text>
              <text x="40" y="54" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700">CAC Legal Clearance</text>
              <text x="40" y="66" fill="#a7f3d0" font-family="monospace" font-size="7.5">100% Completed</text>

              <rect x="10" y="88" width="135" height="45" rx="6" fill="#064e3b" />
              <circle cx="24" cy="110" r="8" fill="#10b981" />
              <text x="20" y="114" fill="#04160f" font-family="system-ui, sans-serif" font-size="10" font-weight="900">✓</text>
              <text x="40" y="108" fill="#ffffff" font-family="system-ui, sans-serif" font-size="8.5" font-weight="700">Payment Gateway API</text>
              <text x="40" y="120" fill="#a7f3d0" font-family="monospace" font-size="7.5">Live Production</text>
            </g>
          </g>
        </g>
      `;

    case 'svc_cybersecurity':
      // Fortified Cyber Shield + Padlock + Biometric Fingerprint + Zero-Trust Grid
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.1" />

        <g transform="translate(130, 85)">
          <rect width="540" height="290" rx="14" fill="#140303" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#2d0808" />
          <circle cx="20" cy="17" r="4" fill="#ef4444" />
          <circle cx="34" cy="17" r="4" fill="#f59e0b" />
          <circle cx="48" cy="17" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#fecaca" font-family="system-ui, sans-serif" font-size="10" font-weight="800">ZERO-TRUST SECURITY SHIELD &amp; PENETRATION AUDIT</text>
          <text x="440" y="21" fill="#f87171" font-family="monospace" font-size="9">AES-256 BIT</text>

          <!-- Left: Big Fortified Defense Shield with Encrypted Padlock -->
          <g transform="translate(40, 50)">
            <!-- Shield Outline -->
            <path d="M 100 15 L 175 40 L 175 110 C 175 160, 100 190, 100 190 C 100 190, 25 160, 25 110 L 25 40 Z" fill="#240707" stroke="${p.accent}" stroke-width="3" filter="drop-shadow(0 0 25px rgba(239,68,68,0.3))" />
            
            <!-- Padlock inside shield -->
            <g transform="translate(75, 75)">
              <!-- Shackle -->
              <path d="M 14 25 L 14 12 C 14 3, 36 3, 36 12 L 36 25" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" />
              <!-- Lock Body -->
              <rect y="22" width="50" height="42" rx="8" fill="#dc2626" />
              <circle cx="25" cy="40" r="5" fill="#140303" />
              <polygon points="23,43 27,43 28,52 22,52" fill="#140303" />
            </g>
          </g>

          <!-- Right: Biometric Fingerprint & Terminal Console -->
          <g transform="translate(260, 50)">
            <!-- Terminal Box -->
            <rect width="250" height="95" rx="8" fill="#1f0707" stroke="#b91c1c" stroke-width="1" />
            <rect width="250" height="24" rx="8" fill="#330b0b" />
            <text x="14" y="16" fill="#fca5a5" font-family="monospace" font-size="9" font-weight="700">audit_scanner.sh</text>
            <text x="14" y="42" fill="#22c55e" font-family="monospace" font-size="9.5">&gt; SSL / TLS: 100% VALID</text>
            <text x="14" y="60" fill="#22c55e" font-family="monospace" font-size="9.5">&gt; WAF FIREWALL: ACTIVE</text>
            <text x="14" y="78" fill="#f87171" font-family="monospace" font-size="9.5">&gt; ZERO THREATS DETECTED</text>

            <!-- Biometric Fingerprint Box -->
            <g transform="translate(0, 108)">
              <rect width="250" height="85" rx="8" fill="#1f0707" stroke="#b91c1c" stroke-width="1" />
              <!-- Fingerprint ridges -->
              <g transform="translate(20, 10)">
                <circle cx="32" cy="32" r="28" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.4" />
                <circle cx="32" cy="32" r="20" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="6 3" opacity="0.6" />
                <circle cx="32" cy="32" r="12" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="4 2" />
                <line x1="0" y1="32" x2="64" y2="32" stroke="#22c55e" stroke-width="2" />
              </g>

              <text x="96" y="36" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="900">IDENTITY VERIFIED</text>
              <text x="96" y="52" fill="#fca5a5" font-family="system-ui, sans-serif" font-size="8.5">Biometric Dual-Key MFA</text>
              <text x="96" y="68" fill="#22c55e" font-family="monospace" font-size="9" font-weight="700">ACCESS GRANTED</text>
            </g>
          </g>
        </g>
      `;

    case 'svc_event_videography':
      // Cinema Camera Rig on Tripod + Studio Spotlights + "● REC" Badge
      return `
        <circle cx="400" cy="220" r="160" fill="${p.accent}" opacity="0.08" />

        <g transform="translate(130, 85)">
          <rect width="540" height="290" rx="14" fill="#0d041a" stroke="${p.accent}" stroke-width="1.5" />
          
          <!-- Header Bar -->
          <rect width="540" height="34" rx="14" fill="#1b0833" />
          <circle cx="20" cy="16" r="4" fill="#ef4444" />
          <circle cx="34" cy="16" r="4" fill="#f59e0b" />
          <circle cx="48" cy="16" r="4" fill="#10b981" />
          <text x="75" y="21" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="10" font-weight="800">4K BROADCAST LIVE EVENT COVERAGE</text>
          
          <!-- Red REC Badge -->
          <g transform="translate(430, 9)">
            <rect width="80" height="18" rx="9" fill="#dc2626" />
            <circle cx="12" cy="9" r="4" fill="#ffffff" />
            <text x="22" y="13" fill="#ffffff" font-family="monospace" font-size="9" font-weight="900">LIVE REC</text>
          </g>

          <!-- Cinema Camera Rig Illustration -->
          <g transform="translate(60, 55)">
            <!-- Spotlight Beams -->
            <polygon points="120,40 380,-10 380,180" fill="${p.accent}" fill-opacity="0.06" />
            
            <!-- Camera Body -->
            <rect x="60" y="50" width="120" height="75" rx="8" fill="#1a0733" stroke="${p.accent}" stroke-width="2" />
            
            <!-- Top Handle -->
            <path d="M 80 50 L 80 30 L 150 30 L 150 50" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" />
            
            <!-- Shotgun Boom Mic mounted on top -->
            <rect x="65" y="18" width="80" height="8" rx="4" fill="#6b21a8" stroke="#a855f7" stroke-width="1" />
            
            <!-- Large Matte Box & Cinema Lens -->
            <polygon points="180,60 225,45 225,130 180,115" fill="#2d0a59" stroke="${p.accent}" stroke-width="1.5" />
            <!-- Lens Rings -->
            <circle cx="225" cy="87" r="32" fill="#0d041a" stroke="#a855f7" stroke-width="2" />
            <circle cx="225" cy="87" r="18" fill="#3b0764" stroke="#c084fc" stroke-width="1.5" />
            <circle cx="225" cy="87" r="8" fill="#f472b6" />

            <!-- Viewfinder / Side Monitor -->
            <rect x="25" y="58" width="35" height="30" rx="4" fill="#240747" stroke="#a855f7" stroke-width="1.5" />
            <rect x="28" y="62" width="29" height="22" rx="2" fill="#3b0764" />
            <text x="32" y="76" fill="#34d399" font-family="monospace" font-size="7">4K 60</text>

            <!-- Fluid Head & Heavy Duty Tripod Legs -->
            <circle cx="120" cy="130" r="10" fill="#4c1d95" />
            <line x1="120" y1="140" x2="50" y2="215" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" />
            <line x1="120" y1="140" x2="120" y2="215" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" />
            <line x1="120" y1="140" x2="190" y2="215" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" />
          </g>

          <!-- Right: Live Broadcast Specs Panel -->
          <g transform="translate(340, 60)">
            <rect width="170" height="195" rx="10" fill="#180730" stroke="#7e22ce" stroke-width="1" />
            <text x="16" y="26" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="10" font-weight="800">CAPTURE SPECS</text>

            <!-- Spec items -->
            <rect x="14" y="40" width="142" height="32" rx="6" fill="#260c4a" />
            <text x="24" y="54" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="8" font-weight="700">RESOLUTION</text>
            <text x="24" y="66" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="900">4K HDR Cinema RAW</text>

            <rect x="14" y="80" width="142" height="32" rx="6" fill="#260c4a" />
            <text x="24" y="94" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="8" font-weight="700">AUDIO MASTERS</text>
            <text x="24" y="106" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="900">32-Bit Float Audio</text>

            <rect x="14" y="120" width="142" height="32" rx="6" fill="#260c4a" />
            <text x="24" y="134" fill="#a78bfa" font-family="system-ui, sans-serif" font-size="8" font-weight="700">DELIVERY SPEED</text>
            <text x="24" y="146" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="900">48-Hr Highlight Reel</text>

            <rect x="14" y="162" width="142" height="22" rx="4" fill="${p.accent}" />
            <text x="36" y="176" fill="#0d041a" font-family="system-ui, sans-serif" font-size="8.5" font-weight="900">BOOK PRODUCTION</text>
          </g>
        </g>
      `;

    default:
      // Generic fallback (never identical for different categories)
      return `
        <circle cx="400" cy="220" r="140" fill="${p.accent}" opacity="0.1" />
        <g transform="translate(200, 120)">
          <rect width="400" height="220" rx="14" fill="#0a0f1d" stroke="${p.accent}" stroke-width="1.5" />
          <rect width="400" height="32" rx="14" fill="#1e293b" />
          <circle cx="18" cy="16" r="4" fill="#ef4444" />
          <circle cx="32" cy="16" r="4" fill="#f59e0b" />
          <circle cx="46" cy="16" r="4" fill="#10b981" />
          <text x="70" y="20" fill="${p.accent}" font-family="system-ui, sans-serif" font-size="10" font-weight="700">${p.label}</text>
          <circle cx="200" cy="130" r="40" fill="${p.accent}" opacity="0.2" />
          <polygon points="200,105 230,150 170,150" fill="${p.accent}" />
        </g>
      `;
  }
}

export function getServiceBespokeSvgUrl(serviceId: string, serviceTitle: string = 'DS Tech Service'): string {
  const p = PALETTES[serviceId] || {
    bg1: '#0a0f1d',
    bg2: '#1e293b',
    accent: '#f97316',
    accent2: '#fb923c',
    label: 'TECH SERVICE',
    badgeBg: '#ea580c'
  };

  const safeTitle = (serviceTitle || 'Enterprise Service').replace(/[<>&'"]/g, '');
  const illustration = getIllustrationForService(serviceId, p);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg_${serviceId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg1}" />
        <stop offset="60%" stop-color="${p.bg1}" />
        <stop offset="100%" stop-color="${p.bg2}" />
      </linearGradient>
      <pattern id="grid_${serviceId}" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${p.accent}" stroke-opacity="0.08" stroke-width="1"/>
      </pattern>
      <linearGradient id="glow_${serviceId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.15" />
        <stop offset="100%" stop-color="${p.accent}" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="bottomDark_${serviceId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
      </linearGradient>
    </defs>

    <!-- Base Canvas -->
    <rect width="100%" height="100%" fill="url(#bg_${serviceId})" />
    <rect width="100%" height="100%" fill="url(#grid_${serviceId})" />
    <rect width="100%" height="140" fill="url(#glow_${serviceId})" />

    <!-- Service-Specific Rich Vector Illustration -->
    ${illustration}

    <!-- Bottom Vignette Gradient -->
    <rect y="360" width="100%" height="140" fill="url(#bottomDark_${serviceId})" />

    <!-- Top Floating Eyebrow Badge -->
    <g transform="translate(36, 32)">
      <rect width="${Math.max(160, p.label.length * 8 + 24)}" height="26" rx="6" fill="${p.badgeBg}" fill-opacity="0.9" stroke="${p.accent}" stroke-width="1"/>
      <text x="${(Math.max(160, p.label.length * 8 + 24)) / 2}" y="17" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="900" text-anchor="middle" letter-spacing="1">${p.label}</text>
    </g>

    <!-- Bottom Identity Branding -->
    <g transform="translate(36, 435)">
      <text x="0" y="0" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="-0.5">${safeTitle}</text>
      <text x="0" y="24" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="600" letter-spacing="1">DS TECH &amp; DIGITAL MARKETING LTD • RC 9550925</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
