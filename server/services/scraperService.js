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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});

// Comprehensive lookup registry for popular international & IPL players
const POPULAR_PLAYER_MAP = {
  'viratkohli': 'https://www.cricbuzz.com/profiles/1413/virat-kohli',
  'rohitsharma': 'https://www.cricbuzz.com/profiles/576/rohit-sharma',
  'msdhoni': 'https://www.cricbuzz.com/profiles/265/ms-dhoni',
  'jaspritbumrah': 'https://www.cricbuzz.com/profiles/9311/jasprit-bumrah',
  'stevesmith': 'https://www.cricbuzz.com/profiles/2250/steve-smith',
  'patcummins': 'https://www.cricbuzz.com/profiles/8095/pat-cummins',
  'babarazam': 'https://www.cricbuzz.com/profiles/8359/babar-azam',
  'joeroot': 'https://www.cricbuzz.com/profiles/8019/joe-root',
  'travishead': 'https://www.cricbuzz.com/profiles/8733/travis-head',
  'hardikpandya': 'https://www.cricbuzz.com/profiles/9647/hardik-pandya',
  'benstokes': 'https://www.cricbuzz.com/profiles/8593/ben-stokes',
  'rashidkhan': 'https://www.cricbuzz.com/profiles/10738/rashid-khan',
  'shubmangill': 'https://www.cricbuzz.com/profiles/11813/shubman-gill',
  'subhmangill': 'https://www.cricbuzz.com/profiles/11813/shubman-gill',
  'klrahul': 'https://www.cricbuzz.com/profiles/8733/kl-rahul',
  'rishabhpant': 'https://www.cricbuzz.com/profiles/10744/rishabh-pant',
  'suryakumaryadav': 'https://www.cricbuzz.com/profiles/7915/suryakumar-yadav',
  'ravindrajadeja': 'https://www.cricbuzz.com/profiles/587/ravindra-jadeja',
  'mitchellstarc': 'https://www.cricbuzz.com/profiles/7909/mitchell-starc',
  'kanewilliamson': 'https://www.cricbuzz.com/profiles/6349/kane-williamson',
  'shaheenafridi': 'https://www.cricbuzz.com/profiles/12911/shaheen-afridi',
  'davidwarner': 'https://www.cricbuzz.com/profiles/1739/david-warner',
  'glennmaxwell': 'https://www.cricbuzz.com/profiles/7662/glenn-maxwell',
  'yashasvijaiswal': 'https://www.cricbuzz.com/profiles/13945/yashasvi-jaiswal',
  'kuldeepyadav': 'https://www.cricbuzz.com/profiles/8292/kuldeep-yadav',
  'mohammedshami': 'https://www.cricbuzz.com/profiles/7985/mohammed-shami',
  'mohammedsiraj': 'https://www.cricbuzz.com/profiles/10808/mohammed-siraj',
  'shreyasiyer': 'https://www.cricbuzz.com/profiles/9428/shreyas-iyer',
  'axarpatel': 'https://www.cricbuzz.com/profiles/8808/axar-patel',
  'trentboult': 'https://www.cricbuzz.com/profiles/8117/trent-boult',
  'kagisorabada': 'https://www.cricbuzz.com/profiles/9585/kagiso-rabada',
  'heinrichklaasen': 'https://www.cricbuzz.com/profiles/10209/heinrich-klaasen',
  'quindekock': 'https://www.cricbuzz.com/profiles/8520/quinton-de-kock',
  'quintondekock': 'https://www.cricbuzz.com/profiles/8520/quinton-de-kock',
  'sachintendulkar': 'https://www.cricbuzz.com/profiles/25/sachin-tendulkar',
};

/**
 * Scrape Live Scores from Cricbuzz — enriched with JSON API for actual scores
 */
