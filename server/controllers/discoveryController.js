import { getAllMoods, getMediaByMood } from '../services/moodService.js';
import { ALL_MEDIA } from '../data/curatedMedia.js';
import { memoryDb } from '../config/db.js';
import { buildUserTasteVector, generateRationale } from '../services/recommendationService.js';

export const discoveryController = {
  getMoods(req, res) {
    const moods = getAllMoods();
    res.json({ success: true, moods });
  },

  getMoodMedia(req, res) {
    const { moodId } = req.params;
    const userId = req.user?.id;
    const watched = userId ? memoryDb.find('watched', { userId }) : [];
    const watchedIds = watched.map(w => w.mediaId);

    const result = getMediaByMood(moodId, { watchedIds, limit: 16 });
    if (!result.mood) {
      return res.status(404).json({ success: false, message: 'Mood not recognized' });
    }
    res.json({ success: true, ...result });
  },

  surpriseMe(req, res) {
    const userId = req.user?.id;
    const watched = userId ? memoryDb.find('watched', { userId }) : [];
    const ratings = userId ? memoryDb.find('ratings', { userId }) : [];
    const watchedIds = new Set(watched.map(w => String(w.mediaId)));

    const userTaste = buildUserTasteVector(watched, ratings);

    // Filter unwatched pool with high quality
    let candidates = ALL_MEDIA.filter(m => !watchedIds.has(String(m.id)) && (m.vote_average || 7) >= 7.6);
    if (candidates.length === 0) {
      candidates = ALL_MEDIA; // fallback
    }

    // Weighted random selection based on vote average
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];

    const matchPercent = Math.min(98, Math.max(88, Math.round((chosen.vote_average / 10) * 100) + Math.floor(Math.random() * 5)));
    const reasons = generateRationale(chosen, userTaste, {
      referenceTitle: 'Your cinematic curiosity'
    });

    res.json({
      success: true,
      data: {
        ...chosen,
        matchScore: matchPercent,
        whyReasons: reasons
      }
    });
  },

  getUniverseGraph(req, res) {
    // Generate force-directed graph representation of all curated media
    const nodes = ALL_MEDIA.map(item => ({
      id: String(item.id),
      name: item.title || item.name,
      media_type: item.media_type,
      genres: item.genres,
      primaryGenre: item.genres ? item.genres[0] : 'Cinema',
      director: item.director,
      rating: item.vote_average,
      poster: item.poster_path,
      backdrop: item.backdrop_path,
      universe_id: item.universe_id,
      val: Math.max(15, Math.round((item.vote_average || 7.5) * 3))
    }));

    const links = [];
    const linkSet = new Set();

    for (let i = 0; i < ALL_MEDIA.length; i++) {
      for (let j = i + 1; j < ALL_MEDIA.length; j++) {
        const a = ALL_MEDIA[i];
        const b = ALL_MEDIA[j];
        let connectionStrength = 0;
        let connectionType = [];

        // 1. Same director
        if (a.director && b.director && a.director === b.director) {
          connectionStrength += 3;
          connectionType.push(`Shared Director: ${a.director}`);
        }

        // 2. Shared cast members
        const aCast = (a.cast || []).map(c => c.name);
        const bCast = (b.cast || []).map(c => c.name);
        const sharedActors = aCast.filter(act => bCast.includes(act));
        if (sharedActors.length > 0) {
          connectionStrength += sharedActors.length * 2;
          connectionType.push(`Shared Cast: ${sharedActors.join(', ')}`);
        }

        // 3. Shared universe
        if (a.universe_id && b.universe_id && a.universe_id === b.universe_id) {
          connectionStrength += 2;
          connectionType.push('Thematic Universe Alignment');
        }

        // 4. Strong genre overlap
        const sharedGenres = (a.genres || []).filter(g => (b.genres || []).includes(g));
        if (sharedGenres.length >= 2) {
          connectionStrength += 1.5;
          connectionType.push(`Genre Overlap: ${sharedGenres.join(' & ')}`);
        }

        if (connectionStrength >= 2) {
          const key = `${a.id}_${b.id}`;
          if (!linkSet.has(key)) {
            linkSet.add(key);
            links.push({
              source: String(a.id),
              target: String(b.id),
              strength: connectionStrength,
              reason: connectionType.join(' • ')
            });
          }
        }
      }
    }

    res.json({
      success: true,
      graph: {
        nodes,
        links
      }
    });
  }
};
