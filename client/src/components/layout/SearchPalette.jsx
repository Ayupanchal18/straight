import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Radio,
  Calendar,
  User,
  Scale,
  Bookmark,
  ArrowRight,
  CornerDownLeft,
  Command,
  Loader2,
  Zap,
  TrendingUp,
  MapPin,
  Coffee,
} from 'lucide-react';
import { fuzzyFilter, highlightMatches, expandQuery, fuzzyScore } from '../../utils/fuzzySearch';
import { isMatchLive, isMatchComplete, isMatchUpcoming, TeamBadge } from '../../utils/teamUtils.jsx';

/* ──────────────────────────────────────────────
   Static data for navigation & popular players
   ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'live', label: 'Live Scores', description: 'Real-time match scores & commentary', icon: Radio },
  { id: 'schedule', label: 'Fixtures & Schedule', description: 'Upcoming international fixtures', icon: Calendar },
  { id: 'players', label: 'Player Stats', description: 'Search any cricket player profile', icon: User },
  { id: 'compare', label: 'H2H Compare', description: 'Head-to-head player comparison', icon: Scale },
  { id: 'favorites', label: 'Watchlist', description: 'Your saved matches & players', icon: Bookmark },
  { id: 'support', label: 'Buy Me a Coffee', description: 'Support independent CricketHub development', icon: Coffee },
];

const POPULAR_PLAYERS = [
  'Virat Kohli', 'Rohit Sharma', 'Jasprit Bumrah', 'Steve Smith',
  'Pat Cummins', 'Babar Azam', 'Joe Root', 'Travis Head',
  'Hardik Pandya', 'Ben Stokes', 'Rashid Khan', 'Kane Williamson',
  'Yashasvi Jaiswal', 'Shubman Gill', 'Suryakumar Yadav', 'Mitchell Starc',
];

/* ──────────────────────────────────────────────
   HighlightText component for rendering fuzzy matches
   ────────────────────────────────────────────── */
