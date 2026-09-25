import React from 'react';
import { Github, Heart, Shield, Zap } from 'lucide-react';

export const Footer = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-pitch-900/60 mt-16 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-300">CricketHub 2.0</span>
            <span>•</span>
            <span>Real-time Cricket Intelligence Dashboard</span>
          </div>

          <div className="flex items-center gap-3.5 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => onSelectTab && onSelectTab('support')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>☕ Buy Me a Coffee</span>
            </button>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Tier Cached</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Real-time Scraper</span>
            </div>
          </div>
        </div>

        {/* Legal & Educational Fair-Use Disclaimer */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Disclaimer & Fair Use Notice:</span>{' '}
            CricketHub is an open-source, non-commercial project developed strictly for educational and portfolio demonstration purposes. All cricket match statistics, player data, team names, trademarks, and logos remain the exclusive intellectual property of their respective governing bodies (ICC, BCCI, ECB, CA, etc.) and original publishers. This application does not claim ownership, does not charge users, and is not affiliated with any commercial sports organization.
          </p>
        </div>
      </div>
    </footer>
  );
};
