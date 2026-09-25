import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { SearchPalette } from './components/layout/SearchPalette';
import { Footer } from './components/layout/Footer';
import { LiveScoresList } from './components/features/live/LiveScoresList';
import { useLiveScores } from './hooks/useLiveScores';
import { Skeleton } from './components/ui/Skeleton';
import cricketApi from './services/api';

// Lazily load secondary tabs to minimize initial bundle size and speed up FCP
const ScheduleList = lazy(() => import('./components/features/schedule/ScheduleList').then(m => ({ default: m.ScheduleList })));
const PlayerSearch = lazy(() => import('./components/features/players/PlayerSearch').then(m => ({ default: m.PlayerSearch })));
const PlayerCompare = lazy(() => import('./components/features/compare/PlayerCompare').then(m => ({ default: m.PlayerCompare })));
const FavoritesView = lazy(() => import('./components/features/favorites/FavoritesView').then(m => ({ default: m.FavoritesView })));

const TabLoadingFallback = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-40 rounded-2xl bg-slate-900/60 border border-white/5" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-64 rounded-2xl bg-slate-900/40 border border-white/5" />
      <div className="h-64 rounded-2xl bg-slate-900/40 border border-white/5" />
    </div>
  </div>
);

import { useSEO } from './hooks/useSEO';

export default function App() {
  // Read initial tab and query from URL search params for deep linking and crawler support
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'live';
  });

  const [selectedPlayerQuery, setSelectedPlayerQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('player') || '';
  });

  const [comparePlayer1, setComparePlayer1] = useState('Virat Kohli');
  const [comparePlayer2, setComparePlayer2] = useState('Rohit Sharma');
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);
  const [scheduleCache, setScheduleCache] = useState([]);

  // Dynamic Root SEO metadata based on active tab
  const getTabSEO = () => {
    switch (activeTab) {
      case 'schedule':
        return {
          title: 'Cricket Match Schedule & Upcoming Fixtures 2026 | CricketHub',
          description: 'Explore upcoming international cricket fixtures, ODI timetables, T20 World Cup schedules, and Test match series with accurate match timings and venues.',
          keywords: 'cricket schedule 2026, upcoming cricket matches, cricket timetable, international cricket fixtures, live match dates'
        };
      case 'players':
        return {
          title: selectedPlayerQuery 
            ? `${selectedPlayerQuery} Stats, Career Records & Bio | CricketHub`
            : 'Cricket Player Search & Career Statistics Analytics | CricketHub',
          description: 'Search cricket players, explore comprehensive career batting averages, bowling records, ICC rankings, centuries, and recent form.',
          keywords: 'cricket player stats, cricket career records, icc rankings, batting averages, bowling strike rate'
        };
      case 'compare':
        return {
          title: `${comparePlayer1} vs ${comparePlayer2} Head-to-Head Stats Comparison | CricketHub`,
          description: `Compare ${comparePlayer1} vs ${comparePlayer2} career batting averages, bowling records, strike rates, centuries, and ICC rankings side-by-side.`,
          keywords: 'player comparison, cricket head to head, batsman comparison, bowler stats compare'
        };
      case 'favorites':
        return {
          title: 'My Cricket Watchlist & Saved Matches | CricketHub',
          description: 'Quick access to your bookmarked cricket matches, tracked players, and personalized alerts.',
          keywords: 'cricket watchlist, pinned matches, favorite players'
        };
      case 'live':
      default:
        return {
          title: 'Cricket Hub | Live Cricket Scores, Schedules, Stats & H2H Comparison',
          description: 'Real-time live cricket scores, ball-by-ball commentary, upcoming fixtures, player career stats, and visual head-to-head comparison.',
          keywords: 'live cricket score, live cricket match, ball by ball commentary, live cricket stream updates'
        };
    }
  };

  const seoData = getTabSEO();
  useSEO({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    canonicalUrl: `${window.location.origin}/?tab=${activeTab}${selectedPlayerQuery ? `&player=${encodeURIComponent(selectedPlayerQuery)}` : ''}`
  });

  // Sync activeTab and selectedPlayerQuery with URL query params without reloading
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tab', activeTab);
    if (activeTab === 'players' && selectedPlayerQuery) {
      url.searchParams.set('player', selectedPlayerQuery);
    } else {
      url.searchParams.delete('player');
    }
    window.history.replaceState({}, '', url);
  }, [activeTab, selectedPlayerQuery]);

  // Lift live scores hook to root so SearchPalette can access match data
  const liveScoresHook = useLiveScores(30000, true);

  // Lightweight schedule cache for search palette (fetched once on first palette open)
  const fetchScheduleForSearch = useCallback(async () => {
    if (scheduleCache.length > 0) return; // already cached
    try {
      const res = await cricketApi.getSchedule();
      if (res && res.data) setScheduleCache(res.data);
    } catch (e) {
      // non-critical — palette still works without schedule data
    }
  }, [scheduleCache.length]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Fetch schedule data when palette opens
  useEffect(() => {
    if (searchPaletteOpen) fetchScheduleForSearch();
  }, [searchPaletteOpen, fetchScheduleForSearch]);

  const handleSelectPlayerFromWatchlist = (playerName) => {
    setSelectedPlayerQuery(playerName);
    setActiveTab('players');
  };

  const handleCompareFromProfile = (playerName) => {
    setComparePlayer1(playerName);
    setActiveTab('compare');
  };

  const handleSearchPlayer = useCallback((playerName) => {
    setSelectedPlayerQuery(playerName);
    setActiveTab('players');
  }, []);

  const handleOpenSearchPalette = useCallback(() => {
    setSearchPaletteOpen(true);
  }, []);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 stadium-bg selection:bg-blue-500 selection:text-white transition-colors duration-200">
          {/* Navigation */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSearch={handleOpenSearchPalette}
          />

          {/* Command Palette / Spotlight Search */}
          <SearchPalette
            isOpen={searchPaletteOpen}
            onClose={() => setSearchPaletteOpen(false)}
            matches={liveScoresHook.matches}
            scheduleData={scheduleCache}
            onSelectTab={setActiveTab}
            onSelectMatch={(match) => {
              // Navigate to live tab — the match detail modal is handled inside LiveScoresList
              setActiveTab('live');
            }}
            onSearchPlayer={handleSearchPlayer}
          />

          {/* Main Content Area */}
          <main className="flex-1 w-full pb-24 md:pb-12">
            {activeTab === 'live' && (
              <LiveScoresList
                onSelectTab={setActiveTab}
                onSearchPlayer={handleSelectPlayerFromWatchlist}
                onOpenSearch={handleOpenSearchPalette}
                sharedLiveScores={liveScoresHook}
              />
            )}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
              <Suspense fallback={<TabLoadingFallback />}>
                {activeTab === 'schedule' && <ScheduleList />}

                {activeTab === 'players' && (
                  <PlayerSearch
                    initialQuery={selectedPlayerQuery}
                    onCompare={handleCompareFromProfile}
                  />
                )}

                {activeTab === 'compare' && (
                  <PlayerCompare
                    defaultPlayer1={comparePlayer1}
                    defaultPlayer2={comparePlayer2}
                  />
                )}

                {activeTab === 'favorites' && (
                  <FavoritesView
                    onSelectPlayer={handleSelectPlayerFromWatchlist}
                    onSelectTab={setActiveTab}
                  />
                )}
              </Suspense>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
