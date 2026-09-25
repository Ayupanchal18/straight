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
  BarChart3,
  Check
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { useFavorites } from '../../../context/FavoritesContext';
import { TeamBadge, getTeamTheme } from '../../../utils/teamUtils.jsx';
import { StatRadarChart } from './StatRadarChart';

export const PlayerProfile = ({ player, onCompareWithThisPlayer }) => {
  const [profileTab, setProfileTab] = useState('overview'); // 'overview' | 'stats' | 'radar'
  const [activeFormat, setActiveFormat] = useState('odi'); // 'test', 'odi', 't20', 'ipl'
  const [statType, setStatType] = useState('batting'); // 'batting' | 'bowling'
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

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* ── Player Hero Showcase (Screen 3 style) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-[#0c1324] dark:via-[#090e1b] dark:to-[#050811] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl p-6 sm:p-8 transition-colors">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-96 h-60 bg-blue-600/5 dark:bg-blue-600/10 blur-[90px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 z-10">
          
          {/* Left Bio Info */}
          <div className="flex-1 flex flex-col justify-between text-center md:text-left">
            <div>
              {/* Badge & Nation */}
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-3">
                <span className="px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {player.role || 'Cricketer'}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <TeamBadge name={player.country} size="xs" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{player.country}</span>
                </div>
              </div>

              {/* Player Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                {player.name}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
                {player.country} International • {player.personalInfo?.battingStyle || 'Right-handed Batter'}
                {player.personalInfo?.bowlingStyle && ` • ${player.personalInfo.bowlingStyle}`}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-6 flex-wrap">
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                  isFav
                    ? 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {isFav ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>+ Add to Watchlist</span>
                  </>
                )}
              </button>

              {onCompareWithThisPlayer && (
                <button
                  onClick={() => onCompareWithThisPlayer(player.name)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Compare Player
                </button>
              )}

              {player.cricbuzzUrl && (
                <a
                  href={player.cricbuzzUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
                  title="View Official Source"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Large Player Photo Showcase */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-slate-100 dark:bg-[#070b14] border-2 border-slate-200 dark:border-white/10 shadow-xl overflow-hidden flex items-center justify-center group relative">
              {player.image ? (
                <img
                  src={player.image}
                  alt={player.name}
                  loading="lazy"
                  decoding="async"
                  width="192"
                  height="192"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-20 h-20 text-slate-400 dark:text-slate-600" />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Navigation Tabs (Overview | Career Stats | Radar Analytics) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'stats', label: 'Career Statistics' },
          { id: 'radar', label: 'Radar Analytics' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setProfileTab(tab.id)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold transition-all relative ${
              profileTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {profileTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 1: OVERVIEW ── */}
      {profileTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Personal Information (7 cols) */}
            <div className="md:col-span-7 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Full Name</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{player.name}</span>
                </div>

                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Born / Age</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{player.personalInfo?.born || 'N/A'}</span>
                </div>

                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Birth Place</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{player.personalInfo?.birthPlace || 'N/A'}</span>
                </div>

                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Height</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{player.personalInfo?.height || 'N/A'}</span>
                </div>

                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Batting Style</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">{player.personalInfo?.battingStyle || 'Right-handed'}</span>
                </div>

                <div className="border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <span className="text-slate-500 block text-[11px] font-medium">Bowling Style</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-0.5 block">{player.personalInfo?.bowlingStyle || 'Right-arm medium'}</span>
                </div>
              </div>

              {/* Major Teams */}
              {player.personalInfo?.teams?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[11px] text-slate-500 font-medium block mb-2">Major Teams Represented</span>
                  <div className="flex flex-wrap gap-1.5">
                    {player.personalInfo.teams.map((tm, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                      >
                        {tm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: ICC Rankings (5 cols) */}
            <div className="md:col-span-5 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Official ICC Rankings</span>
                </h2>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">ODI</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono block">
                      #{player.rankings?.batting?.odi || '--'}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Batter</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">TEST</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono block">
                      #{player.rankings?.batting?.test || '--'}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Batter</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">T20I</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono block">
                      #{player.rankings?.batting?.t20 || '--'}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Batter</span>
                  </div>
                </div>

                {/* Bowling Rankings if active bowler */}
                {(player.rankings?.bowling?.odi || player.rankings?.bowling?.test) && (
                  <div className="grid grid-cols-3 gap-2.5 text-center mt-3">
                    <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">ODI</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                        #{player.rankings?.bowling?.odi || '--'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Bowler</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">TEST</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                        #{player.rankings?.bowling?.test || '--'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Bowler</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">T20I</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                        #{player.rankings?.bowling?.t20 || '--'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Bowler</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Updated Weekly</span>
                <span className="text-amber-600 dark:text-amber-400/90 font-medium">ICC Official Database</span>
              </div>
            </div>

          </div>

          {/* Quick Stats Overview Matrix Table (Screen 3 style) */}
          <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Career Highlights Across Formats</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">International & League Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3 text-right">Matches</th>
                    <th className="py-2.5 px-3 text-right">Innings</th>
                    <th className="py-2.5 px-3 text-right">Runs</th>
                    <th className="py-2.5 px-3 text-right">Avg</th>
                    <th className="py-2.5 px-3 text-right">SR</th>
                    <th className="py-2.5 px-3 text-right">100s</th>
                    <th className="py-2.5 px-3 text-right">50s</th>
                    <th className="py-2.5 px-3 text-right">HS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                  {formats.map(({ key, label }) => {
                    const st = player.batting_stats?.[key] || {};
                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white uppercase">{label}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">{st.matches || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">{st.innings || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{st.runs || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-300">{st.average || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-300">{st.strike_rate || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-purple-600 dark:text-purple-300 font-bold">{st.hundreds || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-300">{st.fifties || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-300">{st.highest_score || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: CAREER STATISTICS ── */}
      {profileTab === 'stats' && (
        <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Full Career Matrix</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle discipline and inspect deep batting and bowling breakdowns</p>
            </div>

            {/* Batting vs Bowling Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setStatType('batting')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  statType === 'batting' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Batting</span>
              </button>
              <button
                onClick={() => setStatType('bowling')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  statType === 'bowling' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Bowling</span>
              </button>
            </div>
          </div>

          {/* Stats Table for all 4 formats */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3 text-right">Matches</th>
                  <th className="py-3 px-3 text-right">Innings</th>
                  {statType === 'batting' ? (
                    <>
                      <th className="py-3 px-3 text-right">Runs</th>
                      <th className="py-3 px-3 text-right">NO</th>
                      <th className="py-3 px-3 text-right">Avg</th>
                      <th className="py-3 px-3 text-right">SR</th>
                      <th className="py-3 px-3 text-right">HS</th>
                      <th className="py-3 px-3 text-right">100s</th>
                      <th className="py-3 px-3 text-right">50s</th>
                      <th className="py-3 px-3 text-right">4s</th>
                      <th className="py-3 px-3 text-right">6s</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-3 text-right">Wickets</th>
                      <th className="py-3 px-3 text-right">BBI</th>
                      <th className="py-3 px-3 text-right">Econ</th>
                      <th className="py-3 px-3 text-right">Avg</th>
                      <th className="py-3 px-3 text-right">SR</th>
                      <th className="py-3 px-3 text-right">4w</th>
                      <th className="py-3 px-3 text-right">5w</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                {formats.map(({ key, label }) => {
                  const data = statType === 'batting'
                    ? (player.batting_stats?.[key] || {})
                    : (player.bowling_stats?.[key] || {});

                  return (
                    <tr key={key} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white uppercase">{label}</td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{data.matches || '-'}</td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{data.innings || '-'}</td>
                      {statType === 'batting' ? (
                        <>
                          <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">{data.runs || '-'}</td>
                          <td className="py-3 px-3 text-right text-slate-400 dark:text-slate-400">{data.not_outs || '-'}</td>
                          <td className="py-3 px-3 text-right text-teal-600 dark:text-teal-300 font-bold">{data.average || '-'}</td>
                          <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-300">{data.strike_rate || '-'}</td>
                          <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-300">{data.highest_score || '-'}</td>
                          <td className="py-3 px-3 text-right text-purple-600 dark:text-purple-300 font-bold">{data.hundreds || '-'}</td>
                          <td className="py-3 px-3 text-right text-blue-600 dark:text-blue-300">{data.fifties || '-'}</td>
                          <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-300">{data.fours || '-'}</td>
                          <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-300">{data.sixes || '-'}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-right font-black text-sky-600 dark:text-sky-400">{data.wickets || '-'}</td>
                          <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-300 font-bold">{data.best_bowling_innings || '-'}</td>
                          <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">{data.economy || '-'}</td>
                          <td className="py-3 px-3 text-right text-teal-600 dark:text-teal-300">{data.average || '-'}</td>
                          <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-300">{data.strike_rate || '-'}</td>
                          <td className="py-3 px-3 text-right text-purple-600 dark:text-purple-300">{data.four_wickets || '-'}</td>
                          <td className="py-3 px-3 text-right text-rose-600 dark:text-rose-300 font-bold">{data.five_wickets || '-'}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: RADAR ANALYTICS ── */}
      {profileTab === 'radar' && (
        <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Spider Radar Performance Model</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Normalized statistical benchmarking against elite world standards</p>
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#070b14] p-1 rounded-lg border border-slate-200 dark:border-white/10">
              {formats.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFormat(key)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    activeFormat === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xl mx-auto py-4">
            <StatRadarChart player1={player} format={activeFormat} mode="batting" />
          </div>
        </div>
      )}

    </div>
  );
};
