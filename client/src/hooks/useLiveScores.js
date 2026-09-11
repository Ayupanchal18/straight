import { useState, useEffect, useCallback, useRef } from 'react';
import cricketApi from '../services/api';

export function useLiveScores(pollInterval = 30000, autoPoll = true) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source, setSource] = useState(null);
  const timerRef = useRef(null);

  const fetchScores = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await cricketApi.getLiveScores();
      if (res && res.data) {
        setMatches(res.data);
        setSource(res.source);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch live matches');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();

    if (autoPoll) {
      timerRef.current = setInterval(() => {
        // Only fetch if tab is active/visible
        if (document.visibilityState === 'visible') {
          fetchScores(true);
        }
      }, pollInterval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchScores, pollInterval, autoPoll]);

  return {
    matches,
    loading,
    error,
    lastUpdated,
    source,
    refresh: () => fetchScores(false),
  };
}
