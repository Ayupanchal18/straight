import React, { useState, useEffect } from 'react';
import {
  Radio,
  Calendar,
  User,
  Scale,
  Bookmark,
  Search,
  BarChart2,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Primary nav items matching design image nav order
  const navItems = [
    { id: 'live', label: 'Live', icon: Radio, isLive: true },
    { id: 'schedule', label: 'Series', icon: Calendar },
    { id: 'players', label: 'Players', icon: User },
    { id: 'compare', label: 'Stats', icon: BarChart2 },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'favorites', label: 'More', icon: Bookmark, count: favorites.length },
  ];

  // Deduplicated nav (merge 'Stats' and 'Compare' into the same tab)
  const navLinks = [
    { id: 'live',     label: 'Live',    isLive: true },
    { id: 'schedule', label: 'Series'  },
    { id: 'players',  label: 'Players' },
    { id: 'players',  label: 'Stats'   },
    { id: 'compare',  label: 'Compare' },
    { id: 'favorites',label: 'More ▾', count: favorites.length },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════
          TOP NAVIGATION BAR
          ═══════════════════════════════════════════════ */}
      <header className="glass-nav sticky top-0 z-40 border-b border-white/[0.07]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* ── Logo & Brand ── */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 group"
              onClick={() => setActiveTab('live')}
            >
              {/* Cricket icon badge */}
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-blue-glow flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-sm leading-none">🏏</span>
              </div>
              <span className="text-[15px] font-black tracking-tight text-white">
                Cricket<span className="text-blue-400">Hub</span>
              </span>
            </div>

            {/* ── Desktop Navigation Links ── */}
            <nav className="hidden lg:flex items-center h-full gap-0.5">
              {navLinks.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 cursor-pointer relative ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 font-medium'
                    }`}
                  >
                    {item.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    )}
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {item.count}
                      </span>
                    )}
                    {/* Active underline indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Right: Search + User Avatar ── */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Search bar — desktop (centered like design image) */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-2 w-52 md:w-64 px-3 py-1.5 bg-navy-800/80 border border-white/[0.1] rounded-lg text-[12px] text-slate-400 hover:text-slate-300 hover:border-white/[0.18] hover:bg-navy-700/80 transition-all cursor-pointer group"
                title="Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                <span className="flex-1 text-left truncate">Search players, teams, series...</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-bold text-slate-500 font-mono flex-shrink-0">
                  ⌘K
                </kbd>
              </button>

              {/* Search icon — mobile */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="sm:hidden p-1.5 rounded-lg bg-navy-800/80 border border-white/[0.1] text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* User Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-[11px] font-bold text-white shadow-sm cursor-pointer hover:scale-105 transition-transform select-none flex-shrink-0">
                C
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(v => !v)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.07] bg-navy-900/98 px-4 py-3 space-y-1 animate-slide-up">
            {navLinks.map((item, idx) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`mob-${item.id}-${idx}`}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-500/10 border border-blue-500/20 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
          ═══════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/98 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around safe-area-bottom">
        {[
          { id: 'live',     label: 'Live',     icon: Radio,    isLive: true },
          { id: 'schedule', label: 'Schedule',  icon: Calendar  },
          { id: 'players',  label: 'Players',   icon: User      },
          { id: 'compare',  label: 'Compare',   icon: Scale     },
          { id: 'favorites',label: 'Watchlist', icon: Bookmark, count: favorites.length },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer relative min-w-[44px] ${
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.isLive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-blue-500 text-white text-[8px] font-black flex items-center justify-center px-0.5">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                {item.label.split(' ')[0]}
              </span>
              {/* Active dot */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
