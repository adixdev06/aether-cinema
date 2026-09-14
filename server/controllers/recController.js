import { ALL_MEDIA } from '../data/curatedMedia.js';
import { memoryDb } from '../config/db.js';
import { buildUserTasteVector, getRecommendations, getGenreHubRecommendations } from '../services/recommendationService.js';

export const recController = {
  getPersonalizedFeeds(req, res) {
    const userId = req.user?.id;
    const watched = userId ? memoryDb.find('watched', { userId }) : [];
    const ratings = userId ? memoryDb.find('ratings', { userId }) : [];
    const watchedIds = watched.map(w => String(w.mediaId));

    const userTaste = buildUserTasteVector(watched, ratings);

    // 1. Picked For You (Overall taste vector match with diversity)
    const pickedForYou = getRecommendations({
      userTaste,
      userWatchedIds: watchedIds,
      limit: 10
    });

    // 2. Hidden Gems & Underrated Masterworks
    const hiddenGems = getRecommendations({
      targetMediaList: ALL_MEDIA.filter(m => (m.vote_count || 10000) <= 20000 || (m.mood_tags || []).includes('underrated-gems')),
      userTaste,
      userWatchedIds: watchedIds,
      includeUnderrated: true,
      limit: 10
    });

    // 3. Because You Loved (Reference most recently highly rated item)
    let becauseYouLoved = null;
    let anchorTitle = null;
    if (watched.length > 0) {
      const lastWatchedId = watched[watched.length - 1].mediaId;
      const ref = ALL_MEDIA.find(m => String(m.id) === String(lastWatchedId));
      if (ref) {
        anchorTitle = ref.title || ref.name;
        becauseYouLoved = getRecommendations({
          referenceItem: ref,
          userWatchedIds: watchedIds,
          limit: 8
        });
      }
    }

    if (!becauseYouLoved) {
      const defaultRef = ALL_MEDIA[0]; // Inception
      anchorTitle = defaultRef.title || defaultRef.name;
      becauseYouLoved = getRecommendations({
        referenceItem: defaultRef,
        userWatchedIds: watchedIds,
        limit: 8
      });
    }

    // 4. Unwatched Masterpieces
    const unwatchedMasterpieces = ALL_MEDIA
      .filter(m => !watchedIds.includes(String(m.id)))
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 10)
      .map(item => ({
        ...item,
        matchScore: Math.round(90 + Math.random() * 8),
        whyReasons: ['Universally recognized cinematic triumph', 'Impeccable directing and scriptwriting', 'Essential viewing benchmark']
      }));

    res.json({
      success: true,
      hasHistory: watched.length > 0,
      feeds: {
        pickedForYou,
        hiddenGems,
        becauseYouLoved: {
          anchorTitle,
          items: becauseYouLoved
        },
        unwatchedMasterpieces
      }
    });
  },

  getShuffleFeed(req, res) {
    const userId = req.user?.id;
    const watched = userId ? memoryDb.find('watched', { userId }) : [];
    const ratings = userId ? memoryDb.find('ratings', { userId }) : [];
    const watchedIds = watched.map(w => String(w.mediaId));
    const userTaste = buildUserTasteVector(watched, ratings);

    const shuffled = getRecommendations({
      userTaste,
      userWatchedIds: watchedIds,
      shuffleJitter: true,
      includeUnderrated: true,
      limit: 12
    });

    res.json({
      success: true,
      results: shuffled
    });
  },

  getGenreHub(req, res) {
    const userId = req.user?.id;
    const watched = userId ? memoryDb.find('watched', { userId }) : [];
    const watchedIds = watched.map(w => String(w.mediaId));

    const genreSections = getGenreHubRecommendations(watchedIds);

    res.json({
      success: true,
      genres: genreSections
    });
  },

  getItemRecommendations(req, res) {
    const { id } = req.params;
    const item = ALL_MEDIA.find(m => String(m.id) === String(id));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const recs = getRecommendations({
      referenceItem: item,
      excludeIds: [item.id],
      limit: 8
    });

    res.json({ success: true, recommendations: recs });
  }
};
