import React from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Award, 
  Globe, 
  Sliders, 
  Check, 
  Linkedin, 
  Twitter, 
  Github, 
  Sparkles 
} from 'lucide-react';
import { 
  TutorApplication, 
  PreviousTeachingExperience 
} from '../../types/tutorRegistration';

interface Step5TutorExperienceProps {
  data: TutorApplication;
  onChange: (updated: Partial<TutorApplication>) => void;
}

const EXPERIENCE_LEVELS = [
  '1 - 2 Years',
  '3 - 5 Years',
  '6 - 10 Years',
  '10+ Years (Senior / Veteran)'
];

export const Step5TutorExperience: React.FC<Step5TutorExperienceProps> = ({
  data,
  onChange
}) => {
  const experiences = data.previousExperiences || [];
  const skills = data.practicalSkills || ['', '', '', '', ''];

  const handleAddExperience = () => {
    const newEntry: PreviousTeachingExperience = {
      institution: '',
      role: '',
      duration: ''
    };
    onChange({ previousExperiences: [...experiences, newEntry] });
  };

  const handleUpdateExperience = (index: number, field: keyof PreviousTeachingExperience, value: string) => {
    const updated = [...experiences];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange({ previousExperiences: updated });
  };

  const handleRemoveExperience = (index: number) => {
    onChange({ previousExperiences: experiences.filter((_, i) => i !== index) });
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills: [string, string, string, string, string] = [
      skills[0] || '',
      skills[1] || '',
      skills[2] || '',
      skills[3] || '',
      skills[4] || ''
    ];
    updatedSkills[index] = value;
    onChange({ practicalSkills: updatedSkills });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
          <Briefcase className="w-4 h-4" />
          <span>Step 5 of 9 • Teaching & Industry Experience</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mt-1">Teaching Track Record & Hands-on Skills</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Document your industry seniority, prior training engagements, 5 key technical proficiencies, and verified online profiles.
        </p>
      </div>

      {/* Years of Industry Experience */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>Total Years of Industry Practice <span className="text-orange-400">*</span></span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPERIENCE_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange({ yearsOfExperience: lvl })}
              className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all text-center ${
                data.yearsOfExperience === lvl
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-orange-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Previous Teaching / Training Experience Entries */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Prior Teaching / Facilitation / Training Experience</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Add bootcamps, universities, corporate workshops, or online cohorts you have previously taught.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddExperience}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No prior institutional teaching entries added yet. Click <strong className="text-orange-400">"Add Experience"</strong> to list your past training roles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-mono font-bold text-orange-400">
                    Teaching Entry #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Institution / Organization
                    </label>
                    <input
                      type="text"
                      value={exp.institution}
                      onChange={(e) => handleUpdateExperience(idx, 'institution', e.target.value)}
                      placeholder="e.g. Decagon / NIIT / Tech Hub"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Role / Position Taught
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                      placeholder="e.g. Lead Python Tutor"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Duration / Period
                    </label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                      placeholder="e.g. Jan 2023 - Dec 2024 (2 yrs)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Practical Relevant Skills (Exactly 5 Fields from PDF 1) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>5 Key Practical Technical Skills <span className="text-orange-400">*</span></span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            List your 5 core hands-on tools, frameworks, languages, or practical skills relevant to your chosen courses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((num, i) => (
            <div key={num} className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold text-orange-400">
                Skill #{num}
              </label>
              <input
                type="text"
                required
                value={skills[i] || ''}
                onChange={(e) => handleSkillChange(i, e.target.value)}
                placeholder={
                  i === 0 ? 'e.g. PyTorch & AI' :
                  i === 1 ? 'e.g. Docker & CI/CD' :
                  i === 2 ? 'e.g. React & Next.js' :
                  i === 3 ? 'e.g. Data Analytics' :
                  'e.g. Pen Testing'
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social Media & Professional Portfolio Handles (2 Links) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <span>Professional Social Media & Web Profiles (2 Links) <span className="text-orange-400">*</span></span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Provide valid profile links for your LinkedIn, GitHub, Twitter/X, YouTube, or Personal Website.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>Social Media Profile 1 (e.g. LinkedIn / GitHub) <span className="text-orange-400">*</span></span>
            </label>
            <input
              type="url"
              required
              value={data.socialMediaHandle1}
              onChange={(e) => onChange({ socialMediaHandle1: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Twitter className="w-4 h-4 text-sky-400" />
              <span>Social Media Profile 2 (e.g. Twitter/X / Portfolio) <span className="text-orange-400">*</span></span>
            </label>
            <input
              type="url"
              required
              value={data.socialMediaHandle2}
              onChange={(e) => onChange({ socialMediaHandle2: e.target.value })}
              placeholder="https://x.com/username or https://myportfolio.dev"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
