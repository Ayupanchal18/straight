import React, { useState, useEffect, useRef } from 'react';
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

  // Score change & Wicket drop flash indicators
  const [flashT1, setFlashT1] = useState(null);
  const [flashT2, setFlashT2] = useState(null);
  const prevT1 = useRef(match.team1Score);
  const prevT2 = useRef(match.team2Score);

  useEffect(() => {
    if (prevT1.current && match.team1Score && prevT1.current !== match.team1Score) {
      const prevW = parseInt((prevT1.current.split('/')[1] || '').trim(), 10) || 0;
      const currW = parseInt((match.team1Score.split('/')[1] || '').trim(), 10) || 0;
      setFlashT1(currW > prevW ? 'wicket' : 'runs');
      const timer = setTimeout(() => setFlashT1(null), 2200);
      prevT1.current = match.team1Score;
      return () => clearTimeout(timer);
    }
    prevT1.current = match.team1Score;
  }, [match.team1Score]);

  useEffect(() => {
    if (prevT2.current && match.team2Score && prevT2.current !== match.team2Score) {
      const prevW = parseInt((prevT2.current.split('/')[1] || '').trim(), 10) || 0;
      const currW = parseInt((match.team2Score.split('/')[1] || '').trim(), 10) || 0;
      setFlashT2(currW > prevW ? 'wicket' : 'runs');
      const timer = setTimeout(() => setFlashT2(null), 2200);
      prevT2.current = match.team2Score;
      return () => clearTimeout(timer);
    }
    prevT2.current = match.team2Score;
  }, [match.team2Score]);

  return (
    <div 
      onClick={() => onSelectMatch && onSelectMatch(match)}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-slate-50 to-blue-50/30 dark:from-[#0e1628] dark:via-[#0b1120] dark:to-[#070b14] border border-slate-200 dark:border-white/[0.08] shadow-xl hover:border-blue-500/40 dark:hover:border-emerald-500/40 transition-all cursor-pointer group mb-6"
    >
      {/* Stadium Floodlights & Pitch Radial Glow */}
      <div className="absolute top-0 left-1/4 w-72 h-28 bg-blue-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-28 bg-sky-500/5 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/[0.05] bg-slate-50/70 dark:bg-white/[0.015] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            PINNED MATCH
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {match.series || match.matchDescription || 'International Cricket'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onUnpin) onUnpin(match);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-900/90 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200 dark:border-white/10 hover:border-rose-300 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
            title="Unpin match from top banner"
          >
            <Bookmark className="w-3 h-3 fill-blue-500 text-blue-500" />
            <span>Unpin</span>
          </button>

          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold">
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
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">{match.team1}</h3>
                  {isBattingT1 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Currently Batting" />
                  )}
                </div>
                {match.team1PrevScore && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                    1st Inn: {match.team1PrevScore}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right lg:text-left flex-shrink-0">
              <div className="flex items-baseline gap-1.5">
                {flashT1 === 'wicket' && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-bounce shadow-2xs">
                    Wicket!
                  </span>
                )}
                <span className={`text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-display transition-all ${
                  flashT1 === 'wicket' ? 'flash-wicket' : flashT1 === 'runs' ? 'flash-runs' : ''
                }`}>
                  {match.team1Score || '–'}
                </span>
                {match.team1Overs && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    ({match.team1Overs} ov)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center VS & Run Rate Details */}
          <div className="lg:col-span-4 text-center border-y lg:border-y-0 lg:border-x border-slate-200 dark:border-white/[0.08] py-4 lg:py-0 px-2 sm:px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-2">
              <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">VS</span>
            </div>

            {/* Status sentence */}
            <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-300 leading-snug">
              {match.status || 'Match Scheduled'}
            </p>

            {/* Run Rate Metrics */}
            {isLive && (
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                {match.currentRunRate && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    CRR: {typeof match.currentRunRate === 'number' ? match.currentRunRate.toFixed(2) : match.currentRunRate}
                  </span>
                )}
                {match.requiredRunRate && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                    RRR: {typeof match.requiredRunRate === 'number' ? match.requiredRunRate.toFixed(2) : match.requiredRunRate}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Team 2 (Right) */}
          <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-4">
            <div className="text-left lg:text-right flex-shrink-0 order-2 lg:order-1">
              <div className="flex items-baseline gap-1.5 justify-end">
                {flashT2 === 'wicket' && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-bounce shadow-2xs">
                    Wicket!
                  </span>
                )}
                <span className={`text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-display transition-all ${
                  flashT2 === 'wicket' ? 'flash-wicket' : flashT2 === 'runs' ? 'flash-runs' : ''
                }`}>
                  {match.team2Score || '–'}
                </span>
                {match.team2Overs && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    ({match.team2Overs} ov)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3.5 min-w-0 order-1 lg:order-2">
              <div className="min-w-0 text-left lg:text-right">
                <div className="flex items-center gap-1.5 justify-start lg:justify-end">
                  {isBattingT2 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Currently Batting" />
                  )}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">{match.team2}</h3>
                </div>
                {match.team2PrevScore && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                    1st Inn: {match.team2PrevScore}
                  </span>
                )}
              </div>
              <TeamBadge name={match.team2} shortName={match.team2ShortName} size="xl" />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-100/60 dark:bg-black/30 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-time Telemetry Active</span>
        </div>
        <div className="flex items-center gap-1">
          {recentBalls.map((b, i) => (
            <span key={i} className="w-5 h-5 rounded-full bg-slate-200 dark:bg-navy-800 text-[10px] font-bold flex items-center justify-center font-mono text-slate-700 dark:text-slate-300">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
