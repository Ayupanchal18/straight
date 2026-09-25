import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, X, MapPin, Clock, RefreshCw, AlertCircle, Bell, BellRing, Filter, ChevronRight, Trophy } from 'lucide-react';
import cricketApi from '../../../services/api';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useSEO } from '../../../hooks/useSEO';

// Helper to extract team names or format from match text
const parseMatchMeta = (matchStr = '') => {
  const isT20 = /t20|twenty20|ipl/i.test(matchStr);
  const isODI = /odi|one day|world cup/i.test(matchStr);
  const isTest = /test/i.test(matchStr);
  const format = isT20 ? 'T20' : isODI ? 'ODI' : isTest ? 'TEST' : 'MATCH';

  // Format badge colors
  const formatColors = {
    T20: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    ODI: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    TEST: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    MATCH: 'bg-slate-200/50 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600/30',
  };

  return { format, badgeColor: formatColors[format] || formatColors.MATCH };
};

export const ScheduleList = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'series' | 'results'
  const [selectedFormat, setSelectedFormat] = useState('ALL'); // 'ALL' | 'T20' | 'ODI' | 'TEST'
  const [reminders, setReminders] = useState({});

  useSEO({
    title: 'Upcoming Cricket Match Schedule, International Tours & Fixtures | CricketHub',
    description: 'Explore upcoming international cricket fixtures, bilateral series timetables, T20 league schedules, match venues, and start times.',
    keywords: 'cricket schedule, upcoming cricket matches, cricket timetable, cricket fixtures, international tour schedule',
  });

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

  const toggleReminder = (id) => {
    setReminders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter items
  const filtered = useMemo(() => {
    return schedule.filter(item => {
      const { format } = parseMatchMeta(item.match || item.fullText);
      if (selectedFormat !== 'ALL' && format !== selectedFormat) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const fields = [item.match, item.date, item.venue, item.fullText, item.time];
      return fields.some(f => f && f.toLowerCase().includes(q));
    });
  }, [schedule, searchQuery, selectedFormat]);

  // Group filtered items by Date
  const groupedSchedule = useMemo(() => {
    const groups = {};
    filtered.forEach((item, idx) => {
      const dateKey = item.date || 'Upcoming Fixtures';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push({ ...item, _uniqueId: item.id || `sched-${idx}` });
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Top Tabs & Header ── */}
      <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                  Cricket Fixtures & Schedule
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  International tours, bilateral series & upcoming ICC tournament fixtures
                </p>
              </div>
            </div>

            {/* View Tabs: Matches | Series | Results */}
            <div className="flex items-center gap-1.5 mt-5 bg-slate-100 dark:bg-navy-950/80 p-1 rounded-lg border border-slate-200 dark:border-white/5 w-fit">
              {[
                { id: 'matches', label: 'Matches' },
                { id: 'series', label: 'Series' },
                { id: 'results', label: 'Results' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Format Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-950/60 p-1 rounded-lg border border-slate-200 dark:border-white/5">
              {['ALL', 'T20', 'ODI', 'TEST'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    selectedFormat === fmt
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter teams or series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchSchedule}
              loading={loading}
              icon={RefreshCw}
              aria-label="Refresh schedule"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs"
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Meta Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-medium">
          Showing <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span> scheduled match{filtered.length === 1 ? '' : 'es'}
        </span>
        {selectedFormat !== 'ALL' && (
          <span className="text-blue-600 dark:text-blue-400 font-semibold">Filtered by {selectedFormat} format</span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <Button size="sm" variant="danger" onClick={fetchSchedule}>Retry</Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && schedule.length === 0 && (
        <div className="space-y-3">
          <Skeleton count={5} className="h-20 rounded-xl" />
        </div>
      )}

      {/* Grouped Fixtures List (List View matching Screen 4 of Design) */}
      {!loading && Object.keys(groupedSchedule).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedSchedule).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2.5">
              {/* Date Header Strip */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h2 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                  {dateLabel}
                </h2>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5"></div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {items.length} match{items.length === 1 ? '' : 'es'}
                </span>
              </div>

              {/* Match Rows */}
              <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl divide-y divide-slate-200 dark:divide-white/5 overflow-hidden shadow-sm dark:shadow-lg transition-colors">
                {items.map((item) => {
                  const { format, badgeColor } = parseMatchMeta(item.match || item.fullText);
                  const isReminded = reminders[item._uniqueId];

                  return (
                    <div
                      key={item._uniqueId}
                      className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3.5"
                    >
                      {/* Left: Format + Timing */}
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${badgeColor}`}>
                          {format}
                        </span>
                        {item.time && item.time !== 'TBA' ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.time}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">TBA</span>
                        )}
                      </div>

                      {/* Center: Match Title & Series */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate">
                            {item.match || item.fullText}
                          </h3>
                        </div>
                        {item.series && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.series}
                          </p>
                        )}
                      </div>

                      {/* Right: Venue + Action Button */}
                      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t border-slate-200 dark:border-white/5 md:border-t-0">
                        {item.venue && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={item.venue}>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{item.venue}</span>
                          </div>
                        )}

                        <button
                          onClick={() => toggleReminder(item._uniqueId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isReminded
                              ? 'bg-blue-600/15 border-blue-500/50 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={isReminded ? 'Reminder set!' : 'Remind me before match'}
                        >
                          {isReminded ? (
                            <>
                              <BellRing className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                              <span>Set</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 text-slate-400" />
                              <span>Remind Me</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/5 rounded-xl p-12 text-center shadow-sm dark:shadow-lg">
          <Calendar className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching fixtures found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your search query or choosing a different format filter.
          </p>
          {(searchQuery || selectedFormat !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedFormat('ALL'); }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
