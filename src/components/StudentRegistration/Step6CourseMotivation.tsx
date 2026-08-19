import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, Compass, MessageSquare, Check, HelpCircle } from 'lucide-react';
import { HearingChannel } from '../../types/studentRegistration';

interface Step6CourseMotivationProps {
  reasonForStudy: string;
  futureGoals: string;
  howDidYouHear: HearingChannel;
  howDidYouHearOther?: string;
  onChange: (fields: Partial<Step6CourseMotivationProps>) => void;
}

const CHANNELS: HearingChannel[] = [
  'Social Media',
  'WhatsApp',
  'Radio/TV',
  'Friend/Family',
  'Google',
  'Email',
  'Other'
];

export const Step6CourseMotivation: React.FC<Step6CourseMotivationProps> = ({
  reasonForStudy,
  futureGoals,
  howDidYouHear,
  howDidYouHearOther,
  onChange
}) => {
  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const reasonWords = getWordCount(reasonForStudy);
  const goalsWords = getWordCount(futureGoals);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          Step 6 of 10
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Course Motivation & Learning Objectives
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Share your professional drive and career vision to help mentors tailor practical projects to your aspirations.
        </p>
      </div>

      {/* Why do you want to study this programme? */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Why do you want to study this programme? <span className="text-orange-400">*</span>
          </label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            reasonWords >= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {reasonWords} / 50 words recommended
          </span>
        </div>
        <div className="relative">
          <textarea
            rows={4}
            value={reasonForStudy}
            onChange={(e) => onChange({ reasonForStudy: e.target.value })}
            placeholder="Explain your passion, career gaps you wish to close, previous technical exposure, and what sparked your interest in this specific field..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 leading-relaxed resize-none font-medium"
          />
        </div>
        <p className="text-[10px] text-slate-500">A thorough explanation helps the admissions committee assign you to the optimal peer group and lead mentor.</p>
      </div>

      {/* What do you hope to achieve after completing? */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
            What do you hope to achieve after completing the programme? <span className="text-orange-400">*</span>
          </label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            goalsWords >= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {goalsWords} / 50 words recommended
          </span>
        </div>
        <div className="relative">
          <textarea
            rows={4}
            value={futureGoals}
            onChange={(e) => onChange({ futureGoals: e.target.value })}
            placeholder="Describe your target job roles, freelancing goals, startup ideas, portfolio objectives, or salary elevation targets..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 leading-relaxed resize-none font-medium"
          />
        </div>
      </div>

      {/* How did you hear about DS Tech Academy? */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-950/60 border border-slate-800">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
          How did you hear about DS Tech Academy? <span className="text-orange-400">*</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CHANNELS.map((ch) => {
            const isSelected = howDidYouHear === ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => onChange({ howDidYouHear: ch })}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{ch}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Other text field if selected */}
        {howDidYouHear === 'Other' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-2"
          >
            <input
              type="text"
              value={howDidYouHearOther || ''}
              onChange={(e) => onChange({ howDidYouHearOther: e.target.value })}
              placeholder="Please specify where you heard about us..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
