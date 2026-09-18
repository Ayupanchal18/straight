import React, { useState } from 'react';
import { Scale, ArrowRight, User, AlertCircle, Sparkles, Trophy } from 'lucide-react';
import cricketApi from '../../../services/api';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { TeamBadge } from '../../../utils/teamUtils.jsx';
import { StatRadarChart } from '../players/StatRadarChart';
import { useSEO } from '../../../hooks/useSEO';

export const PlayerCompare = ({ defaultPlayer1 = 'Virat Kohli', defaultPlayer2 = 'Rohit Sharma' }) => {
  const [player1Name, setPlayer1Name] = useState(defaultPlayer1);
  const [player2Name, setPlayer2Name] = useState(defaultPlayer2);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('odi'); // 'test', 'odi', 't20', 'ipl'
  const [mode, setMode] = useState('batting'); // 'batting', 'bowling'

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

  const p1 = comparisonData?.player1;
  const p2 = comparisonData?.player2;

  const formats = ['test', 'odi', 't20', 'ipl'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Comparison Selector Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1628] via-[#0b1120] to-[#070b14] border border-white/[0.08] shadow-2xl p-6 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Head-to-Head Player Comparison</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Compare Cricket Legends & Stars
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Side-by-side performance analytics, batting averages, strike rates, bowling figures, and official ICC rankings.
          </p>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center pt-2 max-w-xl mx-auto">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="First Player (e.g. Virat Kohli)"
                className="w-full px-4 py-2.5 bg-[#080d1a] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="text-center font-black text-emerald-400 text-sm">VS</div>

            <div className="sm:col-span-2">
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Second Player (e.g. Rohit Sharma)"
                className="w-full px-4 py-2.5 bg-[#080d1a] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              loading={loading}
              onClick={() => handleCompare()}
              icon={Scale}
              className="px-8 cursor-pointer"
            >
              Compare Now
            </Button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="sports-card p-4 border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
          <Button size="sm" variant="danger" onClick={() => handleCompare()}>Retry</Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      )}

      {/* Comparison Results */}
      {p1 && p2 && !loading && (
        <div className="space-y-6">
          {/* Top Player Cards Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player 1 Card */}
            <div className="sports-card p-5 border-emerald-500/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#080d1a] p-1 border border-emerald-500/40 flex-shrink-0 overflow-hidden">
                  {p1.image ? (
                    <img 
                      src={p1.image} 
                      alt={p1.name} 
                      loading="lazy"
                      decoding="async"
                      width="64"
                      height="64"
                      className="w-full h-full object-cover object-top rounded-lg" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500 m-auto mt-3" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TeamBadge name={p1.country} size="xs" />
                    <span className="text-xs text-emerald-400 font-bold">{p1.country}</span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{p1.role}</span>
                  </div>
                  <h3 className="text-xl font-black text-white truncate">{p1.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bat: {p1.personalInfo?.battingStyle || '-'}</p>
                </div>
              </div>
            </div>

            {/* Player 2 Card */}
            <div className="sports-card p-5 border-sky-500/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#080d1a] p-1 border border-sky-500/40 flex-shrink-0 overflow-hidden">
                  {p2.image ? (
                    <img 
                      src={p2.image} 
                      alt={p2.name} 
                      loading="lazy"
                      decoding="async"
                      width="64"
                      height="64"
                      className="w-full h-full object-cover object-top rounded-lg" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-500 m-auto mt-3" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TeamBadge name={p2.country} size="xs" />
                    <span className="text-xs text-sky-400 font-bold">{p2.country}</span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{p2.role}</span>
                  </div>
                  <h3 className="text-xl font-black text-white truncate">{p2.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bat: {p2.personalInfo?.battingStyle || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Format:</span>
              <div className="flex items-center bg-pitch-900 p-1 rounded-xl border border-slate-700">
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      format === fmt ? 'bg-cricket-500 text-pitch-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Metric:</span>
              <div className="flex items-center bg-pitch-900 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setMode('batting')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'batting' ? 'bg-cricket-500 text-pitch-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Batting
                </button>
                <button
                  onClick={() => setMode('bowling')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'bowling' ? 'bg-cricket-500 text-pitch-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bowling
                </button>
              </div>
            </div>
          </div>

          {/* Radar & Visual Comparison */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase mb-4 text-center">
              Comparative Analysis ({format.toUpperCase()})
            </h3>
            <StatRadarChart player1={p1} player2={p2} format={format} mode={mode} />
          </div>

          {/* Comparison Detailed Table */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-white mb-4">Metric by Metric Breakdown</h3>
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="py-3 px-4 text-cricket-400 font-bold">{p1.name}</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-300">Statistic ({format.toUpperCase()})</th>
                  <th className="py-3 px-4 text-right text-sky-400 font-bold">{p2.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
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
                      ];

                      return metrics.map((m, idx) => {
                        const v1 = parseFloat(m.val1) || 0;
                        const v2 = parseFloat(m.val2) || 0;
                        const p1Better = m.higherBetter && v1 > v2;
                        const p2Better = m.higherBetter && v2 > v1;

                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className={`py-3 px-4 font-semibold ${p1Better ? 'text-cricket-400 font-bold' : 'text-slate-200'}`}>
                              {m.val1 || '-'} {p1Better && '👑'}
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-slate-400">
                              {m.label}
                            </td>
                            <td className={`py-3 px-4 text-right font-semibold ${p2Better ? 'text-sky-400 font-bold' : 'text-slate-200'}`}>
                              {p2Better && '👑 '} {m.val2 || '-'}
                            </td>
                          </tr>
                        );
                      });
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
                        { label: '5 Wicket Hauls', val1: s1.five_wickets, val2: s2.five_wickets, higherBetter: true },
                      ];

                      return metrics.map((m, idx) => {
                        const v1 = parseFloat(m.val1) || 0;
                        const v2 = parseFloat(m.val2) || 0;
                        const p1Better = (m.higherBetter && v1 > v2) || (m.lowerBetter && v1 > 0 && (v1 < v2 || v2 === 0));
                        const p2Better = (m.higherBetter && v2 > v1) || (m.lowerBetter && v2 > 0 && (v2 < v1 || v1 === 0));

                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className={`py-3 px-4 font-semibold ${p1Better ? 'text-cricket-400 font-bold' : 'text-slate-200'}`}>
                              {m.val1 || '-'} {p1Better && '👑'}
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-slate-400">
                              {m.label}
                            </td>
                            <td className={`py-3 px-4 text-right font-semibold ${p2Better ? 'text-sky-400 font-bold' : 'text-slate-200'}`}>
                              {p2Better && '👑 '} {m.val2 || '-'}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
