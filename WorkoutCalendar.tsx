import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, isToday, startOfWeek, endOfWeek, isSameMonth, subMonths, addMonths, parseISO, isAfter, startOfDay } from 'date-fns';
import { enUS, es, fr, ru, pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Moon, Calendar as CalendarIcon } from 'lucide-react';
import { WorkoutSession, Theme, Language } from './types';
import { translations } from './translations';

interface Props {
  history: WorkoutSession[];
  onDayClick: (date: Date) => void;
  theme: Theme;
  language: Language;
}

const WorkoutCalendar: React.FC<Props> = ({ history, onDayClick, theme, language }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const t = translations[language];
  const isDark = theme === 'dark';

  const locales = { en: enUS, es: es, fr: fr, ru: ru, pl: pl };
  const currentLocale = locales[language] || enUS;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const calendarStart = startOfWeek(monthStart, { locale: currentLocale });
  const calendarEnd = endOfWeek(monthEnd, { locale: currentLocale });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = [];
  const startOfViewWeek = startOfWeek(new Date(), { locale: currentLocale });
  for (let i = 0; i < 7; i++) {
    weekDays.push(format(addDays(startOfViewWeek, i), 'EEEEE', { locale: currentLocale }));
  }

  const getStatus = (date: Date) => {
    const workout = history.find(h => isSameDay(parseISO(h.date), date));
    if (workout) return { type: 'WORKOUT' as const, data: workout };
    const restCheck = history.some(h => isSameDay(addDays(parseISO(h.date), 1), date));
    if (restCheck) return { type: 'REST' as const };
    return { type: 'NONE' as const };
  };

  const handleGoToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-xl transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          {format(currentMonth, 'MMMM yyyy', { locale: currentLocale })}
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleGoToToday}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border
              ${isDark ? 'bg-slate-700 border-slate-600 text-indigo-400 hover:text-white hover:bg-indigo-600/20' : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'}
            `}
          >
            {t.today}
          </button>

          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 text-center py-2 border-b ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
        {weekDays.map((d, i) => (
          <span key={i} className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const status = getStatus(day);
          const isSelectedMonth = isSameMonth(day, monthStart);
          const today = isToday(day);

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              className={`
                relative h-16 border-b border-r p-1 flex flex-col items-center justify-center transition-all group cursor-pointer
                ${isDark ? 'border-slate-700' : 'border-slate-100'}
                ${!isSelectedMonth ? (isDark ? 'bg-slate-900/20 text-slate-600' : 'bg-slate-50 text-slate-300') : (isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50')}
                ${today ? (isDark ? 'bg-indigo-900/20 ring-1 ring-inset ring-indigo-500/50' : 'bg-indigo-50 ring-1 ring-inset ring-indigo-200') : ''}
              `}
            >
              <span className={`text-xs font-medium mb-1 ${today ? 'text-indigo-500 font-bold underline decoration-2 underline-offset-4' : ''}`}>
                {format(day, 'd')}
              </span>
              
              <div className="flex flex-col items-center gap-0.5">
                {status.type === 'WORKOUT' && (
                  <>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className={`text-[8px] font-bold mono tracking-tighter ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {status.data?.blockId}
                    </span>
                  </>
                )}
                {status.type === 'REST' && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                    <Moon className={`w-3.5 h-3.5 text-amber-500 ${isDark ? 'fill-amber-500/20' : 'fill-amber-500/10'}`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className={`p-4 flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest font-bold ${isDark ? 'bg-slate-900/60 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> {t.training}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> {t.restDay}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> {t.today}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
