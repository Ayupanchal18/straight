import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, Clock, RefreshCw, AlertCircle, Trophy, Globe } from 'lucide-react';
import cricketApi from '../../../services/api';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';

export const ScheduleList = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cricketApi.getSchedule();
      if (res && res.data) {
        setSchedule(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const filtered = schedule.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.match && item.match.toLowerCase().includes(q)) ||
      (item.date && item.date.toLowerCase().includes(q)) ||
      (item.venue && item.venue.toLowerCase().includes(q)) ||
      (item.fullText && item.fullText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="sports-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Upcoming Match Schedule
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            International tour fixtures, bilateral series & upcoming tournament schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search bar inside Schedule */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search team or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0b101d] border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSchedule}
            loading={loading}
            icon={RefreshCw}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Meta status bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filtered.length} fixture{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {/* Error state */}
      {error && (
        <div className="sports-card p-4 border-red-500/30 bg-red-500/10 text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <Button size="sm" variant="danger" onClick={fetchSchedule}>Retry</Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && schedule.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton count={6} className="h-32 rounded-2xl" />
        </div>
      )}

      {/* Fixtures List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div key={item.id || idx} className="sports-card p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <Calendar className="w-3 h-3" />
                    {item.date || 'Upcoming'}
                  </span>
                  {item.time && item.time !== 'TBA' && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mt-2 leading-snug">
                  {item.match || item.fullText}
                </h3>
              </div>

              {item.venue && (
                <div className="mt-3.5 pt-2.5 border-t border-white/[0.04] flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{item.venue}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="sports-card p-12 text-center">
          <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No matching fixtures found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or refreshing the schedule.</p>
        </div>
      ) : null}
    </div>
  );
};
