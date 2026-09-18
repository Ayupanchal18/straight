import React from 'react';
import { Flame, ChevronRight, Activity, X } from 'lucide-react';
import { TeamBadge, isMatchLive, isMatchComplete, isMatchUpcoming } from '../../../utils/teamUtils.jsx';

export const TrendingWidget = ({ matches = [], onSelectMatch, onClose }) => {
  // Take top 5 trending / marquee matches
  const trendingList = matches.slice(0, 5);

  return (
    <div className="sports-card p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-extrabold text-white tracking-wide font-display">
            Trending
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Hide trending section"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {trendingList.map((m, idx) => {
          const live = isMatchLive(m);
          const complete = isMatchComplete(m);
          return (
            <div
              key={m.id || idx}
              onClick={() => onSelectMatch && onSelectMatch(m)}
              className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/[0.04] hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <TeamBadge name={m.team1} shortName={m.team1ShortName} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {m.team1ShortName || m.team1} vs {m.team2ShortName || m.team2}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {m.matchDescription || m.matchType || m.series || 'Match'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {live ? (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    Live
                  </span>
                ) : complete ? (
                  <span className="text-[9px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    Result
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                    Upcoming
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-300 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
