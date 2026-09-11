import React, { createContext, useContext, useState, useEffect } from 'react';
import cricketApi from '../services/api';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pinnedMatchId, setPinnedMatchId] = useState(() => {
    try {
      return localStorage.getItem('cricket_pinned_match_id') || null;
    } catch {
      return null;
    }
  });

  // Load from local storage or backend
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await cricketApi.getFavorites();
      if (res && res.data) {
        setFavorites(res.data);
      }
    } catch {
      // Local storage fallback
      const saved = localStorage.getItem('cricket_favorites');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Save to local storage whenever favorites change
  useEffect(() => {
    localStorage.setItem('cricket_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save pinned match ID
  useEffect(() => {
    if (pinnedMatchId) {
      localStorage.setItem('cricket_pinned_match_id', pinnedMatchId);
    } else {
      localStorage.removeItem('cricket_pinned_match_id');
    }
  }, [pinnedMatchId]);

  const pinMatch = (matchId) => {
    setPinnedMatchId(matchId);
  };

  const unpinMatch = () => {
    setPinnedMatchId(null);
  };

  const togglePinMatch = (match) => {
    const id = match.id || match.rawText;
    if (pinnedMatchId === id) {
      setPinnedMatchId(null);
      removeFavorite(id);
    } else {
      setPinnedMatchId(id);
      addFavorite({
        type: 'match',
        identifier: id,
        name: match.header || `${match.team1} vs ${match.team2}`,
        subtitle: match.status || 'Match in progress',
        meta: match,
      });
    }
  };

  const addFavorite = async (item) => {
    try {
      const res = await cricketApi.addFavorite(item);
      const newFav = res.data || item;
      setFavorites(prev => {
        const filtered = prev.filter(f => !(f.type === item.type && f.identifier === item.identifier));
        return [newFav, ...filtered];
      });
      return true;
    } catch {
      // Local fallback
      setFavorites(prev => {
        const filtered = prev.filter(f => !(f.type === item.type && f.identifier === item.identifier));
        return [{ ...item, _id: Date.now().toString() }, ...filtered];
      });
      return true;
    }
  };

  const removeFavorite = async (identifier) => {
    try {
      await cricketApi.removeFavorite(identifier);
    } catch {
      // Continue with client state removal
    }
    setFavorites(prev => prev.filter(f => f.identifier !== identifier && f._id !== identifier));
    if (pinnedMatchId === identifier) {
      setPinnedMatchId(null);
    }
  };

  const isFavorite = (type, identifier) => {
    return favorites.some(f => f.type === type && f.identifier.toLowerCase() === identifier.toLowerCase());
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      loading, 
      addFavorite, 
      removeFavorite, 
      isFavorite,
      pinnedMatchId,
      pinMatch,
      unpinMatch,
      togglePinMatch,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
