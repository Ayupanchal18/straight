import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-navy-800/80 dark:hover:bg-navy-700/80 border border-slate-200 dark:border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer group ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (visible in dark mode to switch to light) */}
        <Sun
          className={`w-4 h-4 text-amber-400 transition-all duration-300 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
        {/* Moon Icon (visible in light mode to switch to dark) */}
        <Moon
          className={`w-4 h-4 text-blue-600 transition-all duration-300 transform ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 absolute'
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
