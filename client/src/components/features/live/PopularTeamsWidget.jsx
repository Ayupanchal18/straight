import React from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { TeamBadge } from '../../../utils/teamUtils.jsx';

const POPULAR_TEAMS = [
  { name: 'India', shortName: 'IND' },
  { name: 'Australia', shortName: 'AUS' },
  { name: 'England', shortName: 'ENG' },
  { name: 'Pakistan', shortName: 'PAK' },
  { name: 'South Africa', shortName: 'RSA' },
];

export const PopularTeamsWidget = ({ onSelectTeam }) => {
  return (
    <div className="sports-card p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06] mb-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide font-display">
          Popular Teams
        </h3>
        <span className="text-[11px] font-bold text-blue-600 dark:text-emerald-400 hover:text-blue-500 dark:hover:text-emerald-300 transition-colors cursor-pointer">
          View All
        </span>
      </div>

      <div className="space-y-2">
        {POPULAR_TEAMS.map((team) => (
          <div
            key={team.name}
            onClick={() => onSelectTeam && onSelectTeam(team.name)}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-100/70 hover:bg-slate-200/60 dark:bg-slate-900/30 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-white/[0.03] hover:border-blue-500/30 dark:hover:border-emerald-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <TeamBadge name={team.name} shortName={team.shortName} size="sm" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {team.name}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
