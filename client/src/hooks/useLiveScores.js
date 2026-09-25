import { useState, useEffect, useCallback, useRef } from 'react';
import cricketApi from '../services/api';

/**
 * Compute adaptive polling frequency based on match states
 */
function computeAdaptiveInterval(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return 30000;
  }

  const liveMatches = matches.filter(m => {
    return m.isLive || (!m.isComplete && !m.isUpcoming);
  });

  // No active live matches right now
  if (liveMatches.length === 0) {
    return 120000; // 2 minutes for upcoming/results only
  }

  // Check if all live matches are paused (e.g. Stumps, Lunch, Tea, Rain delay, Innings Break)
  const allPaused = liveMatches.every(m => {
    const s = (m.status || '').toLowerCase();
    return s.includes('stumps') || s.includes('lunch') || s.includes('tea') || 
           s.includes('delay') || s.includes('rain') || s.includes('break') || 
           s.includes('wet outfield') || s.includes('toss');
  });

  if (allPaused) {
    return 60000; // 60s for paused / stumps matches
  }

  // Active ball-in-play matches
  return 15000; // 15s fast heartbeat
}

export function useLiveScores(defaultInterval = 30000, autoPoll = true) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source, setSource] = useState(null);
  const [adaptiveInterval, setAdaptiveInterval] = useState(defaultInterval);
  const [recentWicketEvent, setRecentWicketEvent] = useState(null);

  const prevMatchesMapRef = useRef(new Map());
  const timerRef = useRef(null);

  const fetchScores = useCallback(async (isSilent = false, forceFresh = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const res = await cricketApi.getLiveScores(forceFresh);
      if (res && res.data) {
        const nextMatches = res.data;
        
        // Detect Wicket delta across all live matches
        const prevMap = prevMatchesMapRef.current;
        let detectedWicket = null;

        if (prevMap.size > 0) {
          for (const m of nextMatches) {
            const matchId = m.id || m.rawText;
            const prev = prevMap.get(matchId);
            if (prev && m.isLive) {
              const prevW1 = parseInt((prev.team1Score || '').split('/')[1], 10) || 0;
              const currW1 = parseInt((m.team1Score || '').split('/')[1], 10) || 0;
              const prevW2 = parseInt((prev.team2Score || '').split('/')[1], 10) || 0;
              const currW2 = parseInt((m.team2Score || '').split('/')[1], 10) || 0;

              if (currW1 > prevW1) {
                detectedWicket = { team: m.team1ShortName || m.team1, score: m.team1Score, match };
                break;
              } else if (currW2 > prevW2) {
                detectedWicket = { team: m.team2ShortName || m.team2, score: m.team2Score, match };
                break;
              }
            }
          }
        }

        // Cache current matches in Map for next comparison
        const newMap = new Map();
        nextMatches.forEach(m => newMap.set(m.id || m.rawText, m));
        prevMatchesMapRef.current = newMap;

        if (detectedWicket) {
          setRecentWicketEvent(detectedWicket);
          setTimeout(() => setRecentWicketEvent(null), 5000);
        }

        setMatches(nextMatches);
        setSource(res.source);
        setLastUpdated(new Date());

        // Update adaptive interval based on the fresh data
        const nextInterval = computeAdaptiveInterval(nextMatches);
        setAdaptiveInterval(nextInterval);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch live matches');
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();

    // Immediate refetch when user switches back to the tab
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchScores(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    if (autoPoll) {
      timerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchScores(true);
        }
      }, adaptiveInterval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [fetchScores, adaptiveInterval, autoPoll]);

  return {
    matches,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    source,
    adaptiveInterval,
    recentWicketEvent,
    refresh: () => fetchScores(false, true), // Hard refresh: forces live pitch scrape bypassing cache
  };
}
