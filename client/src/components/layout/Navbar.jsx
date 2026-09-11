import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Calendar, 
  User, 
  Scale, 
  Bookmark, 
  Flame,
  Search,
  Moon,
  Newspaper,
  BarChart2,
  Trophy
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

export const Navbar = ({ activeTab, setActiveTab, onGlobalSearch }) => {
  const { favorites } = useFavorites();
  const [searchVal, setSearchVal] = useState('');

  const navItems = [
    { id: 'live', label: 'Live Scores', icon: Radio, isLive: true },
    { id: 'schedule', label: 'Fixtures', icon: Calendar },
    { id: 'results', label: 'Results', icon: BarChart2 },
    { id: 'players', label: 'Player Stats', icon: User },
    { id: 'compare', label: 'H2H Compare', icon: Scale },
    { id: 'favorites', label: 'Watchlist', icon: Bookmark, count: favorites.length },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim() && onGlobalSearch) {
      onGlobalSearch(searchVal.trim());
    }
  };

  return (
    <>
      {/* ── Top Header Bar (Desktop & Tablet) ── */}
      <header className="glass-nav sticky top-0 z-40 border-b border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
              onClick={() => setActiveTab('live')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white font-display">
                    CRICKET<span className="text-emerald-400">HUB</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wide hidden lg:block">Real-time Scores. Deeper Insights.</p>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id === 'results' ? 'live' : item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] flex items-center justify-center font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Tools: Search, Theme, Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Header Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search teams, players..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </form>

              {/* Dark/Light toggle placeholder */}
              <button 
                type="button"
                title="Theme Toggle"
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              {/* User Avatar */}
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors">
                H
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a12]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'results' ? 'live' : item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'} transition-transform`} />
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[12px] h-[12px] rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black flex items-center justify-center px-0.5">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-1 font-bold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
