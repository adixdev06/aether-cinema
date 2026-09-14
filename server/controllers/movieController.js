import { ALL_MEDIA, FREE_STREAMS } from '../data/curatedMedia.js';
import { STREAM_CHANNELS } from '../data/freeStreams.js';
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
  },

  async getStreams(req, res) {
    try {
      const { channel, q } = req.query;
      let streams = [...FREE_STREAMS];

      if (channel && channel !== 'all') {
        streams = streams.filter(s => s.channel === channel);
      }

      if (q && q.trim()) {
        const query = q.toLowerCase().trim();
        streams = streams.filter(s =>
          s.title.toLowerCase().includes(query) ||
          (s.director && s.director.toLowerCase().includes(query)) ||
          (s.genres && s.genres.some(g => g.toLowerCase().includes(query)))
        );
      }

      // Group by channels for the Cinema Lounge
      const groupedChannels = STREAM_CHANNELS.filter(c => c.id !== 'all').map(ch => ({
        ...ch,
        items: FREE_STREAMS.filter(s => s.channel === ch.id)
      }));

      res.json({
        success: true,
        total: streams.length,
        channels: STREAM_CHANNELS,
        groupedChannels,
        streams,
        featuredStream: FREE_STREAMS[0]
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getStreamDetails(req, res) {
    try {
      const { id } = req.params;
      const mediaId = String(id);

      // Check if it's in free streams
      const freeItem = FREE_STREAMS.find(s => String(s.id) === mediaId);

      if (freeItem) {
        // Construct rich source options
        const sources = [];
        if (freeItem.stream_url) {
          sources.push({
            label: "High-Speed Direct HTML5 Stream",
            type: freeItem.stream_type || "mp4",
            url: freeItem.stream_url,
            quality: freeItem.stream_quality || "1080p Full HD"
          });
        }
        if (freeItem.youtube_id) {
          sources.push({
            label: "Official YouTube Stream",
            type: "youtube",
            url: `https://www.youtube.com/embed/${freeItem.youtube_id}?autoplay=1&rel=0&modestbranding=1`,
            quality: "1080p Full HD"
          });
        }
        if (freeItem.archive_embed) {
          sources.push({
            label: "Archive.org Historical Master",
            type: "archive",
            url: freeItem.archive_embed,
            quality: "Original Archive Scan"
          });
        }

        const related = FREE_STREAMS.filter(s => String(s.id) !== mediaId).slice(0, 6);

        return res.json({
          success: true,
          data: {
            ...freeItem,
            is_free_stream: true,
            sources,
            relatedStreams: related
          }
        });
      }

      // If not in FREE_STREAMS, fetch from tmdb/curated media as trailer preview stream
      const generalDetails = await tmdbService.getDetails(id, req.query.type || 'movie');
      if (generalDetails) {
        const sources = [];
        if (generalDetails.trailer_key) {
          sources.push({
            label: "Official Studio HD Preview / Trailer",
            type: "youtube",
            url: `https://www.youtube.com/embed/${generalDetails.trailer_key}?autoplay=1&rel=0&modestbranding=1`,
            quality: "1080p Full HD"
          });
        }

        const related = FREE_STREAMS.slice(0, 6);

        return res.json({
          success: true,
          data: {
            ...generalDetails,
            is_free_stream: false,
            license: "Theatrical Copyright (Official Preview Player Available)",
            stream_quality: "1080p Official Preview",
            sources,
            relatedStreams: related
          }
        });
      }

      res.status(404).json({ success: false, message: 'Stream not found' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
