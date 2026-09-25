const http = require('http');
const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');

// Persistent connection pooling agents for fast warm requests
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 25, keepAliveMsecs: 30000 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 25, keepAliveMsecs: 30000 });

const client = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

const path = require('path');
const fs = require('fs');
const { resolveBroadcastIntelligence } = require('./broadcastService');

// Master Player Registry loaded from verified database (1,100+ players & legends)
let PLAYER_REGISTRY = {};
try {
  const registryPath = path.join(__dirname, '../data/playerRegistry.json');
  if (fs.existsSync(registryPath)) {
    PLAYER_REGISTRY = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
} catch (e) {
  console.warn('[ScraperService] Could not load playerRegistry.json:', e.message);
}

// Global runtime cache for verified match stadium venues (synced between live scores & match details)
const VENUE_CACHE = new Map();

/**
 * Dynamically register a player profile in the runtime registry
 */
function registerPlayerProfile(name, url) {
  if (!name || !url) return;
  const cleanKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanKey.length >= 3) {
    PLAYER_REGISTRY[cleanKey] = url;
  }
}

/**
 * Accurately classify match as Live, Upcoming, or Completed
 */
function evaluateMatchState(m, header = {}, mini = {}) {
  const statusLower = (m.status || header.status || mini.status || '').toLowerCase().trim();
  const stateLower = (m.state || header.state || '').toLowerCase().trim();
  const rawTextLower = (m.rawText || '').toLowerCase().trim();

  // 1. Is it Completed / Ended?
  const isComplete = Boolean(
    header.complete ||
    stateLower === 'complete' ||
    stateLower === 'result' ||
    statusLower.includes(' won') ||
    statusLower.includes('won by') ||
    statusLower.includes('match drawn') ||
    statusLower.includes('match tied') ||
    statusLower.includes('abandon') ||
    statusLower.includes('no result') ||
    statusLower.includes('conceded') ||
    rawTextLower.includes(' won') ||
    rawTextLower.includes(' - complete') ||
    rawTextLower.includes(' - nhnts won') ||
    rawTextLower.includes(' - indw won') ||
    rawTextLower.includes(' - tkrw won') ||
    rawTextLower.includes(' - gloucs won')
  );

  // 2. Is it Upcoming / Not started yet?
  const isUpcoming = Boolean(
    !isComplete && (
      stateLower === 'preview' ||
      stateLower === 'upcoming' ||
      stateLower === 'scheduled' ||
      statusLower === 'preview' ||
      statusLower === 'scheduled' ||
      statusLower === 'upcoming' ||
      statusLower.includes('starts at') ||
      statusLower.includes('match starts at') ||
      statusLower.includes('toss at') ||
      statusLower.includes('toss delayed') ||
      statusLower.includes('no toss yet') ||
      rawTextLower.includes(' - preview') ||
      rawTextLower.includes(' - scheduled') ||
      rawTextLower.includes('starts at') ||
      (!m.team1Score && !m.team2Score && (!m.inningsScores || m.inningsScores.length === 0) && (!m.currentBatsmen || m.currentBatsmen.length === 0) && !statusLower.includes('live') && !statusLower.includes('opt to bat') && !statusLower.includes('opt to bowl') && !statusLower.includes('stumps') && !statusLower.includes('day') && !statusLower.includes('trail') && !statusLower.includes('lead') && !statusLower.includes('break') && !statusLower.includes('lunch') && !statusLower.includes('tea'))
    )
  );

  // 3. Truly LIVE match (in progress right now)
  const isLive = !isComplete && !isUpcoming;

  return { isLive, isComplete, isUpcoming };
}

/**
 * Standardize any match status string or scheduled time strictly to IST (Asia/Kolkata)
 */
function convertStatusToIST(rawStatus, timestamp) {
  if (!rawStatus) return rawStatus;

  // 1. If timestamp exists and status is a scheduled "starts at" message
  if (timestamp && /starts at/i.test(rawStatus)) {
    try {
      const d = new Date(timestamp);
      const dateStr = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `Match starts at ${dateStr}, ${timeStr} IST`;
    } catch (e) {}
  }

  // 2. Regex fallback for GMT strings like "Match starts at Sep 25, 00:00 GMT" or "... at 14:30 GMT"
  const gmtMatch = rawStatus.match(/(starts at\s+)?([A-Za-z]+ \d+),?\s+(\d{1,2}:\d{2})\s*GMT/i);
  if (gmtMatch) {
    try {
      const datePart = gmtMatch[2];
      const timePart = gmtMatch[3];
      const currentYear = new Date().getFullYear();
      const parsedUtc = new Date(`${datePart} ${currentYear} ${timePart} UTC`);
      if (!isNaN(parsedUtc.getTime())) {
        const dateStr = parsedUtc.toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
        });
        const timeStr = parsedUtc.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        return rawStatus.replace(gmtMatch[0], `${gmtMatch[1] || ''}${dateStr}, ${timeStr} IST`);
      }
    } catch (e) {}
  }

  return rawStatus;
}

/**
 * Scrape Live Scores from Cricbuzz — enriched with JSON API for actual scores
 */
