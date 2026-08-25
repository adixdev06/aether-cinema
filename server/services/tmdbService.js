import axios from 'axios';
import https from 'https';
import { ALL_MEDIA } from '../data/curatedMedia.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins

const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 10000
});

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.time < CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

export const tmdbService = {
  getApiKey() {
    return process.env.TMDB_API_KEY || '4e44d9029b1270a757cddc766a1bcb63';
  },

  async request(endpoint, params = {}, retries = 3) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
          params: {
            api_key: apiKey,
            ...params
          },
          httpsAgent,
          timeout: 8000
        });
        setCache(cacheKey, response.data);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          console.warn(`[TMDB API Warning] ${endpoint}: ${error.message}. Using fallback.`);
          return null;
        }
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }
    return null;
  },

  async getTrending(mediaType = 'all', timeWindow = 'week') {
    const tmdbData = await this.request(`/trending/${mediaType}/${timeWindow}`);
    if (tmdbData && tmdbData.results && tmdbData.results.length > 0) {
      return tmdbData.results
        .filter(item => item.poster_path)
        .map(item => this.normalizeItem(item));
    }
    return ALL_MEDIA.slice(0, 16);
  },

  async getPopular(mediaType = 'movie') {
    const endpoint = mediaType === 'tv' ? '/tv/popular' : '/movie/popular';
    const tmdbData = await this.request(endpoint);
    if (tmdbData && tmdbData.results && tmdbData.results.length > 0) {
      return tmdbData.results
        .filter(item => item.poster_path)
        .map(item => this.normalizeItem(item, mediaType));
    }
    return ALL_MEDIA.filter(m => mediaType === 'all' || m.media_type === mediaType);
  },

  async getTopRated(mediaType = 'movie') {
    const endpoint = mediaType === 'tv' ? '/tv/top_rated' : '/movie/top_rated';
    const tmdbData = await this.request(endpoint);
    if (tmdbData && tmdbData.results && tmdbData.results.length > 0) {
      return tmdbData.results
        .filter(item => item.poster_path)
        .map(item => this.normalizeItem(item, mediaType));
    }
    return [...ALL_MEDIA]
      .filter(m => mediaType === 'all' || m.media_type === mediaType)
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  },

  async searchMulti(query) {
    if (!query || !query.trim()) return [];
    
    // First check local curated matches for instant rich vectors
    const q = query.toLowerCase().trim();
    const localMatches = ALL_MEDIA.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const director = (item.director || '').toLowerCase();
      const castMatch = (item.cast || []).some(c => c.name.toLowerCase().includes(q));
      const genreMatch = (item.genres || []).some(g => g.toLowerCase().includes(q));
      const keywordMatch = (item.keywords || []).some(k => k.toLowerCase().includes(q));
      return title.includes(q) || director.includes(q) || castMatch || genreMatch || keywordMatch;
    });

    // Also search live TMDB database
    const tmdbData = await this.request('/search/multi', { query });
    if (tmdbData && tmdbData.results && tmdbData.results.length > 0) {
      const tmdbNormalized = tmdbData.results
        .filter(r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
        .map(item => this.normalizeItem(item));

      // Combine local matches (first) with TMDB results without duplicates
      const seenIds = new Set(localMatches.map(m => String(m.id)));
      const combined = [...localMatches];
      for (const t of tmdbNormalized) {
        if (!seenIds.has(String(t.id))) {
          seenIds.add(String(t.id));
          combined.push(t);
        }
      }
      return combined;
    }

    return localMatches;
  },

  async getDetails(id, mediaType = 'movie') {
    // 1. Fetch live TMDB details if available
    const endpoint = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const details = await this.request(endpoint, {
      append_to_response: 'credits,videos,similar,recommendations,keywords'
    });

    // 2. Check if we have curated vector enhancements
    const curated = ALL_MEDIA.find(m => String(m.id) === String(id));

    if (details) {
      const normalized = this.normalizeDetailedItem(details, mediaType);
      if (curated) {
        return {
          ...normalized,
          vector: curated.vector || normalized.vector,
          mood_tags: curated.mood_tags || normalized.mood_tags,
          universe_id: curated.universe_id || normalized.universe_id
        };
      }
      return normalized;
    }

    // 3. Fallback to curated
    if (curated) return curated;
    return ALL_MEDIA[0];
  },

  normalizeItem(item, explicitType = null) {
    const type = explicitType || item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const poster = item.poster_path
      ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w780${item.poster_path}`)
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
    const backdrop = item.backdrop_path
      ? (item.backdrop_path.startsWith('http') ? item.backdrop_path : `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`)
      : poster;

    return {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      media_type: type,
      overview: item.overview || '',
      poster_path: poster,
      backdrop_path: backdrop,
      vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.5,
      vote_count: item.vote_count || 100,
      release_date: item.release_date || item.first_air_date || '2023-01-01',
      first_air_date: item.first_air_date || item.release_date || '2023-01-01',
      genres: item.genres ? item.genres.map(g => (typeof g === 'string' ? g : g.name)) : ['Drama'],
      matchScore: Math.round(85 + Math.random() * 14)
    };
  },

  normalizeDetailedItem(item, type) {
    const base = this.normalizeItem(item, type);
    const trailer = (item.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
      || (item.videos?.results || [])[0];
    const director = (item.credits?.crew || []).find(c => c.job === 'Director')?.name
      || (item.created_by && item.created_by[0] ? item.created_by[0].name : 'Visionary Creator');
    const cast = (item.credits?.cast || []).slice(0, 8).map(c => ({
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
    }));

    return {
      ...base,
      tagline: item.tagline || 'A cinematic masterpiece.',
      runtime: item.runtime || (item.episode_run_time ? item.episode_run_time[0] : 120),
      director,
      cast,
      trailer_key: trailer ? trailer.key : null,
      keywords: (item.keywords?.keywords || item.keywords?.results || []).map(k => k.name),
      number_of_seasons: item.number_of_seasons,
      number_of_episodes: item.number_of_episodes,
      status: item.status || 'Released',
      seasons: item.seasons || []
    };
  }
};
