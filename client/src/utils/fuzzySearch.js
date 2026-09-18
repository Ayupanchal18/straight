/**
 * Lightweight fuzzy search engine for CricketHub.
 * Scores results by relevance: exact > startsWith > includes > fuzzy subsequence.
 * No external dependencies.
 */

/**
 * Compute a fuzzy match score between a query and a target string.
 * Higher score = better match. Returns 0 if no match.
 *
 * @param {string} query  - The search query (lowercase).
 * @param {string} target - The target string to match against (lowercase).
 * @returns {number} Score (0 = no match).
 */
export function fuzzyScore(query, target) {
  if (!query || !target) return 0;

  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q || !t) return 0;

  // Exact match
  if (t === q) return 1000;

  // Starts with the query
  if (t.startsWith(q)) return 800 + (q.length / t.length) * 100;

  // Contains the query as a whole substring
  if (t.includes(q)) return 500 + (q.length / t.length) * 100;

  // Word-boundary match (any word in target starts with query)
  const words = t.split(/[\s,\-_.]+/);
  for (const word of words) {
    if (word.startsWith(q)) return 600 + (q.length / word.length) * 80;
  }

  // Fuzzy subsequence match
  let qi = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  let score = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
      // Bonus for matching at word boundaries
      if (ti === 0 || /[\s,\-_.]/.test(t[ti - 1])) {
        score += 30;
      }
      score += 10;
    } else {
      consecutive = 0;
    }
  }

  // All query characters must be found in order
  if (qi < q.length) return 0;

  // Bonus for consecutive runs and query coverage
  score += maxConsecutive * 20;
  score += (q.length / t.length) * 50;

  return Math.min(score, 400); // Cap below substring scores
}

/**
 * Common cricket abbreviations / aliases for teams.
 * Helps match "IND" → "India", "AUS" → "Australia", etc.
 */
const TEAM_ALIASES = {
  ind: 'india', aus: 'australia', eng: 'england', pak: 'pakistan',
  sa: 'south africa', rsa: 'south africa', nz: 'new zealand',
  wi: 'west indies', sl: 'sri lanka', ban: 'bangladesh',
  afg: 'afghanistan', zim: 'zimbabwe', ire: 'ireland',
  csk: 'chennai super kings', mi: 'mumbai indians', rcb: 'royal challengers',
  dc: 'delhi capitals', kkr: 'kolkata knight riders', srh: 'sunrisers hyderabad',
  rr: 'rajasthan royals', pbks: 'punjab kings', lsg: 'lucknow super giants',
  gt: 'gujarat titans',
};

/**
 * Expand a search query with known aliases.
 * Returns an array of query strings to try.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function expandQuery(query) {
  const q = query.toLowerCase().trim();
  const expanded = [q];

  // Check alias map
  if (TEAM_ALIASES[q]) {
    expanded.push(TEAM_ALIASES[q]);
  }

  // Reverse: if user types "india", also match "ind"
  for (const [abbr, full] of Object.entries(TEAM_ALIASES)) {
    if (full.startsWith(q) && !expanded.includes(full)) {
      expanded.push(full);
    }
  }

  return expanded;
}

/**
 * Search across a list of items using fuzzy matching.
 *
 * @param {string} query - The search query.
 * @param {Array<Object>} items - Items to search.
 * @param {string[]} fields - Object keys to match against.
 * @param {number} [maxResults=20] - Max results to return.
 * @returns {Array<{item: Object, score: number, matchedField: string}>}
 */
export function fuzzyFilter(query, items, fields, maxResults = 20) {
  if (!query || !query.trim() || !items || items.length === 0) return [];

  const queries = expandQuery(query);

  const scored = [];

  for (const item of items) {
    let bestScore = 0;
    let bestField = '';

    for (const field of fields) {
      const value = item[field];
      if (!value || typeof value !== 'string') continue;

      for (const q of queries) {
        const s = fuzzyScore(q, value);
        if (s > bestScore) {
          bestScore = s;
          bestField = field;
        }
      }
    }

    if (bestScore > 0) {
      scored.push({ item, score: bestScore, matchedField: bestField });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults);
}

/**
 * Highlight matched characters in a string.
 * Returns an array of { text, highlighted } segments for React rendering.
 *
 * @param {string} text - The original text.
 * @param {string} query - The search query.
 * @returns {Array<{text: string, highlighted: boolean}>}
 */
export function highlightMatches(text, query) {
  if (!query || !text) return [{ text: text || '', highlighted: false }];

  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);

  // If direct substring match, highlight that range
  if (idx !== -1) {
    const segments = [];
    if (idx > 0) segments.push({ text: text.slice(0, idx), highlighted: false });
    segments.push({ text: text.slice(idx, idx + q.length), highlighted: true });
    if (idx + q.length < text.length) segments.push({ text: text.slice(idx + q.length), highlighted: false });
    return segments;
  }

  // Fuzzy highlight: highlight each matching character
  const segments = [];
  let qi = 0;
  let current = '';
  let isHighlighted = false;

  for (let i = 0; i < text.length; i++) {
    const charMatch = qi < q.length && text[i].toLowerCase() === q[qi];

    if (charMatch !== isHighlighted) {
      if (current) segments.push({ text: current, highlighted: isHighlighted });
      current = '';
      isHighlighted = charMatch;
    }
    current += text[i];
    if (charMatch) qi++;
  }

  if (current) segments.push({ text: current, highlighted: isHighlighted });

  return segments;
}