async function scrapeLiveMatches() {
  try {
    const url = 'https://m.cricbuzz.com/cricket-match/live-scores';
    const { data: html } = await client.get(url);
    const $ = cheerio.load(html);

    // Step 1: Extract authentic match venues from structured JSON-LD ItemList
    const structuredVenues = new Map();
    $('script[type="application/ld+json"]').each(function () {
      try {
        const json = JSON.parse($(this).html());
        const items = json.mainEntity?.itemListElement;
        if (Array.isArray(items)) {
          items.forEach(it => {
            const t1 = (it.competitor?.[0]?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const t2 = (it.competitor?.[1]?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const loc = (it.location || '').replace(/,\s*$/, '').trim();
            if (t1 && t2 && loc) {
              structuredVenues.set(`${t1}_vs_${t2}`, loc);
              structuredVenues.set(`${t2}_vs_${t1}`, loc);
            }
          });
        }
      } catch (e) {}
    });

    // Step 2: Extract all match links and deduplicate by matchId
    const matchMap = new Map();

    $('a[href*="/live-cricket-scores/"]').each(function () {
      const title = $(this).attr('title') || '';
      const href = $(this).attr('href') || '';
      if (title.length < 5 || title === 'Live Score') return;

      // Extract matchId from href
      const idMatch = href.match(/\/live-cricket-scores\/(\d+)/);
      if (!idMatch) return;
      const matchId = idMatch[1];
      if (matchMap.has(matchId)) return; // deduplicate

      let team1 = '';
      let team2 = '';
      let matchType = '';
      let status = '';

      // Try parsing with status: "Pakistan vs England, 3rd Test - Trail by 18"
      const withStatus = title.match(/^(.+?)\s+vs\s+(.+?),\s*(.+?)\s*-\s*(.+?)\s*$/i);
      if (withStatus) {
        team1 = withStatus[1].trim();
        team2 = withStatus[2].trim();
        matchType = withStatus[3].trim();
        status = withStatus[4].trim();
      } else {
        // Try parsing without status: "Pakistan vs England, 3rd Test"
        const withoutStatus = title.match(/^(.+?)\s+vs\s+(.+?),\s*(.+?)\s*$/i);
        if (withoutStatus) {
          team1 = withoutStatus[1].trim();
          team2 = withoutStatus[2].trim();
          matchType = withoutStatus[3].trim();
        } else if (title.includes(' vs ')) {
          const parts = title.split(' vs ');
          team1 = parts[0].trim();
          team2 = (parts[1] || '').split(',')[0].trim();
        }
      }

      if (!team1 || !team2) return;

      const cleanLink = href.startsWith('http') ? href : `https://www.cricbuzz.com${href}`;

      // Resolve venue accurately from structured JSON-LD or runtime cache
      const t1Clean = team1.toLowerCase().replace(/[^a-z0-9]/g, '');
      const t2Clean = team2.toLowerCase().replace(/[^a-z0-9]/g, '');
      const venueKey = `${t1Clean}_vs_${t2Clean}`;
      const matchedVenue = structuredVenues.get(venueKey) || VENUE_CACHE.get(String(matchId)) || null;
      if (matchedVenue) {
        VENUE_CACHE.set(String(matchId), matchedVenue);
      }

      const rawMatchObj = {
        id: `match-${matchId}`,
        matchId,
        header: `${team1} vs ${team2}`,
        team1,
        team2,
        matchType,
        rawText: title,
        status: status || 'Scheduled',
        venue: matchedVenue,
        cricbuzzLink: cleanLink,
        team1Score: null,
        team2Score: null,
        team1Overs: null,
        team2Overs: null,
        currentBatsmen: [],
        currentBowlers: [],
        inningsScores: [],
      };

      const initialClassification = evaluateMatchState(rawMatchObj);
      rawMatchObj.isLive = initialClassification.isLive;
      rawMatchObj.isComplete = initialClassification.isComplete;
      rawMatchObj.isUpcoming = initialClassification.isUpcoming;

      matchMap.set(matchId, rawMatchObj);
    });

    const matches = Array.from(matchMap.values());

    // Step 2: Batch-enrich matches with live scores from JSON API
    const enrichLimit = Math.min(matches.length, 35);
    const enrichPromises = matches.slice(0, enrichLimit).map(async function (m) {
      try {
        const { data } = await client.get(
          `https://www.cricbuzz.com/api/mcenter/comm/${m.matchId}`,
          {
            headers: {
              ...client.defaults.headers,
              'Accept': 'application/json, text/plain, */*',
            },
            timeout: 6000,
          }
        );

        const header = data.matchHeader || {};
        const mini = data.miniscore || {};
        const scoreDetails = mini.matchScoreDetails || {};

        // Update status and timings from real-time API (strictly in IST)
        const rawLiveStatus = header.status || mini.status || m.status;
        m.status = convertStatusToIST(rawLiveStatus, header.matchStartTimestamp);
        m.state = header.state || '';
        m.matchStartTimestamp = header.matchStartTimestamp || null;
        if (header.matchStartTimestamp) {
          m.startTime = new Date(header.matchStartTimestamp).toISOString();
          m.startTimeIST = header.matchStartTimeIST 
            ? (header.matchStartTimeIST.includes('IST') ? header.matchStartTimeIST : `${header.matchStartTimeIST} IST`)
            : new Date(header.matchStartTimestamp).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }) + ' IST';
        }
        if (!m.venue && VENUE_CACHE.has(String(m.matchId))) {
          m.venue = VENUE_CACHE.get(String(m.matchId));
        }
        m.matchFormat = header.matchFormat || m.matchType;
        m.matchDescription = header.matchDescription || m.matchType;
        m.series = header.seriesName || header.seriesDesc || '';

        // Properly align team names and short names from authoritative API header
        if (header.team1?.name) m.team1 = header.team1.name;
        if (header.team2?.name) m.team2 = header.team2.name;
        m.team1ShortName = header.team1?.shortName || m.team1.slice(0, 3).toUpperCase();
        m.team2ShortName = header.team2?.shortName || m.team2.slice(0, 3).toUpperCase();
        m.team1Id = header.team1?.id;
        m.team2Id = header.team2?.id;

        // Currently batting team ID (for active indicator)
        m.currentBattingTeamId = mini.batTeam?.teamId || null;

        // Parse all innings scores
        const innList = scoreDetails.inningsScoreList || [];
        m.inningsScores = innList.map(function (inn) {
          return {
            inningsId: inn.inningsId,
            battingTeam: inn.batTeamName,
            battingTeamId: inn.batTeamId,
            score: inn.score,
            wickets: inn.wickets,
            overs: inn.overs,
            isDeclared: !!inn.isDeclared,
          };
        });

        // Map team1/team2 primary scores (latest innings per team)
        const t1Id = header.team1?.id;
        const t2Id = header.team2?.id;
        const t1Innings = innList.filter(function (inn) { return inn.batTeamId === t1Id; });
        const t2Innings = innList.filter(function (inn) { return inn.batTeamId === t2Id; });

        if (t1Innings.length > 0) {
          const latest = t1Innings[t1Innings.length - 1];
          m.team1Score = `${latest.score}/${latest.wickets}`;
          m.team1Overs = `${latest.overs}`;
          if (t1Innings.length > 1) {
            m.team1PrevScore = `${t1Innings[0].score}/${t1Innings[0].wickets}`;
          }
        }
        if (t2Innings.length > 0) {
          const latest = t2Innings[t2Innings.length - 1];
          m.team2Score = `${latest.score}/${latest.wickets}`;
          m.team2Overs = `${latest.overs}`;
          if (t2Innings.length > 1) {
            m.team2PrevScore = `${t2Innings[0].score}/${t2Innings[0].wickets}`;
          }
        }

        // Current batsmen summary (for card preview)
        if (mini.batsmanStriker && mini.batsmanStriker.name) {
          m.currentBatsmen.push({
            name: mini.batsmanStriker.name,
            runs: mini.batsmanStriker.runs,
            balls: mini.batsmanStriker.balls,
            fours: mini.batsmanStriker.fours,
            sixes: mini.batsmanStriker.sixes,
            strikeRate: mini.batsmanStriker.strikeRate,
            isStriker: true,
          });
        }
        if (mini.batsmanNonStriker && mini.batsmanNonStriker.name) {
          m.currentBatsmen.push({
            name: mini.batsmanNonStriker.name,
            runs: mini.batsmanNonStriker.runs,
            balls: mini.batsmanNonStriker.balls,
            fours: mini.batsmanNonStriker.fours,
            sixes: mini.batsmanNonStriker.sixes,
            strikeRate: mini.batsmanNonStriker.strikeRate,
            isStriker: false,
          });
        }

        // Current bowler summary
        if (mini.bowlerStriker) {
          m.currentBowlers.push({
            name: mini.bowlerStriker.name,
            wickets: mini.bowlerStriker.wickets,
            runs: mini.bowlerStriker.runs,
            overs: mini.bowlerStriker.overs,
          });
        }

        // CRR / Target / Recent Overs
        m.currentRunRate = mini.currentRunRate || null;
        m.target = mini.target || null;
        m.recentOvers = mini.recentOvsStats || null;
        m.recentBalls = mini.recentOvsStats ? mini.recentOvsStats.trim().split(/\s+/).filter(Boolean) : [];

        // Accurate state classification after receiving real-time API data
        const classification = evaluateMatchState(m, header, mini);
        m.isLive = classification.isLive;
        m.isComplete = classification.isComplete;
        m.isUpcoming = classification.isUpcoming;

        // Broadcast overview summary
        const bLight = resolveBroadcastIntelligence({
          series: m.series,
          title: `${m.team1} vs ${m.team2}`,
          matchFormat: m.matchFormat,
        });
        m.broadcastSummary = bLight.summary;
        m.broadcastPlatforms = (bLight.platforms || []).slice(0, 4);

      } catch (e) {
        // Fall back to title classification
        const classification = evaluateMatchState(m);
        m.isLive = classification.isLive;
        m.isComplete = classification.isComplete;
        m.isUpcoming = classification.isUpcoming;

        const bLight = resolveBroadcastIntelligence({
          series: m.series,
          title: `${m.team1} vs ${m.team2}`,
          matchFormat: m.matchFormat,
        });
        m.broadcastSummary = bLight.summary;
        m.broadcastPlatforms = (bLight.platforms || []).slice(0, 4);
      }
    });

    await Promise.allSettled(enrichPromises);

    return matches;
  } catch (error) {
    console.error('[Scraper Error - Live Matches]', error.message);
    throw error;
  }
}

