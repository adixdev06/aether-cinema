import { ALL_MEDIA } from '../data/curatedMedia.js';

// Cosine similarity between two numerical vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) return 0.5;
  const keys = Object.keys(vecA);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (const k of keys) {
    const valA = vecA[k] || 0;
    const valB = vecB[k] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0.5;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Compute user taste vector from watched & rated movies
export function buildUserTasteVector(userWatched = [], userRatings = []) {
  const ratingMap = {};
  userRatings.forEach(r => {
    ratingMap[r.mediaId] = r.score; // 1 to 10
  });

  const baseVector = {
    cerebral: 0.5,
    adrenaline: 0.5,
    dread: 0.5,
    wonder: 0.5,
    melancholy: 0.5,
    wit: 0.5,
    romance: 0.5,
    complexity: 0.5,
    grit: 0.5
  };

  if (!userWatched || userWatched.length === 0) {
    return baseVector;
  }

  let totalWeight = 0;
  const accum = { ...baseVector };
  Object.keys(accum).forEach(k => (accum[k] = 0));

  userWatched.forEach(w => {
    const media = ALL_MEDIA.find(m => m.id === w.mediaId || String(m.id) === String(w.mediaId));
    if (media && media.vector) {
      const score = ratingMap[w.mediaId] || 7.5; // default high positive assumption
      const weight = score / 10;
      totalWeight += weight;
      Object.keys(media.vector).forEach(k => {
        accum[k] += (media.vector[k] || 0.5) * weight;
      });
    }
  });

  if (totalWeight === 0) return baseVector;

  const finalVector = {};
  Object.keys(accum).forEach(k => {
    finalVector[k] = parseFloat((accum[k] / totalWeight).toFixed(3));
  });
  return finalVector;
}

// Generate human-like dynamic rationale for recommendations
export function generateRationale(item, userTaste, context = {}) {
  const reasons = [];

  if (context.moodLabel) {
    reasons.push(`Directly matches your current desire for "${context.moodLabel}"`);
  }

  if (context.referenceTitle) {
    reasons.push(`Shares thematic DNA, pacing, and visual style with "${context.referenceTitle}"`);
  }

  if (item.director && context.favoriteDirectors && context.favoriteDirectors.includes(item.director)) {
    reasons.push(`Directed by ${item.director}, one of your most frequently praised creators`);
  } else if (item.director) {
    reasons.push(`Acclaimed masterwork directed by ${item.director}`);
  }

  if (item.vote_average >= 8.2) {
    reasons.push(`Extraordinary critical and audience consensus (${item.vote_average.toFixed(1)}/10 on TMDB)`);
  }

  if (item.mood_tags && item.mood_tags.includes('underrated-gems')) {
    reasons.push('Hidden cinematic gem with exceptional storytelling craft');
  }

  if (item.genres && item.genres.length > 0) {
    reasons.push(`Seamless blend of ${item.genres.slice(0, 2).join(' & ')}`);
  }

  if (item.vector && userTaste) {
    if (item.vector.cerebral >= 0.85 && userTaste.cerebral >= 0.6) {
      reasons.push('High cerebral complexity tailored to your interest in deep, analytical narratives');
    } else if (item.vector.adrenaline >= 0.85 && userTaste.adrenaline >= 0.6) {
      reasons.push('Visceral momentum and relentless kinetic pacing');
    } else if (item.vector.dread >= 0.85) {
      reasons.push('Masterclass in slow-burn tension and atmospheric unease');
    }
  }

  if (reasons.length < 3) {
    reasons.push('Selected for pristine audiovisual storytelling and emotional payoff');
  }

  return reasons.slice(0, 4);
}

// Main recommendation ranking algorithm
export function getRecommendations({
  targetMediaList = ALL_MEDIA,
  userTaste = null,
  userWatchedIds = [],
  moodId = null,
  excludeIds = [],
  referenceItem = null,
  includeUnderrated = false,
  shuffleJitter = false,
  limit = 12
}) {
  const watchedSet = new Set(userWatchedIds.map(String));
  const excludeSet = new Set(excludeIds.map(String));

  const scoredItems = targetMediaList.map(item => {
    const isWatched = watchedSet.has(String(item.id));
    const isExcluded = excludeSet.has(String(item.id));

    // Penalty for watched items: -100 to ensure they are omitted from discovery recommendations
    if (isWatched || isExcluded) {
      return {
        item,
        score: -100,
        matchPercentage: 0,
        isWatched: true,
        reasons: []
      };
    }

    let score = 0;

    // 1. Content & Vector similarity
    if (referenceItem && referenceItem.vector && item.vector) {
      const vecSim = cosineSimilarity(referenceItem.vector, item.vector);
      score += vecSim * 0.45;

      // Genre overlap
      const sharedGenres = (item.genres || []).filter(g => (referenceItem.genres || []).includes(g));
      score += (sharedGenres.length / Math.max(1, (item.genres || []).length)) * 0.25;

      // Director match
      if (item.director && referenceItem.director && item.director === referenceItem.director) {
        score += 0.2;
      }
    } else if (userTaste && item.vector) {
      const tasteSim = cosineSimilarity(userTaste, item.vector);
      score += tasteSim * 0.45;
    } else {
      score += 0.35; // baseline
    }

    // 2. Rating Quality
    const ratingScore = (item.vote_average || 7.0) / 10;
    score += ratingScore * 0.3;

    // 3. Mood Matching
    if (moodId && item.mood_tags && item.mood_tags.includes(moodId)) {
      score += 0.35;
    }

    // 4. Hidden Gem / Underrated Boost
    if (includeUnderrated && item.mood_tags && item.mood_tags.includes('underrated-gems')) {
      score += 0.25;
    }

    // 5. Shuffle temperature jitter to prevent stale repetitive results
    if (shuffleJitter) {
      score += (Math.random() - 0.5) * 0.35;
    }

    // Normalize to 0-1 range
    const normalizedScore = Math.min(1, Math.max(0.1, score / 1.15));
    const matchPercentage = Math.round(75 + normalizedScore * 24); // 75% to 99%

    const reasons = generateRationale(item, userTaste, {
      referenceTitle: referenceItem ? (referenceItem.title || referenceItem.name) : null,
      moodLabel: moodId
    });

    return {
      item,
      score: normalizedScore,
      matchPercentage: Math.min(99, matchPercentage),
      isWatched: false,
      reasons
    };
  });

  return scoredItems
    .filter(res => !res.isWatched && res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(res => ({
      ...res.item,
      matchScore: res.matchPercentage,
      whyReasons: res.reasons
    }));
}

// Generate Top Movies per Genre with NO duplicates across adjacent shelves
export function getGenreHubRecommendations(userWatchedIds = []) {
  const GENRES_TO_SHOW = [
    { id: 'sci-fi', label: 'Sci-Fi & Cyberpunk', genre: 'Sci-Fi' },
    { id: 'crime', label: 'Crime & Gangster Sagas', genre: 'Crime' },
    { id: 'thriller', label: 'Psychological Thrillers', genre: 'Thriller' },
    { id: 'drama', label: 'Monumental Dramas', genre: 'Drama' },
    { id: 'action', label: 'High-Octane Action', genre: 'Action' },
    { id: 'animation', label: 'Auteur Animation', genre: 'Animation' },
    { id: 'mystery', label: 'Mind-Bending Mysteries', genre: 'Mystery' },
    { id: 'comedy', label: 'Sharp & Dark Comedy', genre: 'Comedy' }
  ];

  const assignedIds = new Set();
  const genreResults = [];

  GENRES_TO_SHOW.forEach(g => {
    // Filter media matching genre
    const candidates = ALL_MEDIA.filter(item => {
      const hasGenre = (item.genres || []).includes(g.genre);
      return hasGenre;
    });

    // Prioritize high rating & unassigned titles to avoid duplicate rows
    const available = candidates.filter(m => !assignedIds.has(String(m.id)));
    const selected = available.length >= 4 ? available.slice(0, 6) : candidates.slice(0, 6);

    // Track selected
    selected.forEach(m => assignedIds.add(String(m.id)));

    genreResults.push({
      id: g.id,
      label: g.label,
      genre: g.genre,
      items: selected.map(item => ({
        ...item,
        matchScore: Math.round(85 + ((item.vote_average || 8) / 10) * 14)
      }))
    });
  });

  return genreResults;
}
