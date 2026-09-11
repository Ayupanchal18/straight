import React from 'react';
import { 
  ChevronRight, 
  Activity, 
  BarChart3, 
  Scale, 
  UserCheck, 
  Radio
} from 'lucide-react';

export const FeatureBanner = ({ onExplore }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1628] via-[#0b1222] to-[#070b16] border border-white/[0.08] p-5 sm:p-7 shadow-xl mt-8">
      <div className="absolute right-0 top-0 w-96 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left text */}
        <div className="text-center lg:text-left">
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
            Never Miss a Moment
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
            Live scores, detailed innings scorecards, player analytics and head-to-head comparisons — all in one place.
          </p>
          <div className="mt-4 flex justify-center lg:justify-start">
            <button
              onClick={() => onExplore && onExplore('players')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right feature pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Live Scores</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-center">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Detailed Stats</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-center">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Head to Head</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-300">Player Insights</span>
          </div>
        </div>

      </div>
    </div>
  );
};
