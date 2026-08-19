import React from 'react';
import { 
  HeartHandshake, 
  HelpCircle, 
  Sparkles, 
  Lightbulb, 
  Building2, 
  Compass, 
  Check 
} from 'lucide-react';
import { TutorApplication } from '../../types/tutorRegistration';

interface Step6TutorMotivationProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const COMMON_REFERRALS = [
  'Social Media (LinkedIn/X/IG)',
  'WhatsApp Channel / Community',
  'Friend / Colleague Recommendation',
  'DS Tech Staff / Management',
  'Google / Online Search',
  'Radio / TV / Billboard',
  'Other Tech Event / Seminar'
];

export const Step6TutorMotivation: React.FC<Step6TutorMotivationProps> = ({
  data,
  onChange
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <HeartHandshake className="w-4 h-4" />
          <span>Step 6 of 9 • Instructor Motivation & Institutional Fit</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Motivation & Teaching Philosophy</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Share your instructional philosophy, why you are drawn to teaching these courses, and why DS Tech Academy is your academy of choice.
        </p>
      </div>

      {/* Question 1: Why select position */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span>Why do you select this/these skilled-based instructor position(s)? <span className="text-orange-400">*</span></span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {data.whySelectPosition?.length || 0} characters
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Describe your passion for this domain, real-world case studies you can impart, and your approach to hands-on, project-based mentorship.
        </p>

        <textarea
          rows={5}
          required
          value={data.whySelectPosition}
          onChange={(e) => onChange({ whySelectPosition: e.target.value })}
          placeholder="Detail your instructional competence, real-world industry applications, and how you will mentor our students to industry readiness..."
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium leading-relaxed"
        />
      </div>

      {/* Question 2: Why Choose DS Tech Academy */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>Why do you choose DS Tech Academy? <span className="text-orange-400">*</span></span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {data.whyChooseDsTechAcademy?.length || 0} characters
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          What excites you about DS Tech Academy's vision, faculty community, student diversity, or corporate tech partnerships?
        </p>

        <textarea
          rows={5}
          required
          value={data.whyChooseDsTechAcademy}
          onChange={(e) => onChange({ whyChooseDsTechAcademy: e.target.value })}
          placeholder="Explain what drew you to DSTA's Pan-African mission, digital hub infrastructure, and institutional reputation..."
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium leading-relaxed"
        />
      </div>

      {/* Question 3: How did you hear */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-orange-400" />
          <span>How did you hear about DS Tech Academy? <span className="text-orange-400">*</span></span>
        </label>

        <div className="flex flex-wrap gap-2">
          {COMMON_REFERRALS.map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() => onChange({ howDidYouHear: channel })}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                data.howDidYouHear === channel
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            required
            value={data.howDidYouHear}
            onChange={(e) => onChange({ howDidYouHear: e.target.value })}
            placeholder="Or type specific source, person, or platform..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
