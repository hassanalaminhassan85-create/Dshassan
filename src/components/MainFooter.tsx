import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Phone, MapPin, ArrowUp, Building2 } from 'lucide-react';
import { Logo } from './Logo';
import { 
  FacebookIcon, 
  InstagramIcon, 
  XIcon, 
  LinkedInIcon, 
  YouTubeIcon, 
  TikTokIcon 
} from './SocialIcons';

interface MainFooterProps {
  onNavigate?: (path: string) => void;
  publishedCac?: {
    registration_number?: string;
    company_status?: string;
    updated_at?: string;
  } | null;
}

export const MainFooter: React.FC<MainFooterProps> = ({ onNavigate, publishedCac }) => {
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      try {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('popstate'));
      } catch (e) {
        window.location.href = path;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rcNumber = publishedCac?.registration_number || '1845921';
  const companyStatus = publishedCac?.company_status || 'Incorporated & Active';

  const socialLinks = [
    { 
      icon: FacebookIcon, 
      href: 'https://www.facebook.com/share/1DUwq656cM/', 
      label: 'Facebook', 
      hoverClass: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:text-[#1877F2]' 
    },
    { 
      icon: InstagramIcon, 
      href: 'https://www.instagram.com/dstechltd3?igsh=Y2xmb3BhODk4eGF3&utm_source=qr', 
      label: 'Instagram', 
      hoverClass: 'hover:bg-pink-500/10 hover:border-pink-500/40 hover:text-pink-400' 
    },
    { 
      icon: TikTokIcon, 
      href: 'https://www.tiktok.com/@dstechanddigitalltd?_r=1&_t=ZS-98f9P59z155', 
      label: 'TikTok', 
      hoverClass: 'hover:bg-slate-800 hover:border-slate-600 hover:text-white' 
    },
    { 
      icon: XIcon, 
      href: 'https://x.com/DigitalDs18246', 
      label: 'Twitter / X', 
      hoverClass: 'hover:bg-slate-800 hover:border-slate-600 hover:text-white' 
    },
    { 
      icon: LinkedInIcon, 
      href: 'https://www.linkedin.com/company/dstechanddigitaltd', 
      label: 'LinkedIn', 
      hoverClass: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 hover:text-[#0A66C2]' 
    },
    { 
      icon: YouTubeIcon, 
      href: 'https://www.youtube.com/@DSTECHANDDIGITALMARKETINGLTD', 
      label: 'YouTube', 
      hoverClass: 'hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500' 
    },
  ];

  return (
    <footer id="main-website-footer" className="no-print bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-auto pt-12 sm:pt-16 pb-8 sm:pb-12 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans antialiased text-xs">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/[0.03] rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/[0.03] rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-slate-800/70">
          
          {/* Column 1: Company Profile & Verification */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <div className="inline-block cursor-pointer" onClick={() => handleNavigate('/')}>
              <Logo size="md" showText={true} variant="light" className="transition-opacity duration-200 hover:opacity-90" />
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              Amplifying digital footprints and building next-generation software solutions across West Africa and beyond. Combining high-performance marketing, brand storytelling, and modern engineering.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                <ShieldCheck size={13} className="text-orange-400 shrink-0" />
                <span>CAC RC: <strong className="text-slate-100 font-semibold">{rcNumber}</strong></span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{companyStatus}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Page Experience */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              Page Experience
            </h4>
            <ul className="space-y-2 text-xs font-normal text-slate-400">
              <li>
                <button 
                  onClick={() => handleNavigate('/')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Home Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/portfolio')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Case Studies & Portfolio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/recognition')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Accreditations & Certificates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/about')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Company Overview & Team
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/blog')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  The Knowledge Node (Blog)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions & Academy */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              Solutions & Academy
            </h4>
            <ul className="space-y-2 text-xs font-normal text-slate-400">
              <li>
                <button 
                  onClick={() => handleNavigate('/services')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Enterprise Software Systems
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/services')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Digital Ad Bidding & Campaigns
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/academy-overview')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  DS Tech Vocational Academy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/careers')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Accreditation & Staff Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate('/clients')} 
                  className="hover:text-slate-100 transition-colors duration-150 cursor-pointer text-left py-0.5"
                >
                  Client Portal & Projects
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Desk */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              Direct Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Area 1, Garki, Abuja, FCT, Nigeria</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Adamawa Regional Hub, Yola, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <a href="mailto:support@dstech.ng" className="hover:text-slate-200 transition-colors">
                  support@dstech.ng
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <a href="tel:+2348123456789" className="hover:text-slate-200 transition-colors">
                  +234 812 345 6789
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect & Social */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              Connect
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Follow our official media channels for updates, announcements, and tech insights.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {socialLinks.map((social, idx) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    className={`w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center transition-all duration-200 ${social.hoverClass}`}
                  >
                    <IconComponent size={15} />
                  </a>
                );
              })}
            </div>

            <div className="pt-2">
              <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-slate-500">
                SCUML & FIRS Compliant
              </span>
            </div>
          </div>

        </div>

        {/* Sub-Footer Copyright & Actions */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} DS Tech & Digital Marketing Agency Ltd.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>All Rights Reserved. Registered in Garki, Abuja, Nigeria.</span>
          </div>

          <button 
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all group cursor-pointer"
            title="Scroll back to top"
          >
            <span>Back to Top</span>
            <ArrowUp size={13} className="text-orange-400 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

      </div>
    </footer>
  );
};
