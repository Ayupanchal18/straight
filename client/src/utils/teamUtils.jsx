import React, { useState } from 'react';

/**
 * ISO 3166-1 Alpha-2 / Country & Sub-region code mapping for cricket nations
 * Compatible with FlagCDN & Circle-flags CDN (jsDelivr / HatScripts)
 */
const CRICKET_COUNTRY_CODE_MAP = {
  'india': 'in',
  'pakistan': 'pk',
  'england': 'gb-eng',
  'australia': 'au',
  'south africa': 'za',
  'new zealand': 'nz',
  'sri lanka': 'lk',
  'bangladesh': 'bd',
  'afghanistan': 'af',
  'zimbabwe': 'zw',
  'ireland': 'ie',
  'namibia': 'na',
  'scotland': 'gb-sct',
  'netherlands': 'nl',
  'nepal': 'np',
  'uganda': 'ug',
  'oman': 'om',
  'united arab emirates': 'ae',
  'uae': 'ae',
  'united states': 'us',
  'usa': 'us',
  'canada': 'ca',
  'papua new guinea': 'pg',
  'png': 'pg',
  'kenya': 'ke',
  'japan': 'jp',
  'malaysia': 'my',
  'hong kong': 'hk',
  'singapore': 'sg',
  'kuwait': 'kw',
  'qatar': 'qa',
  'italy': 'it',
  'germany': 'de',
  'jersey': 'je',
  'guernsey': 'gg',
  'bermuda': 'bm',
  'jamaica': 'jm',
  'barbados': 'bb',
  'guyana': 'gy',
  'trinidad': 'tt',
  'trinbago': 'tt',
  'st lucia': 'lc',
  'antigua': 'ag',
};

const TEAM_COLOR_MAP = {
  'england': { bg: 'from-rose-600 to-red-700', text: 'text-white', border: 'border-rose-400/40', short: 'ENG' },
  'pakistan': { bg: 'from-emerald-700 to-green-600', text: 'text-white', border: 'border-emerald-400/40', short: 'PAK' },
  'india': { bg: 'from-blue-600 to-sky-500', text: 'text-white', border: 'border-blue-400/40', short: 'IND' },
  'australia': { bg: 'from-amber-500 to-yellow-400', text: 'text-slate-950', border: 'border-amber-400/40', short: 'AUS' },
  'south africa': { bg: 'from-green-700 to-emerald-600', text: 'text-yellow-300', border: 'border-green-400/40', short: 'RSA' },
  'sri lanka': { bg: 'from-blue-700 to-amber-500', text: 'text-white', border: 'border-blue-400/40', short: 'SL' },
  'namibia': { bg: 'from-blue-700 to-red-600', text: 'text-white', border: 'border-blue-400/40', short: 'NAM' },
  'new zealand': { bg: 'from-slate-900 to-slate-800', text: 'text-white', border: 'border-slate-400/40', short: 'NZ' },
  'west indies': { bg: 'from-rose-900 to-amber-600', text: 'text-white', border: 'border-rose-400/40', short: 'WI' },
  'bangladesh': { bg: 'from-emerald-800 to-red-600', text: 'text-white', border: 'border-emerald-400/40', short: 'BAN' },
  'afghanistan': { bg: 'from-blue-600 to-red-600', text: 'text-white', border: 'border-blue-400/40', short: 'AFG' },
  'zimbabwe': { bg: 'from-red-700 to-amber-500', text: 'text-white', border: 'border-red-400/40', short: 'ZIM' },
  'ireland': { bg: 'from-emerald-600 to-green-400', text: 'text-white', border: 'border-emerald-400/40', short: 'IRE' },
  'scotland': { bg: 'from-blue-800 to-indigo-600', text: 'text-white', border: 'border-blue-400/40', short: 'SCO' },
  'netherlands': { bg: 'from-orange-600 to-amber-500', text: 'text-white', border: 'border-orange-400/40', short: 'NED' },
  'uganda': { bg: 'from-yellow-600 to-red-600', text: 'text-white', border: 'border-yellow-400/40', short: 'UGA' },
};

/**
 * Get country code and CDN Flag URL with high availability
 */
export function getCountryCode(teamName = '') {
  const clean = teamName.toLowerCase().replace(/ women| women's| w\b| u19| men\b/g, '').trim();
  for (const [key, code] of Object.entries(CRICKET_COUNTRY_CODE_MAP)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }
  return null;
}

export function getFlagCdnUrl(countryCode) {
  if (!countryCode) return null;
  // High-performance circular SVG flags from jsDelivr / HatScripts CDN
  return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`;
}

export function getTeamTheme(teamName = '', shortName = '') {
  const clean = teamName.toLowerCase().replace(/ women| women's| w\b| u19/g, '').trim();
  const countryCode = getCountryCode(teamName);
  
  for (const [key, val] of Object.entries(TEAM_COLOR_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        ...val,
        short: shortName || val.short,
        countryCode,
        flagUrl: getFlagCdnUrl(countryCode),
      };
    }
  }

  // Fallback hash gradient
  const short = shortName || (teamName.slice(0, 3).toUpperCase() || 'T1');
  const colors = [
    { bg: 'from-indigo-600 to-blue-500', text: 'text-white', border: 'border-indigo-400/30' },
    { bg: 'from-emerald-600 to-teal-500', text: 'text-white', border: 'border-emerald-400/30' },
    { bg: 'from-amber-600 to-orange-500', text: 'text-white', border: 'border-amber-400/30' },
    { bg: 'from-rose-600 to-pink-500', text: 'text-white', border: 'border-rose-400/30' },
    { bg: 'from-cyan-600 to-blue-600', text: 'text-white', border: 'border-cyan-400/30' },
  ];
  const charCode = (teamName.charCodeAt(0) || 0) + (teamName.charCodeAt(teamName.length - 1) || 0);
  const picked = colors[charCode % colors.length];

  return {
    ...picked,
    short,
    countryCode,
    flagUrl: getFlagCdnUrl(countryCode),
  };
}

/**
 * TeamBadge Component with automatic 3-tier fallback:
 * 1. Circle-flags / FlagCDN Cloudflare SVG
 * 2. Secondary FlagCDN PNG fallback on error
 * 3. Graceful CSS Team Crest with Initials
 */
export const TeamBadge = ({ name = '', shortName = '', size = 'md', className = '' }) => {
  const theme = getTeamTheme(name, shortName);
  const [imgFailed, setImgFailed] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[7px]',
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 text-sm',
    xl: 'w-11 h-11 sm:w-14 sm:h-14 text-base',
  }[size] || 'w-8 h-8 text-xs';

  const handleImageError = () => {
    if (!fallbackAttempted && theme.countryCode) {
      setFallbackAttempted(true);
    } else {
      setImgFailed(true);
    }
  };

  // Determine image source (Circle-flags SVG primary -> FlagCDN PNG secondary)
  const currentSrc = !fallbackAttempted 
    ? theme.flagUrl 
    : theme.countryCode 
      ? `https://flagcdn.com/w80/${theme.countryCode}.png` 
      : null;

  if (currentSrc && !imgFailed) {
    return (
      <div className={`${sizeClasses} ${className} flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden shadow-md ring-1 ring-white/20 bg-slate-900`}>
        <img
          src={currentSrc}
          alt={name || 'Team'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} ${className} rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center font-black shadow-md border ${theme.border} flex-shrink-0`}>
      <span className={theme.text}>{theme.short}</span>
    </div>
  );
};
