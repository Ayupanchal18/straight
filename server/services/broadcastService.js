const cheerio = require('cheerio');

/**
 * Authoritative Global Cricket Broadcast & Telecast Registry
 * Maps tournaments, series, and host cricket boards to verified TV & OTT platforms.
 */
const BROADCAST_REGISTRY = [
  // 1. Asian Games / Multisport Events
  {
    pattern: /asian\s*games/i,
    summary: 'Live streaming on SonyLIV & televised on Sony Sports Network',
    platforms: [
      { name: 'SonyLIV', type: 'OTT', region: 'India & South Asia', badge: 'Official Stream', url: 'https://www.sonyliv.com' },
      { name: 'Sony Sports Network (Sony Ten 1/2/3)', type: 'TV', region: 'India', badge: 'Live TV' },
      { name: 'Sony Sports Network HD', type: 'TV', region: 'South Asia', badge: 'Live Broadcast' },
    ],
  },

  // 2. Indian Premier League (IPL)
  {
    pattern: /ipl|indian\s*premier\s*league/i,
    summary: 'Live streaming in 4K on JioCinema, live telecast on Star Sports Network',
    platforms: [
      { name: 'JioCinema', type: 'OTT', region: 'India', badge: 'Free 4K Stream', url: 'https://www.jiocinema.com/sports' },
      { name: 'Star Sports 1 / HD & Regional', type: 'TV', region: 'India', badge: 'Live TV' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Foxtel & Kayo Sports', type: 'TV & OTT', region: 'Australia', badge: 'Live Stream', url: 'https://kayosports.com.au' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live HD', url: 'https://www.willow.tv' },
      { name: 'SuperSport Cricket', type: 'TV & OTT', region: 'South Africa', badge: 'Live Broadcast', url: 'https://supersport.com/cricket' },
      { name: 'YuppTV', type: 'OTT', region: 'Europe & SE Asia', badge: 'Live Digital', url: 'https://www.yupptv.com' },
    ],
  },

  // 3. Women's Premier League (WPL)
  {
    pattern: /wpl|women'?s\s*premier\s*league/i,
    summary: 'Live streaming on JioCinema, live telecast on Sports18 Network',
    platforms: [
      { name: 'JioCinema', type: 'OTT', region: 'India', badge: 'Free HD Stream', url: 'https://www.jiocinema.com/sports' },
      { name: 'Sports18 1 / HD & Khel', type: 'TV', region: 'India', badge: 'Official Broadcaster' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
      { name: 'Fox Cricket / Kayo', type: 'TV & OTT', region: 'Australia', badge: 'Live Stream', url: 'https://kayosports.com.au' },
    ],
  },

  // 4. ICC Tournaments (Men's & Women's ODI World Cup, T20 World Cup, Champions Trophy, WTC Final, U19)
  {
    pattern: /icc|world\s*cup|champions\s*trophy|wtc|t20\s*world\s*cup|under-?19\s*world\s*cup/i,
    summary: 'Live streaming on Disney+ Hotstar, live broadcast on Star Sports Network',
    platforms: [
      { name: 'Disney+ Hotstar', type: 'OTT', region: 'India', badge: 'Official Stream', url: 'https://www.hotstar.com/in/sports' },
      { name: 'Star Sports 1 / HD & Regional', type: 'TV', region: 'India', badge: 'Live Telecast' },
      { name: 'Sky Sports Cricket & Sky Go', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Amazon Prime Video', type: 'OTT', region: 'Australia', badge: 'Exclusive Live', url: 'https://www.primevideo.com' },
      { name: 'Willow TV & Sling TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
      { name: 'SuperSport Grandstand & Cricket', type: 'TV & OTT', region: 'South Africa', badge: 'Live TV', url: 'https://supersport.com/cricket' },
      { name: 'PTV Sports & Ten Sports', type: 'TV', region: 'Pakistan', badge: 'Live TV' },
      { name: 'Tamasha App', type: 'OTT', region: 'Pakistan', badge: 'Live Digital', url: 'https://tamashaweb.com' },
      { name: 'ICC.tv', type: 'OTT', region: 'Global / Continental Europe', badge: 'Official Stream', url: 'https://www.icc.tv' },
    ],
  },

  // 5. BCCI Home Series & India Domestic (Tour of India, India A, Ranji, Duleep, Irani)
  {
    pattern: /tour\s*of\s*india|india\s*a\s*tour|bcci|ranji|duleep|deodhar|syed\s*mushtaq|irani\s*cup/i,
    summary: 'Live streaming on JioCinema, live telecast on Sports18 Network',
    platforms: [
      { name: 'JioCinema', type: 'OTT', region: 'India', badge: 'Official Digital Partner', url: 'https://www.jiocinema.com/sports' },
      { name: 'Sports18 1 / HD & Khel', type: 'TV', region: 'India', badge: 'Official Broadcaster' },
      { name: 'Colors Cineplex', type: 'TV', region: 'India', badge: 'Live TV' },
      { name: 'TNT Sports', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
      { name: 'Fox Cricket / Kayo', type: 'TV & OTT', region: 'Australia', badge: 'Live Stream', url: 'https://kayosports.com.au' },
    ],
  },

  // 6. ECB & English Cricket (The Ashes in UK, England home tours, County Championship, Vitality Blast, The Hundred)
  {
    pattern: /the\s*hundred|county\s*championship|vitality\s*blast|tour\s*of\s*england|england\s*tour|ecb/i,
    summary: 'Live broadcast on Sky Sports & BBC in UK, streaming on FanCode & SonyLIV in India',
    platforms: [
      { name: 'FanCode', type: 'OTT', region: 'India', badge: 'Live Match Pass', url: 'https://www.fancode.com' },
      { name: 'Sony Sports Network & SonyLIV', type: 'TV & OTT', region: 'India', badge: 'Bilateral Rights', url: 'https://www.sonyliv.com' },
      { name: 'Sky Sports Cricket & Main Event', type: 'TV & OTT', region: 'United Kingdom', badge: 'Official Host Broadcaster', url: 'https://www.skysports.com/cricket' },
      { name: 'BBC iPlayer & BBC Sport', type: 'OTT', region: 'United Kingdom', badge: 'Free Streaming', url: 'https://www.bbc.co.uk/sport/cricket' },
      { name: 'Official County Club YouTube Channels', type: 'OTT', region: 'Global / Free', badge: 'Official Free Live Stream', url: 'https://www.youtube.com' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
      { name: 'Fox Cricket / Kayo', type: 'TV & OTT', region: 'Australia', badge: 'Live Stream', url: 'https://kayosports.com.au' },
    ],
  },

  // 7. Cricket Australia & Australian Domestic (Big Bash League, WBBL, Australia home tours, Sheffield Shield)
  {
    pattern: /big\s*bash|bbl|wbbl|tour\s*of\s*australia|australia\s*tour|sheffield\s*shield|marsh\s*cup/i,
    summary: 'Live broadcast on Channel 7 & Fox Cricket in Australia, Disney+ Hotstar & Star Sports in India',
    platforms: [
      { name: 'Disney+ Hotstar', type: 'OTT', region: 'India', badge: 'Live Streaming', url: 'https://www.hotstar.com/in/sports' },
      { name: 'Star Sports 1 / HD', type: 'TV', region: 'India', badge: 'Live Broadcast' },
      { name: 'Fox Cricket & Kayo Sports', type: 'TV & OTT', region: 'Australia', badge: 'Live 4K Stream', url: 'https://kayosports.com.au' },
      { name: 'Channel 7 (Seven Network)', type: 'TV', region: 'Australia', badge: 'Free-to-Air' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
    ],
  },

  // 8. Pakistan Cricket Board (PSL, Pakistan home tours, National T20)
  {
    pattern: /psl|pakistan\s*super\s*league|tour\s*of\s*pakistan|pakistan\s*tour/i,
    summary: 'Live telecast on A Sports & Ten Sports, streaming on Tamasha in Pakistan, FanCode in India',
    platforms: [
      { name: 'FanCode', type: 'OTT', region: 'India', badge: 'Live Match Pass', url: 'https://www.fancode.com' },
      { name: 'A Sports HD & Ten Sports', type: 'TV', region: 'Pakistan', badge: 'Live Broadcast' },
      { name: 'Tamasha App', type: 'OTT', region: 'Pakistan', badge: 'Official Stream', url: 'https://tamashaweb.com' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Broadcast', url: 'https://www.willow.tv' },
      { name: 'Fox Cricket / Kayo', type: 'TV & OTT', region: 'Australia', badge: 'Live Stream', url: 'https://kayosports.com.au' },
    ],
  },

  // 9. Caribbean Premier League & West Indies (CPL, WCPL, West Indies home series)
  {
    pattern: /cpl|caribbean\s*premier\s*league|tour\s*of\s*west\s*indies|west\s*indies\s*tour/i,
    summary: 'Live streaming on FanCode, live telecast on Star Sports in India',
    platforms: [
      { name: 'FanCode', type: 'OTT', region: 'India', badge: 'Live Stream', url: 'https://www.fancode.com' },
      { name: 'Star Sports 2 / Select', type: 'TV', region: 'India', badge: 'Live Telecast' },
      { name: 'Flow Sports & Rush Sports', type: 'TV & OTT', region: 'Caribbean', badge: 'Official Host Broadcaster' },
      { name: 'TNT Sports', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Broadcast', url: 'https://www.willow.tv' },
    ],
  },

  // 10. SA20 & South Africa (SA20, South Africa home series, CSA T20)
  {
    pattern: /sa20|tour\s*of\s*south\s*africa|south\s*africa\s*tour|csa\s*t20/i,
    summary: 'Live streaming on JioCinema, live telecast on Sports18 in India, SuperSport in SA',
    platforms: [
      { name: 'JioCinema', type: 'OTT', region: 'India', badge: 'Official Digital Partner', url: 'https://www.jiocinema.com/sports' },
      { name: 'Sports18 1 / HD', type: 'TV', region: 'India', badge: 'Live Telecast' },
      { name: 'SuperSport Cricket & Grandstand', type: 'TV & OTT', region: 'South Africa & Sub-Saharan Africa', badge: 'Exclusive Live', url: 'https://supersport.com/cricket' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Live Stream', url: 'https://www.willow.tv' },
    ],
  },

  // 11. Bangladesh Cricket Board & BPL
  {
    pattern: /bpl|bangladesh\s*premier\s*league|tour\s*of\s*bangladesh|bangladesh\s*tour/i,
    summary: 'Live streaming on FanCode in India, T Sports in Bangladesh',
    platforms: [
      { name: 'FanCode', type: 'OTT', region: 'India', badge: 'Live Match Pass', url: 'https://www.fancode.com' },
      { name: 'T Sports & GTV', type: 'TV', region: 'Bangladesh', badge: 'Official Broadcaster' },
      { name: 'Rabbitholebd Sports', type: 'OTT', region: 'Bangladesh & Global', badge: 'Official Stream' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA', badge: 'Live Stream', url: 'https://www.willow.tv' },
    ],
  },

  // 12. Major League Cricket (MLC - USA)
  {
    pattern: /major\s*league\s*cricket|mlc/i,
    summary: 'Live on Willow TV in USA & Canada, JioCinema / Sony in India',
    platforms: [
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA & Canada', badge: 'Exclusive Host Broadcaster', url: 'https://www.willow.tv' },
      { name: 'JioCinema', type: 'OTT', region: 'India', badge: 'Live Stream', url: 'https://www.jiocinema.com/sports' },
      { name: 'Sony Sports Network', type: 'TV', region: 'India', badge: 'Live Telecast' },
      { name: 'TNT Sports', type: 'TV', region: 'United Kingdom', badge: 'Live Broadcast' },
    ],
  },

  // 13. New Zealand Cricket (Super Smash, New Zealand home tours)
  {
    pattern: /super\s*smash|tour\s*of\s*new\s*zealand|new\s*zealand\s*tour|plunket\s*shield/i,
    summary: 'Live on TVNZ in New Zealand, SonyLIV / FanCode in India',
    platforms: [
      { name: 'SonyLIV / FanCode', type: 'OTT', region: 'India', badge: 'Live Stream', url: 'https://www.sonyliv.com' },
      { name: 'Sony Sports Network', type: 'TV', region: 'India', badge: 'Live Broadcast' },
      { name: 'TVNZ+ / Sky Sport NZ', type: 'TV & OTT', region: 'New Zealand', badge: 'Official Broadcaster' },
      { name: 'TNT Sports', type: 'TV', region: 'United Kingdom', badge: 'Live Broadcast' },
    ],
  },

  // 14. Sri Lanka Cricket (Lanka Premier League - LPL, Sri Lanka home series)
  {
    pattern: /lpl|lanka\s*premier\s*league|tour\s*of\s*sri\s*lanka|sri\s*lanka\s*tour/i,
    summary: 'Live on Sony Sports & SonyLIV in India, Supreme TV in Sri Lanka',
    platforms: [
      { name: 'SonyLIV', type: 'OTT', region: 'India', badge: 'Live Stream', url: 'https://www.sonyliv.com' },
      { name: 'Sony Sports Network (Sony Ten 1/5)', type: 'TV', region: 'India & South Asia', badge: 'Live Telecast' },
      { name: 'Supreme TV', type: 'TV', region: 'Sri Lanka', badge: 'Official Broadcaster' },
      { name: 'FanCode', type: 'OTT', region: 'India', badge: 'Live Pass', url: 'https://www.fancode.com' },
    ],
  },

  // 15. International League T20 (ILT20 - UAE)
  {
    pattern: /ilt20|international\s*league\s*t20|uae\s*t20/i,
    summary: 'Live on Zee5 & Zee Cinema in India, global streaming on official digital feeds',
    platforms: [
      { name: 'ZEE5', type: 'OTT', region: 'India & Global', badge: 'Live Stream', url: 'https://www.zee5.com' },
      { name: 'Zee Cinema / &Pictures', type: 'TV', region: 'India', badge: 'Live Telecast' },
      { name: 'Sky Sports Cricket', type: 'TV & OTT', region: 'United Kingdom', badge: 'Live Broadcast', url: 'https://www.skysports.com/cricket' },
      { name: 'Willow TV', type: 'TV & OTT', region: 'USA', badge: 'Live Stream', url: 'https://www.willow.tv' },
    ],
  },
];

// Helper mapping known platform names to official verified stream portals
const PLATFORM_URLS = {
  'sonyliv': 'https://www.sonyliv.com/sports',
  'sony sports': 'https://www.sonyliv.com',
  'jiocinema': 'https://www.jiocinema.com/sports',
  'hotstar': 'https://www.hotstar.com/in/sports',
  'disney+ hotstar': 'https://www.hotstar.com/in/sports',
  'star sports': 'https://www.hotstar.com/in/sports',
  'sports18': 'https://www.jiocinema.com/sports',
  'fancode': 'https://www.fancode.com',
  'sky sports': 'https://www.skysports.com/cricket',
  'bbc iplayer': 'https://www.bbc.co.uk/sport/cricket',
  'willow': 'https://www.willow.tv',
  'kayo': 'https://kayosports.com.au',
  'foxtel': 'https://www.foxtel.com.au',
  'supersport': 'https://supersport.com/cricket',
  'icc.tv': 'https://www.icc.tv',
  'tamasha': 'https://tamashaweb.com',
  'zee5': 'https://www.zee5.com',
  'youtube': 'https://www.youtube.com',
};

const REGION_MAP = {
  'IN': 'India',
  'IND': 'India',
  'UK': 'United Kingdom',
  'GB': 'United Kingdom',
  'US': 'USA & Canada',
  'USA': 'USA & Canada',
  'AU': 'Australia',
  'AUS': 'Australia',
  'NZ': 'New Zealand',
  'SA': 'South Africa',
  'RSA': 'South Africa',
  'PK': 'Pakistan',
  'PAK': 'Pakistan',
  'BD': 'Bangladesh',
  'SL': 'Sri Lanka',
  'GLOBAL': 'Worldwide / Global',
};

/**
 * Extracts Cricbuzz's native Broadcast Guide from the HTML of the cricket-match-facts page
 */
function extractCricbuzzFactsBroadcast(html) {
  if (!html) return null;
  try {
    const $ = cheerio.load(html);
    const platforms = [];

    // Cricbuzz pattern: <a title="Broadcast Guide - IN"> ... followed by .facts-row-grid rows
    $('a[title*="Broadcast Guide"]').each((_, aEl) => {
      const titleAttr = $(aEl).attr('title') || $(aEl).text() || '';
      const regMatch = titleAttr.match(/Broadcast Guide(?:\s*-\s*([A-Za-z0-9]+))?/i);
      const rawCode = regMatch && regMatch[1] ? regMatch[1].toUpperCase() : 'IN';
      const regionName = REGION_MAP[rawCode] || rawCode;

      // Scan the following facts-row-grid elements
      let curr = $(aEl).next();
      while (curr.length && (curr.hasClass('facts-row-grid') || curr.find('.font-bold').length)) {
        const typeEl = curr.find('.font-bold').first();
        const typeLabel = typeEl.text().trim();
        let valText = curr.children().last().text().trim();
        if (valText === typeLabel) {
          valText = curr.text().replace(typeLabel, '').trim();
        }

        if (typeLabel && valText) {
          const isStreaming = /stream|ott|digital|app|online/i.test(typeLabel);
          const isTv = /tv|channel|broadcast|network/i.test(typeLabel);

          // Support multi-channel comma/slash entries
          const entries = valText.split(/[,/&]+/).map(s => s.trim()).filter(Boolean);
          entries.forEach(name => {
            let matchedUrl = null;
            const lowerName = name.toLowerCase();
            for (const [k, u] of Object.entries(PLATFORM_URLS)) {
              if (lowerName.includes(k)) {
                matchedUrl = u;
                break;
              }
            }

            platforms.push({
              name,
              type: isStreaming ? 'OTT' : (isTv ? 'TV' : 'Broadcast'),
              category: typeLabel,
              region: regionName,
              regionCode: rawCode,
              badge: isStreaming ? 'Digital Live Stream' : 'Live TV Channel',
              url: matchedUrl,
              source: 'official_guide',
            });
          });
        }
        curr = curr.next();
      }
    });

    return platforms.length > 0 ? { platforms } : null;
  } catch (err) {
    return null;
  }
}

/**
 * Resolves complete broadcasting and telecast intelligence for a match.
 * Combines Cricbuzz scraped facts with verified broadcast rights registry.
 */
function resolveBroadcastIntelligence({ series = '', title = '', matchFormat = '', cricbuzzFactsHtml = null }) {
  const combinedText = `${series} ${title} ${matchFormat}`.trim();
  const platforms = [];

  // 1. Scrape Cricbuzz native match facts if available
  const scraped = extractCricbuzzFactsBroadcast(cricbuzzFactsHtml);
  if (scraped && scraped.platforms.length > 0) {
    scraped.platforms.forEach(p => {
      platforms.push(p);
    });
  }

  // 2. Query Authoritative Global Rights Registry
  let matchedRule = null;
  for (const rule of BROADCAST_REGISTRY) {
    if (rule.pattern.test(combinedText)) {
      matchedRule = rule;
      rule.platforms.forEach(regPlatform => {
        // Avoid duplicate entries in the same region
        const isDuplicate = platforms.some(
          p => p.name.toLowerCase() === regPlatform.name.toLowerCase() ||
               (regPlatform.name.toLowerCase().includes(p.name.toLowerCase()) && p.region === regPlatform.region)
        );
        if (!isDuplicate) {
          platforms.push({
            ...regPlatform,
            source: 'verified_registry',
          });
        }
      });
      break;
    }
  }

  // 3. Fallback for unlisted domestic / associate matches
  if (platforms.length === 0) {
    platforms.push(
      {
        name: 'FanCode',
        type: 'OTT',
        region: 'India & South Asia',
        badge: 'Live Match Pass',
        url: 'https://www.fancode.com',
        source: 'default_broadcaster',
      },
      {
        name: 'ICC.tv / Official Board Stream',
        type: 'OTT',
        region: 'Global / Worldwide',
        badge: 'Free & Official Live Stream',
        url: 'https://www.icc.tv',
        source: 'default_broadcaster',
      }
    );
  }

  // 4. Group by regions for seamless tab filtering in frontend
  const regionMap = {};
  platforms.forEach(p => {
    const reg = p.region || 'Global';
    if (!regionMap[reg]) {
      regionMap[reg] = { region: reg, platforms: [] };
    }
    regionMap[reg].platforms.push(p);
  });

  // 5. Generate concise, human-readable summary
  const ottPlatforms = platforms.filter(p => p.type === 'OTT' || p.type === 'TV & OTT');
  const tvPlatforms = platforms.filter(p => p.type === 'TV' || p.type === 'TV & OTT');

  let summary = matchedRule?.summary;
  if (!summary) {
    if (ottPlatforms.length > 0 && tvPlatforms.length > 0) {
      summary = `Live streaming on ${ottPlatforms[0].name} and televised live on ${tvPlatforms[0].name}`;
    } else if (ottPlatforms.length > 0) {
      summary = `Live streaming exclusively on ${ottPlatforms[0].name}`;
    } else if (tvPlatforms.length > 0) {
      summary = `Televised live on ${tvPlatforms[0].name}`;
    } else {
      summary = 'Available via official cricket broadcasting partners';
    }
  }

  return {
    available: true,
    summary,
    platforms,
    regions: Object.values(regionMap),
    ottCount: ottPlatforms.length,
    tvCount: tvPlatforms.length,
    totalCount: platforms.length,
  };
}

module.exports = {
  extractCricbuzzFactsBroadcast,
  resolveBroadcastIntelligence,
  BROADCAST_REGISTRY,
};
