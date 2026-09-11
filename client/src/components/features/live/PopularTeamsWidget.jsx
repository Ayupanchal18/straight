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
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <h3 className="text-sm font-extrabold text-white tracking-wide font-display">
          Popular Teams
        </h3>
        <span className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
          View All
        </span>
      </div>

      <div className="space-y-2">
        {POPULAR_TEAMS.map((team) => (
          <div
            key={team.name}
            onClick={() => onSelectTeam && onSelectTeam(team.name)}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/30 hover:bg-slate-800/60 border border-white/[0.03] hover:border-emerald-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <TeamBadge name={team.name} shortName={team.shortName} size="sm" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                {team.name}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-300 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
