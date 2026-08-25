import { ALL_MEDIA } from '../data/curatedMedia.js';
import { UNIVERSES } from '../config/constants.js';
import { tmdbService } from '../services/tmdbService.js';
import { getRecommendations } from '../services/recommendationService.js';

export const movieController = {
  async getTrending(req, res) {
    try {
      const type = req.query.type || 'all';
      const items = await tmdbService.getTrending(type);
      res.json({ success: true, results: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getPopular(req, res) {
    try {
      const type = req.query.type || 'movie';
      const items = await tmdbService.getPopular(type);
      res.json({ success: true, results: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getTopRated(req, res) {
    try {
      const type = req.query.type || 'movie';
      const items = await tmdbService.getTopRated(type);
      res.json({ success: true, results: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getUniverses(req, res) {
    try {
      const universesWithMedia = UNIVERSES.map(u => {
        const matchingMedia = ALL_MEDIA.filter(m => m.universe_id === u.id || (m.genres && u.tags.some(t => m.genres.includes(t))));
        return {
          ...u,
          count: matchingMedia.length,
          items: matchingMedia.slice(0, 8)
        };
      });
      res.json({ success: true, universes: universesWithMedia });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const type = req.query.type || 'movie';
      const details = await tmdbService.getDetails(id, type);

      if (!details) {
        return res.status(404).json({ success: false, message: 'Title not found' });
      }

      // Compute intelligent recommendations for this title
      const similar = getRecommendations({
        referenceItem: details,
        excludeIds: [details.id],
        limit: 8
      });

      res.json({
        success: true,
        data: {
          ...details,
          similarRecommendations: similar
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async search(req, res) {
    try {
      const { q } = req.query;
      const results = await tmdbService.searchMulti(q);
      res.json({ success: true, results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async filter(req, res) {
    try {
      const { genre, decade, minRating, mediaType, sortBy, mood } = req.query;

      let results = [...ALL_MEDIA];

      if (mediaType && mediaType !== 'all') {
        results = results.filter(m => m.media_type === mediaType);
      }

      if (genre && genre !== 'all') {
        results = results.filter(m => (m.genres || []).some(g => g.toLowerCase() === genre.toLowerCase()));
      }

      if (mood && mood !== 'all') {
        results = results.filter(m => (m.mood_tags || []).includes(mood));
      }

      if (minRating) {
        const min = parseFloat(minRating);
        results = results.filter(m => (m.vote_average || 0) >= min);
      }

      if (decade && decade !== 'all') {
        const startYear = parseInt(decade);
        const endYear = startYear + 9;
        results = results.filter(m => {
          const year = parseInt((m.release_date || m.first_air_date || '2000').substring(0, 4));
          return year >= startYear && year <= endYear;
        });
      }

      if (sortBy === 'rating') {
        results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      } else if (sortBy === 'recency') {
        results.sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date));
      } else if (sortBy === 'votes') {
        results.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      }

      res.json({ success: true, total: results.length, results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
