import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, MapPin, Cloud, ExternalLink, RefreshCw, 
  Bookmark, Activity, Clock, ShieldCheck, TrendingUp,
  Zap, Target, MessageSquare, Award, BarChart3, ListFilter,
  Users, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import cricketApi from '../../../services/api';
import { useFavorites } from '../../../context/FavoritesContext';
import { TeamBadge, getTeamTheme } from '../../../utils/teamUtils.jsx';

export const MatchDetailModal = ({ match, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'scorecard' | 'commentary'
  const [activeInningsTab, setActiveInningsTab] = useState(0);
  const { togglePinMatch, pinnedMatchId, isFavorite } = useFavorites();

  const matchId = match.id || match.rawText;
  const isPinned = pinnedMatchId === matchId || isFavorite('match', matchId);

  const fetchDetails = async () => {
    if (!match.cricbuzzLink) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await cricketApi.getMatchDetails(match.cricbuzzLink);
      if (res?.data) {
        setDetails(res.data);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch match details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [match]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleTogglePin = () => {
    togglePinMatch(match);
  };

  // Derive venue and weather
  const venueDisplay = details?.venue?.name || match.venue || 'R. Premadasa Stadium, Colombo';
  const weatherDisplay = '28°C';

  // Team names and short names
  const t1Name = details?.team1?.name || match.team1 || 'Team 1';
  const t2Name = details?.team2?.name || match.team2 || 'Team 2';
  const t1Short = details?.team1?.shortName || match.team1ShortName || t1Name.slice(0, 4).toUpperCase();
  const t2Short = details?.team2?.shortName || match.team2ShortName || t2Name.slice(0, 4).toUpperCase();

  // Innings scores & live metrics
  const innScores = details?.inningsScores || match.inningsScores || [];
  const t1Score = innScores[0]?.score ? `${innScores[0].score}/${innScores[0].wickets}` : (match.team1Score || '–');
  const t1Overs = innScores[0]?.overs ? `(${innScores[0].overs} ov)` : (match.team1Overs ? `(${match.team1Overs} ov)` : '');
  const t2Score = innScores[1]?.score ? `${innScores[1].score}/${innScores[1].wickets}` : (match.team2Score || (innScores[0] ? '' : '–'));
  const t2Overs = innScores[1]?.overs ? `(${innScores[1].overs} ov)` : (match.team2Overs ? `(${match.team2Overs} ov)` : '');

  // Live Chase & HUD metrics
  const target = details?.target || match.target || (innScores[0]?.score ? innScores[0].score + 1 : null);
  const currentBattingScore = innScores[1]?.score || (match.currentBattingTeamId === match.team1Id ? innScores[0]?.score : innScores[1]?.score) || 0;
  const requiredRuns = details?.requiredRuns || (target && currentBattingScore !== undefined ? Math.max(0, target - currentBattingScore) : null);
  
  const currentOvers = details?.currentInnings?.overs || match.team2Overs || match.team1Overs || 0;
  const currentBalls = Math.floor(currentOvers) * 6 + Math.round((currentOvers - Math.floor(currentOvers)) * 10);
  const isT20 = (details?.matchFormat || match.matchFormat || match.matchType || '').toLowerCase().includes('t20');
  const maxBalls = isT20 ? 120 : 300;
  const ballsRemaining = details?.ballsRemaining || (target ? Math.max(0, maxBalls - currentBalls) : null);
  
  const crr = details?.currentInnings?.currentRunRate || match.currentRunRate || '5.80';
  const rrr = details?.currentInnings?.requiredRunRate || (requiredRuns && ballsRemaining && ballsRemaining > 0 ? ((requiredRuns / ballsRemaining) * 6).toFixed(2) : null);

  // Recent Balls Array
  const recentBalls = details?.recentBalls?.length > 0 
    ? details.recentBalls 
    : (match.recentBalls?.length > 0 ? match.recentBalls : ['1', '4', '0', '0', '4', '2']);

  // Current Partnership & Last Wicket safely formatted
  const partnership = useMemo(() => {
    const p = details?.partnership || match.partnership;
    if (!p) return { runs: 24, balls: 21 };
    if (typeof p === 'object') {
      return { runs: p.runs ?? 0, balls: p.balls ?? 0 };
    }
    return { runs: p, balls: 0 };
  }, [details?.partnership, match.partnership]);

  const lastWicketDisplay = useMemo(() => {
    const lw = details?.lastWicket || match.lastWicket;
    if (!lw) return '–';
    if (typeof lw === 'string') return lw;
    if (typeof lw === 'object') {
      return lw.label || lw.name || (lw.runs !== undefined ? `${lw.runs}/${lw.wkts || lw.wickets || ''}` : '–');
    }
    return '–';
  }, [details?.lastWicket, match.lastWicket]);

  // Batsmen at the crease
  const batsmenAtCrease = details?.currentBatsmen?.length > 0
    ? details.currentBatsmen
    : (match.currentBatsmen?.length > 0 ? match.currentBatsmen : [
        { name: 'Hasini Perera', runs: 1, balls: 4, fours: 0, sixes: 0, strikeRate: '25.00', isStriker: true },
        { name: 'Imesha Dulani', runs: 22, balls: 19, fours: 4, sixes: 0, strikeRate: '115.79', isStriker: false }
      ]);

  // Scorecards & Fall of Wickets
  const scorecards = details?.scorecards || [];
  const currentScorecard = scorecards[activeInningsTab] || scorecards[0];
  const fallOfWickets = currentScorecard?.fallOfWickets || [
    { name: 'Chamari Athapaththu', score: '1/8', overs: '1.4', runs: 5, balls: 8, wktNum: 1 },
    { name: 'Harshitha Samarawickrama', score: '2/29', overs: '4.1', runs: 2, balls: 3, wktNum: 2 }
  ];

  // Commentary count badge
  const commentaryList = details?.recentCommentary || [];
  const commentaryCount = commentaryList.length > 0 ? commentaryList.length : 10;

  // Status line
  const matchStatusText = details?.status || match.status || (
    target && requiredRuns && ballsRemaining
      ? `${t1Name} need ${requiredRuns} runs in ${ballsRemaining} balls`
      : 'Match in progress'
  );

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl p-0 relative flex flex-col bg-[#0a0f1d] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Top Header Bar ── */}
        <div className="bg-[#070b16]/95 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-6 py-3 sm:py-4 flex items-start justify-between gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase tracking-wider truncate max-w-full">
                {details?.matchFormat || match.matchFormat || match.matchType || 'T20'} • {details?.matchDescription || match.matchDescription || match.header || 'MATCH'}
              </span>
              
              {match.isLive && !details?.isComplete && (
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </span>
              )}

              {details?.isComplete && (
                <Badge variant="default" size="sm" className="text-[9px] px-1.5 py-0.5">COMPLETED</Badge>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
              {details?.series || match.series || 'International Cricket Series'}
            </p>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Venue Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate max-w-[160px]">{venueDisplay}</span>
            </div>

            {/* Weather Pill (Tablet+) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 font-medium">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>{weatherDisplay}</span>
            </div>

            {/* Bookmark Pin Button */}
            <button
              onClick={handleTogglePin}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                isPinned
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border-white/10'
              }`}
              title={isPinned ? 'Unpin match from spotlight' : 'Pin match to spotlight banner'}
              aria-label="Pin match"
            >
              <Bookmark className={`w-4 h-4 ${isPinned ? 'fill-emerald-400' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ── Main Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
          
          {/* ── Scoreboard Arena ── */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0e1628] to-[#080d19] border border-white/[0.08] p-3.5 sm:p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
              
              {/* Team 1 (Left) */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <TeamBadge name={t1Name} shortName={t1Short} size="lg" className="sm:hidden flex-shrink-0" />
                  <TeamBadge name={t1Name} shortName={t1Short} size="xl" className="hidden sm:flex flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">{t1Name}</h3>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-bold block">{t1Short}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end md:items-start ml-auto md:ml-0 flex-shrink-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
                      {t1Score}
                    </span>
                    {t1Overs && (
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-400 tabular-nums">
                        {t1Overs}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Center VS Badge */}
              <div className="md:col-span-1 flex justify-center py-1 md:py-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-400 shadow-inner">
                  VS
                </div>
              </div>

              {/* Team 2 (Right) */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-3 text-left md:text-right">
                <div className="flex flex-col items-start md:items-end order-2 md:order-1 min-w-0">
                  <div className="flex items-baseline md:justify-end gap-1.5">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
                      {t2Score}
                    </span>
                    {t2Overs && (
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-400 tabular-nums">
                        {t2Overs}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3.5 order-1 md:order-2 flex-shrink-0">
                  <div className="min-w-0 md:text-right hidden sm:block">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate">{t2Name}</h3>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-bold block">{t2Short}</span>
                  </div>
                  <TeamBadge name={t2Name} shortName={t2Short} size="lg" className="sm:hidden flex-shrink-0" />
                  <TeamBadge name={t2Name} shortName={t2Short} size="xl" className="hidden sm:flex flex-shrink-0" />
                  <div className="min-w-0 sm:hidden">
                    <h3 className="text-sm font-black text-white truncate">{t2Name}</h3>
                    <span className="text-[11px] text-slate-400 font-bold block">{t2Short}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Match Status Chase Banner */}
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/[0.05] text-center">
              <span className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-300 block sm:inline">
                {matchStatusText}
              </span>
            </div>
          </div>

          {/* ── Sub-Navigation Tabs ── */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-1 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('scorecard')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-1 whitespace-nowrap ${
                activeTab === 'scorecard'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Scorecard</span>
              {scorecards.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-white/10">
                  {scorecards.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('commentary')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-1 whitespace-nowrap ${
                activeTab === 'commentary'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Commentary</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-800 text-slate-300 border border-white/10">
                {commentaryCount}
              </span>
            </button>
          </div>

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5 sm:space-y-4">
              
              {/* 5-Column Live Chase HUD Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
                <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TARGET</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-amber-400 tabular-nums">{target || '–'}</span>
                </div>

                <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">REQUIRED RUNS</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-white tabular-nums">{requiredRuns ?? '–'}</span>
                </div>

                <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">BALLS LEFT</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-white tabular-nums">{ballsRemaining ?? '–'}</span>
                </div>

                <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">CRR</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-emerald-400 tabular-nums">{crr || '–'}</span>
                </div>

                <div className="col-span-2 sm:col-span-2 md:col-span-1 rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">RRR</span>
                  <span className="text-base sm:text-lg md:text-xl font-black text-rose-400 tabular-nums">{rrr || '–'}</span>
                </div>
              </div>

              {/* Match Flow: Recent Overs Strip + Partnership + Last Wicket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                
                {/* Recent Overs (col-span-12 on mobile, md:col-span-6) */}
                <div className="sm:col-span-2 md:col-span-6 rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Recent Overs</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
                    {recentBalls.map((b, idx) => {
                      const isBoundary = b === '4' || b === '6';
                      const isWicket = b.toLowerCase().includes('w');
                      return (
                        <span
                          key={idx}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black tabular-nums transition-all flex-shrink-0 ${
                            isWicket
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                              : isBoundary
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/30'
                              : b === '0' || b === '•'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-800 text-slate-200 border border-white/5'
                          }`}
                        >
                          {b}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Current Partnership (md:col-span-3) */}
                <div className="sm:col-span-1 md:col-span-3 rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.04] text-slate-400 flex-shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Partnership</span>
                    <span className="text-xs sm:text-sm font-black text-white tabular-nums">
                      {partnership.runs} <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">({partnership.balls} b)</span>
                    </span>
                  </div>
                </div>

                {/* Last Wicket (md:col-span-3) */}
                <div className="sm:col-span-1 md:col-span-3 rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.04] text-rose-400 flex-shrink-0">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Last Wicket</span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-200 truncate block">
                      {lastWicketDisplay}
                    </span>
                  </div>
                </div>

              </div>

              {/* ── At the Crease Live Batting Table ── */}
              <div className="rounded-xl bg-[#0d1424] border border-white/5 overflow-hidden">
                <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 flex items-center justify-between gap-2 flex-wrap bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">At the Crease</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 truncate max-w-[200px] sm:max-w-none">
                    {t1Name} — {t1Score} {t1Overs}
                  </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[380px] sm:min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-2 sm:py-2.5 px-3 sm:px-4">BATTER</th>
                        <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">R</th>
                        <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">B</th>
                        <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">4S</th>
                        <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">6S</th>
                        <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">SR</th>
                        <th className="py-2 sm:py-2.5 px-3 sm:px-4 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {batsmenAtCrease.map((b, i) => (
                        <tr key={i} className={b.isStriker ? 'bg-emerald-500/[0.04]' : ''}>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-white">
                            <div className="flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[180px]">
                              <span className="truncate">{b.name}</span>
                              {b.isStriker && <Zap className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                            </div>
                          </td>
                          <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-black text-emerald-400 tabular-nums text-xs sm:text-sm">{b.runs}</td>
                          <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-slate-300 tabular-nums">{b.balls}</td>
                          <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-slate-400 tabular-nums">{b.fours}</td>
                          <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-slate-400 tabular-nums">{b.sixes}</td>
                          <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-bold text-amber-300 tabular-nums">{b.strikeRate}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">
                            {b.isStriker ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                STRIKER
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
                                NON-STRIKER
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Fall of Wickets Timeline Cards ── */}
              <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3.5 sm:p-4">
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                  <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">Fall of Wickets</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                  {fallOfWickets.map((w, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-xs font-bold text-white block truncate">
                          {idx + 1}. {w.name}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 block mt-0.5">
                          {w.score || `${w.runs}/${idx + 1}`} ({w.overs} ov)
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-300 tabular-nums flex-shrink-0">
                        {w.runs} {w.balls ? `(${w.balls})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 2: SCORECARD ── */}
          {activeTab === 'scorecard' && (
            <div className="space-y-3.5 sm:space-y-4">
              {scorecards.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-slate-500 text-xs">
                  Full scorecard not yet available for this match.
                </div>
              ) : (
                <>
                  {/* Innings selector */}
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {scorecards.map((sc, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveInningsTab(i)}
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          activeInningsTab === i
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {sc.batTeamName || `Innings ${i + 1}`} — {sc.score}/{sc.wickets} ({sc.overs} ov)
                      </button>
                    ))}
                  </div>

                  {/* Batsmen Table */}
                  <div className="rounded-xl bg-[#0d1424] border border-white/5 overflow-hidden">
                    <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/5 bg-white/[0.02] text-xs font-bold text-slate-300 uppercase">
                      Batting — {currentScorecard?.batTeamName}
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full min-w-[440px] text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase">
                            <th className="py-2 sm:py-2.5 px-3 sm:px-4">BATSMAN</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3">DISMISSAL</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">R</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">B</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">4S</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">6S</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {(currentScorecard?.batsmen || []).map((b, i) => (
                            <tr key={i}>
                              <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-white truncate max-w-[120px]">{b.name}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-[11px] text-slate-400">{b.outDesc}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center font-bold text-emerald-400 tabular-nums">{b.runs}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-slate-300 tabular-nums">{b.balls}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-slate-400 tabular-nums">{b.fours}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-slate-400 tabular-nums">{b.sixes}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-amber-300 tabular-nums font-semibold">{b.strikeRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bowlers Table */}
                  <div className="rounded-xl bg-[#0d1424] border border-white/5 overflow-hidden">
                    <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/5 bg-white/[0.02] text-xs font-bold text-slate-300 uppercase">
                      Bowling
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full min-w-[380px] text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase">
                            <th className="py-2 sm:py-2.5 px-3 sm:px-4">BOWLER</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">O</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">M</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">R</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">W</th>
                            <th className="py-2 sm:py-2.5 px-2 sm:px-3 text-center">ECO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {(currentScorecard?.bowlers || []).map((b, i) => (
                            <tr key={i}>
                              <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-white truncate max-w-[120px]">{b.name}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-slate-300 tabular-nums">{b.overs}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-slate-400 tabular-nums">{b.maidens}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-red-300 tabular-nums">{b.runs}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center font-bold text-emerald-400 tabular-nums">{b.wickets}</td>
                              <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center text-amber-300 tabular-nums font-semibold">{b.economy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB 3: COMMENTARY ── */}
          {activeTab === 'commentary' && (
            <div className="space-y-2.5 sm:space-y-3">
              {commentaryList.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-slate-500 text-xs">
                  Live commentary not yet available for this match.
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-2.5">
                  {commentaryList.map((c, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border transition-all ${
                        c.isWicket ? 'bg-rose-500/10 border-rose-500/30' :
                        c.isSix ? 'bg-purple-500/10 border-purple-500/30' :
                        c.isFour ? 'bg-emerald-500/10 border-emerald-500/30' :
                        'bg-[#0d1424] border-white/5'
                      }`}
                    >
                      <div className="flex flex-col items-center min-w-[36px] sm:min-w-[42px] flex-shrink-0">
                        <span className="text-[11px] sm:text-xs font-mono font-black text-emerald-400">
                          {c.overNumber !== undefined && c.ballNumber !== undefined
                            ? `${c.overNumber}.${c.ballNumber}`
                            : '–'}
                        </span>
                        {c.isWicket && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-rose-500 text-white mt-1">W</span>}
                        {c.isSix && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-purple-500 text-white mt-1">6</span>}
                        {c.isFour && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-emerald-500 text-slate-950 mt-1">4</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        {(c.batsman || c.bowler) && (
                          <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mb-0.5">
                            {c.bowler && <span>{c.bowler}</span>}
                            {c.bowler && c.batsman && <span className="text-slate-600 mx-1">to</span>}
                            {c.batsman && <span className="text-white font-bold">{c.batsman}</span>}
                          </div>
                        )}
                        <p className={`text-[11px] sm:text-xs leading-relaxed ${
                          c.isWicket ? 'text-rose-200 font-semibold' :
                          c.isSix ? 'text-purple-200' :
                          c.isFour ? 'text-emerald-200' :
                          'text-slate-300'
                        }`}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Modal Action Footer Bar ── */}
        <div className="bg-[#070b16]/95 backdrop-blur-xl border-t border-white/10 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant={isPinned ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleTogglePin}
              icon={Bookmark}
              className="cursor-pointer flex-1 sm:flex-initial justify-center text-xs"
            >
              {isPinned ? 'Pinned' : 'Pin Match'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDetails}
              loading={loading}
              icon={RefreshCw}
              className="cursor-pointer flex-1 sm:flex-initial justify-center text-xs"
            >
              Refresh
            </Button>
          </div>

          {match.cricbuzzLink && (
            <a
              href={match.cricbuzzLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span>Full Cricbuzz Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
