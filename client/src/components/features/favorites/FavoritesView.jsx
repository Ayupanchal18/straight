import React, { useState } from 'react';
import { Bookmark, User, Radio, Trash2, ArrowRight, Eye, Shield } from 'lucide-react';
import { useFavorites } from '../../../context/FavoritesContext';
import { TeamBadge } from '../../../utils/teamUtils.jsx';

export const FavoritesView = ({ onSelectPlayer, onSelectTab }) => {
  const { favorites, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matches' | 'players'

  const playerFavorites = favorites.filter(f => f.type === 'player');
  const matchFavorites = favorites.filter(f => f.type === 'match');

  const filteredFavorites = activeTab === 'players' 
    ? playerFavorites 
    : activeTab === 'matches' 
      ? matchFavorites 
      : favorites;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Top Header & Tab Row (Screen 6 style) ── */}
      <div className="bg-[#0b1120] border border-white/5 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bookmark className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                  My Watchlist
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pinned cricketers and saved fixtures for fast personal tracking
                </p>
              </div>
            </div>

            {/* Watchlist Tabs */}
            <div className="flex items-center gap-1.5 mt-5 bg-navy-950/80 p-1 rounded-lg border border-white/5 w-fit">
              {[
                { id: 'all', label: `All (${favorites.length})` },
                { id: 'matches', label: `Matches (${matchFavorites.length})` },
                { id: 'players', label: `Players (${playerFavorites.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab && onSelectTab('players')}
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
            >
              + Add Cricketer
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('live')}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Explore Live
            </button>
          </div>
        </div>
      </div>

      {/* ── Saved Items List (Row Layout) ── */}
      {filteredFavorites.length > 0 ? (
        <div className="bg-[#0b1120] border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {filteredFavorites.map((fav) => {
            const isPlayer = fav.type === 'player';

            return (
              <div
                key={fav.identifier}
                className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail / Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#070b14] border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {fav.image ? (
                      <img src={fav.image} alt={fav.name} className="w-full h-full object-cover object-top" />
                    ) : isPlayer ? (
                      <User className="w-6 h-6 text-slate-500" />
                    ) : (
                      <Radio className="w-6 h-6 text-blue-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        isPlayer 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isPlayer ? 'Player' : 'Match'}
                      </span>
                      {fav.meta?.country && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <TeamBadge name={fav.meta.country} size="xs" />
                          <span>{fav.meta.country}</span>
                        </div>
                      )}
                    </div>

                    <h3 
                      onClick={() => isPlayer && onSelectPlayer && onSelectPlayer(fav.name)}
                      className="text-sm sm:text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer truncate"
                    >
                      {fav.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {fav.subtitle || (isPlayer ? 'Player Profile' : 'Live Match Fixture')}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                  {isPlayer ? (
                    <button
                      onClick={() => onSelectPlayer && onSelectPlayer(fav.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectTab && onSelectTab('live')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      <span>View Match</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => removeFavorite(fav.identifier)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove from watchlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0b1120] border border-white/5 rounded-xl p-12 text-center shadow-xl">
          <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Your Watchlist is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Bookmark live matches or save star cricketers for quick access directly from this dashboard.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => onSelectTab && onSelectTab('live')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Browse Live Matches
            </button>
            <button
              onClick={() => onSelectTab && onSelectTab('players')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-colors"
            >
              Explore Cricketers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
