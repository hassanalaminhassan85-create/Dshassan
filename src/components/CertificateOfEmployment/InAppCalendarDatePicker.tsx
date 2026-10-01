import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Sparkles, X, Check } from 'lucide-react';

interface InAppCalendarDatePickerProps {
  label: string;
  value: string;
  onChange: (formattedDate: string, isoDate: string) => void;
  required?: boolean;
  helperText?: string;
  className?: string;
  placeholder?: string;
  defaultToToday?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Ordinal Day suffix: 1st, 2nd, 3rd, 4th, 21st, 22nd, 31st
export function getOrdinalDay(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

// Convert Date object to legal certificate string: "15th January 2024"
export function formatToCertificateDate(date: Date): string {
  const day = getOrdinalDay(date.getDate());
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Parse string like "15th January 2024" or "2024-01-15" or standard date into Date object
export function parseAnyDate(dateStr: string): Date {
  if (!dateStr || !dateStr.trim()) return new Date();

  // Try standard Date parsing
  const cleanStr = dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1');
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Fallback to today
  return new Date();
}

export const InAppCalendarDatePicker: React.FC<InAppCalendarDatePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  helperText,
  className = '',
  placeholder = 'Select date...',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Active view date in calendar (Month & Year)
  const initialDate = parseAnyDate(value);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // Sync view when value prop changes externally
  useEffect(() => {
    if (value) {
      const d = parseAnyDate(value);
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Day Selection
  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    const formatted = formatToCertificateDate(newDate);
    const iso = newDate.toISOString().split('T')[0];
    onChange(formatted, iso);
    setIsOpen(false);
  };

  // Quick Preset Selection (Zero manual typing)
  const applyPreset = (offsetYears: number = 0, offsetMonths: number = 0, specificDate?: Date) => {
    const target = specificDate || new Date();
    if (offsetYears !== 0) {
      target.setFullYear(target.getFullYear() + offsetYears);
    }
    if (offsetMonths !== 0) {
      target.setMonth(target.getMonth() + offsetMonths);
    }
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    const formatted = formatToCertificateDate(target);
    const iso = target.toISOString().split('T')[0];
    onChange(formatted, iso);
    setIsOpen(false);
  };

  // Generate Calendar Days Grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  // Year Range generator: 2016 to 2032
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 18 }, (_, i) => currentYear - 12 + i);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      
      {/* Label & Calendar Action Badge */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <CalendarIcon size={12} className="text-orange-500" />
          <span>{label}</span>
          {required && <span className="text-orange-500 font-black">*</span>}
        </label>
      </div>

      {/* Clickable Display Input Bar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs ${
            isOpen
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-slate-800'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <CalendarIcon size={14} />
            </div>
            <span className={`text-xs font-semibold truncate ${value ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}`}>
              {value || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              Pick Date
            </span>
          </div>
        </button>

        {/* Hidden Native Input for quick browser datepickers if desired */}
        <input
          ref={hiddenDateInputRef}
          type="date"
          className="sr-only"
          onChange={(e) => {
            if (e.target.value) {
              const d = new Date(e.target.value);
              const formatted = formatToCertificateDate(d);
              onChange(formatted, e.target.value);
            }
          }}
        />
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      )}

      {/* ========================================================= */}
      {/* IN-APP CALENDAR POPOVER                                    */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-full sm:w-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Quick Presets Row for Super-Fast 1-Click Setup */}
          <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => applyPreset(0, 0)}
              className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-[10px] font-bold cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyPreset(0, -6)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium cursor-pointer transition-colors"
            >
              6 Mos Ago
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-1, 0)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium cursor-pointer transition-colors"
            >
              1 Yr Ago
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-2, 0)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium cursor-pointer transition-colors"
            >
              2 Yrs Ago
            </button>
          </div>

          {/* Month & Year Selectors Header */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Dropdown */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-slate-400">
            {WEEKDAY_NAMES.map((w) => (
              <span key={w} className="py-0.5">{w}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month trailing days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="py-1.5 text-[11px] text-slate-300 dark:text-slate-700 select-none"
                >
                  {dayNum}
                </span>
              );
            })}

            {/* Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#000E32] text-white font-black shadow-sm ring-2 ring-orange-500 scale-105'
                      : today
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold border border-orange-300 dark:border-orange-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Bar with native datepicker fallback link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={() => {
                if (hiddenDateInputRef.current) {
                  hiddenDateInputRef.current.showPicker?.();
                }
              }}
              className="text-slate-500 hover:text-orange-500 underline font-medium cursor-pointer"
            >
              Native Wheel
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
