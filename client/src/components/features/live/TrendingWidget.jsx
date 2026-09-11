import React from 'react';
import { Flame, ChevronRight, Activity } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamUtils.jsx';

export const TrendingWidget = ({ matches = [], onSelectMatch }) => {
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
      </div>

      <div className="space-y-2.5">
        {trendingList.map((m, idx) => {
          const isLive = m.isLive && !m.isComplete;
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
                {isLive ? (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    Result
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
