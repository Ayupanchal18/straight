import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, ChevronRight, MapPin, Calendar, Zap } from 'lucide-react';
import { TeamBadge, isMatchLive, isMatchComplete, isMatchUpcoming, getMatchVenue } from '../../../utils/teamUtils.jsx';
import { useFavorites } from '../../../context/FavoritesContext';
import cricketApi from '../../../services/api';

/**
 * BallBead — single coloured ball indicator in the over strip
 */
const BallBead = ({ ball }) => {
  const b = String(ball ?? '').trim();
  if (b === '4')
    return <span className="bead bead-four">4</span>;
  if (b === '6')
    return <span className="bead bead-six">6</span>;
  if (b === 'W')
    return <span className="bead bead-wicket">W</span>;
  if (b === '0' || b === '.' || b === '')
    return <span className="bead bead-dot">·</span>;
  if (b === 'WD' || b === 'NB' || b === 'LB' || b === 'B')
    return <span className="bead bead-extras" style={{ fontSize: '7px' }}>{b}</span>;
  return <span className="bead bead-run">{b}</span>;
};

const MatchCardComponent = ({ match, onSelectMatch }) => {
  const { isFavorite, togglePinMatch, pinnedMatchId } = useFavorites();
  const matchId = match.id || match.rawText;
  const isPinned = pinnedMatchId === matchId || isFavorite('match', matchId);

  const handleTogglePin = (e) => {
    e.stopPropagation();
    togglePinMatch(match);
  };

  const team1 = match.team1 || 'Team 1';
  const team2 = match.team2 || 'Team 2';

  const isLive     = isMatchLive(match);
  const isComplete = isMatchComplete(match);
  const isUpcoming = isMatchUpcoming(match);

  const isBattingT1 = isLive && match.currentBattingTeamId && match.currentBattingTeamId === match.team1Id;
  const isBattingT2 = isLive && match.currentBattingTeamId && match.currentBattingTeamId === match.team2Id;

  const venueDisplay = getMatchVenue(match);

  // Recent balls — show last 6
  const recentBalls = (match.recentBalls || []).slice(-6);

  // Score change & Wicket drop flash indicators
  const [flashT1, setFlashT1] = useState(null); // 'runs' | 'wicket' | null
  const [flashT2, setFlashT2] = useState(null);
  const prevT1Score = useRef(match.team1Score);
  const prevT2Score = useRef(match.team2Score);

  useEffect(() => {
    if (prevT1Score.current && match.team1Score && prevT1Score.current !== match.team1Score) {
      const prevW = parseInt((prevT1Score.current.split('/')[1] || '').trim(), 10) || 0;
      const currW = parseInt((match.team1Score.split('/')[1] || '').trim(), 10) || 0;
      const type = currW > prevW ? 'wicket' : 'runs';
      setFlashT1(type);
      const timer = setTimeout(() => setFlashT1(null), 2200);
      prevT1Score.current = match.team1Score;
      return () => clearTimeout(timer);
    }
    prevT1Score.current = match.team1Score;
  }, [match.team1Score]);

  useEffect(() => {
    if (prevT2Score.current && match.team2Score && prevT2Score.current !== match.team2Score) {
      const prevW = parseInt((prevT2Score.current.split('/')[1] || '').trim(), 10) || 0;
      const currW = parseInt((match.team2Score.split('/')[1] || '').trim(), 10) || 0;
      const type = currW > prevW ? 'wicket' : 'runs';
      setFlashT2(type);
      const timer = setTimeout(() => setFlashT2(null), 2200);
      prevT2Score.current = match.team2Score;
      return () => clearTimeout(timer);
    }
    prevT2Score.current = match.team2Score;
  }, [match.team2Score]);

  return (
    <div
      className="match-card flex flex-col cursor-pointer group select-none overflow-hidden transition-all duration-200"
      onClick={() => onSelectMatch && onSelectMatch(match)}
      onMouseEnter={() => match.cricbuzzLink && cricketApi.prefetchMatchDetails(match.cricbuzzLink)}
      onTouchStart={() => match.cricbuzzLink && cricketApi.prefetchMatchDetails(match.cricbuzzLink)}
    >
      {/* ── Header: Series + Status badge + Pin ── */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2 border-b border-slate-200 dark:border-white/[0.05]">
        <div className="min-w-0 flex-1">
          {/* Tournament / series name */}
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block truncate leading-tight">
            {match.series || match.matchDescription || 'Cricket Match'}
          </span>
          {match.matchDescription && match.series && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{match.matchDescription}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Status badge */}
          {isLive ? (
            <span className="badge-live">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          ) : isComplete ? (
            <span className="badge-result">Result</span>
          ) : (
            <span className="badge-upcoming">
              <Calendar size={9} />
              Upcoming
            </span>
          )}

          {/* Pin toggle */}
          <button
            onClick={handleTogglePin}
            title={isPinned ? 'Unpin match' : 'Pin match'}
            className={`p-1 rounded-md border transition-all cursor-pointer ${
              isPinned
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isPinned ? 'fill-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Scores Arena ── */}
      <div className="px-3.5 py-3 flex-1 space-y-2.5">
        {/* Team 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TeamBadge name={team1} shortName={match.team1ShortName} size="md" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-sm truncate leading-tight ${isBattingT1 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                {match.team1ShortName || team1}
              </span>
              {isBattingT1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Currently batting" />
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {match.team1Score ? (
              <div>
                <div className="flex items-center justify-end gap-1">
                  {flashT1 === 'wicket' && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-bounce shadow-2xs">
                      Wicket!
                    </span>
                  )}
                  <span className={`score-display text-base font-black transition-all ${
                    flashT1 === 'wicket' ? 'flash-wicket' : flashT1 === 'runs' ? 'flash-runs' : ''
                  }`}>
                    {match.team1Score}
                  </span>
                  {match.team1Overs && (
                    <span className="overs-display ml-1 text-[11px]">({match.team1Overs})</span>
                  )}
                </div>
                {match.team1PrevScore && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">& {match.team1PrevScore}</div>
                )}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">–</span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <TeamBadge name={team2} shortName={match.team2ShortName} size="md" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-sm truncate leading-tight ${isBattingT2 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                {match.team2ShortName || team2}
              </span>
              {isBattingT2 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Currently batting" />
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {match.team2Score ? (
              <div>
                <div className="flex items-center justify-end gap-1">
                  {flashT2 === 'wicket' && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider animate-bounce shadow-2xs">
                      Wicket!
                    </span>
                  )}
                  <span className={`score-display text-base font-black transition-all ${
                    flashT2 === 'wicket' ? 'flash-wicket' : flashT2 === 'runs' ? 'flash-runs' : ''
                  }`}>
                    {match.team2Score}
                  </span>
                  {match.team2Overs && (
                    <span className="overs-display ml-1 text-[11px]">({match.team2Overs})</span>
                  )}
                </div>
                {match.team2PrevScore && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">& {match.team2PrevScore}</div>
                )}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 font-mono text-sm">–</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Match Status Strip ── */}
      <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-white/[0.015] border-t border-slate-200 dark:border-white/[0.04]">
        <p className="text-[11px] text-amber-600 dark:text-amber-300/90 font-medium truncate leading-tight">
          {match.status || 'Match Scheduled'}
        </p>
      </div>

      {/* ── Over Bead Strip (only when live & has balls) ── */}
      {isLive && recentBalls.length > 0 && (
        <div className="px-3.5 py-2.5 border-t border-slate-200 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {recentBalls.map((b, i) => (
              <BallBead key={i} ball={b} />
            ))}
          </div>
        </div>
      )}

      {/* ── Footer: Venue + CRR + Match Center CTA ── */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-white/[0.04]">
        <div className="flex items-center gap-2 min-w-0">
          {venueDisplay && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{venueDisplay}</span>
            </div>
          )}
          {isLive && match.currentRunRate && (
            <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              CRR: {typeof match.currentRunRate === 'number' ? match.currentRunRate.toFixed(2) : match.currentRunRate}
            </span>
          )}
        </div>

        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors flex-shrink-0">
          <span>View Match</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};

// React.memo to prevent unnecessary re-renders across all cards during live score pulses
export const MatchCard = React.memo(MatchCardComponent, (prev, next) => {
  return (
    prev.match.id === next.match.id &&
    prev.match.team1Score === next.match.team1Score &&
    prev.match.team2Score === next.match.team2Score &&
    prev.match.team1Overs === next.match.team1Overs &&
    prev.match.team2Overs === next.match.team2Overs &&
    prev.match.status === next.match.status &&
    prev.match.currentBattingTeamId === next.match.currentBattingTeamId &&
    (prev.match.recentBalls?.length || 0) === (next.match.recentBalls?.length || 0)
  );
});
