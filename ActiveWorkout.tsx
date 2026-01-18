import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ShieldCheck, Dumbbell, Target, Timer, X } from 'lucide-react';
import { WorkoutBlock, ExerciseData, WorkoutSession, Theme, Language } from './types';
import { FINISH_HOLD_TIME } from './constants';
import { translations } from './translations';

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
  
  // Set completion logic
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [setHoldId, setSetHoldId] = useState<string | null>(null);
  const [setExerciseHoldProgress, setSetExerciseHoldProgress] = useState(0);

  // Timer logic
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const t = translations[language];
  const isDark = theme === 'dark';

  // Session Finish Hold (3s)
  useEffect(() => {
    let animationFrame: number;
    const checkHold = () => {
      if (holdStartTime) {
        const now = Date.now();
        const diff = now - holdStartTime;
        const progress = Math.min((diff / FINISH_HOLD_TIME) * 100, 100);
        setHoldProgress(progress);
        if (progress >= 100) {
          handleComplete();
        } else {
          animationFrame = requestAnimationFrame(checkHold);
        }
      } else {
        setHoldProgress(0);
      }
    };
    if (holdStartTime) animationFrame = requestAnimationFrame(checkHold);
    return () => cancelAnimationFrame(animationFrame);
  }, [holdStartTime]);

  // Set Completion Hold (3s)
  useEffect(() => {
    let animationFrame: number;
    const checkSetHold = () => {
      if (setHoldId) {
        const parts = setHoldId.split('-');
        const start = parseInt(parts[2]);
        const now = Date.now();
        const diff = now - start;
        const progress = Math.min((diff / 3000) * 100, 100);
        setSetExerciseHoldProgress(progress);
        
        if (progress >= 100) {
          const key = `${parts[0]}-${parts[1]}`;
          setCompletedSets(prev => ({ ...prev, [key]: true }));
          setSetHoldId(null);
          setSetExerciseHoldProgress(0);
        } else {
          animationFrame = requestAnimationFrame(checkSetHold);
        }
      } else {
        setSetExerciseHoldProgress(0);
      }
    };
    if (setHoldId) animationFrame = requestAnimationFrame(checkSetHold);
    return () => cancelAnimationFrame(animationFrame);
  }, [setHoldId]);

  // Rest Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimeLeft(null);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    setHoldStartTime(Date.now());
  };
  const handleHoldEnd = () => setHoldStartTime(null);

  const handleSetHoldStart = (e: React.MouseEvent | React.TouchEvent, exIdx: number, setIdx: number) => {
    const key = `${exIdx}-${setIdx}`;
    if (completedSets[key]) return;
    setSetHoldId(`${exIdx}-${setIdx}-${Date.now()}`);
  };

  const handleSetHoldEnd = () => setSetHoldId(null);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
  };

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
    <div className="space-y-6 pb-40 select-none">
      {/* Rest Timer Interface */}
      <div className={`p-6 rounded-3xl border transition-all duration-500 ${timeLeft !== null ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-500/20' : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-100 border-slate-200 shadow-inner')}`}>
        {timeLeft !== null ? (
          <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-2">Rest Phase Active</div>
            <div className="text-7xl font-black mono text-white mb-4 drop-shadow-md">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <button 
              onClick={() => setTimeLeft(null)}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 transition-colors border border-white/20"
            >
              <X className="w-4 h-4" /> Skip Rest
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Initiate Rest Timer</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => startTimer(60)}
                className={`py-4 rounded-2xl font-black text-2xl border transition-all active:scale-95 flex items-center justify-center gap-1 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 shadow-sm'}`}
              >
                60<span className="text-xs font-bold opacity-40">SEC</span>
              </button>
              <button 
                onClick={() => startTimer(90)}
                className={`py-4 rounded-2xl font-black text-2xl border transition-all active:scale-95 flex items-center justify-center gap-1 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 shadow-sm'}`}
              >
                90<span className="text-xs font-bold opacity-40">SEC</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workout Plan Section */}
      <div className="space-y-6">
         <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
           <Target className="w-4 h-4" /> {t.sessionGoals}
         </h3>
         
         {draft.map((ex, exIdx) => (
           <div key={exIdx} className={`rounded-2xl border overflow-hidden transition-colors ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`px-4 py-3 flex items-center gap-3 ${isDark ? 'bg-slate-700/20' : 'bg-slate-50 border-b border-slate-100'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700/50' : 'bg-white shadow-sm'}`}>
                  <Dumbbell className="w-4 h-4 text-indigo-500" />
                </div>
                <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {t[ex.name as keyof typeof t] || ex.name}
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div className="grid grid-cols-12 gap-2 px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="col-span-2 text-center">{t.set}</div>
                  <div className="col-span-5 text-center">{t.weight}</div>
                  <div className="col-span-5 text-center">{t.reps}</div>
                </div>

                {ex.sets.map((s, si) => {
                  const isDone = completedSets[`${exIdx}-${si}`];
                  const isThisSetHolding = setHoldId?.startsWith(`${exIdx}-${si}-`);

                  return (
                    <div 
                      key={si} 
                      onMouseDown={(e) => handleSetHoldStart(e, exIdx, si)} 
                      onMouseUp={handleSetHoldEnd} 
                      onMouseLeave={handleSetHoldEnd}
                      onTouchStart={(e) => handleSetHoldStart(e, exIdx, si)} 
                      onTouchEnd={handleSetHoldEnd}
                      onContextMenu={(e) => e.preventDefault()}
                      className={`relative grid grid-cols-12 gap-2 items-center p-4 rounded-xl cursor-pointer overflow-hidden select-none active:scale-[0.98] ${isDone ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : (isDark ? 'bg-slate-900/40 hover:bg-slate-900/60' : 'bg-slate-50 hover:bg-slate-100')}`}
                    >
                      {/* Hold Progress Overlay - NO CSS TRANSITION for direct width updates */}
                      {isThisSetHolding && !isDone && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-emerald-400 z-0 opacity-40" 
                          style={{ width: `${setExerciseHoldProgress}%` }} 
                        />
                      )}

                      <div className="col-span-2 flex justify-center relative z-10">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black mono border transition-colors ${isDone ? 'bg-emerald-600 border-emerald-400 text-white' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500')}`}>
                          {si + 1}
                        </span>
                      </div>
                      <div className="col-span-5 text-center relative z-10">
                        <div className="flex flex-col">
                          <span className={`text-xl font-black mono transition-colors ${isDone ? 'text-white' : (isDark ? 'text-indigo-400' : 'text-indigo-600')}`}>{s.weight}</span>
                          <span className={`text-[8px] font-bold uppercase transition-colors ${isDone ? 'text-emerald-100' : 'text-slate-500 opacity-60'}`}>KG</span>
                        </div>
                      </div>
                      <div className="col-span-5 text-center relative z-10">
                        <div className="flex flex-col">
                          <span className={`text-xl font-black mono transition-colors ${isDone ? 'text-white' : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>{s.reps}</span>
                          <span className={`text-[8px] font-bold uppercase transition-colors ${isDone ? 'text-emerald-100' : 'text-slate-500 opacity-60'}`}>{t.reps}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
         ))}
      </div>

      {/* Completion Button */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-2xl mx-auto p-4 backdrop-blur-md z-30 transition-colors ${isDark ? 'bg-slate-900/80' : 'bg-white/80 border-t border-slate-100'}`}>
        <button
          onMouseDown={handleHoldStart} 
          onMouseUp={handleHoldEnd} 
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart} 
          onTouchEnd={handleHoldEnd}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative w-full h-20 rounded-2xl overflow-hidden group select-none transition-all active:scale-[0.98] ${isDark ? 'bg-slate-800 shadow-inner border border-slate-700' : 'bg-slate-100 border border-slate-200 shadow-inner'}`}
        >
          {/* Main Hold Progress Overlay - NO CSS TRANSITION for direct width updates */}
          <div 
            className="absolute inset-y-0 left-0 bg-emerald-600 z-0" 
            style={{ width: `${holdProgress}%` }} 
          />
          
          <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
             <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} ${holdProgress > 0 ? 'scale-90 border-emerald-400 shadow-lg' : ''}`}>
                <ShieldCheck className={`w-6 h-6 ${holdProgress > 50 ? 'text-emerald-400' : (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
             </div>
             <div className="text-left">
                <div className={`font-black uppercase tracking-wider leading-none transition-colors ${holdProgress > 30 ? 'text-white' : (isDark ? 'text-slate-100' : 'text-slate-800')}`}>
                  {holdProgress > 0 ? t.securingData : t.finishSession}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-tighter mt-1 transition-colors ${holdProgress > 30 ? 'text-emerald-100' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                  {holdProgress > 0 ? `${Math.round(holdProgress)}% COMPLETE` : t.safetyHoldRequired}
                </div>
             </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
