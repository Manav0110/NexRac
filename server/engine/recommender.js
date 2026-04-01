/**
 * Hybrid Recommendation Engine
 * Combines content-based filtering + behavior-based filtering + cross-domain bridging
 */

import { mockMusic, mockPodcasts, mockVideos, mockMovies, mockNews, genreMap } from '../data/mockData.js';

const ALL_CONTENT = [...mockMovies, ...mockMusic, ...mockPodcasts, ...mockVideos, ...mockNews];

// Score an item based on how well it matches user preferences
function contentScore(item, preferences) {
  let score = 0;
  const { likedGenres = [], likedTags = [], likedDomains = [], dislikedGenres = [] } = preferences;

  const itemGenres = (item.genre || []).map(g => g.toLowerCase());
  const itemTags = (item.tags || []).map(t => t.toLowerCase());

  // Genre matching
  for (const genre of likedGenres) {
    if (itemGenres.some(g => g.includes(genre.toLowerCase()))) score += 3;
  }

  // Tag matching
  for (const tag of likedTags) {
    if (itemTags.some(t => t.includes(tag.toLowerCase()))) score += 2;
  }

  // Domain preference
  if (likedDomains.includes(item.domain)) score += 1;

  // Penalty for disliked genres
  for (const genre of dislikedGenres) {
    if (itemGenres.some(g => g.includes(genre.toLowerCase()))) score -= 5;
  }

  // Boost for high ratings
  if (item.rating >= 4.8) score += 1;

  return score;
}

// Content-based recommendations
function contentBasedRecs(preferences, excludeIds = [], limit = 10) {
  const scored = ALL_CONTENT
    .filter(item => !excludeIds.includes(item.id))
    .map(item => ({ ...item, score: contentScore(item, preferences) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

// Cross-domain bridge recommendations
function crossDomainRecs(likedItems = [], excludeIds = [], limit = 8) {
  const recommendations = [];
  const dominantGenres = new Set();

  // Extract genres from liked items
  for (const item of likedItems) {
    (item.genre || []).forEach(g => dominantGenres.add(g.toLowerCase()));
  }

  const likedDomains = new Set(likedItems.map(i => i.domain));

  // Recommend from OTHER domains
  for (const [broadGenre, domainMap] of Object.entries(genreMap)) {
    const matchedGenre = [...dominantGenres].some(g => g.includes(broadGenre));
    if (!matchedGenre) continue;

    // Find content from domains the user hasn't explored
    for (const [domain, genres] of Object.entries(domainMap)) {
      const targetContent = ALL_CONTENT.filter(item =>
        item.domain === domain &&
        !likedDomains.has(domain) &&
        !excludeIds.includes(item.id) &&
        (item.genre || []).some(g => genres.includes(g.toLowerCase()))
      );
      recommendations.push(...targetContent.slice(0, 2));
      if (recommendations.length >= limit) break;
    }
    if (recommendations.length >= limit) break;
  }

  return recommendations.slice(0, limit);
}

// Get trending (top rated across all domains)
function getTrending(excludeIds = [], limit = 12) {
  return ALL_CONTENT
    .filter(item => !excludeIds.includes(item.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// Generate "Because you liked X" reason
function generateReason(item, likedItems) {
  if (likedItems.length === 0) return 'Trending in your area';
  const topLiked = likedItems[0];
  const sharedGenre = (item.genre || []).find(g =>
    (topLiked.genre || []).some(tg => tg.toLowerCase() === g.toLowerCase())
  );
  if (sharedGenre) return `Because you like ${sharedGenre} content`;
  return `Popular in ${item.domain}`;
}

export function generateRecommendations({ preferences = {}, history = [], likedItems = [] }) {
  const allInteracted = [...(history || []), ...(likedItems || [])].map(i => i.id);

  const contentRecs = contentBasedRecs(preferences, allInteracted, 15);
  const crossDomain = crossDomainRecs(likedItems, allInteracted, 8);
  const trending = getTrending(allInteracted, 8);

  // Add reasons to recommendations
  const withReasons = contentRecs.map(item => ({
    ...item,
    reason: generateReason(item, likedItems),
    recommendationType: 'personalized'
  }));

  const crossWithReasons = crossDomain.map(item => ({
    ...item,
    reason: `Explore ${item.domain} based on your taste`,
    recommendationType: 'cross-domain'
  }));

  const trendingWithReasons = trending.map(item => ({
    ...item,
    reason: 'Trending now',
    recommendationType: 'trending'
  }));

  return {
    personalized: withReasons,
    crossDomain: crossWithReasons,
    trending: trendingWithReasons,
  };
}
