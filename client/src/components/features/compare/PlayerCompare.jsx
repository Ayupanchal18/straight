import React, { useState, useEffect } from 'react';
import { Scale, ArrowRight, User, AlertCircle, Sparkles, Trophy, BarChart3, Zap, Target } from 'lucide-react';
import cricketApi from '../../../services/api';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { TeamBadge } from '../../../utils/teamUtils.jsx';
import { StatRadarChart } from '../players/StatRadarChart';
import { useSEO } from '../../../hooks/useSEO';

// Horizontal Comparison Row Component (Screen 5 style)
const CompareBarRow = ({ label, val1, val2, higherBetter = true, lowerBetter = false }) => {
  const num1 = parseFloat(val1) || 0;
  const num2 = parseFloat(val2) || 0;
  const max = Math.max(num1, num2);

  // Proportional percentages (relative to max, or 50/50 if zero)
  const pct1 = max > 0 ? (num1 / max) * 100 : 0;
  const pct2 = max > 0 ? (num2 / max) * 100 : 0;

  const p1Wins = (higherBetter && num1 > num2) || (lowerBetter && num1 > 0 && (num1 < num2 || num2 === 0));
  const p2Wins = (higherBetter && num2 > num1) || (lowerBetter && num2 > 0 && (num2 < num1 || num1 === 0));

  return (
    <div className="py-3 px-3 sm:px-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/5 last:border-b-0">
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
        {/* Player 1 Value (Left) */}
        <div className="col-span-2 text-right">
          <span className={`text-xs sm:text-sm font-black font-mono tabular-nums ${
            p1Wins ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {val1 !== undefined && val1 !== null && val1 !== '' ? val1 : '-'}
          </span>
        </div>

        {/* Player 1 Bar (goes towards center, flex-end) */}
        <div className="col-span-3 flex justify-end">
          <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden flex justify-end border border-slate-200 dark:border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                p1Wins ? 'bg-blue-600 dark:bg-blue-500 shadow-sm' : 'bg-blue-400/40'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, pct1))}%` }}
            />
          </div>
        </div>

        {/* Label (Center) */}
        <div className="col-span-2 text-center">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            {label}
          </span>
        </div>

        {/* Player 2 Bar (goes away from center, flex-start) */}
        <div className="col-span-3 flex justify-start">
          <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden flex justify-start border border-slate-200 dark:border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                p2Wins ? 'bg-sky-500 dark:bg-sky-400 shadow-sm' : 'bg-sky-400/40'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, pct2))}%` }}
            />
          </div>
        </div>

        {/* Player 2 Value (Right) */}
        <div className="col-span-2 text-left">
          <span className={`text-xs sm:text-sm font-black font-mono tabular-nums ${
            p2Wins ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {val2 !== undefined && val2 !== null && val2 !== '' ? val2 : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PlayerCompare = ({ defaultPlayer1 = 'Virat Kohli', defaultPlayer2 = 'Babar Azam' }) => {
  const [player1Name, setPlayer1Name] = useState(defaultPlayer1);
  const [player2Name, setPlayer2Name] = useState(defaultPlayer2);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('odi'); // 'test', 'odi', 't20', 'ipl'
  const [mode, setMode] = useState('batting'); // 'batting', 'bowling'
  const [viewType, setViewType] = useState('bars'); // 'bars' | 'radar'

  useSEO({
    title: player1Name && player2Name 
      ? `${player1Name} vs ${player2Name} Head-to-Head Cricket Stats Comparison | CricketHub`
      : 'Compare Cricket Players Head to Head | CricketHub',
    description: `Side-by-side batting & bowling career analytics comparing ${player1Name} and ${player2Name}. Batting averages, strike rates, centuries, economy rates, and radar visualizer.`,
    keywords: `${player1Name} vs ${player2Name}, cricket player comparison, head to head stats, cricket analytics`,
  });

  const handleCompare = async (p1 = player1Name, p2 = player2Name) => {
    if (!p1.trim() || !p2.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await cricketApi.comparePlayers(p1.trim(), p2.trim());
      if (res && res.data) {
        setComparisonData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to compare players. Please check names.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCompare(defaultPlayer1, defaultPlayer2);
  }, []);

  const p1 = comparisonData?.player1;
  const p2 = comparisonData?.player2;

  const formats = [
    { key: 'test', label: 'Test' },
    { key: 'odi', label: 'ODI' },
    { key: 't20', label: 'T20I' },
    { key: 'ipl', label: 'IPL / T20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Selector / Header Bar (Screen 5 style) ── */}
      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Head-to-Head Player Comparison</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            Compare Cricket Legends & Stars
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Direct statistical comparison across international formats with normalized comparative indicators.
          </p>

          {/* Dual Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center pt-2 max-w-2xl mx-auto">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1 (e.g. Virat Kohli)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            <div className="text-center font-black text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-mono py-1">
              VS
            </div>

            <div className="sm:col-span-2">
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2 (e.g. Babar Azam)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="md"
              loading={loading}
              onClick={() => handleCompare()}
              icon={Scale}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 shadow-md shadow-blue-500/20"
            >
              Compare Players
            </Button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-300 flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
          <Button size="sm" variant="danger" onClick={() => handleCompare()}>Retry</Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}

      {/* Comparison Results */}
      {p1 && p2 && !loading && (
        <div className="space-y-6">
          
          {/* Side-by-Side Player Showcase Cards (Screen 5 style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 Card */}
            <div className="bg-white dark:bg-[#0b1120] border border-blue-500/30 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 dark:bg-[#070b14] border border-blue-500/40 flex-shrink-0 overflow-hidden relative">
                {p1.image ? (
                  <img 
                    src={p1.image} 
                    alt={p1.name} 
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                    className="w-full h-full object-cover object-top" 
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400 dark:text-slate-500 m-auto mt-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <TeamBadge name={p1.country} size="xs" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{p1.country}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{p1.role}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate font-display">{p1.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {p1.personalInfo?.battingStyle || 'Right-handed'} • {p1.personalInfo?.bowlingStyle || 'Bowler'}
                </p>
              </div>
            </div>

            {/* Player 2 Card */}
            <div className="bg-white dark:bg-[#0b1120] border border-sky-400/30 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-xl flex items-center gap-4 transition-colors">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 dark:bg-[#070b14] border border-sky-400/40 flex-shrink-0 overflow-hidden relative">
                {p2.image ? (
                  <img 
                    src={p2.image} 
                    alt={p2.name} 
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                    className="w-full h-full object-cover object-top" 
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400 dark:text-slate-500 m-auto mt-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <TeamBadge name={p2.country} size="xs" />
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-bold">{p2.country}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{p2.role}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate font-display">{p2.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {p2.personalInfo?.battingStyle || 'Right-handed'} • {p2.personalInfo?.bowlingStyle || 'Bowler'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Bar: Format Pills & Mode & View Toggle */}
          <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm dark:shadow-xl transition-colors">
            {/* Format selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Format:</span>
              <div className="flex items-center bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-white/10">
                {formats.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      format === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discipline & View Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setMode('batting')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                    mode === 'batting' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Batting</span>
                </button>
                <button
                  onClick={() => setMode('bowling')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                    mode === 'bowling' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-3 h-3" />
                  <span>Bowling</span>
                </button>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setViewType('bars')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    viewType === 'bars' ? 'bg-slate-200 dark:bg-white/15 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Bars
                </button>
                <button
                  onClick={() => setViewType('radar')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    viewType === 'radar' ? 'bg-slate-200 dark:bg-white/15 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Radar
                </button>
              </div>
            </div>
          </div>

          {/* View: Horizontal Comparison Bars (Screen 5 style) */}
          {viewType === 'bars' && (
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
              <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Career Comparison ({format.toUpperCase()})
                </h3>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    {p1.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    {p2.name}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {mode === 'batting' ? (
                  <>
                    {(() => {
                      const s1 = p1.batting_stats?.[format] || {};
                      const s2 = p2.batting_stats?.[format] || {};
                      const metrics = [
                        { label: 'Matches', val1: s1.matches, val2: s2.matches },
                        { label: 'Innings', val1: s1.innings, val2: s2.innings },
                        { label: 'Total Runs', val1: s1.runs, val2: s2.runs, higherBetter: true },
                        { label: 'Batting Average', val1: s1.average, val2: s2.average, higherBetter: true },
                        { label: 'Strike Rate', val1: s1.strike_rate, val2: s2.strike_rate, higherBetter: true },
                        { label: 'Highest Score', val1: s1.highest_score, val2: s2.highest_score },
                        { label: 'Centuries (100s)', val1: s1.hundreds, val2: s2.hundreds, higherBetter: true },
                        { label: 'Fifties (50s)', val1: s1.fifties, val2: s2.fifties, higherBetter: true },
                        { label: 'Boundaries (4s)', val1: s1.fours, val2: s2.fours, higherBetter: true },
                        { label: 'Sixes (6s)', val1: s1.sixes, val2: s2.sixes, higherBetter: true },
                      ];

                      return metrics.map((m, idx) => (
                        <CompareBarRow
                          key={idx}
                          label={m.label}
                          val1={m.val1}
                          val2={m.val2}
                          higherBetter={m.higherBetter}
                        />
                      ));
                    })()}
                  </>
                ) : (
                  <>
                    {(() => {
                      const s1 = p1.bowling_stats?.[format] || {};
                      const s2 = p2.bowling_stats?.[format] || {};
                      const metrics = [
                        { label: 'Matches', val1: s1.matches, val2: s2.matches },
                        { label: 'Balls Bowled', val1: s1.balls, val2: s2.balls },
                        { label: 'Wickets Taken', val1: s1.wickets, val2: s2.wickets, higherBetter: true },
                        { label: 'Economy Rate', val1: s1.economy, val2: s2.economy, lowerBetter: true },
                        { label: 'Bowling Average', val1: s1.average, val2: s2.average, lowerBetter: true },
                        { label: 'Best Bowling (BBI)', val1: s1.best_bowling_innings, val2: s2.best_bowling_innings },
                        { label: '5-Wicket Hauls', val1: s1.five_wickets, val2: s2.five_wickets, higherBetter: true },
                      ];

                      return metrics.map((m, idx) => (
                        <CompareBarRow
                          key={idx}
                          label={m.label}
                          val1={m.val1}
                          val2={m.val2}
                          higherBetter={m.higherBetter}
                          lowerBetter={m.lowerBetter}
                        />
                      ));
                    })()}
                  </>
                )}
              </div>
            </div>
          )}

          {/* View: Radar Chart */}
          {viewType === 'radar' && (
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-xl transition-colors">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-center mb-4 font-display">
                Spider Radar Model ({format.toUpperCase()})
              </h3>
              <div className="max-w-xl mx-auto">
                <StatRadarChart player1={p1} player2={p2} format={format} mode={mode} />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
