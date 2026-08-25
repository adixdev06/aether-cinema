import { MOODS } from '../config/constants.js';
import { ALL_MEDIA } from '../data/curatedMedia.js';

export function getAllMoods() {
  return MOODS;
}

export function getMediaByMood(moodId, options = {}) {
  const { watchedIds = [], userTaste = null, limit = 12 } = options;
  const mood = MOODS.find(m => m.id === moodId);
  const watchedSet = new Set(watchedIds.map(String));

  if (!mood) {
    return {
      mood: null,
      results: []
    };
  }

  const matches = ALL_MEDIA.filter(item => !watchedSet.has(String(item.id))).map(item => {
    let score = 0;

    // Mood tag direct match
    if (item.mood_tags && item.mood_tags.includes(moodId)) {
      score += 40;
    }

    // Genre overlap
    if (item.genres && mood.genres) {
      const genreMatches = item.genres.filter(g => mood.genres.includes(g));
      score += genreMatches.length * 15;
    }

    // Keyword overlap
    if (item.keywords && mood.keywords) {
      const kwMatches = item.keywords.filter(kw =>
        mood.keywords.some(mk => kw.toLowerCase().includes(mk.toLowerCase()))
      );
      score += kwMatches.length * 8;
    }

    // Rating quality
    score += (item.vote_average || 7.0) * 3;

    const matchPercent = Math.min(99, Math.round(75 + (score / 100) * 23));

    const explanation = [
      `Curated specifically for "${mood.label}"`,
      `Captures a ${mood.tone} atmosphere`,
      `Features high audience acclaim (${item.vote_average.toFixed(1)} rating)`,
      `Explores signature themes like ${(item.keywords || []).slice(0, 2).join(', ')}`
    ];

    return {
      ...item,
      moodMatchScore: matchPercent,
      matchScore: matchPercent,
      whyReasons: explanation
    };
  });

  matches.sort((a, b) => b.moodMatchScore - a.moodMatchScore);

  return {
    mood,
    results: matches.slice(0, limit)
  };
}
