import { memoryDb } from '../config/db.js';
import { ALL_MEDIA } from '../data/curatedMedia.js';

export const libraryController = {
  // --- WATCHED ---
  async getWatched(req, res) {
    try {
      const userId = req.user.id;
      const watchedItems = memoryDb.find('watched', { userId });

      // Enrich with media details
      const enriched = watchedItems.map(w => {
        const media = ALL_MEDIA.find(m => String(m.id) === String(w.mediaId)) || {
          id: w.mediaId,
          title: w.title || 'Untitled',
          poster_path: w.poster_path,
          media_type: w.media_type || 'movie',
          vote_average: 8.0,
          genres: ['Cinema']
        };
        return {
          ...w,
          media
        };
      });

      // Compute summary stats
      let totalMinutes = 0;
      const genreCounts = {};
      enriched.forEach(w => {
        totalMinutes += (w.media.runtime || 110);
        (w.media.genres || []).forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      });

      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([g, count]) => ({ genre: g, count }));

      res.json({
        success: true,
        totalWatched: enriched.length,
        totalHours: Math.round(totalMinutes / 60),
        topGenres,
        items: enriched.sort((a, b) => new Date(b.watchedAt || b.createdAt) - new Date(a.watchedAt || a.createdAt))
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async markWatched(req, res) {
    try {
      const userId = req.user.id;
      const { mediaId, title, poster_path, media_type, userRating, sentiment, reviewNote, rewatchCount } = req.body;

      if (!mediaId) {
        return res.status(400).json({ success: false, message: 'mediaId required' });
      }

      // Check if already watched
      const existing = memoryDb.findOne('watched', { userId, mediaId: String(mediaId) });
      if (existing) {
        // Update
        const updated = memoryDb.updateOne('watched', { userId, mediaId: String(mediaId) }, {
          userRating: userRating !== undefined ? userRating : existing.userRating,
          sentiment: sentiment || existing.sentiment,
          reviewNote: reviewNote !== undefined ? reviewNote : existing.reviewNote,
          rewatchCount: rewatchCount || (existing.rewatchCount || 1) + 1,
          watchedAt: new Date().toISOString()
        });

        // Also update ratings table if rating supplied
        if (userRating) {
          memoryDb.updateOne('ratings', { userId, mediaId: String(mediaId) }, { score: userRating, sentiment });
        }

        return res.json({ success: true, message: 'Updated watched entry', item: updated });
      }

      const newEntry = memoryDb.insert('watched', {
        userId,
        mediaId: String(mediaId),
        title,
        poster_path,
        media_type: media_type || 'movie',
        userRating: userRating || null,
        sentiment: sentiment || 'loved',
        reviewNote: reviewNote || '',
        rewatchCount: 1,
        watchedAt: new Date().toISOString()
      });

      // Auto-remove from watchlist if it was there
      memoryDb.deleteOne('watchlist', { userId, mediaId: String(mediaId) });

      // Save rating if provided
      if (userRating) {
        memoryDb.insert('ratings', {
          userId,
          mediaId: String(mediaId),
          score: userRating,
          sentiment: sentiment || 'loved'
        });
      }

      res.status(201).json({ success: true, message: 'Marked as watched', item: newEntry });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async unmarkWatched(req, res) {
    try {
      const userId = req.user.id;
      const { mediaId } = req.params;
      memoryDb.deleteOne('watched', { userId, mediaId: String(mediaId) });
      res.json({ success: true, message: 'Removed from watched' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // --- WATCHLIST ---
  async getWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const list = memoryDb.find('watchlist', { userId });

      const enriched = list.map(item => {
        const media = ALL_MEDIA.find(m => String(m.id) === String(item.mediaId)) || {
          id: item.mediaId,
          title: item.title,
          poster_path: item.poster_path,
          media_type: item.media_type || 'movie',
          vote_average: 8.0,
          genres: ['Cinema']
        };
        return {
          ...item,
          media
        };
      });

      const watchNext = enriched.filter(i => i.priority === 'watch_next');
      const savedForLater = enriched.filter(i => i.priority !== 'watch_next');

      res.json({
        success: true,
        total: enriched.length,
        watchNext,
        savedForLater,
        items: enriched
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async addToWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { mediaId, title, poster_path, media_type, priority } = req.body;

      if (!mediaId) {
        return res.status(400).json({ success: false, message: 'mediaId required' });
      }

      const existing = memoryDb.findOne('watchlist', { userId, mediaId: String(mediaId) });
      if (existing) {
        const updated = memoryDb.updateOne('watchlist', { userId, mediaId: String(mediaId) }, {
          priority: priority || existing.priority
        });
        return res.json({ success: true, message: 'Watchlist updated', item: updated });
      }

      const item = memoryDb.insert('watchlist', {
        userId,
        mediaId: String(mediaId),
        title,
        poster_path,
        media_type: media_type || 'movie',
        priority: priority || 'watch_next',
        addedAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, message: 'Added to watchlist', item });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { mediaId } = req.params;
      memoryDb.deleteOne('watchlist', { userId, mediaId: String(mediaId) });
      res.json({ success: true, message: 'Removed from watchlist' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // --- RATINGS ---
  async rateItem(req, res) {
    try {
      const userId = req.user.id;
      const { mediaId, score, sentiment } = req.body;

      if (!mediaId || score === undefined) {
        return res.status(400).json({ success: false, message: 'mediaId and score (1-10) required' });
      }

      const existing = memoryDb.findOne('ratings', { userId, mediaId: String(mediaId) });
      if (existing) {
        const updated = memoryDb.updateOne('ratings', { userId, mediaId: String(mediaId) }, {
          score,
          sentiment: sentiment || existing.sentiment,
          ratedAt: new Date().toISOString()
        });
        return res.json({ success: true, message: 'Rating updated', rating: updated });
      }

      const newRating = memoryDb.insert('ratings', {
        userId,
        mediaId: String(mediaId),
        score,
        sentiment: sentiment || 'liked',
        ratedAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, message: 'Rating saved', rating: newRating });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getRatings(req, res) {
    try {
      const userId = req.user.id;
      const ratings = memoryDb.find('ratings', { userId });
      res.json({ success: true, ratings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
