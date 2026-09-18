import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Radio, 
  Search,
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  AlertCircle, 
  Flame,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { useLiveScores } from '../../../hooks/useLiveScores';
import { useFavorites } from '../../../context/FavoritesContext';
import { MatchCard } from './MatchCard';
import { FeaturedMatchHero } from './FeaturedMatchHero';
import { TrendingWidget } from './TrendingWidget';
import { PopularTeamsWidget } from './PopularTeamsWidget';
import { FeatureBanner } from './FeatureBanner';
import { MatchDetailModal } from './MatchDetailModal';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { isMatchLive, isMatchComplete, isMatchUpcoming } from '../../../utils/teamUtils.jsx';

import { useSEO } from '../../../hooks/useSEO';
import { generateMatchSchema } from '../../../utils/seo';

export const LiveScoresList = ({ onSelectTab, onSearchPlayer, sharedLiveScores }) => {
  // Use shared live scores from App if available, otherwise fallback to own hook
  const ownHook = useLiveScores(30000, !sharedLiveScores);
  const { matches, loading, error, lastUpdated, refresh } = sharedLiveScores || ownHook;
  const { pinnedMatchId, unpinMatch, favorites } = useFavorites();
  const [filter, setFilter] = useState('all'); // all, live, upcoming, international, t20, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dynamic SEO & SportsEvent Schema for the live matches view
  const featuredLiveMatch = matches.find(m => isMatchLive(m)) || matches[0];
  useSEO({
    title: featuredLiveMatch
      ? `LIVE: ${featuredLiveMatch.team1} vs ${featuredLiveMatch.team2} (${featuredLiveMatch.status || 'Live Scores'}) | CricketHub`
      : 'Live Cricket Scores & Ball-by-Ball Commentary | CricketHub',
    description: featuredLiveMatch
      ? `Live Cricket Score: ${featuredLiveMatch.team1} vs ${featuredLiveMatch.team2}. Current status: ${featuredLiveMatch.status || 'Live'}. Ball-by-ball updates, commentary and stats.`
      : 'Real-time live cricket scores, ball-by-ball commentary, match fixtures, and scorecard analytics for international & IPL matches.',
    keywords: 'live cricket score, today match live, ball by ball commentary, ipl live score, international cricket score',
    structuredData: featuredLiveMatch ? generateMatchSchema(featuredLiveMatch) : null,
  });
  const [showTrending, setShowTrending] = useState(() => {
    try {
      const saved = localStorage.getItem('cricket_show_trending_sidebar');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleTrending = () => {
    setShowTrending((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cricket_show_trending_sidebar', String(next));
      } catch {}
      return next;
    });
  };

  // Only display Spotlight Hero when a match is explicitly pinned by user
  const featuredMatch = useMemo(() => {
    if (!pinnedMatchId || !matches || matches.length === 0) return null;
    const found = matches.find(m => (m.id || m.rawText) === pinnedMatchId);
    if (found) return found;

    // Check if match metadata is saved in favorites list
    const fav = favorites.find(f => f.identifier === pinnedMatchId);
    return fav?.meta || null;
  }, [matches, pinnedMatchId, favorites]);

  // Filter and search matches
  const filteredMatches = useMemo(() => {
    let list = matches;

    if (filter === 'live') {
      list = list.filter(isMatchLive);
    } else if (filter === 'upcoming') {
      list = list.filter(isMatchUpcoming);
    } else if (filter === 'completed') {
      list = list.filter(isMatchComplete);
    } else if (filter === 'international') {
      list = list.filter(m => 
        m.matchFormat?.includes('TEST') || 
        m.matchFormat?.includes('ODI') || 
        m.matchFormat?.includes('T20I') ||
        m.series?.toLowerCase().includes('tour') ||
        m.series?.toLowerCase().includes('cup') ||
        m.series?.toLowerCase().includes('asia')
      );
    } else if (filter === 't20') {
      list = list.filter(m => 
        m.matchFormat?.toLowerCase().includes('t20') ||
        m.series?.toLowerCase().includes('league') ||
        m.series?.toLowerCase().includes('cpl') ||
        m.series?.toLowerCase().includes('ipl')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      // Fuzzy-style search: check multiple fields with includes for speed
      list = list.filter(m => {
        const fields = [
          m.team1, m.team2, m.series, m.matchDescription,
          m.matchType, m.matchFormat, m.team1ShortName, m.team2ShortName,
          m.status
        ];
        return fields.some(f => f && f.toLowerCase().includes(q));
      });
    }

    return list;
  }, [matches, filter, searchQuery]);

  const liveMatchesList = useMemo(() => {
    return matches.filter(isMatchLive);
  }, [matches]);

  const liveCount = liveMatchesList.length;
  const upcomingCount = useMemo(() => matches.filter(isMatchUpcoming).length, [matches]);
  const completedCount = useMemo(() => matches.filter(isMatchComplete).length, [matches]);

  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Keep active match state synchronized with live polled score updates
  const currentActiveMatch = useMemo(() => {
    if (!selectedMatch) return null;
    const sId = selectedMatch.id || selectedMatch.rawText || selectedMatch.matchId;
    const found = matches.find(m => (m.id || m.rawText || m.matchId) === sId);
    return found ? { ...selectedMatch, ...found } : selectedMatch;
  }, [matches, selectedMatch]);

  return (
    <div className="space-y-6">
      
      {/* ── Spotlight Featured Hero Banner (Only when pinned) ── */}
      {featuredMatch && !searchQuery && (
        <FeaturedMatchHero 
          match={featuredMatch} 
          onSelectMatch={(m) => setSelectedMatch(m)} 
          onUnpin={unpinMatch}
        />
      )}

      {/* ── Sub-navigation Filter & Control Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        {/* Left Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            All Matches ({matches.length})
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'live' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Live ({liveCount})</span>
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'upcoming' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('international')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'international' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            International
          </button>
          <button
            onClick={() => setFilter('t20')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 't20' 
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            T20 Leagues
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'completed' 
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            Results ({completedCount})
          </button>
        </div>

        {/* Right Controls: Sort Dropdown, Search Input, Refresh & Toggle Trending */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
              <span>Sort by: <strong>Latest</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search team, league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 ${searchQuery ? 'pr-8' : 'pr-3'} py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            loading={loading}
            icon={RefreshCw}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Toggle Trending Sidebar Button */}
          <button
            type="button"
            onClick={toggleTrending}
            title={showTrending ? "Hide Trending section" : "Show Trending section"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
              showTrending
                ? 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-white/20'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-sm shadow-emerald-500/10'
            }`}
          >
            {showTrending ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Hide Trending</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Show Trending</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Dashboard Layout (Full width or 2-column) ── */}
      <div className={`grid grid-cols-1 ${showTrending ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start`}>
        
        {/* ── Left Column: Match Grid ── */}
        <div className={`${showTrending ? 'lg:col-span-8' : 'w-full'} space-y-4`}>
          
          {/* Section Header: Title & Date Stepper */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white font-display">
                {filter === 'all' 
                  ? 'All Matches' 
                  : filter === 'live' 
                  ? 'Live Matches' 
                  : filter === 'upcoming'
                  ? 'Upcoming Fixtures'
                  : filter === 'completed'
                  ? 'Match Results'
                  : filter === 'international'
                  ? 'International Matches'
                  : filter === 't20'
                  ? 'T20 Leagues'
                  : filter.toUpperCase()}
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Showing {filteredMatches.length} matches
              </span>
            </div>

            {/* Date Stepper */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/[0.08] text-xs font-semibold text-slate-300">
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] tabular-nums font-bold">{dateDisplay}</span>
              </div>
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="sports-card p-4 border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
              <Button size="sm" variant="danger" onClick={refresh}>Retry</Button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && matches.length === 0 && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showTrending ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
              <Skeleton count={6} className="h-44 rounded-2xl" />
            </div>
          )}

          {/* Match Cards Grid */}
          {filteredMatches.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showTrending ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
              {filteredMatches.map((match) => (
                <MatchCard 
                  key={match.id || match.rawText} 
                  match={match} 
                  onSelectMatch={(m) => setSelectedMatch(m)}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="sports-card p-12 text-center">
              <Radio className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No matches found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? `No results matching "${searchQuery}"` : 'No matches in this category.'}
              </p>
            </div>
          ) : null}

        </div>

        {/* ── Right Column: Sidebar (Trending & Popular Teams) ── */}
        {showTrending && (
          <div className="lg:col-span-4 space-y-4">
            <TrendingWidget 
              matches={matches} 
              onSelectMatch={(m) => setSelectedMatch(m)} 
              onClose={toggleTrending}
            />

            <PopularTeamsWidget 
              onSelectTeam={(teamName) => {
                if (onSearchPlayer) onSearchPlayer(teamName);
              }} 
            />
          </div>
        )}

      </div>

      {/* ── Bottom Feature Banner ── */}
      <FeatureBanner onExplore={onSelectTab} />

      {/* ── "Live Now" Carousel Section ── */}
      {liveMatchesList.length > 0 && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-base font-extrabold text-white font-display">
                Live Now ({liveMatchesList.length})
              </h3>
            </div>
            <button
              onClick={() => setFilter('live')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Live</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveMatchesList.slice(0, 4).map((m) => (
              <MatchCard 
                key={m.id || m.rawText} 
                match={m} 
                onSelectMatch={(match) => setSelectedMatch(match)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Match Details Modal */}
      {currentActiveMatch && (
        <MatchDetailModal
          match={currentActiveMatch}
          onClose={() => setSelectedMatch(null)}
          onRefreshScores={refresh}
        />
      )}
    </div>
  );
};
