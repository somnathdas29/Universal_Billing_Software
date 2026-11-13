import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const isDocDark = document.documentElement.classList.contains('dark');
    setIsDark(isDocDark);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    const nextDark = !document.documentElement.classList.contains('dark');
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('payzen_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('payzen_theme', 'light');
    }
    setIsDark(nextDark);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
        isDark
          ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 shadow-sm'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};