const HighlightText = ({ text, query }) => {
  const segments = highlightMatches(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark key={i} className="bg-emerald-500/30 text-emerald-300 rounded-sm px-0.5">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
};

/* ──────────────────────────────────────────────
   Main SearchPalette Component
   ────────────────────────────────────────────── */
export const SearchPalette = ({
  isOpen,
  onClose,
  matches = [],       // live match data from parent
  scheduleData = [],   // schedule data from parent
  onSelectTab,         // (tabId) => void
  onSelectMatch,       // (match) => void — open match detail
  onSearchPlayer,      // (playerName) => void — navigate to player tab with query
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Small delay to let animation start
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* ── Build search results ── */
  const results = useMemo(() => {
    const sections = [];

    if (!query.trim()) {
      // Show default: Quick Actions + Trending Players
      sections.push({
        title: 'Quick Navigation',
        icon: Zap,
        items: NAV_ITEMS.map(nav => ({
          id: `nav-${nav.id}`,
          type: 'nav',
          title: nav.label,
          subtitle: nav.description,
          icon: nav.icon,
          data: nav,
        })),
      });

      sections.push({
        title: 'Trending Players',
        icon: TrendingUp,
        items: POPULAR_PLAYERS.slice(0, 8).map(name => ({
          id: `player-${name}`,
          type: 'player',
          title: name,
          subtitle: 'Search player profile',
          icon: User,
          data: { name },
        })),
      });

      return sections;
    }

    const q = query.trim();

    // 1. Live Matches
    if (matches.length > 0) {
      const matchResults = fuzzyFilter(
        q,
        matches,
        ['team1', 'team2', 'series', 'matchDescription', 'matchType', 'team1ShortName', 'team2ShortName'],
        8
      );

      if (matchResults.length > 0) {
        sections.push({
          title: 'Matches',
          icon: Radio,
          items: matchResults.map(({ item }) => {
            const isLive = isMatchLive(item);
            const isComplete = isMatchComplete(item);
            const statusLabel = isLive ? '● LIVE' : isComplete ? 'Completed' : 'Upcoming';
            const statusClass = isLive ? 'text-red-400' : isComplete ? 'text-slate-400' : 'text-sky-400';

            return {
              id: `match-${item.id || item.matchId}`,
              type: 'match',
              title: `${item.team1} vs ${item.team2}`,
              subtitle: `${item.series || item.matchType || ''}`,
              badge: statusLabel,
              badgeClass: statusClass,
              icon: Radio,
              data: item,
            };
          }),
        });
      }
    }

    // 2. Schedule
    if (scheduleData.length > 0) {
      const schedResults = fuzzyFilter(
        q,
        scheduleData,
        ['match', 'date', 'venue', 'fullText'],
        5
      );

      if (schedResults.length > 0) {
        sections.push({
          title: 'Fixtures',
          icon: Calendar,
          items: schedResults.map(({ item }) => ({
            id: `sched-${item.id}`,
            type: 'schedule',
            title: item.match,
            subtitle: item.date || '',
            icon: Calendar,
            data: item,
          })),
        });
      }
    }

    // 3. Players (fuzzy match from popular registry)
    const playerItems = POPULAR_PLAYERS.map(name => ({ name }));
    const playerResults = fuzzyFilter(q, playerItems, ['name'], 6);

    if (playerResults.length > 0) {
      sections.push({
        title: 'Players',
        icon: User,
        items: playerResults.map(({ item }) => ({
          id: `player-${item.name}`,
          type: 'player',
          title: item.name,
          subtitle: 'View player profile & career stats',
          icon: User,
          data: item,
        })),
      });
    }

    // 4. Always offer a "Search for player" action
    sections.push({
      title: 'Search',
      icon: Search,
      items: [{
        id: 'search-player-direct',
        type: 'player-search',
        title: `Search player: "${q}"`,
        subtitle: 'Look up cricket player career statistics & records',
        icon: ArrowRight,
        data: { name: q },
      }],
    });

    // 5. Navigation (fuzzy)
    const navResults = fuzzyFilter(
      q,
      NAV_ITEMS.map(n => ({ ...n, searchable: `${n.label} ${n.description}` })),
      ['label', 'description', 'searchable'],
      3
    );

    if (navResults.length > 0) {
      sections.push({
        title: 'Go To',
        icon: Zap,
        items: navResults.map(({ item }) => ({
          id: `nav-${item.id}`,
          type: 'nav',
          title: item.label,
          subtitle: item.description,
          icon: item.icon,
          data: item,
        })),
      });
    }

    return sections;
  }, [query, matches, scheduleData]);

  // Flatten results for keyboard navigation
  const flatItems = useMemo(() => {
    return results.flatMap(section => section.items);
  }, [results]);

  // Clamp active index
  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeEl = resultsContainerRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  /* ── Handle item selection ── */
  const handleSelect = useCallback((item) => {
    onClose();

    switch (item.type) {
      case 'match':
        if (onSelectMatch) onSelectMatch(item.data);
        break;
      case 'schedule':
        if (onSelectTab) onSelectTab('schedule');
        break;
      case 'player':
      case 'player-search':
        if (onSearchPlayer) onSearchPlayer(item.data.name);
        break;
      case 'nav':
        if (onSelectTab) onSelectTab(item.data.id === 'results' ? 'live' : item.data.id);
        break;
      default:
        break;
    }
  }, [onClose, onSelectMatch, onSelectTab, onSearchPlayer]);

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[activeIndex]) {
          handleSelect(flatItems[activeIndex]);
        }
        break;
      default:
        break;
    }
  }, [flatItems, activeIndex, handleSelect]);

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="search-palette-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="search-palette-container" role="dialog" aria-label="Search">
        <div className="search-palette">
          {/* Search Input */}
          <div className="search-palette-input-wrap">
            <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search matches, players, fixtures..."
              className="search-palette-input"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setActiveIndex(0); inputRef.current?.focus(); }}
                className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="search-palette-kbd hidden sm:flex">ESC</kbd>
          </div>

          {/* Results */}
          <div className="search-palette-results" ref={resultsContainerRef}>
            {results.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.title} className="search-palette-section">
                  <div className="search-palette-section-title">
                    <SectionIcon className="w-3 h-3" />
                    <span>{section.title}</span>
                  </div>

                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const idx = globalIndex++;
                    const isActive = idx === activeIndex;

                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`search-palette-item ${isActive ? 'search-palette-item--active' : ''}`}
                      >
                        <div className="search-palette-item-icon">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="search-palette-item-title">
                            <HighlightText text={item.title} query={query} />
                          </div>
                          {item.subtitle && (
                            <div className="search-palette-item-subtitle">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${item.badgeClass || 'text-slate-500'}`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {query && flatItems.length <= 1 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-400">No results found for "<span className="text-white font-semibold">{query}</span>"</p>
                <p className="text-xs text-slate-500 mt-1">Try a different search term or search for a player directly</p>
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="search-palette-footer">
            <div className="flex items-center gap-1.5">
              <kbd className="search-palette-kbd-sm">↑</kbd>
              <kbd className="search-palette-kbd-sm">↓</kbd>
              <span className="text-[10px] text-slate-500">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="search-palette-kbd-sm">↵</kbd>
              <span className="text-[10px] text-slate-500">Select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="search-palette-kbd-sm">esc</kbd>
              <span className="text-[10px] text-slate-500">Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
