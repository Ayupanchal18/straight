import React, { useState } from 'react';
import {
  Radio,
  Calendar,
  Scale,
  Bookmark,
  Search,
  BarChart2,
  Menu,
  X,
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Primary navigation links
  const navLinks = [
    { id: 'live', label: 'Live', isLive: true },
    { id: 'schedule', label: 'Series' },
    { id: 'players', label: 'Players' },
    { id: 'compare', label: 'Compare' },
    { id: 'favorites', label: 'Watchlist', count: favorites.length },
    { id: 'support', label: 'Buy Me a Coffee', icon: '☕' },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════
          TOP NAVIGATION BAR
          ═══════════════════════════════════════════════ */}
      <header className="glass-nav sticky top-0 z-40 border-b border-slate-200 dark:border-white/[0.07]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* ── Logo & Brand ── */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 group"
              onClick={() => setActiveTab('live')}
            >
              {/* Cricket icon badge */}
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="text-sm leading-none">🏏</span>
              </div>
              <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white font-display">
                Cricket<span className="text-blue-500">Hub</span>
              </span>
            </div>

            {/* ── Desktop Navigation Links ── */}
            <nav className="hidden lg:flex items-center h-full gap-1">
              {navLinks.map((item, idx) => {
                const isActive = activeTab === item.id || (item.id === 'support' && activeTab === 'coffee');
                const isCoffee = item.id === 'support';
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 cursor-pointer relative ${
                      isActive
                        ? isCoffee
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-blue-600 dark:text-white font-bold'
                        : isCoffee
                          ? 'text-amber-600/90 hover:text-amber-700 dark:text-amber-400/90 dark:hover:text-amber-300 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    {item.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    )}
                    {item.icon && (
                      <span className="text-xs leading-none flex-shrink-0">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        {item.count}
                      </span>
                    )}
                    {/* Active underline indicator */}
                    {isActive && (
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full ${
                        isCoffee ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Right: Search + Theme Toggle + User Avatar ── */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Search bar — desktop */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-2 w-48 md:w-60 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-800/80 dark:hover:bg-navy-700/80 border border-slate-200 dark:border-white/[0.1] rounded-lg text-[12px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-all cursor-pointer group"
                title="Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                <span className="flex-1 text-left truncate">Search players, teams...</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[9px] font-bold text-slate-500 font-mono flex-shrink-0">
                  ⌘K
                </kbd>
              </button>

              {/* Search icon — mobile */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="sm:hidden p-2 rounded-lg bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-white/[0.1] text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Buy Me a Coffee / Support button */}
              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs select-none ${
                  activeTab === 'support' || activeTab === 'coffee'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-amber-500/20 font-extrabold'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/25'
                }`}
                title="Support CricketHub - Buy Me a Coffee"
              >
                <span>☕</span>
                <span className="hidden md:inline">Support</span>
              </button>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(v => !v)}
                className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-white/[0.07] bg-white/98 dark:bg-navy-900/98 px-4 py-3 space-y-1 shadow-lg animate-slide-up">
            {navLinks.map((item, idx) => {
              const isActive = activeTab === item.id || (item.id === 'support' && activeTab === 'coffee');
              const isCoffee = item.id === 'support';
              return (
                <button
                  key={`mob-${item.id}-${idx}`}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? isCoffee
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-white font-bold'
                      : isCoffee
                        ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {item.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {item.icon && (
                    <span className="text-base">{item.icon}</span>
                  )}
                  <span className={`flex-1 text-left ${isCoffee ? 'font-bold' : ''}`}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between px-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle showLabel={true} />
            </div>
          </div>
        )}
      </header>
    </>
  );
};
