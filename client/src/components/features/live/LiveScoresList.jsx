import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  RefreshCw,
  Radio,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useLiveScores } from '../../../hooks/useLiveScores';
import { useFavorites } from '../../../context/FavoritesContext';
import { MatchCard } from './MatchCard';
import { HeroSection } from './HeroSection';
import { FeaturedMatchHero } from './FeaturedMatchHero';
import { TrendingWidget } from './TrendingWidget';
import { PopularTeamsWidget } from './PopularTeamsWidget';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';

// Code-split heavy modal to keep initial live scores page lightweight and bloatware-free
const MatchDetailModal = lazy(() => import('./MatchDetailModal').then(m => ({ default: m.MatchDetailModal })));
import { isMatchLive, isMatchComplete, isMatchUpcoming } from '../../../utils/teamUtils.jsx';

import { useSEO } from '../../../hooks/useSEO';
import { generateMatchSchema } from '../../../utils/seo';

export const LiveScoresList = ({ onSelectTab, onSearchPlayer, onOpenSearch, sharedLiveScores }) => {
  // Use shared live scores from App if available, otherwise fallback to own hook
  const ownHook = useLiveScores(30000, !sharedLiveScores);
  const { matches, loading, isRefreshing, error, lastUpdated, adaptiveInterval, recentWicketEvent, refresh } = sharedLiveScores || ownHook;
  const { pinnedMatchId, unpinMatch, favorites } = useFavorites();

  const [filter, setFilter]           = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(() => {
    try { return localStorage.getItem('cricket_show_sidebar') !== 'false'; }
    catch { return true; }
  });
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleManualRefresh = async () => {
    await refresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2200);
  };

  // Dynamic Browser Tab Title & SEO Telemetry
  const featuredLiveMatch = matches.find(m => isMatchLive(m)) || matches[0];
  
  const dynamicTitle = useMemo(() => {
    if (recentWicketEvent) {
      return `⚡ WICKET! ${recentWicketEvent.team} ${recentWicketEvent.score} | CricketHub`;
    }
    if (featuredLiveMatch && isMatchLive(featuredLiveMatch)) {
      const t1 = featuredLiveMatch.team1ShortName || featuredLiveMatch.team1;
      const t2 = featuredLiveMatch.team2ShortName || featuredLiveMatch.team2;
      const s1 = featuredLiveMatch.team1Score;
      const s2 = featuredLiveMatch.team2Score;
      if (s1 || s2) {
        return `🔴 ${t1} ${s1 || ''} vs ${t2} ${s2 || ''} | CricketHub`.replace(/\s+/g, ' ');
      }
      return `🔴 LIVE: ${t1} vs ${t2} | CricketHub`;
    }
    return 'Cricket Hub | Live Cricket Scores, Schedules & Stats';
  }, [recentWicketEvent, featuredLiveMatch]);

  useSEO({
    title: dynamicTitle,
    description: featuredLiveMatch
      ? `Live Cricket Score: ${featuredLiveMatch.team1} vs ${featuredLiveMatch.team2}. ${featuredLiveMatch.status || 'Live'}. Ball-by-ball updates, commentary and stats.`
      : 'Real-time live cricket scores, ball-by-ball commentary, match fixtures, and scorecard analytics.',
    keywords: 'live cricket score, today match live, ball by ball commentary, ipl live score, international cricket score',
    structuredData: featuredLiveMatch ? generateMatchSchema(featuredLiveMatch) : null,
  });

  const toggleSidebar = () => {
    setShowSidebar(prev => {
      const next = !prev;
      try { localStorage.setItem('cricket_show_sidebar', String(next)); } catch {}
      return next;
    });
  };

  // Pinned match spotlight
  const featuredMatch = useMemo(() => {
    if (!pinnedMatchId || !matches || matches.length === 0) return null;
    const found = matches.find(m => (m.id || m.rawText) === pinnedMatchId);
    if (found) return found;
    const fav = favorites.find(f => f.identifier === pinnedMatchId);
    return fav?.meta || null;
  }, [matches, pinnedMatchId, favorites]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    let list = matches;
    if (filter === 'live')          list = list.filter(isMatchLive);
    else if (filter === 'upcoming') list = list.filter(isMatchUpcoming);
    else if (filter === 'completed') list = list.filter(isMatchComplete);
    else if (filter === 'international') {
      list = list.filter(m =>
        m.matchFormat?.includes('TEST') ||
        m.matchFormat?.includes('ODI')  ||
        m.matchFormat?.includes('T20I') ||
        m.series?.toLowerCase().includes('tour') ||
        m.series?.toLowerCase().includes('cup')  ||
        m.series?.toLowerCase().includes('asia')
      );
    } else if (filter === 't20') {
      list = list.filter(m =>
        m.matchFormat?.toLowerCase().includes('t20') ||
        m.series?.toLowerCase().includes('league') ||
        m.series?.toLowerCase().includes('ipl')
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => {
        const fields = [m.team1, m.team2, m.series, m.matchDescription, m.matchType, m.matchFormat, m.team1ShortName, m.team2ShortName, m.status];
        return fields.some(f => f && f.toLowerCase().includes(q));
      });
    }
    return list;
  }, [matches, filter, searchQuery]);

  const liveMatches     = useMemo(() => matches.filter(isMatchLive),     [matches]);
  const upcomingMatches = useMemo(() => matches.filter(isMatchUpcoming), [matches]);

  const liveCount     = liveMatches.length;
  const upcomingCount = upcomingMatches.length;
  const completedCount = useMemo(() => matches.filter(isMatchComplete).length, [matches]);

  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  // Keep active match synced with live score updates
  const currentActiveMatch = useMemo(() => {
    if (!selectedMatch) return null;
    const sId = selectedMatch.id || selectedMatch.rawText || selectedMatch.matchId;
    const found = matches.find(m => (m.id || m.rawText || m.matchId) === sId);
    return found ? { ...selectedMatch, ...found } : selectedMatch;
  }, [matches, selectedMatch]);

  // ── Filter tabs config ──
  const filterTabs = [
    { id: 'all',           label: `All (${matches.length})`,      activeClass: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-white/10 dark:text-white dark:border-white/20' },
    { id: 'live',          label: `Live (${liveCount})`,           activeClass: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30', dot: true },
    { id: 'upcoming',      label: `Upcoming (${upcomingCount})`,   activeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30' },
    { id: 'international', label: 'International',                  activeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30' },
    { id: 't20',           label: 'T20 Leagues',                   activeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30' },
    { id: 'completed',     label: `Results (${completedCount})`,   activeClass: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600' },
  ];

  return (
    <div>
      {/* ═══════════════════════════════════════════════
          HERO SECTION (shown once on homepage, not when filtering)
          ═══════════════════════════════════════════════ */}
      <HeroSection
        onOpenSearch={onOpenSearch}
        onSelectTab={onSelectTab || (() => {})}
        liveCount={liveCount}
        upcomingCount={upcomingCount}
      />

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT — below hero
          ═══════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Pinned Featured Match ── */}
        {featuredMatch && !searchQuery && (
          <FeaturedMatchHero
            match={featuredMatch}
            onSelectMatch={m => setSelectedMatch(m)}
            onUnpin={unpinMatch}
          />
        )}

        {/* ── Filter + Control Bar ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar flex-shrink-0">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  filter === tab.id
                    ? tab.activeClass
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab.dot && filter === tab.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Local search */}
            <div className="relative flex-1 sm:w-52 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by team, series..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-navy-800/80 border border-slate-200 dark:border-white/[0.09] rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Live Sync Status indicator */}
            <div 
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-white/[0.08] text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none"
              title={`Adaptive heartbeat: checking every ${Math.round((adaptiveInterval || 30000) / 1000)}s based on pitch activity`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-emerald-500 animate-pulse'
              }`} />
              <span className="font-mono text-[10px]">
                {isRefreshing ? 'Syncing...' : `Pulse ${Math.round((adaptiveInterval || 30000) / 1000)}s`}
              </span>
            </div>

            {/* Refresh (Hard Refresh bypassing cache) */}
            <Button
              variant={justRefreshed ? "outline" : "secondary"}
              size="sm"
              onClick={handleManualRefresh}
              loading={loading || isRefreshing}
              icon={RefreshCw}
              title="Force hard refresh: fetches freshest live scores directly from pitch"
              aria-label="Refresh live scores"
              className={`flex-shrink-0 transition-all ${justRefreshed ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
            >
              <span className="hidden sm:inline">
                {justRefreshed ? '✓ Synced' : 'Refresh'}
              </span>
            </Button>

            {/* Toggle sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                showSidebar
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800/80 dark:hover:bg-navy-700 border-slate-200 dark:border-white/[0.09] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300'
              }`}
            >
              {showSidebar
                ? <PanelRightClose className="w-3.5 h-3.5" />
                : <PanelRightOpen  className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showSidebar ? 'Hide' : 'Trending'}</span>
            </button>
          </div>
        </div>

        {/* ── Main Grid: Match Cards + Sidebar ── */}
        <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-12' : ''} gap-6 items-start`}>

          {/* Left: Match Grid */}
          <div className={`${showSidebar ? 'lg:col-span-8' : ''} space-y-5`}>

            {/* Section header with date stepper */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {filter === 'all'           ? 'All Matches'
                   : filter === 'live'        ? '🔴 Live Now'
                   : filter === 'upcoming'    ? 'Upcoming Fixtures'
                   : filter === 'completed'   ? 'Match Results'
                   : filter === 'international' ? 'International'
                   : filter === 't20'         ? 'T20 Leagues'
                   : filter}
                </h2>
                {filteredMatches.length > 0 && (
                  <span className="text-xs text-slate-500">{filteredMatches.length} matches</span>
                )}
              </div>

              {/* Date stepper */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800/60 border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5 shadow-2xs">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                  className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
                  title="Previous day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 px-2">
                  <CalendarIcon className="w-3 h-3 text-blue-500" />
                  <span className="text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-300">{dateDisplay}</span>
                </div>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                  className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
                  title="Next day"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="match-card p-4 border-red-500/20 bg-red-500/8 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-red-300">{error}</span>
                </div>
                <Button size="sm" variant="danger" onClick={refresh}>Retry</Button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && matches.length === 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showSidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
                <Skeleton count={6} className="h-48 rounded-xl" />
              </div>
            )}

            {/* ── LIVE section (shown first when filter=all) ── */}
            {filter === 'all' && liveMatches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Live Matches</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                      {liveMatches.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setFilter('live')}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${showSidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
                  {liveMatches.slice(0, showSidebar ? 6 : 8).map(m => (
                    <MatchCard key={m.id || m.rawText} match={m} onSelectMatch={m => setSelectedMatch(m)} />
                  ))}
                </div>
              </div>
            )}

            {/* ── UPCOMING section (shown second when filter=all) ── */}
            {filter === 'all' && upcomingMatches.length > 0 && (
              <div className="space-y-3 pt-2">
                {/* Date group header */}
                <div className="date-group-header">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upcoming Fixtures</span>
                </div>
                <div className="space-y-2">
                  {upcomingMatches.slice(0, 8).map(m => (
                    <div
                      key={m.id || m.rawText}
                      onClick={() => setSelectedMatch(m)}
                      className="match-row px-4 py-3 flex items-center gap-3 cursor-pointer group"
                    >
                      {/* Status + Format */}
                      <div className="flex items-center gap-2 flex-shrink-0 w-28">
                        <span className="badge-upcoming">Upcoming</span>
                      </div>
                      {/* Teams */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {m.team1} vs {m.team2}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {m.series || m.matchDescription || 'Cricket Match'}
                        </div>
                      </div>
                      {/* Time / Date */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-[11px] font-semibold text-slate-300 tabular-nums">
                          {m.dateTimeGMT
                            ? new Date(m.dateTimeGMT).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : '–'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {m.dateTimeGMT
                            ? new Date(m.dateTimeGMT).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                            : ''}
                        </div>
                      </div>
                      {/* CTA */}
                      <span className="text-[11px] font-semibold text-blue-400 group-hover:text-blue-300 flex-shrink-0 flex items-center gap-0.5 transition-colors">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Filtered match cards (non-all filter) ── */}
            {filter !== 'all' && filteredMatches.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showSidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
                {filteredMatches.map(match => (
                  <MatchCard
                    key={match.id || match.rawText}
                    match={match}
                    onSelectMatch={m => setSelectedMatch(m)}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredMatches.length === 0 && !loading && (
              <div className="match-card p-12 text-center">
                <Radio className="w-9 h-9 mx-auto text-slate-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-400">No matches found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery ? `No results matching "${searchQuery}"` : 'Try a different filter.'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          {showSidebar && (
            <div className="lg:col-span-4 space-y-4">
              <TrendingWidget
                matches={matches}
                onSelectMatch={m => setSelectedMatch(m)}
                onClose={toggleSidebar}
              />
              <PopularTeamsWidget
                onSelectTeam={teamName => { if (onSearchPlayer) onSearchPlayer(teamName); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Match Detail Modal — Lazy loaded on demand */}
      {currentActiveMatch && (
        <Suspense fallback={null}>
          <MatchDetailModal
            match={currentActiveMatch}
            onClose={() => setSelectedMatch(null)}
            onRefreshScores={refresh}
          />
        </Suspense>
      )}
    </div>
  );
};