/**
/**
 * Extract matchId from a Cricbuzz live-cricket-scores URL
 * e.g. https://www.cricbuzz.com/live-cricket-scores/129596/pak-vs-eng-... → 129596
 */
function extractMatchId(url) {
  const match = url.match(/\/live-cricket-scores\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch Rich Match Details via Cricbuzz Internal JSON API
 * Endpoint: /api/mcenter/comm/{matchId}  — live state, miniscore, commentary
 * Endpoint: /api/mcenter/scorecard/{matchId} — full innings scorecards
 */
async function scrapeMatchDetails(matchUrl) {
  const matchId = extractMatchId(matchUrl);
  if (!matchId) {
    throw new Error('Could not extract match ID from URL: ' + matchUrl);
  }

  const results = {};

  // 1. Fetch commentary/miniscore endpoint (primary)
  try {
    const { data } = await client.get(
      `https://www.cricbuzz.com/api/mcenter/comm/${matchId}`,
      { headers: { ...client.defaults.headers, 'Accept': 'application/json, text/plain, */*' } }
    );

    const header = data.matchHeader || {};
    const mini = data.miniscore || {};
    const scoreDetails = mini.matchScoreDetails || {};
    const winProb = data.winProbability || {};

    // Match header info
    results.matchId = header.matchId || parseInt(matchId);
    results.matchDescription = header.matchDescription || '';
    results.matchFormat = header.matchFormat || '';
    results.matchType = header.matchType || '';
    results.state = header.state || '';
    results.status = convertStatusToIST(header.status || mini.status || '', header.matchStartTimestamp);
    results.isComplete = !!header.complete;

    // Series
    results.series = header.seriesName || header.seriesDesc || '';

    // Teams
    results.team1 = {
      id: header.team1?.id,
      name: header.team1?.name || 'Team 1',
      shortName: header.team1?.shortName || 'T1',
    };
    results.team2 = {
      id: header.team2?.id,
      name: header.team2?.name || 'Team 2',
      shortName: header.team2?.shortName || 'T2',
    };

    // Toss
    results.toss = header.tossResults ? {
      winner: header.tossResults.tossWinnerName || '',
      decision: header.tossResults.decision || '',
    } : null;

    // Timing (Strictly IST)
    results.matchStartTimestamp = header.matchStartTimestamp || null;
    results.startTime = header.matchStartTimestamp
      ? new Date(header.matchStartTimestamp).toISOString()
      : null;
    results.startTimeLocal = header.matchStartTimeLocal || '';
    results.startTimeIST = header.matchStartTimeIST
      ? (header.matchStartTimeIST.includes('IST') ? header.matchStartTimeIST : `${header.matchStartTimeIST} IST`)
      : (header.matchStartTimestamp ? new Date(header.matchStartTimestamp).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) + ' IST' : '');
    results.startDateIST = header.matchStartTimestamp
      ? new Date(header.matchStartTimestamp).toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
        })
      : '';
    results.dayNight = !!header.dayNight;

    // Venue (from SportsEvent structured data as backup later)
    results.venue = null; // Will be enriched below

    // Current live state (miniscore)
    if (mini.batTeam) {
      results.currentInnings = {
        inningsId: mini.inningsId,
        battingTeamId: mini.batTeam.teamId,
        score: mini.batTeam.teamScore,
        wickets: mini.batTeam.teamWkts,
        overs: mini.overs,
        currentRunRate: mini.currentRunRate,
        requiredRunRate: mini.requiredRunRate || null,
        target: mini.target || null,
      };

      // Current batsmen
      results.currentBatsmen = [];
      if (mini.batsmanStriker) {
        results.currentBatsmen.push({
          name: mini.batsmanStriker.name,
          runs: mini.batsmanStriker.runs,
          balls: mini.batsmanStriker.balls,
          fours: mini.batsmanStriker.fours,
          sixes: mini.batsmanStriker.sixes,
          strikeRate: mini.batsmanStriker.strikeRate,
          isStriker: true,
        });
      }
      if (mini.batsmanNonStriker) {
        results.currentBatsmen.push({
          name: mini.batsmanNonStriker.name,
          runs: mini.batsmanNonStriker.runs,
          balls: mini.batsmanNonStriker.balls,
          fours: mini.batsmanNonStriker.fours,
          sixes: mini.batsmanNonStriker.sixes,
          strikeRate: mini.batsmanNonStriker.strikeRate,
          isStriker: false,
        });
      }

      // Current bowlers
      results.currentBowlers = [];
      if (mini.bowlerStriker) {
        results.currentBowlers.push({
          name: mini.bowlerStriker.name,
          overs: mini.bowlerStriker.overs,
          maidens: mini.bowlerStriker.maidens,
          runs: mini.bowlerStriker.runs,
          wickets: mini.bowlerStriker.wickets,
          economy: mini.bowlerStriker.economy,
          isBowling: true,
        });
      }
      if (mini.bowlerNonStriker) {
        results.currentBowlers.push({
          name: mini.bowlerNonStriker.name,
          overs: mini.bowlerNonStriker.overs,
          maidens: mini.bowlerNonStriker.maidens,
          runs: mini.bowlerNonStriker.runs,
          wickets: mini.bowlerNonStriker.wickets,
          economy: mini.bowlerNonStriker.economy,
          isBowling: false,
        });
      }

      // Current partnership
      results.partnership = mini.partnerShip ? {
        runs: mini.partnerShip.runs,
        balls: mini.partnerShip.balls,
      } : null;

      // Recent overs & balls array
      results.recentOvers = mini.recentOvsStats || null;
      results.recentBalls = mini.recentOvsStats
        ? mini.recentOvsStats.trim().split(/\s+/).filter(Boolean)
        : [];

      // Last wicket string
      if (mini.lastWicket) {
        if (typeof mini.lastWicket === 'object') {
          results.lastWicket = mini.lastWicket.label || mini.lastWicket.name || (mini.lastWicket.runs !== undefined ? `${mini.lastWicket.runs}/${mini.lastWicket.wkts || ''}` : '–');
        } else {
          results.lastWicket = String(mini.lastWicket);
        }
      } else if (mini.latestPerformance?.[0]) {
        const lp = mini.latestPerformance[0];
        results.lastWicket = typeof lp === 'object' ? (lp.label || lp.name || `${lp.runs || 0}/${lp.wkts || ''}`) : String(lp);
      } else {
        results.lastWicket = null;
      }

      // Target calculations
      if (mini.target) {
        results.target = mini.target;
        results.requiredRuns = Math.max(0, mini.target - (mini.batTeam?.teamScore || 0));
        
        // Calculate balls remaining based on format overs limit
        const totalMaxOvers = (header.matchFormat === 'T20' || header.matchFormat === 'T20I') ? 20 : (header.matchFormat === 'ODI' ? 50 : null);
        if (totalMaxOvers && mini.overs) {
          const currentBalls = Math.floor(mini.overs) * 6 + Math.round((mini.overs - Math.floor(mini.overs)) * 10);
          results.ballsRemaining = Math.max(0, (totalMaxOvers * 6) - currentBalls);
        } else {
          results.ballsRemaining = null;
        }
      }
    } else {
      results.currentInnings = null;
      results.currentBatsmen = [];
      results.currentBowlers = [];
      results.partnership = null;
      results.recentOvers = null;
      results.recentBalls = [];
      results.lastWicket = null;
    }

    // All innings scores summary
    results.inningsScores = (scoreDetails.inningsScoreList || []).map(inn => ({
      inningsId: inn.inningsId,
      batTeamName: inn.batTeamName,
      battingTeamId: inn.batTeamId,
      score: inn.score,
      wickets: inn.wickets,
      overs: inn.overs,
      isDeclared: !!inn.isDeclared,
      isFollowOn: !!inn.isFollowOn,
    }));

    // Win probability
    results.winProbability = winProb.batTeamProb ? {
      battingTeam: winProb.batTeamName || '',
      battingTeamProb: winProb.batTeamProb || 0,
      bowlingTeam: winProb.bowlTeamName || '',
      bowlingTeamProb: winProb.bowlTeamProb || 0,
    } : null;

    // Recent commentary
    let commList = [];
    if (data.matchCommentary && typeof data.matchCommentary === 'object') {
      commList = Object.values(data.matchCommentary);
    } else if (Array.isArray(data.commentaryList)) {
      commList = data.commentaryList;
    }

    results.recentCommentary = commList.slice(0, 15).map(c => {
      const overNbr = c.ballMetric ? Math.floor(c.ballMetric) : c.overNumber;
      const ballNbr = c.ballMetric ? Math.round((c.ballMetric - Math.floor(c.ballMetric)) * 10) : c.ballNbr;
      const text = (c.commText || '').replace(/<[^>]*>/g, '').replace(/cricbuzz/gi, 'CricketHub').trim();
      const lowerText = text.toLowerCase();

      // Normalize event (can be Array ['four', 'all'], String 'FOUR', or undefined)
      const eventArr = Array.isArray(c.event)
        ? c.event.map(e => String(e).toLowerCase())
        : typeof c.event === 'string'
          ? [c.event.toLowerCase()]
          : [];

      // 1. Authoritative API fields
      let isWicket = Boolean(eventArr.includes('wicket') || c.isWicket === true || c.wktType);
      let isFour = Boolean(eventArr.includes('four') || c.isFour === true || c.batRuns === 4);
      let isSix = Boolean(eventArr.includes('six') || c.isSix === true || c.batRuns === 6);

      // 2. Strict text-based evaluation (only if API event array did not explicitly classify it)
      if (!isWicket && !isFour && !isSix) {
        // Actual dismissal patterns in cricket commentary (avoiding "spread out", "stepped out", "inside out", "around the wicket")
        isWicket = Boolean(
          /\bOUT\b[!,.\s]/i.test(text) ||
          /,\s*OUT\b/i.test(text) ||
          /\b(clean\s+bowled|bowled\s+him|trapped\s+lbw|caught\s+behind|run\s+out|stumped\s+by)\b/i.test(lowerText) ||
          /\b(c\s+[\w\s]+\s+b\s+[\w\s]+|lbw\s+b\s+[\w\s]+|st\s+[\w\s]+\s+b\s+[\w\s]+)\b/i.test(lowerText)
        ) && !/\bnot\s+out\b/i.test(lowerText) && !/\bno\s+ball\b/i.test(lowerText);

        isFour = Boolean(
          /\bFOUR\b[!,.\s]/i.test(text) ||
          /\b(four\s+runs|hits\s+a\s+four|punches\s+it\s+for\s+four|driven\s+for\s+four|races\s+to\s+the\s+fence|crosses\s+the\s+rope)\b/i.test(lowerText)
        ) && !isWicket;

        isSix = Boolean(
          /\bSIX\b[!,.\s]/i.test(text) ||
          /\b(six\s+runs|hits\s+a\s+six|maximum|into\s+the\s+crowd|over\s+the\s+fence)\b/i.test(lowerText)
        ) && !isWicket;
      }

      return {
        overNumber: overNbr,
        ballNumber: ballNbr,
        text,
        event: eventArr.join(', '),
        batRuns: c.batRuns,
        isFour: !!isFour,
        isSix: !!isSix,
        isWicket: !!isWicket,
        batsman: c.batsmanDetails?.playerName || '',
        bowler: c.bowlerDetails?.playerName || '',
      };
    }).filter(c => c.text.length > 0);

    // 1b. Fetch Full Scorecard (optional/parallel)
    try {
      const { data: scData } = await client.get(
        `https://www.cricbuzz.com/api/mcenter/scorecard/${matchId}`,
        { headers: { ...client.defaults.headers, 'Accept': 'application/json, text/plain, */*' }, timeout: 5000 }
      );

      if (scData.scoreCard && Array.isArray(scData.scoreCard)) {
        results.scorecards = scData.scoreCard.map(sc => {
          const rawBatsmenData = sc.batTeamDetails?.batsmenData || {};
          const batsmenMap = {};
          Object.values(rawBatsmenData).forEach(b => {
            if (b.batId) batsmenMap[String(b.batId)] = b;
            if (b.batName) batsmenMap[b.batName.toLowerCase()] = b;
            if (b.name) batsmenMap[b.name.toLowerCase()] = b;
          });

          const batsmen = Object.values(rawBatsmenData).map(b => ({
            name: b.batName || b.name,
            runs: b.runs,
            balls: b.balls,
            fours: b.fours,
            sixes: b.sixes,
            strikeRate: b.strikeRate,
            outDesc: b.outDesc || 'not out',
          }));

          const bowlers = sc.bowlTeamDetails?.bowlersData
            ? Object.values(sc.bowlTeamDetails.bowlersData).map(b => ({
                name: b.bowlName || b.name,
                overs: b.overs,
                maidens: b.maidens,
                runs: b.runs,
                wickets: b.wickets,
                economy: b.economy,
              }))
            : [];

          const fallOfWickets = sc.wicketsData
            ? Object.values(sc.wicketsData).map(w => {
                const bInfo = batsmenMap[String(w.batId)] || batsmenMap[(w.batName || '').toLowerCase()] || {};
                const teamRuns = w.wktRuns !== undefined ? w.wktRuns : w.runs;
                const batterRuns = bInfo.runs !== undefined ? bInfo.runs : null;
                const batterBalls = bInfo.balls !== undefined ? bInfo.balls : null;

                return {
                  name: w.batName || w.name,
                  score: w.wktRuns !== undefined ? `${w.wktRuns}/${w.wktNum || w.wktNbr}` : w.score,
                  overs: w.wktOver || w.overs,
                  runs: batterRuns !== null ? batterRuns : teamRuns,
                  balls: batterBalls,
                  batterRuns,
                  batterBalls,
                  teamRuns,
                  wktNum: w.wktNum || w.wktNbr,
                };
              })
            : [];

          return {
            inningsId: sc.inningsId,
            batTeamId: sc.batTeamDetails?.batTeamId,
            batTeamName: sc.batTeamDetails?.batTeamName || sc.batTeamDetails?.batTeamShortName || '',
            batTeamShortName: sc.batTeamDetails?.batTeamShortName || '',
            score: sc.scoreDetails?.runs ?? sc.scoreDetails?.score ?? 0,
            wickets: sc.scoreDetails?.wickets ?? 0,
            overs: sc.scoreDetails?.overs ?? 0,
            batsmen,
            bowlers,
            fallOfWickets,
          };
        });

        // Ensure any live innings in inningsScores not yet in scorecards is included
        if (Array.isArray(results.inningsScores)) {
          results.inningsScores.forEach(inn => {
            if (!results.scorecards.some(sc => sc.inningsId === inn.inningsId)) {
              results.scorecards.push({
                inningsId: inn.inningsId,
                batTeamId: inn.battingTeamId,
                batTeamName: inn.batTeamName || (inn.battingTeamId === results.team1?.id ? results.team1.name : results.team2?.name) || '',
                batTeamShortName: (inn.battingTeamId === results.team1?.id ? results.team1.shortName : results.team2?.shortName) || '',
                score: inn.score ?? 0,
                wickets: inn.wickets ?? 0,
                overs: inn.overs ?? 0,
                batsmen: results.currentInnings?.inningsId === inn.inningsId ? (results.currentBatsmen || []) : [],
                bowlers: results.currentInnings?.inningsId === inn.inningsId ? (results.currentBowlers || []) : [],
                fallOfWickets: [],
              });
            }
          });
        }
      }
    } catch (scErr) {
      // Non-fatal if scorecard API fails
      results.scorecards = [];
    }

  } catch (error) {
    console.error(`[Scraper Error - Match JSON API (${matchId})]`, error.message);
    // Fallback to HTML scraping if JSON API fails
    try {
      const { data: html } = await client.get(matchUrl);
      const $ = cheerio.load(html);
      let sportsEvent = null;
      $('script[type="application/ld+json"]').each((_, s) => {
        try {
          const json = JSON.parse($(s).html());
          if (json['@type'] === 'SportsEvent' || json.competitor) sportsEvent = json;
        } catch (e) {}
      });
      results.matchId = parseInt(matchId);
      results.status = sportsEvent?.description || $('title').text().trim();
      results.series = sportsEvent?.superEvent?.name || '';
      results.team1 = { name: sportsEvent?.competitor?.[0]?.name || 'Team 1', shortName: '' };
      results.team2 = { name: sportsEvent?.competitor?.[1]?.name || 'Team 2', shortName: '' };
    } catch (fallbackError) {
      throw error;
    }
  }

  // 2. Enrich with venue and Cricbuzz facts page data (structured data + facts guide)
  let factsHtml = null;
  try {
    const factsUrl = matchUrl.includes('/live-cricket-scores/')
      ? matchUrl.replace('/live-cricket-scores/', '/cricket-match-facts/')
      : null;

    // Fetch match page and facts page in parallel with fast timeouts
    const [pageRes, factsRes] = await Promise.allSettled([
      client.get(matchUrl, { timeout: 4500 }),
      factsUrl ? client.get(factsUrl, { timeout: 4500 }) : Promise.resolve(null),
    ]);

    const html = pageRes.status === 'fulfilled' ? pageRes.value?.data : null;
    if (factsRes.status === 'fulfilled' && factsRes.value?.data) {
      factsHtml = factsRes.value.data;
    }

    if (html) {
      const $ = cheerio.load(html);
      $('script[type="application/ld+json"]').each((_, s) => {
        try {
          const json = JSON.parse($(s).html());
          if (json['@type'] === 'Place' && json.name) {
            results.venue = {
              name: json.name,
              city: json.address?.addressLocality || '',
              country: json.address?.addressCountry || '',
            };
          } else if (json.location && json.location.name) {
            results.venue = {
              name: json.location.name,
              city: json.location.address?.addressLocality || '',
              country: json.location.address?.addressCountry || '',
            };
          } else if ((json['@type'] === 'SportsEvent' || json.competitor) && json.location) {
            results.venue = {
              name: typeof json.location === 'string' ? json.location : json.location.name || '',
              city: json.location.address?.addressLocality || '',
              country: json.location.address?.addressCountry || '',
            };
          }
        } catch (e) {}
      });
    }

    // Fallback venue from facts HTML if structured data was missing
    if (!results.venue && factsHtml) {
      const $f = cheerio.load(factsHtml);
      $f('.facts-row-grid, div').each((_, el) => {
        const t = $f(el).text().replace(/\s+/g, ' ').trim();
        if (t.startsWith('Venue') && t.length > 5 && t.length < 80) {
          const vClean = t.replace(/^Venue\s*:?\s*/i, '').trim();
          if (vClean) {
            results.venue = { name: vClean, city: '', country: '' };
          }
        }
      });
    }

    if (results.venue) {
      const vParts = [results.venue.name, results.venue.city || results.venue.country].filter(Boolean);
      if (vParts.length > 0) {
        const vStr = vParts.join(', ');
        results.venueString = vStr;
        VENUE_CACHE.set(String(matchId), vStr);
      }
    }
  } catch (e) {
    // venue remains null — non-critical
  }

  // 3. Resolve Complete Multi-Region OTT & TV Broadcasting Intelligence
  try {
    results.broadcast = resolveBroadcastIntelligence({
      series: results.series,
      title: `${results.team1?.name || ''} vs ${results.team2?.name || ''}`,
      matchFormat: results.matchFormat,
      cricbuzzFactsHtml: factsHtml,
    });
  } catch (bErr) {
    results.broadcast = {
      available: false,
      summary: 'Broadcasting guide currently unavailable',
      platforms: [],
      regions: [],
    };
  }

  results.matchUrl = matchUrl;
  results.lastUpdated = new Date().toISOString();

  return results;
}

