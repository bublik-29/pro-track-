
import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

interface Props {
  onFinished: () => void;
  language: Language;
}

const CountdownOverlay: React.FC<Props> = ({ onFinished, language }) => {
  const [count, setCount] = useState<number | string>(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const t = translations[language];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return 'GO!';
        return prev;
      });
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 50);
    }, 1000);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] mb-4">{t.getReady}</div>
        <div 
          className={`
            text-[12rem] font-black mono text-white leading-none transition-all duration-300
            ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
          `}
        >
          {count}
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;
