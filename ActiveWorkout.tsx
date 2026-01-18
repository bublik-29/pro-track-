
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ShieldCheck, Dumbbell, AlertTriangle } from 'lucide-react';
import { WorkoutBlock, ExerciseData, WorkoutSession, Theme, Language } from '../types';
import { FINISH_HOLD_TIME } from '../constants';
import { translations } from '../translations';

interface Props {
  block: WorkoutBlock;
  date: Date;
  draft: ExerciseData[];
  onFinish: (session: WorkoutSession) => void;
  theme: Theme;
  language: Language;
}

const ActiveWorkout: React.FC<Props> = ({ block, date, draft, onFinish, theme, language }) => {
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const t = translations[language];
  const isDark = theme === 'dark';

  useEffect(() => {
    let animationFrame: number;
    const checkHold = () => {
      if (holdStartTime) {
        const now = Date.now();
        const diff = now - holdStartTime;
        const progress = Math.min((diff / FINISH_HOLD_TIME) * 100, 100);
        setHoldProgress(progress);
        if (progress >= 100) handleComplete();
        else animationFrame = requestAnimationFrame(checkHold);
      } else {
        setHoldProgress(0);
      }
    };
    if (holdStartTime) animationFrame = requestAnimationFrame(checkHold);
    return () => cancelAnimationFrame(animationFrame);
  }, [holdStartTime]);

  const handleHoldStart = () => setHoldStartTime(Date.now());
  const handleHoldEnd = () => setHoldStartTime(null);

  const handleComplete = () => {
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      date: format(date, 'yyyy-MM-dd'),
      blockId: block.id,
      exercises: draft,
      completedAt: new Date().toISOString(),
    };
    onFinish(session);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className={`text-center py-10 rounded-3xl border backdrop-blur-sm transition-colors ${isDark ? 'bg-slate-800/20 border-slate-700/50' : 'bg-indigo-50 border-indigo-200 shadow-sm'}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t.block} {block.id}
        </div>
        <h2 className={`mt-4 text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          {t[block.name as keyof typeof t] || block.name}
        </h2>
      </div>

      <div className="space-y-4">
         <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2">{t.sessionGoals}</h3>
         {draft.map((ex, i) => (
           <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <Dumbbell className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {t[ex.name as keyof typeof t] || ex.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{t.targetReps}</div>
                </div>
              </div>
              <div className="flex gap-1">
                 {ex.sets.map((s, si) => (
                    <div key={si} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors ${s.reps > 0 ? 'bg-indigo-500 border-indigo-400 text-white shadow-sm shadow-indigo-200' : (isDark ? 'bg-slate-900 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-300')}`}>
                      {si + 1}
                    </div>
                 ))}
              </div>
           </div>
         ))}
      </div>

      <div className={`flex items-center gap-2 text-xs justify-center font-medium ${isDark ? 'text-amber-500/80' : 'text-amber-600'}`}>
        <AlertTriangle className="w-4 h-4" />
        {t.safetyInfo}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 max-w-2xl mx-auto p-4 backdrop-blur-md z-30 transition-colors ${isDark ? 'bg-slate-900/80' : 'bg-white/80 border-t border-slate-100'}`}>
        <button
          onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}
          className={`relative w-full h-20 rounded-2xl overflow-hidden group select-none transition-all active:scale-[0.98] ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
        >
          <div className="absolute inset-y-0 left-0 bg-emerald-600/80 transition-all duration-75" style={{ width: `${holdProgress}%` }} />
          <div className="absolute inset-0 flex items-center justify-center gap-3">
             <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} ${holdProgress > 0 ? 'scale-90 border-emerald-500 shadow-lg' : ''}`}>
                <ShieldCheck className={`w-6 h-6 ${holdProgress > 50 ? 'text-emerald-400' : (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
             </div>
             <div className="text-left">
                <div className={`font-black uppercase tracking-wider leading-none ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.finishSession}</div>
                <div className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {holdProgress > 0 ? `${t.securingData} ${Math.round(holdProgress)}%` : t.safetyHoldRequired}
                </div>
             </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
