import React, { useState, useEffect } from 'react';
import { Search, User, Sparkles, AlertCircle, TrendingUp, Flame } from 'lucide-react';
import cricketApi from '../../../services/api';
import { PlayerProfile } from './PlayerProfile';
import { Skeleton } from '../../ui/Skeleton';
import { Button } from '../../ui/Button';
import { TeamBadge } from '../../../utils/teamUtils.jsx';

const POPULAR_PLAYERS = [
  { name: 'Virat Kohli', country: 'India' },
  { name: 'Rohit Sharma', country: 'India' },
  { name: 'Jasprit Bumrah', country: 'India' },
  { name: 'Steve Smith', country: 'Australia' },
  { name: 'Pat Cummins', country: 'Australia' },
  { name: 'Babar Azam', country: 'Pakistan' },
  { name: 'Joe Root', country: 'England' },
  { name: 'Travis Head', country: 'Australia' },
  { name: 'Hardik Pandya', country: 'India' },
  { name: 'Ben Stokes', country: 'England' },
  { name: 'Rashid Khan', country: 'Afghanistan' },
  { name: 'Kane Williamson', country: 'New Zealand' }
];

import { useSEO } from '../../../hooks/useSEO';
import { generatePlayerSchema } from '../../../utils/seo';

export const PlayerSearch = ({ initialQuery = '', onCompare }) => {
  const [query, setQuery] = useState(initialQuery || 'Virat Kohli');
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic SEO & Athlete Schema for the currently viewed player
  useSEO({
    title: player?.name 
      ? `${player.name} (${player.country}) Career Stats, ICC Rankings, Batting & Bowling Records | CricketHub`
      : 'Cricket Player Search & Career Statistics Analytics | CricketHub',
    description: player?.name 
      ? `Comprehensive career statistics for ${player.name} (${player.country}). Batting average, bowling economy, strike rates, centuries, and ICC rankings.`
      : 'Search cricket players, explore comprehensive career batting averages, bowling records, ICC rankings, centuries, and recent form.',
    keywords: player?.name 
      ? `${player.name}, ${player.name} stats, ${player.name} career records, ${player.country} cricket, ${player.name} rankings`
      : 'cricket player stats, cricket career records, icc rankings, batting averages',
    structuredData: player ? generatePlayerSchema(player) : null,
    ogImage: player?.image || undefined,
  });

  const searchPlayer = async (targetName) => {
    const q = (targetName || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await cricketApi.getPlayerProfile(q);
      if (res && res.data) {
        setPlayer(res.data);
      }
    } catch (err) {
      setError(err.message || `No player profile found for "${q}". Please check the spelling.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultSearch = initialQuery || 'Virat Kohli';
    setQuery(defaultSearch);
    searchPlayer(defaultSearch);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchPlayer();
  };

  return (
    <div className="space-y-6">
      
      {/* ── Search Header Arena ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-slate-50 to-blue-50/30 dark:from-[#0e1628] dark:via-[#0b1120] dark:to-[#070b14] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl p-6 sm:p-8 text-center transition-colors">
        {/* Pitch light accents */}
        <div className="absolute top-0 left-1/3 w-96 h-28 bg-blue-500/5 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-96 h-28 bg-sky-500/5 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>International Player Analytics</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            Search Any Cricket Player
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Comprehensive career batting averages, bowling records, ICC rankings, and bio from authoritative international cricket databases.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Virat Kohli, Rohit Sharma, Steve Smith, Babar Azam..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="px-6 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Search
            </Button>
          </form>

          {/* Trending Cricketers Quick Select */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Trending Cricketers:</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {POPULAR_PLAYERS.map(({ name, country }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setQuery(name);
                    searchPlayer(name);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    query.toLowerCase() === name.toLowerCase()
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-300 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-slate-300'
                  }`}
                >
                  <TeamBadge name={country} size="xs" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="sports-card p-4 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
          <Button size="sm" variant="danger" onClick={() => searchPlayer()}>Try Again</Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      )}

      {/* Render Player Profile */}
      {player && !loading && (
        <PlayerProfile
          player={player}
          onCompareWithThisPlayer={onCompare}
        />
      )}
    </div>
  );
};
