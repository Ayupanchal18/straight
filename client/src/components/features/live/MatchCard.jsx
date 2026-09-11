import React from 'react';
import { 
  Bookmark, 
  Activity, 
  ChevronRight, 
  MapPin, 
  CloudSun, 
  ExternalLink 
} from 'lucide-react';
import { TeamBadge } from '../../../utils/teamUtils.jsx';
import { useFavorites } from '../../../context/FavoritesContext';

export const MatchCard = ({ match, onSelectMatch }) => {
  const { isFavorite, togglePinMatch, pinnedMatchId } = useFavorites();
  const matchId = match.id || match.rawText;
  const isPinned = pinnedMatchId === matchId || isFavorite('match', matchId);

  const handleTogglePin = (e) => {
    e.stopPropagation();
    togglePinMatch(match);
  };

  const team1 = match.team1 || 'Team 1';
  const team2 = match.team2 || 'Team 2';

  const isLive = match.isLive && !match.isComplete;
  const isBattingT1 = isLive && match.currentBattingTeamId && match.currentBattingTeamId === match.team1Id;
  const isBattingT2 = isLive && match.currentBattingTeamId && match.currentBattingTeamId === match.team2Id;

  // Derive venue fallback or city
  const venueDisplay = match.venue || 'Lord\'s, London';

  return (
    <div 
      className="sports-card flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
      onClick={() => onSelectMatch && onSelectMatch(match)}
    >
      {/* ── Top Match Header ── */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-white/[0.04]">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block truncate">
            {match.matchDescription || match.matchType || 'Match'}
          </span>
          {match.series && (
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">{match.series}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Live
            </span>
          ) : match.isComplete ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              Result
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              Upcoming
            </span>
          )}

          <button
            onClick={handleTogglePin}
            title={isPinned ? 'Unpin match' : 'Pin match to top'}
            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
              isPinned 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Teams & Scores Arena ── */}
      <div className="px-4 py-3.5 space-y-3 flex-1">
        {/* Team 1 Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <TeamBadge name={team1} shortName={match.team1ShortName} size="md" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`font-bold text-sm truncate ${isBattingT1 ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                {team1}
              </span>
              {isBattingT1 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              )}
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            {match.team1Score ? (
              <div>
                <span className="font-black text-sm text-white tabular-nums">
                  {match.team1Score}
                </span>
                {match.team1Overs && (
                  <span className="text-[10px] text-slate-400 tabular-nums ml-1">
                    ({match.team1Overs} ov)
                  </span>
                )}
                {match.team1PrevScore && (
                  <div className="text-[9px] text-slate-400 tabular-nums">&amp; {match.team1PrevScore}</div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-mono">–</span>
            )}
          </div>
        </div>

        {/* Team 2 Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <TeamBadge name={team2} shortName={match.team2ShortName} size="md" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`font-bold text-sm truncate ${isBattingT2 ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                {team2}
              </span>
              {isBattingT2 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              )}
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            {match.team2Score ? (
              <div>
                <span className="font-black text-sm text-white tabular-nums">
                  {match.team2Score}
                </span>
                {match.team2Overs && (
                  <span className="text-[10px] text-slate-400 tabular-nums ml-1">
                    ({match.team2Overs} ov)
                  </span>
                )}
                {match.team2PrevScore && (
                  <div className="text-[9px] text-slate-400 tabular-nums">&amp; {match.team2PrevScore}</div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-mono">–</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Bar Strip ── */}
      <div className="bg-[#090e1c] border-t border-white/[0.04] px-4 py-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
        <Activity className={`w-3.5 h-3.5 flex-shrink-0 ${isLive ? 'animate-pulse text-amber-400' : 'text-slate-400'}`} />
        <span className="truncate flex-1 text-[11px]">{match.status || 'Match Scheduled'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
      </div>

      {/* ── Card Footer: Venue + Weather + CRR + Match Center ── */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-[11px] border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-3 text-slate-400 min-w-0">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{venueDisplay}</span>
          </div>
          {match.currentRunRate && (
            <span className="font-mono text-emerald-400/90 font-semibold flex-shrink-0">
              CRR: {match.currentRunRate.toFixed(2)}
            </span>
          )}
        </div>

        <span className="text-emerald-400 group-hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors flex-shrink-0">
          <span>Match Center</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
