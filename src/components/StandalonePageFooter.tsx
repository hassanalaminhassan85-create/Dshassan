import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';

export const StandalonePageFooter: React.FC = () => {
  const navigate = (path: string) => {
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new Event('popstate'));
    } catch (e) {
      window.location.href = path;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto pt-16 pb-12 px-6 md:px-12 relative overflow-hidden font-sans">
      {/* Decorative ambient background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Top Grid: Branding, Solutions, Navigation & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <Logo size="md" variant="light" showText={true} />
            <p className="text-slate-400 text-xs leading-relaxed font-light">
              Architecting digital authorities, high-conversion ad bidding engines, micro-animated software systems, and fast corporate compliance setups across West Africa.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-orange-400" />
                <span>CAC INCORPORATED RC: 1845921</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase font-mono tracking-widest border-l-2 border-orange-500 pl-2.5">
              Page Experience
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-orange-400 transition-colors">
                  Home Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/portfolio')} className="hover:text-orange-400 transition-colors">
                  Case Studies & Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/recognition')} className="hover:text-orange-400 transition-colors">
                  Accreditations & Certificates
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-orange-400 transition-colors">
                  Company Overview & Team
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/blog')} className="hover:text-orange-400 transition-colors">
                  The Knowledge Node (Blog)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions & Academy */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase font-mono tracking-widest border-l-2 border-orange-500 pl-2.5">
              Solutions & Academy
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-orange-400 transition-colors">
                  Enterprise Software Systems
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-orange-400 transition-colors">
                  Digital Ad Bidding & Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/academy-overview')} className="hover:text-orange-400 transition-colors">
                  DS Tech Vocational Academy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/careers')} className="hover:text-orange-400 transition-colors">
                  Accreditation & Staff Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/clients')} className="hover:text-orange-400 transition-colors">
                  Client Portal & Projects
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-black uppercase font-mono tracking-widest border-l-2 border-orange-500 pl-2.5">
              Direct Desk
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span>Area 1, Garki, Abuja, FCT, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-orange-400 shrink-0" />
                <span>support@dstech.ng</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-orange-400 shrink-0" />
                <span>+234 812 345 6789</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Scroll to top */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DS Tech & Digital Marketing Agency. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">SCUML & FIRS Compliant</span>
            <button 
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              title="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp size={12} className="text-orange-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
