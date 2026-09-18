/**
 * SEO & Structured Data (JSON-LD) Utility for CricketHub
 */

export function updateSEO({
  title = 'Cricket Hub | Live Cricket Scores, Schedules, Stats & H2H Comparison',
  description = 'Follow real-time live cricket scores, ball-by-ball commentary, upcoming match schedules, comprehensive player career stats, ICC rankings, and visual head-to-head comparisons.',
  keywords = 'live cricket score, cricket scores, cricket schedule, player career stats, virat kohli stats, rohit sharma, icc rankings, ball by ball commentary, cricket match timetable',
  canonicalUrl = window.location.href,
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=630&fit=crop&q=80',
  structuredData = null,
} = {}) {
  // 1. Title
  document.title = title;

  // Helper to set or create meta tag
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  setMeta('name', 'description', description);
  setMeta('name', 'keywords', keywords);
  setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // 3. Open Graph Tags
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', ogType);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', ogImage);
  setMeta('property', 'og:site_name', 'CricketHub');
  setMeta('property', 'og:locale', 'en_US');

  // 4. Twitter Card Tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', ogImage);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 6. JSON-LD Structured Data
  let ldJsonEl = document.querySelector('script#crickethub-structured-data');
  if (!ldJsonEl) {
    ldJsonEl = document.createElement('script');
    ldJsonEl.setAttribute('id', 'crickethub-structured-data');
    ldJsonEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(ldJsonEl);
  }

  const defaultWebsiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'CricketHub',
    'url': window.location.origin,
    'description': description,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${window.location.origin}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const schemaToInject = structuredData || defaultWebsiteSchema;
  ldJsonEl.textContent = JSON.stringify(schemaToInject);
}

/**
 * Generate Schema.org Person (Athlete) JSON-LD for Player Profiles
 */
export function generatePlayerSchema(playerData) {
  if (!playerData || !playerData.name) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': playerData.name,
    'jobTitle': playerData.role || 'Professional Cricketer',
    'nationality': {
      '@type': 'Country',
      'name': playerData.country || 'International'
    },
    'image': playerData.image || undefined,
    'birthDate': playerData.personalInfo?.born ? playerData.personalInfo.born.split('(')[0]?.trim() : undefined,
    'birthPlace': playerData.personalInfo?.birthPlace || undefined,
    'description': `${playerData.name} is an international cricket player representing ${playerData.country || 'International'}. Role: ${playerData.role || 'Cricketer'}. Batting Style: ${playerData.personalInfo?.battingStyle || '-'}. Bowling Style: ${playerData.personalInfo?.bowlingStyle || '-'}.`,
    'memberOf': (playerData.personalInfo?.teams || []).map(teamName => ({
      '@type': 'SportsTeam',
      'name': teamName
    }))
  };
}

/**
 * Generate Schema.org SportsEvent JSON-LD for Live & Scheduled Matches
 */
export function generateMatchSchema(match) {
  if (!match) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    'name': `${match.team1} vs ${match.team2} (${match.matchFormat || match.matchType || 'Cricket Match'})`,
    'description': `${match.header || `${match.team1} vs ${match.team2}`}: ${match.status || 'Cricket Match'} - ${match.series || 'International Series'}`,
    'sport': 'Cricket',
    'competitor': [
      { '@type': 'SportsTeam', 'name': match.team1 },
      { '@type': 'SportsTeam', 'name': match.team2 }
    ],
    'location': match.venue ? {
      '@type': 'Place',
      'name': typeof match.venue === 'object' ? match.venue.name : match.venue,
      'address': typeof match.venue === 'object' ? `${match.venue.city || ''}, ${match.venue.country || ''}`.trim() : undefined
    } : undefined,
    'eventStatus': match.isComplete
      ? 'https://schema.org/EventCompleted'
      : (match.isLive ? 'https://schema.org/EventMovedOnline' : 'https://schema.org/EventScheduled')
  };
}
