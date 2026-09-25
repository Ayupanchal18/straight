import React from 'react';
import { Search, Radio, Calendar, User, Scale } from 'lucide-react';

/**
 * HeroSection — Homepage hero matching design image:
 * Left: editorial headline + search bar + quick-action pills
 * Right: cricket action silhouette image (CSS illustration)
 */
export const HeroSection = ({ onOpenSearch, onSelectTab, liveCount = 0, upcomingCount = 0 }) => {
  const quickActions = [
    {
      id: 'live',
      label: 'Live Matches',
      count: liveCount,
      icon: Radio,
      color: 'text-red-400',
      bg: 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20',
      dot: true,
    },
    {
      id: 'schedule',
      label: 'Upcoming',
      count: upcomingCount,
      icon: Calendar,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20',
    },
    {
      id: 'players',
      label: 'Players',
      icon: User,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20',
    },
    {
      id: 'compare',
      label: 'Player Compare',
      icon: Scale,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20',
    },
  ];

  return (
    <div className="relative overflow-hidden hero-bg border-b border-white/[0.06]">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/6 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-cyan-500/4 via-transparent to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ── Left: Text & Search ── */}
          <div className="space-y-6 lg:space-y-8">

            {/* Editorial headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white">
                Live Cricket.
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-blue-400">
                Deeper Insights.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-md leading-relaxed">
                Real-time scores, player analytics, match schedules and more.
                <br className="hidden sm:block" />
                Your ultimate cricket companion.
              </p>
            </div>

            {/* Search bar — prominent, full-width */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none z-10" />
              <button
                type="button"
                onClick={onOpenSearch}
                className="w-full flex items-center gap-3 pl-11 pr-4 py-3.5 bg-navy-800/90 border border-white/[0.12] rounded-xl text-slate-400 hover:text-slate-300 hover:border-blue-500/30 hover:bg-navy-700/90 transition-all cursor-pointer text-sm text-left shadow-lg"
              >
                Search players, teams, series or matches...
              </button>
              {/* Search button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-blue-glow"
              >
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Quick-action pills */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onSelectTab(action.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${action.bg} ${action.color}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                      {action.dot && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <span>{action.label}</span>
                    {action.count !== undefined && action.count > 0 && (
                      <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {action.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Cricket Visual ── */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Stadium backdrop rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full border border-blue-500/8 absolute" />
              <div className="w-96 h-96 rounded-full border border-blue-500/5 absolute" />
              <div className="w-[500px] h-[500px] rounded-full border border-blue-500/3 absolute" />
            </div>

            {/* Central player spotlight */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Stadium floodlight glow */}
              <div className="absolute -inset-16 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Cricket player silhouette using CSS art */}
              <div className="relative w-48 h-56 sm:w-56 sm:h-64 flex items-end justify-center">
                {/* Player shape */}
                <div className="relative">
                  {/* Bat glow */}
                  <div className="absolute -top-4 -right-6 w-3 h-24 bg-gradient-to-b from-amber-400/40 to-transparent rounded-full rotate-[20deg] blur-sm" />

                  {/* Pitch oval */}
                  <div className="w-32 h-4 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent rounded-full blur-md mx-auto" />

                  {/* Stats floating card */}
                  <div className="absolute -left-20 top-8 match-card p-3 w-36 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Live Match</div>
                    <div className="text-sm font-black text-white score-display">245<span className="text-slate-400 font-normal">/4</span></div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">CRR: 5.76</div>
                    <div className="flex gap-1 mt-1.5">
                      {['1', '4', '0', '6', '1', 'W'].map((b, i) => (
                        <span
                          key={i}
                          className={`bead ${
                            b === '4' ? 'bead-four' :
                            b === '6' ? 'bead-six' :
                            b === 'W' ? 'bead-wicket' :
                            b === '0' ? 'bead-dot' : 'bead-run'
                          }`}
                          style={{ width: '18px', height: '18px', fontSize: '8px' }}
                        >
                          {b === '0' ? '·' : b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Player stats card */}
                  <div className="absolute -right-24 bottom-4 match-card p-3 w-32 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-1">V. Kohli</div>
                    <div className="text-lg font-black text-white score-display">102</div>
                    <div className="text-[9px] text-slate-400">96 balls • SR 106.3</div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[9px] text-emerald-400 font-bold">11×4</span>
                      <span className="text-[9px] text-purple-400 font-bold">2×6</span>
                    </div>
                  </div>

                  {/* Win prob card */}
                  <div className="absolute -left-16 bottom-0 match-card p-2.5 w-28 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Win Prob</div>
                    <div className="win-prob-bar mb-1.5">
                      <div className="win-prob-fill-left" style={{ width: '62%' }} />
                      <div className="win-prob-fill-right" style={{ width: '38%' }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold">
                      <span className="text-emerald-400">IND 62%</span>
                      <span className="text-blue-400">AUS 38%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
