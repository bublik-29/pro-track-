
import React, { useState, useEffect } from 'react';
import { isSameDay, addDays } from 'date-fns';
import { Activity, ChevronLeft, Settings as SettingsIcon } from 'lucide-react';
import { AppView, WorkoutSession, WorkoutBlock, ExerciseData, Theme, Language } from './types';
import { STORAGE_KEY } from './constants';
import { translations } from './translations';
import WorkoutCalendar from './WorkoutCalendar';
import WorkoutSetup from './WorkoutSetup';
import CountdownOverlay from './CountdownOverlay';
import ActiveWorkout from './ActiveWorkout';
import Settings from './Settings';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('CALENDAR');
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<WorkoutBlock | null>(null);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [currentSessionDraft, setCurrentSessionDraft] = useState<ExerciseData[]>([]);
  
  // Settings State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('protrack_theme') as Theme) || 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('protrack_lang') as Language) || 'en');

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('protrack_theme', theme);
    localStorage.setItem('protrack_lang', language);
  }, [theme, language]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveWorkout = (session: WorkoutSession) => {
    const updatedHistory = [session, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    setView('CALENDAR');
  };

  const deleteWorkout = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    setView('CALENDAR');
  };

  const startSetup = (date: Date) => {
    setActiveDate(date);
    setView('SETUP');
  };

  const handleStartCountdown = (block: WorkoutBlock, draft: ExerciseData[]) => {
    setSelectedBlock(block);
    setCurrentSessionDraft(draft);
    setView('COUNTDOWN');
  };

  const handleCountdownFinished = () => {
    setView('ACTIVE');
  };

  const handleCancel = () => {
    if (view === 'ACTIVE') {
      if (window.confirm(t.stopWorkout)) {
        setView('CALENDAR');
      }
    } else {
      setView('CALENDAR');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen max-w-2xl mx-auto shadow-2xl overflow-hidden relative border-x flex flex-col transition-colors duration-300
      ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}
    `}>
      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b p-4 flex items-center justify-between shrink-0 transition-colors
        ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className={`font-bold text-xl tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            PRO<span className="text-indigo-500">TRACK</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {view === 'CALENDAR' ? (
            <button 
              onClick={() => setView('SETTINGS')}
              className={`p-2 rounded-lg transition-colors border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600'}`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleCancel}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 border
                ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'}
              `}
            >
              <ChevronLeft className="w-4 h-4" /> {t.cancel}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {view === 'CALENDAR' && (
          <WorkoutCalendar 
            history={history} 
            onDayClick={startSetup}
            theme={theme}
            language={language}
          />
        )}

        {view === 'SETTINGS' && (
          <Settings 
            theme={theme} 
            setTheme={setTheme} 
            language={language} 
            setLanguage={setLanguage} 
            onBack={() => setView('CALENDAR')}
          />
        )}

        {view === 'SETUP' && (
          <WorkoutSetup 
            date={activeDate}
            history={history}
            onStart={handleStartCountdown}
            onDelete={deleteWorkout}
            theme={theme}
            language={language}
          />
        )}

        {view === 'ACTIVE' && selectedBlock && (
          <ActiveWorkout 
            block={selectedBlock}
            date={activeDate}
            draft={currentSessionDraft}
            onFinish={saveWorkout}
            theme={theme}
            language={language}
          />
        )}
      </main>

      {/* Overlay Screens */}
      {view === 'COUNTDOWN' && (
        <CountdownOverlay onFinished={handleCountdownFinished} language={language} />
      )}

      {/* Stats/Footer */}
      {view === 'CALENDAR' && (
        <div className={`fixed bottom-0 left-0 right-0 max-w-2xl mx-auto backdrop-blur-md border-t p-4 z-20 transition-colors
          ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}
        `}>
           <div className={`flex items-center justify-around ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-400 mono">{history.length}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">{t.totalSessions}</div>
              </div>
              <div className={`h-8 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400 mono">
                   {history.length > 0 ? history.filter(h => isSameDay(addDays(new Date(h.date), 1), new Date())).length : 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">{t.restToday}</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
