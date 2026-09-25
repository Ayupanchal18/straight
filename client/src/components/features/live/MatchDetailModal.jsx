import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, MapPin, ExternalLink, RefreshCw, 
  Activity, Clock, ShieldCheck, TrendingUp,
  Zap, Target, MessageSquare, Award, BarChart3, ListFilter,
  Users, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import cricketApi from '../../../services/api';
import { TeamBadge, getTeamTheme, isMatchLive, isMatchComplete, isMatchUpcoming, getMatchVenue } from '../../../utils/teamUtils.jsx';

export const MatchDetailModal = ({ match, onClose, onRefreshScores }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'scorecard' | 'commentary'
  const [activeInningsTab, setActiveInningsTab] = useState(null);
  const [fowInningsTab, setFowInningsTab] = useState(null);

  const matchId = match.id || match.rawText;

  const fetchDetails = async (isSilent = false) => {
    if (!match.cricbuzzLink) {
      if (!isSilent) setLoading(false);
      return;
    }
    if (!isSilent && !details) setLoading(true);
    setError(null);
    try {
      const res = await cricketApi.getMatchDetails(match.cricbuzzLink);
      if (res && res.data) {
        setDetails(res.data);
      }
    } catch (err) {
      console.warn('Live match details fallback:', err.message);
      if (!details) {
        setError(err.message || 'Details currently loading...');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(false);

    // Auto-refresh match details and parent live scores every 15s if the match is live
    const isLive = isMatchLive(match) || match.isLive;
    if (!isLive) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDetails(true);
        if (onRefreshScores) onRefreshScores();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [match.cricbuzzLink, isMatchLive(match)]);

  const handleManualRefresh = async () => {
    if (onRefreshScores) onRefreshScores();
    await fetchDetails(false);
  };

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

  // Helper functions to guarantee all times are displayed in Indian Standard Time (IST)
  const formatTimeIST = (timeVal) => {
    if (!timeVal) return '';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';
    } catch {
      return '';
    }
  };

  const formatDateIST = (timeVal) => {
    if (!timeVal) return '';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Derive venue dynamically from match details, structured data, or series context
  const venueDisplay = getMatchVenue(details || match);

  // Team names and short names
  const t1Name = details?.team1?.name || match.team1 || 'Team 1';
  const t2Name = details?.team2?.name || match.team2 || 'Team 2';
  const t1Short = details?.team1?.shortName || match.team1ShortName || t1Name.slice(0, 4).toUpperCase();
  const t2Short = details?.team2?.shortName || match.team2ShortName || t2Name.slice(0, 4).toUpperCase();

  // Innings scores & live metrics accurately mapped by team identity
  const innScores = details?.inningsScores || match.inningsScores || [];
  const t1Id = details?.team1?.id || match.team1Id;
  const t2Id = details?.team2?.id || match.team2Id;

  const isTeam1Match = (inn) => {
    if (t1Id && inn.battingTeamId === t1Id) return true;
    if (inn.batTeamName && t1Name) {
      const cleanInn = inn.batTeamName.toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
      const cleanT1 = t1Name.toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
      return cleanInn === cleanT1 || cleanT1.includes(cleanInn) || cleanInn.includes(cleanT1);
    }
    return false;
  };

  const isTeam2Match = (inn) => {
    if (t2Id && inn.battingTeamId === t2Id) return true;
    if (inn.batTeamName && t2Name) {
      const cleanInn = inn.batTeamName.toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
      const cleanT2 = t2Name.toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
      return cleanInn === cleanT2 || cleanT2.includes(cleanInn) || cleanInn.includes(cleanT2);
    }
    return false;
  };

  const t1InningsList = innScores.filter(isTeam1Match);
  const t2InningsList = innScores.filter(isTeam2Match);

  const t1LatestInnings = t1InningsList.length > 0 ? t1InningsList[t1InningsList.length - 1] : null;
  const t2LatestInnings = t2InningsList.length > 0 ? t2InningsList[t2InningsList.length - 1] : null;

  // Helper to parse cricket overs to ball count for accurate comparison
  const parseOversToBalls = (ov) => {
    if (!ov) return 0;
    const str = String(ov).replace(/[^\d.]/g, '');
    const val = parseFloat(str) || 0;
    const whole = Math.floor(val);
    return whole * 6 + Math.round((val - whole) * 10);
  };

  const t1MatchOversBalls = parseOversToBalls(match.team1Overs);
  const t1DetailsOversBalls = parseOversToBalls(t1LatestInnings?.overs);

  let t1Score = '–';
  let t1Overs = '';

  if (t1MatchOversBalls >= t1DetailsOversBalls && match.team1Score) {
    t1Score = match.team1Score;
    t1Overs = match.team1Overs ? `(${match.team1Overs} ov)` : '';
  } else if (t1LatestInnings?.score !== undefined) {
    t1Score = `${t1LatestInnings.score}/${t1LatestInnings.wickets ?? 0}`;
    t1Overs = t1LatestInnings?.overs ? `(${t1LatestInnings.overs} ov)` : '';
  } else if (match.team1Score) {
    t1Score = match.team1Score;
    t1Overs = match.team1Overs ? `(${match.team1Overs} ov)` : '';
  } else if (innScores.length === 1 && !t2LatestInnings) {
    t1Score = `${innScores[0].score}/${innScores[0].wickets}`;
  }

  const t2MatchOversBalls = parseOversToBalls(match.team2Overs);
  const t2DetailsOversBalls = parseOversToBalls(t2LatestInnings?.overs);

  let t2Score = '–';
  let t2Overs = '';

  if (t2MatchOversBalls >= t2DetailsOversBalls && match.team2Score) {
    t2Score = match.team2Score;
    t2Overs = match.team2Overs ? `(${match.team2Overs} ov)` : '';
  } else if (t2LatestInnings?.score !== undefined) {
    t2Score = `${t2LatestInnings.score}/${t2LatestInnings.wickets ?? 0}`;
    t2Overs = t2LatestInnings?.overs ? `(${t2LatestInnings.overs} ov)` : '';
  } else if (match.team2Score) {
    t2Score = match.team2Score;
    t2Overs = match.team2Overs ? `(${match.team2Overs} ov)` : '';
  } else if (innScores.length === 2 && !t1LatestInnings) {
    t2Score = `${innScores[1].score}/${innScores[1].wickets}`;
  } else if (innScores.length > 0) {
    t2Score = '';
  }

  // Lifecycle state evaluation
  const isUpcoming = isMatchUpcoming(details || match) || (!details?.currentInnings && !match.isLive && (details?.status || match.status || '').toLowerCase().includes('starts at'));
  const isComplete = isMatchComplete(details || match);
  const isLive = !isUpcoming && !isComplete && isMatchLive(details || match);

  // Check if any innings has actually started
  const hasInningsStarted = !isUpcoming && (
    (innScores.length > 0 && innScores.some(inn => (inn.score || inn.overs || inn.wickets))) ||
    Boolean(details?.currentInnings && (details.currentInnings.score !== undefined || details.currentInnings.overs)) ||
    (t1Score !== '–' && t1Score !== '') ||
    (t2Score !== '–' && t2Score !== '') ||
    isLive ||
    isComplete
  );

  // Determine which team is actively batting (strictly only if play has started)
  const currentBattingTeamId = hasInningsStarted ? (details?.currentInnings?.battingTeamId || match.currentBattingTeamId) : null;
  const isTeam1Batting = hasInningsStarted && (
    (currentBattingTeamId && (currentBattingTeamId === t1Id || currentBattingTeamId === match.team1Id)) ||
    (!currentBattingTeamId && (t2Score === '–' || t2Score === ''))
  );
  const currentBattingTeamName = hasInningsStarted ? (isTeam1Batting ? t1Name : t2Name) : '';
  const currentBattingScoreDisplay = hasInningsStarted ? (isTeam1Batting ? `${t1Score} ${t1Overs}` : `${t2Score} ${t2Overs}`) : '';

  // Match Format evaluation
  const matchFormatString = `${details?.matchFormat || ''} ${match.matchFormat || ''} ${match.matchType || ''} ${match.header || ''} ${details?.matchDescription || ''}`.toLowerCase();
  const isTestMatch = matchFormatString.includes('test') || matchFormatString.includes('four-day') || matchFormatString.includes('three-day') || matchFormatString.includes('first-class') || matchFormatString.includes('fc');
  const isT20 = matchFormatString.includes('t20');
  const maxOvers = isT20 ? 20 : (isTestMatch ? null : 50);
  const maxBalls = maxOvers ? maxOvers * 6 : null;

  // Innings identification & Chase evaluation
  const currentInningsId = details?.currentInnings?.inningsId || (innScores.length > 0 ? innScores.length : 1);
  const isSecondInnings = hasInningsStarted && ((innScores.length >= 2) || (currentInningsId === 2) || Boolean(details?.target || match.target));
  const isChase = !isTestMatch && isSecondInnings && Boolean(details?.target || match.target || (innScores.length >= 2 && innScores[0]?.score));

  // Target and required runs ONLY apply during 2nd innings (chase)
  const target = isChase ? (details?.target || match.target || (innScores[0]?.score ? innScores[0].score + 1 : null)) : null;
  const currentBattingScore = isChase 
    ? (innScores[1]?.score ?? (isTeam1Batting ? t1LatestInnings?.score : t2LatestInnings?.score) ?? 0) 
    : ((isTeam1Batting ? t1LatestInnings?.score : t2LatestInnings?.score) ?? innScores[0]?.score ?? 0);
  const requiredRuns = isChase && target !== null ? (details?.requiredRuns ?? Math.max(0, target - currentBattingScore)) : null;

  const currentOversNum = hasInningsStarted ? (parseFloat(details?.currentInnings?.overs || (isTeam1Batting ? (t1MatchOversBalls > t1DetailsOversBalls ? match.team1Overs : t1LatestInnings?.overs) : (t2MatchOversBalls > t2DetailsOversBalls ? match.team2Overs : t2LatestInnings?.overs)) || 0) || 0) : 0;
  const currentOversFloor = Math.floor(currentOversNum);
  const currentBalls = currentOversFloor * 6 + Math.round((currentOversNum - currentOversFloor) * 10);
  const ballsRemaining = (isLive || isChase) && maxBalls ? Math.max(0, maxBalls - currentBalls) : null;
  const oversRemaining = ballsRemaining !== null ? `${Math.floor(ballsRemaining / 6)}.${ballsRemaining % 6}` : null;

  const currentRuns = currentBattingScore || 0;
  const crr = hasInningsStarted && currentBalls > 0 
    ? (details?.currentInnings?.currentRunRate ? String(details.currentInnings.currentRunRate) : (match.currentRunRate ? String(match.currentRunRate) : ((currentRuns / currentBalls) * 6).toFixed(2)))
    : null;

  const rrr = isChase && requiredRuns !== null && ballsRemaining && ballsRemaining > 0
    ? ((requiredRuns / ballsRemaining) * 6).toFixed(2)
    : (details?.currentInnings?.requiredRunRate ? String(details.currentInnings.requiredRunRate) : null);

  // Projected scores for 1st innings (strictly during active live 1st innings with play underway)
  const crrNum = currentBalls > 0 ? (currentRuns / currentBalls) * 6 : null;
  const projectedAtCRR = isLive && !isChase && maxBalls && ballsRemaining !== null && currentBalls >= 6 && crrNum 
    ? Math.round(currentRuns + (crrNum * ballsRemaining) / 6) 
    : null;
  const projectedAt6 = isLive && !isChase && maxBalls && ballsRemaining !== null && currentBalls > 0 
    ? Math.round(currentRuns + (6.0 * ballsRemaining) / 6) 
    : null;
  const projectedAt8 = isLive && !isChase && maxBalls && ballsRemaining !== null && currentBalls > 0 
    ? Math.round(currentRuns + (8.0 * ballsRemaining) / 6) 
    : null;

  // Recent Balls Array (strictly authentic data only - no fake fallback)
  const recentBalls = (!isUpcoming && details?.recentBalls?.length > 0)
    ? details.recentBalls 
    : (!isUpcoming && match.recentBalls?.length > 0 ? match.recentBalls : []);

  // Current Partnership (strictly authentic data only - no fake fallback)
  const partnership = useMemo(() => {
    if (isUpcoming || !hasInningsStarted) return null;
    const p = details?.partnership || match.partnership;
    if (!p) return null;
    if (typeof p === 'object') {
      const runs = p.runs ?? 0;
      const balls = p.balls ?? 0;
      if (runs === 0 && balls === 0 && !isLive) return null;
      return { runs, balls };
    }
    return typeof p === 'number' ? { runs: p, balls: 0 } : null;
  }, [details?.partnership, match.partnership, isUpcoming, hasInningsStarted, isLive]);

  // Last Wicket (strictly authentic data only)
  const lastWicketDisplay = useMemo(() => {
    if (isUpcoming || !hasInningsStarted) return null;
    const lw = details?.lastWicket || match.lastWicket;
    if (!lw) return null;
    if (typeof lw === 'string') return lw.trim() ? lw : null;
    if (typeof lw === 'object') {
      return lw.label || lw.name || (lw.runs !== undefined ? `${lw.runs}/${lw.wkts || lw.wickets || ''}` : null);
    }
    return null;
  }, [details?.lastWicket, match.lastWicket, isUpcoming, hasInningsStarted]);

  // Extract squad rosters from commentary if available
  const squadsFromCommentary = useMemo(() => {
    const squads = [];
    (details?.recentCommentary || []).forEach(c => {
      const text = c.text || '';
      if (text.includes('Squad:')) {
        const [teamPart, playersPart] = text.split('Squad:');
        const teamName = teamPart.trim();
        const players = playersPart ? playersPart.split(',').map(p => p.trim()).filter(Boolean) : [];
        if (teamName && players.length > 0) {
          squads.push({ teamName, players });
        }
      }
    });
    return squads;
  }, [details?.recentCommentary]);

  // Batsmen at the crease — prioritized by freshness between match polling & details
  const isMatchBatsmenNewer = (match.currentBatsmen?.length > 0) && (
    !details?.currentBatsmen?.length ||
    (t2MatchOversBalls > t2DetailsOversBalls || t1MatchOversBalls > t1DetailsOversBalls)
  );

  const batsmenAtCrease = isMatchBatsmenNewer
    ? match.currentBatsmen
    : (details?.currentBatsmen?.length > 0
        ? details.currentBatsmen
        : (match.currentBatsmen?.length > 0 ? match.currentBatsmen : []));

  // Available Scorecards & Innings Mapping
  const availableScorecards = useMemo(() => {
    const raw = details?.scorecards || [];
    const innList = details?.inningsScores || match.inningsScores || [];

    let list = [];
    if (raw.length > 0) {
      list = raw.map(sc => ({
        ...sc,
        shortName: sc.batTeamShortName || (sc.batTeamName ? sc.batTeamName.slice(0, 4).toUpperCase() : `INN ${sc.inningsId}`),
      }));
    } else if (innList.length > 0) {
      list = innList.map(inn => ({
        inningsId: inn.inningsId,
        batTeamId: inn.battingTeamId,
        batTeamName: inn.batTeamName || (inn.battingTeamId === t1Id ? t1Name : t2Name),
        shortName: (inn.battingTeamId === t1Id ? t1Short : t2Short) || inn.batTeamName?.slice(0, 4).toUpperCase() || `INN ${inn.inningsId}`,
        score: inn.score ?? 0,
        wickets: inn.wickets ?? 0,
        overs: inn.overs ?? 0,
        batsmen: [],
        bowlers: [],
        fallOfWickets: []
      }));
    }

    // Ensure all known innings from innList are present
    innList.forEach(inn => {
      const found = list.some(item => 
        item.inningsId === inn.inningsId || 
        (item.batTeamId && inn.battingTeamId && item.batTeamId === inn.battingTeamId) ||
        (item.batTeamName && inn.batTeamName && item.batTeamName.toLowerCase() === inn.batTeamName.toLowerCase())
      );
      if (!found) {
        list.push({
          inningsId: inn.inningsId,
          batTeamId: inn.battingTeamId,
          batTeamName: inn.batTeamName || (inn.battingTeamId === t1Id ? t1Name : t2Name),
          shortName: (inn.battingTeamId === t1Id ? t1Short : t2Short) || inn.batTeamName?.slice(0, 4).toUpperCase() || `INN ${inn.inningsId}`,
          score: inn.score ?? 0,
          wickets: inn.wickets ?? 0,
          overs: inn.overs ?? 0,
          batsmen: [],
          bowlers: [],
          fallOfWickets: []
        });
      }
    });

    if (list.length === 0) {
      list = [
        {
          inningsId: 1,
          batTeamId: t1Id,
          batTeamName: t1Name,
          shortName: t1Short,
          score: t1Score,
          wickets: 0,
          overs: t1Overs,
          batsmen: [],
          bowlers: [],
          fallOfWickets: []
        },
        {
          inningsId: 2,
          batTeamId: t2Id,
          batTeamName: t2Name,
          shortName: t2Short,
          score: t2Score,
          wickets: 0,
          overs: t2Overs,
          batsmen: [],
          bowlers: [],
          fallOfWickets: []
        }
      ];
    } else if (list.length === 1 && (t1Name || t2Name)) {
      const firstBatName = (list[0].batTeamName || '').toLowerCase();
      const isFirstT1 = firstBatName.includes(t1Name.toLowerCase()) || (t1Id && list[0].batTeamId === t1Id);
      const otherName = isFirstT1 ? t2Name : t1Name;
      const otherShort = isFirstT1 ? t2Short : t1Short;
      const otherScore = isFirstT1 ? t2Score : t1Score;
      const otherOvers = isFirstT1 ? t2Overs : t1Overs;
      const otherId = isFirstT1 ? t2Id : t1Id;

      list.push({
        inningsId: list[0].inningsId === 1 ? 2 : 1,
        batTeamId: otherId,
        batTeamName: otherName,
        shortName: otherShort,
        score: otherScore,
        wickets: 0,
        overs: otherOvers,
        batsmen: [],
        bowlers: [],
        fallOfWickets: []
      });
    }

    return list;
  }, [details?.scorecards, details?.inningsScores, match.inningsScores, t1Name, t2Name, t1Short, t2Short, t1Score, t2Score, t1Overs, t2Overs, t1Id, t2Id]);

  // Determine index of currently batting team's innings
  const currentBattingInningsIndex = useMemo(() => {
    if (!availableScorecards || availableScorecards.length === 0) return 0;

    // 1. Match by currentInnings inningsId
    if (details?.currentInnings?.inningsId) {
      const idx = availableScorecards.findIndex(sc => sc.inningsId === details.currentInnings.inningsId);
      if (idx !== -1) return idx;
    }

    // 2. Match by currentBattingTeamId
    const batTeamId = details?.currentInnings?.battingTeamId || match.currentBattingTeamId;
    if (batTeamId) {
      const idx = availableScorecards.findIndex(sc => sc.batTeamId === batTeamId || sc.inningsId === (batTeamId === t1Id ? 1 : 2));
      if (idx !== -1) return idx;
    }

    // 3. Match by currentBattingTeamName
    if (currentBattingTeamName) {
      const cleanBatting = currentBattingTeamName.toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
      const idx = availableScorecards.findIndex(sc => {
        const cleanSc = (sc.batTeamName || '').toLowerCase().replace(/ women| women's| men| u19/g, '').trim();
        return cleanSc && (cleanSc === cleanBatting || cleanBatting.includes(cleanSc) || cleanSc.includes(cleanBatting));
      });
      if (idx !== -1) return idx;
    }

    // 4. If 2nd innings is underway (isSecondInnings / target present) and we have >= 2 scorecards
    if (isSecondInnings && availableScorecards.length >= 2) {
      return 1;
    }

    return 0;
  }, [availableScorecards, details?.currentInnings, match.currentBattingTeamId, currentBattingTeamName, isSecondInnings, t1Id]);

  const scorecards = availableScorecards;
  const resolvedActiveInningsIndex = activeInningsTab !== null 
    ? Math.min(activeInningsTab, Math.max(0, availableScorecards.length - 1)) 
    : currentBattingInningsIndex;

  const resolvedFowIndex = fowInningsTab !== null 
    ? Math.min(fowInningsTab, Math.max(0, availableScorecards.length - 1)) 
    : currentBattingInningsIndex;

  const currentScorecard = availableScorecards[resolvedActiveInningsIndex] || availableScorecards[0];
  const selectedFowScorecard = availableScorecards[resolvedFowIndex] || availableScorecards[0];
  const fallOfWickets = selectedFowScorecard?.fallOfWickets || [];

  // Commentary count badge
  const commentaryList = details?.recentCommentary || [];
  const commentaryCount = commentaryList.length > 0 ? commentaryList.length : 10;

  // Status line (ensuring all timing is strictly in IST)
  const rawStatus = details?.status || match.status || (
    isChase && target && requiredRuns !== null && ballsRemaining !== null
      ? `${currentBattingTeamName} need ${requiredRuns} runs in ${ballsRemaining} balls`
      : 'Match in progress'
  );

  const matchStatusText = useMemo(() => {
    if (!rawStatus) return '';
    const ts = details?.matchStartTimestamp || match.matchStartTimestamp || details?.startTime || match.startTime;
    if (ts && /starts at/i.test(rawStatus) && (rawStatus.includes('GMT') || !rawStatus.includes('IST'))) {
      const dIST = formatDateIST(ts);
      const tIST = formatTimeIST(ts);
      if (dIST && tIST) return `Match starts at ${dIST}, ${tIST}`;
    }
    // Regex fallback for GMT in status string (e.g., "Sep 25, 00:00 GMT")
    const gmtMatch = rawStatus.match(/(starts at\s+)?([A-Za-z]+ \d+),?\s+(\d{1,2}:\d{2})\s*GMT/i);
    if (gmtMatch) {
      try {
        const d = new Date(`${gmtMatch[2]} ${new Date().getFullYear()} ${gmtMatch[3]} UTC`);
        if (!isNaN(d.getTime())) {
          const dIST = formatDateIST(d);
          const tIST = formatTimeIST(d);
          return rawStatus.replace(gmtMatch[0], `${gmtMatch[1] || ''}${dIST}, ${tIST}`);
        }
      } catch {}
    }
    return rawStatus;
  }, [rawStatus, details?.matchStartTimestamp, match.matchStartTimestamp, details?.startTime, match.startTime]);

  // ── Ball Bead helper (reused in bead strip) ──
  const BallBeadInner = ({ ball }) => {
    const b = String(ball ?? '').trim();
    if (b === '4') return <span className="bead bead-four">{b}</span>;
    if (b === '6') return <span className="bead bead-six">{b}</span>;
    if (b === 'W') return <span className="bead bead-wicket">W</span>;
    if (b === '0' || b === '.' || b === '') return <span className="bead bead-dot">·</span>;
    if (b === 'WD' || b === 'NB' || b === 'LB')
      return <span className="bead bead-extras" style={{ fontSize: '8px' }}>{b}</span>;
    return <span className="bead bead-run">{b}</span>;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >


      <div
        className="w-full max-w-4xl h-[96vh] sm:h-auto sm:max-h-[92vh] flex flex-col bg-navy-900 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ══════════════════════════════════════
            HEADER: Breadcrumb + Status + Actions
            ══════════════════════════════════════ */}
        <div className="flex-shrink-0 bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          {/* Left: breadcrumb + series */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Live</span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-slate-400 truncate max-w-[200px]">
                {details?.series || match.series || 'International Cricket'}
              </span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-slate-300 font-semibold truncate max-w-[140px] hidden sm:block">
                {t1Short} vs {t2Short}
              </span>
            </div>
            {/* Status badges */}
            {isLive && (
              <span className="badge-live flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            {isComplete && <span className="badge-result flex-shrink-0">RESULT</span>}
            {isUpcoming && <span className="badge-upcoming flex-shrink-0">UPCOMING</span>}
          </div>

          {/* Right: format + venue + refresh + close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Venue (desktop) */}
            {venueDisplay && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{venueDisplay}</span>
              </div>
            )}
            {/* Refresh */}
            <button
              onClick={handleManualRefresh}
              title="Refresh match data"
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* ══════════════════════════════════════
            MAIN SCROLLABLE BODY
            ══════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ── SCOREBOARD HERO ── */}
          <div className="bg-gradient-to-b from-navy-800 to-navy-900 border-b border-white/[0.06] px-4 sm:px-6 py-5 sm:py-6">

            {/* Tournament + Format info */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">
                {details?.matchFormat || match.matchFormat || match.matchType || 'T20'} •
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {details?.matchDescription || match.matchDescription || ''}
              </span>
            </div>

            {/* 3-col scoreboard: Team1 | VS | Team2 */}
            <div className="grid grid-cols-7 items-center gap-2">

              {/* Team 1 */}
              <div className="col-span-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <TeamBadge name={t1Name} shortName={t1Short} size="xl" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-white truncate">{t1Name}</span>
                      {isTeam1Batting && hasInningsStarted && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" title="Batting" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{t1Short}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="score-display text-2xl sm:text-3xl md:text-4xl font-black">{t1Score}</span>
                  {t1Overs && (
                    <span className="overs-display">({t1Overs.replace(/[()]/g, '')} ov)</span>
                  )}
                </div>
                {match.team1PrevScore && (
                  <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">& {match.team1PrevScore}</div>
                )}
                {isTeam1Batting && crr && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 mt-1 block">
                    CRR: {typeof crr === 'number' ? crr.toFixed(2) : crr}
                  </span>
                )}
              </div>

              {/* VS Center */}
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-navy-700 border border-white/[0.08] flex items-center justify-center text-[10px] font-black text-slate-500">
                  VS
                </div>
              </div>

              {/* Team 2 */}
              <div className="col-span-3 text-right">
                <div className="flex items-center justify-end gap-2.5 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isTeam1Batting && hasInningsStarted && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" title="Batting" />
                      )}
                      <span className="font-bold text-sm sm:text-base text-white truncate">{t2Name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{t2Short}</span>
                  </div>
                  <TeamBadge name={t2Name} shortName={t2Short} size="xl" />
                </div>
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="score-display text-2xl sm:text-3xl md:text-4xl font-black">{t2Score}</span>
                  {t2Overs && (
                    <span className="overs-display">({t2Overs.replace(/[()]/g, '')} ov)</span>
                  )}
                </div>
                {match.team2PrevScore && (
                  <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">& {match.team2PrevScore}</div>
                )}
                {!isTeam1Batting && hasInningsStarted && crr && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 mt-1 block">
                    CRR: {typeof crr === 'number' ? crr.toFixed(2) : crr}
                  </span>
                )}
              </div>
            </div>

            {/* ── Status Strip ── */}
            {matchStatusText && (
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-medium text-amber-300/90 flex-1">{matchStatusText}</p>
                {rrr && (
                  <span className="text-xs font-mono font-bold text-red-400 flex-shrink-0 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                    RRR: {rrr}
                  </span>
                )}
              </div>
            )}

            {/* ── Over Bead Strip ── */}
            {recentBalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.05]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recentBalls.map((b, i) => (
                    <BallBeadInner key={i} ball={b} />
                  ))}
                </div>
              </div>
            )}

            {/* ── 4-Cell Metrics Row: CRR | RRR | Target | Balls Left ── */}
            {hasInningsStarted && (crr || rrr || target || ballsRemaining) && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="metric-cell">
                  <span className="metric-value">{crr ? (typeof crr === 'number' ? crr.toFixed(2) : crr) : '–'}</span>
                  <span className="metric-label">CRR</span>
                </div>
                <div className="metric-cell">
                  <span className={`metric-value ${rrr ? 'text-red-400' : ''}`}>{rrr || '–'}</span>
                  <span className="metric-label">RRR</span>
                </div>
                <div className="metric-cell">
                  <span className="metric-value">{target || '–'}</span>
                  <span className="metric-label">Target</span>
                </div>
                <div className="metric-cell">
                  <span className="metric-value">{ballsRemaining !== null ? ballsRemaining : '–'}</span>
                  <span className="metric-label">Balls Left</span>
                </div>
              </div>
            )}
          </div>

          {/* ── TAB BAR ── */}
          <div className="flex items-center gap-0 border-b border-white/[0.07] bg-navy-900/80 px-3 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview',   label: 'Live',       icon: Activity },
              { id: 'scorecard',  label: 'Scorecard',  icon: ListFilter, badge: scorecards.length > 0 ? scorecards.length : null },
              { id: 'commentary', label: 'Commentary', icon: MessageSquare, badge: commentaryCount },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer -mb-px ${
                    isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.07] text-[9px] font-bold text-slate-400">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TAB CONTENT AREA ── */}
          <div className="p-4 sm:p-5 space-y-4">


          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5 sm:space-y-4">
              
              {/* ── 1. UPCOMING FIXTURE HUB (Pre-match state) ── */}
              {isUpcoming ? (
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Scheduled Start Banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/20 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                          <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                            Upcoming Match Fixture
                          </span>
                          <h4 className="text-sm sm:text-base font-extrabold text-white">
                            {matchStatusText || 'Scheduled to begin soon'}
                          </h4>
                        </div>
                      </div>

                      {(details?.startTime || match.startTime || details?.matchStartTimestamp || match.matchStartTimestamp) && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-right self-start sm:self-auto">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Start Time (IST)</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatTimeIST(details?.startTime || match.startTime || details?.matchStartTimestamp || match.matchStartTimestamp) || details?.startTimeIST || match.startTimeIST || 'Scheduled'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Match Information Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white truncate" title={venueDisplay}>
                        {venueDisplay}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Target className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {details?.matchFormat || match.matchFormat || match.matchType || 'T20'} {maxOvers ? `(${maxOvers} Overs)` : ''}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toss</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {details?.toss?.winner 
                          ? `${details.toss.winner} (${details.toss.decision || 'elected'})` 
                          : 'Toss yet to take place'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Series</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white truncate" title={details?.series || match.series}>
                        {details?.series || match.series || 'International Series'}
                      </p>
                    </div>
                  </div>

                  {/* Announced Squads (from Commentary / Match Details) */}
                  {squadsFromCommentary.length > 0 && (
                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
                          Announced Squads
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {squadsFromCommentary.map((sq, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                            <span className="text-xs font-bold text-emerald-400 block mb-2">
                              {sq.teamName} ({sq.players.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {sq.players.map((p, pIdx) => {
                                const isCap = p.includes('(c)');
                                const isWkt = p.includes('(w)');
                                return (
                                  <span 
                                    key={pIdx}
                                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                                      isCap 
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold' 
                                        : isWkt
                                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 font-bold'
                                        : 'bg-white/[0.04] text-slate-300 border-white/5'
                                    }`}
                                  >
                                    {p}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pre-Match Awaiting Notice */}
                  <div className="rounded-xl bg-[#0d1424] border border-white/5 p-4 sm:p-5 text-center flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2.5 text-emerald-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-white">Live Tracking Awaiting Match Start</h5>
                    <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                      Live ball-by-ball commentary, player crease tracking, fall of wickets, and real-time match analytics will activate automatically when play starts.
                    </p>
                  </div>
                </div>
              ) : isComplete ? (
                /* ── 2. COMPLETED MATCH SUMMARY ── */
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Match Result Banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-emerald-500/5 border border-emerald-500/20 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                          Match Result
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">
                          {matchStatusText || 'Match Completed'}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Innings Final Scores Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{t1Name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{t1Overs || '–'}</span>
                      </div>
                      <span className="text-lg font-black text-white tabular-nums">{t1Score}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0d1424] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{t2Name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{t2Overs || '–'}</span>
                      </div>
                      <span className="text-lg font-black text-white tabular-nums">{t2Score}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── 3. LIVE IN-PLAY MATCH EXPERIENCE ── */
                <>
                  {/* Live Chase HUD (2nd Innings) or Match Projection HUD (1st Innings) */}
                  {isChase ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
                      <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">TARGET</span>
                        <span className="text-base sm:text-lg md:text-xl font-black text-amber-400 tabular-nums">{target}</span>
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
                  ) : hasInningsStarted ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
                      <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">CURRENT RR (CRR)</span>
                        <span className="text-base sm:text-lg md:text-xl font-black text-emerald-400 tabular-nums">{crr || '–'}</span>
                      </div>

                      <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">OVERS LEFT</span>
                        <span className="text-base sm:text-lg md:text-xl font-black text-white tabular-nums">
                          {oversRemaining ? `${oversRemaining} ov` : (ballsRemaining !== null ? `${ballsRemaining} b` : '–')}
                        </span>
                      </div>

                      <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">PROJECTED (AT CRR)</span>
                        <span className="text-base sm:text-lg md:text-xl font-black text-amber-400 tabular-nums">{projectedAtCRR || '–'}</span>
                      </div>

                      <div className="rounded-xl bg-[#0d1424] border border-white/5 p-2.5 sm:p-3 text-center">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">PROJECTED (6.0 RPO)</span>
                        <span className="text-base sm:text-lg md:text-xl font-black text-sky-300 tabular-nums">{projectedAt6 || '–'}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Match Flow: Recent Overs Strip + Partnership + Last Wicket (Strictly authentic data only) */}
                  {(recentBalls.length > 0 || partnership !== null || lastWicketDisplay) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                      
                      {/* Recent Overs */}
                      {recentBalls.length > 0 && (
                        <div className={`${partnership && lastWicketDisplay ? 'sm:col-span-2 md:col-span-6' : 'sm:col-span-2 md:col-span-12'} rounded-xl bg-[#0d1424] border border-white/5 p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3`}>
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
                      )}

                      {/* Current Partnership */}
                      {partnership !== null && (
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
                      )}

                      {/* Last Wicket */}
                      {lastWicketDisplay && (
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
                      )}

                    </div>
                  )}

                  {/* ── At the Crease Live Batting Table (only if batsmen are at crease) ── */}
                  {batsmenAtCrease && batsmenAtCrease.length > 0 && (
                    <div className="rounded-xl bg-[#0d1424] border border-white/5 overflow-hidden">
                      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 flex items-center justify-between gap-2 flex-wrap bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                          <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">At the Crease</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 truncate max-w-[220px] sm:max-w-none">
                          {currentBattingTeamName} — {currentBattingScoreDisplay} {isChase && target ? `| Target ${target}` : ''}
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
                  )}
                </>
              )}

              {/* ── Fall of Wickets Timeline Section with Team Toggle (only when play has commenced) ── */}
              {!isUpcoming && availableScorecards.length > 0 && (
                <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                        <Target className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
                          Fall of Wickets
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                          • {selectedFowScorecard?.batTeamName || 'Innings'}
                        </span>
                      </div>
                    </div>

                    {/* Team / Innings Toggle Buttons */}
                    {availableScorecards.length > 1 && (
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-white/10 self-start sm:self-auto overflow-x-auto max-w-full">
                        {availableScorecards.map((sc, idx) => {
                          const isActive = resolvedFowIndex === idx;
                          const isLiveInnings = idx === currentBattingInningsIndex && isMatchLive(details || match);
                          const scWkts = sc.wickets ?? (sc.fallOfWickets?.length ?? 0);
                          const scRuns = sc.score ?? 0;

                          return (
                            <button
                              key={idx}
                              onClick={() => setFowInningsTab(idx)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                isActive
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/25 font-black'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span>{sc.shortName || sc.batTeamShortName || sc.batTeamName || `Inn ${idx + 1}`}</span>
                              <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-slate-400'
                              }`}>
                                {scRuns}/{scWkts}
                              </span>
                              {isLiveInnings && (
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-950 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Fall of wickets cards or empty state */}
                  {fallOfWickets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                      {fallOfWickets.map((w, idx) => (
                        <div 
                          key={idx}
                          className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2 hover:border-white/10 transition-colors"
                        >
                          <div className="min-w-0 pr-1">
                            <span className="text-xs font-bold text-white block truncate">
                              {w.wktNum || idx + 1}. {w.name}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 block mt-0.5">
                              {w.score || `${w.teamRuns || w.runs}/${w.wktNum || idx + 1}`} {w.overs ? `(${w.overs} ov)` : ''}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-extrabold text-slate-200 tabular-nums block">
                              {w.batterRuns !== null && w.batterRuns !== undefined 
                                ? `${w.batterRuns}` 
                                : (w.runs !== undefined ? `${w.runs}` : '–')}
                            </span>
                            {w.batterBalls !== null && w.batterBalls !== undefined && (
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {w.batterBalls} balls
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 px-4 rounded-xl bg-slate-900/40 border border-white/5 text-center flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">No wickets fallen yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                        {selectedFowScorecard?.batTeamName || 'This team'} is {selectedFowScorecard?.score ?? 0}/{selectedFowScorecard?.wickets ?? 0} {selectedFowScorecard?.overs ? `(${selectedFowScorecard.overs} ov)` : ''} without loss.
                      </p>
                      {availableScorecards.length > 1 && availableScorecards.some((sc, i) => i !== resolvedFowIndex && ((sc.wickets ?? 0) > 0 || (sc.fallOfWickets?.length ?? 0) > 0)) && (
                        <button
                          onClick={() => {
                            const otherIdx = availableScorecards.findIndex((sc, i) => i !== resolvedFowIndex && ((sc.wickets ?? 0) > 0 || (sc.fallOfWickets?.length ?? 0) > 0));
                            if (otherIdx !== -1) setFowInningsTab(otherIdx);
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 text-[11px] font-bold transition-all cursor-pointer border border-white/10"
                        >
                          <span>
                            View {availableScorecards.find((sc, i) => i !== resolvedFowIndex && ((sc.wickets ?? 0) > 0 || (sc.fallOfWickets?.length ?? 0) > 0))?.batTeamName || 'other team'}'s wickets
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── TAB 2: SCORECARD ── */}
          {activeTab === 'scorecard' && (
            <div className="space-y-3.5 sm:space-y-4">
              {isUpcoming || scorecards.length === 0 || scorecards.every(sc => (!sc.batsmen || sc.batsmen.length === 0) && (!sc.bowlers || sc.bowlers.length === 0)) ? (
                <div className="text-center py-12 sm:py-16 text-slate-400 rounded-xl bg-[#0d1424] border border-white/5 p-6">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs sm:text-sm font-bold text-white">Full Scorecard Awaiting Match Start</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    The official scorecard and player performances will be updated live once the match begins.
                  </p>
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
                          resolvedActiveInningsIndex === i
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

                  {/* Fall of Wickets for this scorecard */}
                  {currentScorecard?.fallOfWickets?.length > 0 && (
                    <div className="rounded-xl bg-[#0d1424] border border-white/5 p-3.5 sm:p-4">
                      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
                          Fall of Wickets — {currentScorecard.batTeamName}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                        {currentScorecard.fallOfWickets.map((w, idx) => (
                          <div 
                            key={idx}
                            className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="text-xs font-bold text-white block truncate">
                                {w.wktNum || idx + 1}. {w.name}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 block mt-0.5">
                                {w.score || `${w.teamRuns || w.runs}/${w.wktNum || idx + 1}`} {w.overs ? `(${w.overs} ov)` : ''}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-extrabold text-slate-200 tabular-nums block">
                                {w.batterRuns !== null && w.batterRuns !== undefined 
                                  ? `${w.batterRuns}` 
                                  : (w.runs !== undefined ? `${w.runs}` : '–')}
                              </span>
                              {w.batterBalls !== null && w.batterBalls !== undefined && (
                                <span className="text-[10px] text-slate-400 font-medium block">
                                  {w.batterBalls} balls
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  {commentaryList.map((c, i) => {
                    const hasBallMetric = c.overNumber !== undefined && c.ballNumber !== undefined;
                    const isWicketEvent = Boolean(c.isWicket && (hasBallMetric || c.event === 'WICKET'));
                    const isSixEvent = Boolean(c.isSix && hasBallMetric);
                    const isFourEvent = Boolean(c.isFour && hasBallMetric);

                    return (
                      <div 
                        key={i} 
                        className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border transition-all ${
                          isWicketEvent ? 'bg-rose-500/10 border-rose-500/30' :
                          isSixEvent ? 'bg-purple-500/10 border-purple-500/30' :
                          isFourEvent ? 'bg-emerald-500/10 border-emerald-500/30' :
                          'bg-[#0d1424] border-white/5'
                        }`}
                      >
                        <div className="flex flex-col items-center min-w-[36px] sm:min-w-[42px] flex-shrink-0">
                          {hasBallMetric ? (
                            <span className="text-[11px] sm:text-xs font-mono font-black text-emerald-400">
                              {`${c.overNumber}.${c.ballNumber}`}
                            </span>
                          ) : (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-400/90 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                              INFO
                            </span>
                          )}
                          {isWicketEvent && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-rose-500 text-white mt-1">W</span>}
                          {isSixEvent && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-purple-500 text-white mt-1">6</span>}
                          {isFourEvent && <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-emerald-500 text-slate-950 mt-1">4</span>}
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
                          isWicketEvent ? 'text-rose-200 font-semibold' :
                          isSixEvent ? 'text-purple-200' :
                          isFourEvent ? 'text-emerald-200' :
                          'text-slate-300'
                        }`}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          )}

          </div>{/* ── end tab content area div ── */}
        </div>{/* ── end scrollable body div ── */}

        {/* ── FOOTER BAR ── */}
        <div className="flex-shrink-0 bg-navy-950/80 backdrop-blur-xl border-t border-white/[0.07] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualRefresh}
              loading={loading}
              icon={RefreshCw}
              className="cursor-pointer text-xs"
            >
              Refresh
            </Button>
          </div>

          {match.cricbuzzLink && (
            <a
              href={match.cricbuzzLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Full Scorecard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
