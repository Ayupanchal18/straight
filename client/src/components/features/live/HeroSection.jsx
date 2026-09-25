import React from 'react';
import { Search, Radio, Calendar, User, Scale, Zap, ShieldCheck } from 'lucide-react';

/**
 * HeroSection — Compact, modern homepage hero:
 * Sleek height (~150px) that keeps live match cards immediately visible above the fold.
 * Left: Punchy headline + live pulse badge + compact search & quick action pills.
 * Right: Minimalist real-time telemetry badge.
 */
export const HeroSection = ({ onOpenSearch, onSelectTab, liveCount = 0, upcomingCount = 0 }) => {
  const quickActions = [
    {
      id: 'live',
      label: 'Live',
      count: liveCount,
      icon: Radio,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 hover:bg-red-100/80 dark:bg-red-500/10 dark:hover:bg-red-500/15 border-red-200 dark:border-red-500/30',
      dot: true,
    },
    {
      id: 'schedule',
      label: 'Series',
      count: upcomingCount,
      icon: Calendar,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 border-amber-200 dark:border-amber-500/30',
    },
    {
      id: 'players',
      label: 'Players',
      icon: User,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-500/10 dark:hover:bg-blue-500/15 border-blue-200 dark:border-blue-500/30',
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: Scale,
      color: 'text-purple-700 dark:text-purple-400',
      bg: 'bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-500/10 dark:hover:bg-purple-500/15 border-purple-200 dark:border-purple-500/30',
    },
  ];

  return (
    <div className="relative overflow-hidden hero-bg border-b border-slate-200 dark:border-white/[0.06] transition-colors duration-200">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-600/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-80 h-full bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">

          {/* ── Left / Main: Compact Headline & Controls ── */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Headline + Live Pulse Chip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                Live Cricket. <span className="text-blue-600 dark:text-blue-400">Deeper Insights.</span>
              </h1>
              
              {liveCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{liveCount} Live Now</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Live Telemetry</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-normal">
              Real-time ball-by-ball telecast feeds, player head-to-heads, and tournament fixtures.
            </p>

            {/* Compact Control Strip: Search Trigger + Quick Action Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              
              {/* Compact Search Trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-navy-800/90 border border-slate-200 dark:border-white/[0.12] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-blue-500/40 text-xs font-medium transition-all shadow-2xs group flex-1 max-w-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                <span className="truncate">Search players, teams, series...</span>
                <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.08] text-[9px] font-mono text-slate-500 font-bold">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar flex-shrink-0">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onSelectTab(action.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs flex-shrink-0 ${action.bg} ${action.color}`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{action.label}</span>
                      {action.count !== undefined && action.count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-black">
                          {action.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ── Right: Sleek Telemetry & Ad-Free Badge (Desktop only) ── */}
          <div className="hidden lg:flex lg:col-span-4 items-center justify-end">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-navy-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <div className="pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Fast Telemetry</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Real-time ball polling & OTT</span>
              </div>
              <div className="h-7 w-px bg-slate-200 dark:border-white/10" />
              <div className="text-right pl-0.5">
                <span className="text-xs font-black text-slate-900 dark:text-white block">100% Ad-Free</span>
                <span className="text-[10px] text-slate-400">Community Built</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