/**
 * Scrape Upcoming International/Series Schedule
 */
async function scrapeSchedule() {
  try {
    const url = 'https://m.cricbuzz.com/cricket-schedule/upcoming-series/international';
    const { data: html } = await client.get(url);
    const $ = cheerio.load(html);

    const scheduleList = [];

    // Modern Cricbuzz Schedule parser
    $('h3').each((_, h3) => {
      const dateText = $(h3).text().trim();
      if (dateText && (dateText.includes('202') || /[A-Z]{3}, [A-Z]{3} \d+/i.test(dateText))) {
        const container = $(h3).parent();
        container.find('a').each((j, a) => {
          const matchTitle = $(a).text().trim();
          const href = $(a).attr('href') || '';
          if (matchTitle && matchTitle.length > 5 && !scheduleList.some(s => s.match === matchTitle)) {
            scheduleList.push({
              id: `sched-${scheduleList.length + 1}`,
              date: dateText,
              match: matchTitle,
              venue: 'International Stadium',
              time: 'Scheduled',
              fullText: `${dateText} - ${matchTitle}`,
              link: href ? `https://www.cricbuzz.com${href}` : null,
            });
          }
        });
      }
    });

    // Fallback: Legacy selector
    if (scheduleList.length === 0) {
      $('.cb-col-100.cb-col').each((_, container) => {
        const dateEl = $(container).find('.cb-lv-grn-strip.text-bold').first();
        const matchInfoEl = $(container).find('.cb-col-100.cb-col').first();
        const dateText = dateEl.text().trim();
        const matchText = matchInfoEl.text().trim();

        if (dateText && matchText) {
          scheduleList.push({
            id: `sched-${scheduleList.length + 1}`,
            date: dateText,
            match: matchText,
            venue: 'International Stadium',
            time: 'Scheduled',
            fullText: `${dateText} - ${matchText}`,
          });
        }
      });
    }

    return scheduleList;
  } catch (error) {
    console.error('[Scraper Error - Schedule]', error.message);
    throw error;
  }
}