async function scrapeLiveMatches() {
  try {
    const url = 'https://www.cricbuzz.com/cricket-match/live-scores';
    const { data: html } = await client.get(url);
    const $ = cheerio.load(html);

    // Step 1: Extract all match links and deduplicate by matchId
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

      matchMap.set(matchId, {
        id: `match-${matchId}`,
        matchId,
        header: `${team1} vs ${team2}`,
        team1,
        team2,
        matchType,
        rawText: title,
        status: status || 'Scheduled',
        isLive: true,
        cricbuzzLink: cleanLink,
        // Score fields (enriched below)
        team1Score: null,
        team2Score: null,
        team1Overs: null,
        team2Overs: null,
        currentBatsmen: [],
        currentBowlers: [],
        inningsScores: [],
      });
    });

    const matches = Array.from(matchMap.values());

    // Step 2: Batch-enrich matches with live scores from JSON API
    // Fetch top N matches in parallel to keep latency low
    const enrichLimit = Math.min(matches.length, 25);
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

        // Update status from real-time API
        m.status = header.status || mini.status || m.status;
        m.state = header.state || '';
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

        // Determine live/complete state
        m.isLive = !header.complete
          && m.state !== 'Complete'
          && !m.status.toLowerCase().includes(' won')
          && !m.status.toLowerCase().includes('abandoned')
          && !m.status.toLowerCase().includes('no result');
        m.isComplete = !!header.complete;

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

      } catch (e) {
        // Non-critical — keep the HTML-parsed data
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
    results.status = header.status || mini.status || '';
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

    // Timing
    results.startTime = header.matchStartTimestamp
      ? new Date(header.matchStartTimestamp).toISOString()
      : null;
    results.startTimeLocal = header.matchStartTimeLocal || '';
    results.startTimeIST = header.matchStartTimeIST || '';
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

    results.recentCommentary = commList.slice(0, 10).map(c => {
      const overNbr = c.ballMetric ? Math.floor(c.ballMetric) : c.overNumber;
      const ballNbr = c.ballMetric ? Math.round((c.ballMetric - Math.floor(c.ballMetric)) * 10) : c.ballNbr;
      const text = (c.commText || '').replace(/<[^>]*>/g, '').trim();
      const isFour = c.isFour || text.toLowerCase().includes('four') || text.includes(' 4 ');
      const isSix = c.isSix || text.toLowerCase().includes('six') || text.includes(' 6 ');
      const isWicket = c.isWicket || text.toLowerCase().includes('out') || text.toLowerCase().includes('wicket');

      return {
        overNumber: overNbr,
        ballNumber: ballNbr,
        text,
        event: c.event || '',
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
          const batsmen = sc.batTeamDetails?.batsmenData 
            ? Object.values(sc.batTeamDetails.batsmenData).map(b => ({
                name: b.batName || b.name,
                runs: b.runs,
                balls: b.balls,
                fours: b.fours,
                sixes: b.sixes,
                strikeRate: b.strikeRate,
                outDesc: b.outDesc || 'not out',
              }))
            : [];

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
            ? Object.values(sc.wicketsData).map(w => ({
                name: w.batName || w.name,
                score: w.wktRuns !== undefined ? `${w.wktRuns}/${w.wktNum || w.wktNbr}` : w.score,
                overs: w.wktOver || w.overs,
                runs: w.wktRuns || w.runs,
                wktNum: w.wktNum || w.wktNbr,
              }))
            : [];

          return {
            inningsId: sc.inningsId,
            batTeamName: sc.batTeamDetails?.batTeamName || sc.batTeamDetails?.batTeamShortName || '',
            score: sc.scoreDetails?.runs || sc.scoreDetails?.score,
            wickets: sc.scoreDetails?.wickets,
            overs: sc.scoreDetails?.overs,
            batsmen,
            bowlers,
            fallOfWickets,
          };
        });
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

  // 2. Enrich with venue from HTML SportsEvent structured data
  try {
    const { data: html } = await client.get(matchUrl);
    const $ = cheerio.load(html);
    $('script[type="application/ld+json"]').each((_, s) => {
      try {
        const json = JSON.parse($(s).html());
        if ((json['@type'] === 'SportsEvent' || json.competitor) && json.location) {
          results.venue = {
            name: json.location.name || '',
            city: json.location.address?.addressLocality || '',
            country: json.location.address?.addressCountry || '',
          };
        }
      } catch (e) {}
    });
  } catch (e) {
    // venue remains null — non-critical
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
    const url = 'https://www.cricbuzz.com/cricket-schedule/upcoming-series/international';
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
  const cleanKey = playerName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct registry hit
  if (POPULAR_PLAYER_MAP[cleanKey]) {
    return POPULAR_PLAYER_MAP[cleanKey];
  }

  // 2. Partial matches in registry
  for (const [key, url] of Object.entries(POPULAR_PLAYER_MAP)) {
    if (cleanKey.includes(key) || key.includes(cleanKey)) {
      return url;
    }
  }

  // 3. Fallback DuckDuckGo search
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:cricbuzz.com/profiles/ ' + playerName)}`;
    const { data: duckHtml } = await client.get(searchUrl);
    const $ = cheerio.load(duckHtml);

    let profileUrl = null;
    $('a.result__url, a.result__snippet, .result__title a').each((_, a) => {
      const href = $(a).attr('href') || '';
      if (href.includes('cricbuzz.com/profiles/')) {
        const match = href.match(/uddg=([^&]+)/);
        profileUrl = match ? decodeURIComponent(match[1]) : href;
        return false;
      }
    });

    if (profileUrl) return profileUrl;
  } catch (err) {
    console.warn('[Scraper Warning] DDG search error:', err.message);
  }

  // 4. Default slug fallback for any player
  const slug = playerName.toLowerCase().replace(/\s+/g, '-');
  return `https://www.cricbuzz.com/profiles/1413/${slug}`;
}

/**
 * Scrape Full Player Profile & Statistics from Cricbuzz URL
 */
async function scrapePlayerProfile(profileUrl, playerNameFallback = '') {
  try {
    const { data: html } = await client.get(profileUrl);
    const $ = cheerio.load(html);

    // 1. Extract Name
    let name = $('h1').first().text().trim();
    if (!name || name.length < 2) {
      const title = $('title').text();
      name = title.split('Profile')[0]?.trim() || playerNameFallback;
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
};
