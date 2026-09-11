import React from 'react';
import { Bookmark, User, Radio, Trash2, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../../context/FavoritesContext';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

export const FavoritesView = ({ onSelectPlayer, onSelectTab }) => {
  const { favorites, removeFavorite } = useFavorites();

  const playerFavorites = favorites.filter(f => f.type === 'player');
  const matchFavorites = favorites.filter(f => f.type === 'match');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cricket-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Cricket Watchlist
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pinned cricketers and saved matches for quick access
          </p>
        </div>

        <Badge variant="primary" size="md">
          {favorites.length} Saved Item{favorites.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {/* Pinned Cricketers Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cricket-400" />
          <span>Pinned Players ({playerFavorites.length})</span>
        </h2>

        {playerFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerFavorites.map((fav) => (
              <Card key={fav.identifier} className="p-4 flex items-center justify-between gap-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => onSelectPlayer && onSelectPlayer(fav.name)}
                >
                  <div className="w-12 h-12 rounded-xl bg-pitch-700 p-1 border border-slate-700 flex-shrink-0 overflow-hidden">
                    {fav.image ? (
                      <img src={fav.image} alt={fav.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500 m-auto mt-2" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate hover:text-cricket-400 transition-colors">
                      {fav.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{fav.subtitle || 'Player Profile'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => removeFavorite(fav.identifier)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No players saved yet. Search for a cricketer and click "Add to Watchlist".</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onSelectTab && onSelectTab('players')}
            >
              Search Players
            </Button>
          </div>
        )}
      </div>

      {/* Pinned Matches Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Pinned Matches ({matchFavorites.length})</span>
        </h2>

        {matchFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matchFavorites.map((fav) => (
              <Card key={fav.identifier} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-cricket-400">{fav.name}</span>
                    <button
                      onClick={() => removeFavorite(fav.identifier)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">{fav.subtitle}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Radio className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No matches pinned yet. Click the bookmark icon on any live match card.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onSelectTab && onSelectTab('live')}
            >
              View Live Matches
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