/**
 * Search Cricbuzz Player Profile URL
 */
async function searchPlayerProfileUrl(playerName) {
  if (!playerName) return null;
  const cleanKey = playerName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct registry hit
  if (PLAYER_REGISTRY[cleanKey]) {
    return PLAYER_REGISTRY[cleanKey];
  }

  // 2. Token / surname / word match
  const parts = playerName.toLowerCase().trim().split(/\s+/);
  for (const part of parts) {
    const cleanPart = part.replace(/[^a-z0-9]/g, '');
    if (cleanPart.length >= 4 && PLAYER_REGISTRY[cleanPart]) {
      return PLAYER_REGISTRY[cleanPart];
    }
  }

  // 3. Partial substring match in registry (only if key has sufficient length)
  for (const [key, url] of Object.entries(PLAYER_REGISTRY)) {
    if (key.length >= 5 && (cleanKey.includes(key) || key.includes(cleanKey))) {
      return url;
    }
  }

  // 4. Return null if not found
  return null;
}

/**
 * Scrape Full Player Profile & Statistics from Cricbuzz URL
 */
async function scrapePlayerProfile(profileUrl, playerNameFallback = '') {
  try {
    let html = null;
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    try {
      const res = await client.get(profileUrl, { headers: fetchHeaders });
      html = res.data;
    } catch (fetchErr) {
      const altUrl = profileUrl.includes('m.cricbuzz.com')
        ? profileUrl.replace('m.cricbuzz.com', 'www.cricbuzz.com')
        : profileUrl.replace('www.cricbuzz.com', 'm.cricbuzz.com');
      const res = await client.get(altUrl, { headers: fetchHeaders });
      html = res.data;
    }

    const $ = cheerio.load(html);

    // 1. Extract Name
    let name = $('h1').first().text().trim();
    if (!name || name.length < 2) {
      const title = $('title').text();
      name = title.split('Profile')[0]?.trim() || playerNameFallback;
    }

    // Name mismatch guard (guarantees wrong players like Faisal Naved are never returned)
    if (playerNameFallback && name) {
      const cleanScraped = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanTarget = playerNameFallback.toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetParts = playerNameFallback.toLowerCase().split(/\s+/);
      const isMatch = cleanScraped.includes(cleanTarget) ||
                      cleanTarget.includes(cleanScraped) ||
                      targetParts.some(p => p.length >= 4 && cleanScraped.includes(p));
      if (!isMatch) {
        console.warn(`[Scraper Warning] Name mismatch: queried "${playerNameFallback}" but profile at ${profileUrl} is "${name}"`);
        return null;
      }
    }

    // 2. Personal Information
    let born = '-';
    let birthPlace = '-';
    let height = '-';
    let role = 'Cricketer';
    let battingStyle = '-';
    let bowlingStyle = '-';
    let teams = [];
    let country = 'International';

    // Personal info fields
    $('div').each((_, el) => {
      const text = $(el).text().trim();
      if ($(el).closest('header, nav, .bg-cbGrnCyn').length > 0) return;

      const nextVal = $(el).next().text().trim();

      if (text === 'Born' && nextVal && born === '-') {
        born = nextVal;
      } else if (text === 'Birth Place' && nextVal && birthPlace === '-') {
        birthPlace = nextVal;
      } else if (text === 'Height' && nextVal && height === '-') {
        height = nextVal;
      } else if (text === 'Role' && nextVal && role === 'Cricketer') {
        role = nextVal;
      } else if (text === 'Batting Style' && nextVal && battingStyle === '-') {
        battingStyle = nextVal;
      } else if (text === 'Bowling Style' && nextVal && bowlingStyle === '-') {
        bowlingStyle = nextVal;
      }
    });

    // Extract Teams
    $('div').each((_, el) => {
      if ($(el).closest('header, nav, .bg-cbGrnCyn').length > 0) return;
      const text = $(el).text().trim();
      if (text === 'Teams' || text === 'TEAMS') {
        const container = $(el).closest('.border, .rounded-lg, .shadow-sm, tr');
        const fullText = container.text().replace(/\s+/g, ' ').trim();
        const splitted = fullText.split(/Teams|TEAMS/i)[1]?.trim();
        if (splitted && splitted.includes(',')) {
          teams = splitted.split(',').map(t => t.trim()).filter(t => t.length > 1);
        }
      }
    });

    // Country derivation
    const KNOWN_COUNTRIES = [
      'India', 'Australia', 'England', 'Pakistan', 'South Africa', 
      'New Zealand', 'West Indies', 'Sri Lanka', 'Bangladesh', 
      'Afghanistan', 'Zimbabwe', 'Ireland', 'Netherlands', 'Scotland',
      'Namibia', 'Nepal', 'USA', 'United States', 'Canada', 'Oman', 'UAE'
    ];

    if (teams.length > 0) {
      const matchedCountry = KNOWN_COUNTRIES.find(c => teams.some(t => t.toLowerCase() === c.toLowerCase() || t.toLowerCase().startsWith(c.toLowerCase())));
      if (matchedCountry) {
        country = matchedCountry;
      } else {
        country = teams[0];
      }
    } else {
      const pageText = $('body').text();
      const matchedCountry = KNOWN_COUNTRIES.find(c => pageText.includes(c));
      if (matchedCountry) country = matchedCountry;
    }

    // 3. Extract Image (enhanced to high-resolution)
    let image = null;
    $('img').each((_, img) => {
      const src = $(img).attr('src') || '';
      if ((src.includes('/profiles/') || src.includes('cricbuzz.com/a/img/v1/i1/c')) && !src.includes('logo') && !src.includes('sprite') && !src.includes('squad')) {
        let fullSrc = src.startsWith('//') ? `https:${src}` : (src.startsWith('http') ? src : `https://static.cricbuzz.com${src}`);
        fullSrc = fullSrc.replace('d=low&p=gthumb', 'd=high&p=det').replace('d=low', 'd=high');
        image = fullSrc;
        return false;
      }
    });

    // 4. Parse Tables: Rankings, Batting Stats, Bowling Stats
    const battingStats = { test: {}, odi: {}, t20: {}, ipl: {} };
    const bowlingStats = { test: {}, odi: {}, t20: {}, ipl: {} };
    const rankings = {
      batting: { test: '--', odi: '--', t20: '--' },
      bowling: { test: '--', odi: '--', t20: '--' }
    };

    $('table').each((tblIdx, tbl) => {
      const rows = $(tbl).find('tr');
      const headerRow = rows.first();
      const headerText = headerRow.text().toLowerCase();

      // Check if Table is Rankings
      if (headerText.includes('rank')) {
        rows.each((_, tr) => {
          const cols = $(tr).find('td, th');
          if (cols.length >= 2) {
            const fmt = cols.eq(0).text().trim().toLowerCase();
            const rank = cols.eq(1).text().trim();
            if (fmt.includes('test')) rankings.batting.test = rank || '--';
            if (fmt.includes('odi')) rankings.batting.odi = rank || '--';
            if (fmt.includes('t20')) rankings.batting.t20 = rank || '--';
          }
        });
        return;
      }

      // Check if Table is Career Matrix (Rows = Metrics, Cols = Test/ODI/T20/IPL)
      if (headerText.includes('test') || headerText.includes('odi')) {
        const colFormats = [];
        headerRow.find('th, td').each((cIdx, cell) => {
          const t = $(cell).text().trim().toLowerCase();
          if (t.includes('test')) colFormats.push('test');
          else if (t.includes('odi')) colFormats.push('odi');
          else if (t.includes('t20')) colFormats.push('t20');
          else if (t.includes('ipl')) colFormats.push('ipl');
          else colFormats.push(null);
        });

        let isBowlingTable = false;
        rows.each((_, tr) => {
          const metric = $(tr).find('td, th').first().text().trim().toLowerCase();
          if (metric === 'wickets' || metric === 'maidens' || metric === 'bbi' || metric === 'eco') {
            isBowlingTable = true;
          }
        });

        const targetStats = isBowlingTable ? bowlingStats : battingStats;

        rows.slice(1).each((_, tr) => {
          const cells = $(tr).find('td');
          if (cells.length < 2) return;
          const metricLabel = cells.eq(0).text().trim().toLowerCase();

          cells.slice(1).each((cIdx, td) => {
            const format = colFormats[cIdx + 1] || (cIdx === 0 ? 'test' : cIdx === 1 ? 'odi' : cIdx === 2 ? 't20' : 'ipl');
            const val = $(td).text().trim() || '-';

            if (!targetStats[format]) targetStats[format] = {};

            if (!isBowlingTable) {
              if (metricLabel.includes('match')) targetStats[format].matches = val;
              else if (metricLabel.includes('inning')) targetStats[format].innings = val;
              else if (metricLabel.includes('run')) targetStats[format].runs = val;
              else if (metricLabel.includes('ball')) targetStats[format].balls = val;
              else if (metricLabel.includes('highest') || metricLabel.includes('hs')) targetStats[format].highest_score = val;
              else if (metricLabel.includes('average') || metricLabel === 'avg') targetStats[format].average = val;
              else if (metricLabel.includes('sr') || metricLabel.includes('strike')) targetStats[format].strike_rate = val;
              else if (metricLabel.includes('not out') || metricLabel.includes('no')) targetStats[format].not_outs = val;
              else if (metricLabel.includes('four') || metricLabel.includes('4s')) targetStats[format].fours = val;
              else if (metricLabel.includes('six') || metricLabel.includes('6s')) targetStats[format].sixes = val;
              else if (metricLabel.includes('50') || metricLabel.includes('fift')) targetStats[format].fifties = val;
              else if (metricLabel.includes('100') || metricLabel.includes('hund')) targetStats[format].hundreds = val;
              else if (metricLabel.includes('200')) targetStats[format].double_hundreds = val;
              else if (metricLabel.includes('duck')) targetStats[format].ducks = val;
            } else {
              if (metricLabel.includes('match')) targetStats[format].matches = val;
              else if (metricLabel.includes('inning')) targetStats[format].innings = val;
              else if (metricLabel.includes('ball')) targetStats[format].balls = val;
              else if (metricLabel.includes('run')) targetStats[format].runs = val;
              else if (metricLabel.includes('maiden')) targetStats[format].maidens = val;
              else if (metricLabel.includes('wicket')) targetStats[format].wickets = val;
              else if (metricLabel.includes('average') || metricLabel === 'avg') targetStats[format].average = val;
              else if (metricLabel.includes('eco')) targetStats[format].economy = val;
              else if (metricLabel.includes('sr') || metricLabel.includes('strike')) targetStats[format].strike_rate = val;
              else if (metricLabel.includes('bbi') || metricLabel.includes('best bowling')) targetStats[format].best_bowling_innings = val;
              else if (metricLabel.includes('bbm')) targetStats[format].best_bowling_match = val;
              else if (metricLabel.includes('4w')) targetStats[format].four_wickets = val;
              else if (metricLabel.includes('5w')) targetStats[format].five_wickets = val;
              else if (metricLabel.includes('10w')) targetStats[format].ten_wickets = val;
            }
          });
        });
      }
    });

    // Populate fallback default structure if empty
    ['test', 'odi', 't20', 'ipl'].forEach(fmt => {
      if (!battingStats[fmt].matches) {
        battingStats[fmt] = {
          matches: '-',
          innings: '-',
          runs: '-',
          highest_score: '-',
          average: '-',
          strike_rate: '-',
          hundreds: '-',
          fifties: '-'
        };
      }
      if (!bowlingStats[fmt].matches) {
        bowlingStats[fmt] = {
          matches: '-',
          balls: '-',
          wickets: '-',
          economy: '-',
          average: '-',
          best_bowling_innings: '-',
          five_wickets: '-'
        };
      }
    });

    return {
      name: name || playerNameFallback,
      country: country || 'International',
      image,
      role: role || 'Cricketer',
      cricbuzzUrl: profileUrl,
      personalInfo: {
        born,
        birthPlace,
        height,
        battingStyle,
        bowlingStyle,
        teams,
      },
      rankings,
      batting_stats: battingStats,
      bowling_stats: bowlingStats,
      lastScraped: new Date(),
    };
  } catch (error) {
    console.error(`[Scraper Error - Profile Parse (${profileUrl})]`, error.message);
    throw error;
  }
}

module.exports = {
  scrapeLiveMatches,
  scrapeMatchDetails,
  scrapeSchedule,
  searchPlayerProfileUrl,
  scrapePlayerProfile,
  registerPlayerProfile,
};
