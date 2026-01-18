import React, { useState, useEffect } from 'react';
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { enUS, es, fr, ru, pl } from 'date-fns/locale';
import { Play, Dumbbell, History, Sparkles, Trash2, ShieldAlert, Lock } from 'lucide-react';
import { WorkoutBlock, WorkoutSession, ExerciseData, SetRecord, Theme, Language } from './types';
import { WORKOUT_BLOCKS, FINISH_HOLD_TIME } from './constants';
import { translations } from './translations';
import { getWorkoutTip } from './geminiService';

interface Props {
  date: Date;
  history: WorkoutSession[];
  onStart: (block: WorkoutBlock, data: ExerciseData[]) => void;
  onDelete: (id: string) => void;
  theme: Theme;
  language: Language;
}

const WorkoutSetup: React.FC<Props> = ({ date, history, onStart, onDelete, theme, language }) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const locales = { en: enUS, es: es, fr: fr, ru: ru, pl: pl };

  const existingSession = history.find(h => isSameDay(parseISO(h.date), date));
  const isDateToday = isToday(date);
  
  const initialBlock = existingSession 
    ? (WORKOUT_BLOCKS.find(b => b.id === existingSession.blockId) || WORKOUT_BLOCKS[0])
    : WORKOUT_BLOCKS[0];

  const [selectedBlock, setSelectedBlock] = useState<WorkoutBlock>(initialBlock);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [aiTip, setAiTip] = useState<string>("");
  const [deleteHoldStart, setDeleteHoldStart] = useState<number | null>(null);
  const [deleteProgress, setDeleteProgress] = useState(0);

  useEffect(() => {
    if (existingSession) {
      setExercises(existingSession.exercises);
      setAiTip(t.sessionComplete);
      return;
    }

    setAiTip(t.loadingTip);
    const prev = history.find(h => h.blockId === selectedBlock.id);
    
    const translatedBlockName = t[selectedBlock.name as keyof typeof t] || selectedBlock.name;
    const translatedExercises = selectedBlock.exercises.map(exKey => t[exKey as keyof typeof t] || exKey);
    
    getWorkoutTip(translatedBlockName, translatedExercises, language).then(setAiTip);

    const initialExercises: ExerciseData[] = selectedBlock.exercises.map(name => {
      const prevEx = prev?.exercises.find(e => e.name === name);
      return {
        name,
        sets: [1, 2, 3].map((_, i) => ({
          weight: prevEx?.sets[i]?.weight || 0,
          reps: prevEx?.sets[i]?.reps || 0,
        }))
      };
    });
    setExercises(initialExercises);
  }, [selectedBlock, history, language, existingSession, t.loadingTip, t.sessionComplete]);

  useEffect(() => {
    let animationFrame: number;
    const checkDelete = () => {
      if (deleteHoldStart) {
        const now = Date.now();
        const diff = now - deleteHoldStart;
        const progress = Math.min((diff / FINISH_HOLD_TIME) * 100, 100);
        setDeleteProgress(progress);
        if (progress >= 100 && existingSession) {
          onDelete(existingSession.id);
          setDeleteHoldStart(null);
        } else {
          animationFrame = requestAnimationFrame(checkDelete);
        }
      } else {
        setDeleteProgress(0);
      }
    };
    if (deleteHoldStart) animationFrame = requestAnimationFrame(checkDelete);
    return () => cancelAnimationFrame(animationFrame);
  }, [deleteHoldStart, existingSession, onDelete]);

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetRecord, value: number) => {
    if (existingSession || !isDateToday) return; 
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleHoldStart = () => setDeleteHoldStart(Date.now());
  const handleHoldEnd = () => setDeleteHoldStart(null);

  return (
    <div className="space-y-6">
      <div className={`p-1 rounded-xl flex gap-1 border transition-colors ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        {WORKOUT_BLOCKS.map(block => (
          <button
            key={block.id}
            disabled={!!existingSession || !isDateToday}
            onClick={() => setSelectedBlock(block)}
            className={`
              flex-1 py-3 px-2 rounded-lg text-sm font-bold transition-all
              ${selectedBlock.id === block.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:bg-white hover:text-indigo-600')}
              ${(existingSession || !isDateToday) && selectedBlock.id !== block.id ? 'opacity-20 cursor-not-allowed' : ''}
            `}
          >
            {block.id}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
           {t[selectedBlock.name as keyof typeof t] || selectedBlock.name}
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
          {t.preparation} {format(date, 'MMMM do, yyyy', { locale: (locales[language] || enUS) })}
        </p>
      </div>

      <div className={`p-4 rounded-2xl border flex gap-3 items-start shadow-inner ${isDark ? 'bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
        <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t.proFocus}</p>
          <p className={`text-sm leading-relaxed font-medium italic ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>"{aiTip}"</p>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <div key={ex.name} className={`rounded-2xl border overflow-hidden shadow-sm transition-colors ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`px-4 py-3 flex justify-between items-center ${isDark ? 'bg-slate-700/30' : 'bg-slate-50 border-b border-slate-200'}`}>
              <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                <Dumbbell className="w-4 h-4 text-indigo-500" />
                {t[ex.name as keyof typeof t] || ex.name}
              </h3>
              {existingSession ? (
                 <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                   <ShieldAlert className="w-3 h-3" /> {t.sessionComplete}
                 </div>
              ) : (
                history.find(h => h.blockId === selectedBlock.id) && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <History className="w-3 h-3" /> {t.historyLoaded}
                  </div>
                )
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <div className="col-span-2 text-center">{t.set}</div>
                <div className="col-span-5">{t.weight} (KG)</div>
                <div className="col-span-5">{t.reps}</div>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2 flex justify-center">
                    <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold mono ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {setIdx + 1}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <input 
                      type="number"
                      readOnly={!!existingSession || !isDateToday}
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className={`w-full border rounded-lg px-3 py-2 font-semibold mono outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-200 focus:border-indigo-400 shadow-sm'} ${existingSession || !isDateToday ? 'opacity-70 cursor-default' : ''}`}
                    />
                  </div>
                  <div className="col-span-5">
                     <input 
                      type="number"
                      readOnly={!!existingSession || !isDateToday}
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className={`w-full border rounded-lg px-3 py-2 font-semibold mono outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-200 focus:border-indigo-400 shadow-sm'} ${existingSession || !isDateToday ? 'opacity-70 cursor-default' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isDateToday ? (
        !existingSession && (
          <button
            onClick={() => onStart(selectedBlock, exercises)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 pulse-start group"
          >
            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
            {t.startTraining}
          </button>
        )
      ) : (
        !existingSession && (
          <div className={`p-6 rounded-2xl border border-dashed flex flex-col items-center gap-2 text-center ${isDark ? 'border-slate-700 bg-slate-800/20 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
            <Lock className="w-8 h-8 opacity-40" />
            <p className="text-xs font-bold uppercase tracking-widest">{t.onlyToday}</p>
          </div>
        )
      )}

      {existingSession && (
        <div className="space-y-4 pt-4">
          <div className={`text-center text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-rose-500/80' : 'text-rose-600'}`}>
             <ShieldAlert className="w-4 h-4 mx-auto mb-1" />
             {t.holdToDelete}
          </div>
          <button
            onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative w-full h-20 rounded-2xl overflow-hidden group select-none transition-all active:scale-[0.98] ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
          >
            <div className="absolute inset-y-0 left-0 bg-rose-600 z-0" style={{ width: `${deleteProgress}%` }} />
            <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
               <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} ${deleteProgress > 0 ? 'scale-90 border-rose-500' : ''}`}>
                  <Trash2 className={`w-6 h-6 ${deleteProgress > 50 ? 'text-rose-100' : (isDark ? 'text-rose-500' : 'text-rose-600')}`} />
               </div>
               <div className="text-left">
                  <div className={`font-black uppercase tracking-wider leading-none ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.deleteSession}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {deleteProgress > 0 ? `${t.deletingData} ${Math.round(deleteProgress)}%` : t.safetyHoldRequired}
                  </div>
               </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutSetup;
