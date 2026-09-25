import React from 'react';
import { 
  ArrowLeft, Search, Radio, Calendar, User, Scale, Coffee, 
  RotateCcw, Compass, HelpCircle, ShieldAlert
} from 'lucide-react';
import { Button } from '../../ui/Button';

export const NotFoundView = ({ onNavigate, onOpenSearch }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 animate-fade-in">
      
      {/* ── Cricket 404 Visual Icon Badge ── */}
      <div className="relative mb-6">
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/15 rounded-full blur-3xl" />
        
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-navy-800 dark:to-navy-900 border-2 border-red-500/40 dark:border-red-500/30 flex flex-col items-center justify-center shadow-2xl group">
          {/* Umpire finger out indicator */}
          <span className="text-4xl sm:text-5xl select-none transform group-hover:scale-110 transition-transform">
            ☝️
          </span>
          <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider">
            <span>OUT! 404</span>
          </div>
        </div>
      </div>

      {/* ── Heading & Explanation ── */}
      <div className="max-w-md space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Howzat?! That's Out!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The umpire has raised his finger. The page or delivery you're looking for was clean bowled, run out, or doesn't exist in the scorebook.
        </p>
      </div>

      {/* ── Primary Action Buttons ── */}
      <div className="flex items-center gap-3 flex-wrap justify-center mb-10">
        <Button
          variant="primary"
          size="md"
          icon={Radio}
          onClick={() => onNavigate && onNavigate('live')}
          className="shadow-md shadow-blue-500/20 cursor-pointer font-bold text-xs sm:text-sm"
        >
          Return to Live Pitch
        </Button>

        {onOpenSearch && (
          <Button
            variant="secondary"
            size="md"
            icon={Search}
            onClick={onOpenSearch}
            className="cursor-pointer font-semibold text-xs sm:text-sm"
          >
            Search Players & Matches
          </Button>
        )}
      </div>

      {/* ── Quick Navigation Links ── */}
      <div className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-navy-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-left">
          Jump Back into the Match Action
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onNavigate && onNavigate('schedule')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1424] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all text-left group cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Series</span>
            <span className="text-[10px] text-slate-500">Upcoming tours</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('players')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1424] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all text-left group cursor-pointer"
          >
            <User className="w-4 h-4 text-emerald-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Players</span>
            <span className="text-[10px] text-slate-500">1,190+ profiles</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('compare')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1424] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all text-left group cursor-pointer"
          >
            <Scale className="w-4 h-4 text-purple-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Compare</span>
            <span className="text-[10px] text-slate-500">H2H analytics</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('support')}
            className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-amber-500/20 transition-all text-left group cursor-pointer"
          >
            <Coffee className="w-4 h-4 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Support</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Buy a coffee</span>
          </button>
        </div>
      </div>

    </div>
  );
};
