import React from 'react';
import { Sun, Moon, Languages, Check } from 'lucide-react';
import { Theme, Language } from './types';
import { translations } from './translations';

interface Props {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onBack: () => void;
}

const Settings: React.FC<Props> = ({ theme, setTheme, language, setLanguage, onBack }) => {
  const t = translations[language];
  const isDark = theme === 'dark';

  const langs: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Español' },
    { id: 'fr', label: 'Français' },
    { id: 'ru', label: 'Русский' },
    { id: 'pl', label: 'Polski' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t.settings}</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Languages className="w-4 h-4" /> {t.language}
          </h3>
          <div className={`rounded-2xl border divide-y overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700 divide-slate-700' : 'bg-white border-slate-200 divide-slate-200'}`}>
            {langs.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${language === lang.id ? (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50') : (isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50')}`}
              >
                <span className="font-medium">{lang.label}</span>
                {language === lang.id && <Check className="w-5 h-5 text-indigo-500" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Sun className="w-4 h-4" /> {t.theme}
          </h3>
          <div className={`grid grid-cols-2 gap-3 p-1 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm
                ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <Sun className="w-4 h-4" /> {t.light}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm
                ${theme === 'dark' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-white'}
              `}
            >
              <Moon className="w-4 h-4" /> {t.dark}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
