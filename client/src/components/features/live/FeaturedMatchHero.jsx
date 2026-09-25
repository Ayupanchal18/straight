import React from 'react';
import { 
  ChevronRight, 
  Zap, 
  Target, 
  Activity, 
  Bookmark,
  X,
  User
} from 'lucide-react';
import { TeamBadge, isMatchLive } from '../../../utils/teamUtils.jsx';

export const FeaturedMatchHero = ({ match, onSelectMatch, onUnpin }) => {
  if (!match) return null;

  const isLive = isMatchLive(match);
  const isBattingT1 = match.currentBattingTeamId && match.currentBattingTeamId === match.team1Id;
  const isBattingT2 = match.currentBattingTeamId && match.currentBattingTeamId === match.team2Id;

  // Fallback balls if not provided
  const recentBalls = match.recentBalls?.length > 0 
    ? match.recentBalls 
    : ['4', '0', '1', '0', '4', '2'];

  return (
    <div 
      onClick={() => onSelectMatch && onSelectMatch(match)}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1628] via-[#0b1120] to-[#070b14] border border-white/[0.08] shadow-2xl hover:border-emerald-500/40 transition-all cursor-pointer group mb-6"
    >
      {/* Stadium Floodlights & Pitch Radial Glow */}
      <div className="absolute top-0 left-1/4 w-72 h-28 bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-28 bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Top Banner Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-white/[0.05] bg-white/[0.015] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            PINNED MATCH
          </span>
          <span className="text-xs font-semibold text-slate-300 truncate">
            {match.series || match.matchDescription || 'International Cricket'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onUnpin) onUnpin(match);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
            title="Unpin match from top banner"
          >
            <Bookmark className="w-3 h-3 fill-blue-400 text-blue-400" />
            <span>Unpin</span>
          </button>

          <div className="flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold">
            <span>Match Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Scoreboard Arena */}
      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          
          {/* Team 1 (Left) */}
          <div className="lg:col-span-4 flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <TeamBadge name={match.team1} shortName={match.team1ShortName} size="xl" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate">{match.team1}</h3>
                  {isBattingT1 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Currently Batting" />
                  )}
                </div>
                {match.team1PrevScore && (
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    1st Inn: {match.team1PrevScore}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right lg:text-left flex-shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight font-display">
                  {match.team1Score || '–'}
                </span>
                {match.team1Overs && (
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    ({match.team1Overs} ov)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Status Card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center px-4 py-3 bg-[#0d1424]/90 rounded-2xl border border-white/[0.08] shadow-inner">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 px-2 py-0.5 rounded bg-slate-800/60">
              {match.matchDescription || match.matchType || 'MATCH DETAILS'}
            </span>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
              <span className="truncate">{match.status || 'Match in Progress'}</span>
            </div>
            {match.currentRunRate && (
              <span className="text-[11px] font-mono text-emerald-400/90 font-semibold mt-1">
                CRR: {match.currentRunRate.toFixed(2)}
              </span>
            )}
          </div>

          {/* Team 2 (Right) */}
          <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-4 lg:flex-row-reverse text-left lg:text-right">
            <div className="flex items-center gap-3.5 lg:flex-row-reverse min-w-0">
              <TeamBadge name={match.team2} shortName={match.team2ShortName} size="xl" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 justify-start lg:justify-end">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate">{match.team2}</h3>
                  {isBattingT2 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Currently Batting" />
                  )}
                </div>
                {match.team2PrevScore && (
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    1st Inn: {match.team2PrevScore}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight font-display">
                  {match.team2Score || '–'}
                </span>
                {match.team2Overs && (
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    ({match.team2Overs} ov)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Live Ticker Strip ── */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-[#080d1a]/80 -mx-4 sm:-mx-6 md:-mx-8 -mb-5 sm:-mb-7 px-4 sm:px-6 md:px-8 py-3">
          
          {/* Recent Balls Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
              RECENT
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {recentBalls.slice(0, 6).map((ball, i) => {
                const isFour = ball === '4';
                const isSix = ball === '6';
                const isWkt = ball.toLowerCase().includes('w');
                return (
                  <span 
                    key={i} 
                    className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center tabular-nums shadow-sm ${
                      isFour ? 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-300' :
                      isSix ? 'bg-purple-500 text-white ring-1 ring-purple-300' :
                      isWkt ? 'bg-rose-500 text-white ring-1 ring-rose-300' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {ball}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Current Batsmen & Bowlers Strip */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
            {match.currentBatsmen?.length > 0 ? (
              match.currentBatsmen.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className={`font-semibold ${b.isStriker ? 'text-white' : 'text-slate-300'}`}>
                    {b.name.split(' ').pop()}
                  </span>
                  <span className="font-extrabold text-emerald-400 tabular-nums">
                    {b.runs}
                  </span>
                  <span className="text-[10px] text-slate-400">({b.balls})</span>
                  {b.isStriker && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="On Strike" />}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300 font-semibold">At The Crease</span>
              </div>
            )}

            {match.currentBowlers?.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-950/60 border border-sky-500/30 text-xs text-sky-200">
                <Target className="w-3 h-3 text-sky-400" />
                <span className="font-semibold">{match.currentBowlers[0].name.split(' ').pop()}</span>
                <span className="font-extrabold text-sky-300 tabular-nums">
                  {match.currentBowlers[0].wickets}/{match.currentBowlers[0].runs}
                </span>
                <span className="text-[10px] text-sky-400">({match.currentBowlers[0].overs})</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
