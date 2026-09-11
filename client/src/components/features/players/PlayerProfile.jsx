import React, { useState } from 'react';
import { 
  Trophy, 
  Bookmark, 
  Activity, 
  User, 
  Award, 
  Calendar, 
  MapPin, 
  Zap,
  Target,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useFavorites } from '../../../context/FavoritesContext';
import { TeamBadge, getTeamTheme } from '../../../utils/teamUtils.jsx';
import { StatRadarChart } from './StatRadarChart';

export const PlayerProfile = ({ player, onCompareWithThisPlayer }) => {
  const [activeFormat, setActiveFormat] = useState('odi'); // 'test', 'odi', 't20', 'ipl'
  const [statTab, setStatTab] = useState('batting'); // 'batting', 'bowling'
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (!player) return null;

  const isFav = isFavorite('player', player.name);

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(player.name);
    } else {
      addFavorite({
        type: 'player',
        identifier: player.name,
        name: player.name,
        subtitle: `${player.country} • ${player.role}`,
        image: player.image,
        meta: player,
      });
    }
  };

  const formats = [
    { key: 'test', label: 'Test' },
    { key: 'odi', label: 'ODI' },
    { key: 't20', label: 'T20I' },
    { key: 'ipl', label: 'IPL / T20' }
  ];

  const countryTheme = getTeamTheme(player.country || 'International');

  const b = player.batting_stats?.[activeFormat] || {};
  const bw = player.bowling_stats?.[activeFormat] || {};

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Player Spotlight Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1628] via-[#0b1120] to-[#070b14] border border-white/[0.08] shadow-2xl p-6 sm:p-8">
        {/* Pitch / Spotlight glow effects */}
        <div className="absolute top-0 left-1/4 w-80 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
          
          {/* Avatar / Portrait */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#080d1a] p-1 border-2 border-emerald-500/30 shadow-2xl overflow-hidden flex items-center justify-center group">
              {player.image ? (
                <img
                  src={player.image}
                  alt={player.name}
                  loading="lazy"
                  decoding="async"
                  width="144"
                  height="144"
                  className="w-full h-full object-cover object-top rounded-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-14 h-14 text-slate-500" />
              )}
            </div>

            {/* Country Pill Overlay */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:-right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d1424] border border-white/10 shadow-lg whitespace-nowrap">
              <TeamBadge name={player.country} size="xs" />
              <span className="text-[11px] font-bold text-slate-200">{player.country}</span>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {player.role || 'Cricketer'}
                  </span>
                  {player.personalInfo?.height && player.personalInfo.height !== '-' && (
                    <span className="text-[11px] font-medium text-slate-400">
                      • {player.personalInfo.height}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  {player.name}
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap">
                <Button
                  variant={isFav ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={toggleFavorite}
                  icon={Bookmark}
                  className="cursor-pointer"
                >
                  {isFav ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>

                {onCompareWithThisPlayer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCompareWithThisPlayer(player.name)}
                    className="cursor-pointer"
                  >
                    Compare
                  </Button>
                )}

                {player.cricbuzzUrl && (
                  <a
                    href={player.cricbuzzUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
                    title="View on Cricbuzz"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Personal Bio Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {player.personalInfo?.born && player.personalInfo.born !== '-' && (
                <div className="stat-pill p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Born</span>
                  <span className="text-xs font-semibold text-white truncate block">{player.personalInfo.born}</span>
                </div>
              )}
              {player.personalInfo?.birthPlace && player.personalInfo.birthPlace !== '-' && (
                <div className="stat-pill p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Birth Place</span>
                  <span className="text-xs font-semibold text-white truncate block">{player.personalInfo.birthPlace}</span>
                </div>
              )}
              {player.personalInfo?.battingStyle && player.personalInfo.battingStyle !== '-' && (
                <div className="stat-pill p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Batting</span>
                  <span className="text-xs font-semibold text-emerald-300 truncate block">{player.personalInfo.battingStyle}</span>
                </div>
              )}
              {player.personalInfo?.bowlingStyle && player.personalInfo.bowlingStyle !== '-' && (
                <div className="stat-pill p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bowling</span>
                  <span className="text-xs font-semibold text-sky-300 truncate block">{player.personalInfo.bowlingStyle}</span>
                </div>
              )}
            </div>

            {/* Major Teams Tags */}
            {player.personalInfo?.teams?.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teams:</span>
                {player.personalInfo.teams.slice(0, 6).map((tm, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-white/5 text-slate-300 font-medium"
                  >
                    {tm}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── ICC Rankings Section ── */}
      {player.rankings && (
        <div className="sports-card p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Official ICC Rankings</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Test Batting</span>
              <span className="text-base font-black text-emerald-400 tabular-nums">#{player.rankings.batting?.test || '--'}</span>
            </div>
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">ODI Batting</span>
              <span className="text-base font-black text-emerald-400 tabular-nums">#{player.rankings.batting?.odi || '--'}</span>
            </div>
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">T20I Batting</span>
              <span className="text-base font-black text-emerald-400 tabular-nums">#{player.rankings.batting?.t20 || '--'}</span>
            </div>
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Test Bowling</span>
              <span className="text-base font-black text-sky-400 tabular-nums">#{player.rankings.bowling?.test || '--'}</span>
            </div>
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">ODI Bowling</span>
              <span className="text-base font-black text-sky-400 tabular-nums">#{player.rankings.bowling?.odi || '--'}</span>
            </div>
            <div className="stat-pill p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">T20I Bowling</span>
              <span className="text-base font-black text-sky-400 tabular-nums">#{player.rankings.bowling?.t20 || '--'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Career Statistics & Radar Analytics ── */}
      <div className="sports-card p-6 space-y-6">
        
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Career Performance Statistics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Authoritative international match records across all formats</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Batting vs Bowling Toggle */}
            <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setStatTab('batting')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  statTab === 'batting' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Batting</span>
              </button>
              <button
                onClick={() => setStatTab('bowling')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  statTab === 'bowling' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Bowling</span>
              </button>
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-white/10">
              {formats.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFormat(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeFormat === key ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Radar / Visual Analytics + Stat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Visual Radar Column (approx 35%) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/[0.06] pb-6 lg:pb-0 lg:pr-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Performance Profile ({activeFormat.toUpperCase()})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300">
                {statTab.toUpperCase()}
              </span>
            </div>
            <StatRadarChart player1={player} format={activeFormat} mode={statTab} />
          </div>

          {/* Comprehensive Stats Matrix (approx 65%) */}
          <div className="lg:col-span-8">
            {statTab === 'batting' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Matches / Innings</span>
                  <span className="text-xl font-black text-white tabular-nums">
                    {b.matches || '-'} <span className="text-slate-500 font-normal text-sm">/</span> {b.innings || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Total Runs</span>
                  <span className="text-xl font-black text-emerald-400 tabular-nums">
                    {b.runs || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Batting Average</span>
                  <span className="text-xl font-black text-teal-300 tabular-nums">
                    {b.average || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Strike Rate</span>
                  <span className="text-xl font-black text-amber-300 tabular-nums">
                    {b.strike_rate || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Highest Score</span>
                  <span className="text-xl font-black text-rose-300 tabular-nums">
                    {b.highest_score || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Centuries / Fifties (100s / 50s)</span>
                  <span className="text-xl font-black text-purple-300 tabular-nums">
                    {b.hundreds || '-'} <span className="text-slate-500 font-normal text-sm">/</span> {b.fifties || '-'}
                  </span>
                </div>

                {b.fours && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Boundaries (4s / 6s)</span>
                    <span className="text-lg font-black text-sky-300 tabular-nums">
                      {b.fours || '-'} <span className="text-slate-500 font-normal text-sm">/</span> {b.sixes || '-'}
                    </span>
                  </div>
                )}

                {b.not_outs && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Not Outs</span>
                    <span className="text-lg font-black text-slate-200 tabular-nums">
                      {b.not_outs || '-'}
                    </span>
                  </div>
                )}

                {b.balls && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Balls Faced</span>
                    <span className="text-lg font-black text-slate-200 tabular-nums">
                      {b.balls || '-'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Matches / Innings</span>
                  <span className="text-xl font-black text-white tabular-nums">
                    {bw.matches || '-'} <span className="text-slate-500 font-normal text-sm">/</span> {bw.innings || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Wickets</span>
                  <span className="text-xl font-black text-sky-400 tabular-nums">
                    {bw.wickets || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Economy Rate</span>
                  <span className="text-xl font-black text-emerald-400 tabular-nums">
                    {bw.economy || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Bowling Average</span>
                  <span className="text-xl font-black text-teal-300 tabular-nums">
                    {bw.average || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Best Bowling (BBI)</span>
                  <span className="text-xl font-black text-amber-300 tabular-nums">
                    {bw.best_bowling_innings || '-'}
                  </span>
                </div>

                <div className="stat-pill p-3.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">5W / 4W Hauls</span>
                  <span className="text-xl font-black text-purple-300 tabular-nums">
                    {bw.five_wickets || '-'} <span className="text-slate-500 font-normal text-sm">/</span> {bw.four_wickets || '-'}
                  </span>
                </div>

                {bw.balls && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Balls Bowled</span>
                    <span className="text-lg font-black text-slate-200 tabular-nums">
                      {bw.balls || '-'}
                    </span>
                  </div>
                )}

                {bw.maidens && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Maidens</span>
                    <span className="text-lg font-black text-slate-200 tabular-nums">
                      {bw.maidens || '-'}
                    </span>
                  </div>
                )}

                {bw.strike_rate && (
                  <div className="stat-pill p-3.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Strike Rate</span>
                    <span className="text-lg font-black text-slate-200 tabular-nums">
                      {bw.strike_rate || '-'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
