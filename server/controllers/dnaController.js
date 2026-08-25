import { memoryDb } from '../config/db.js';
import { ALL_MEDIA } from '../data/curatedMedia.js';

export const dnaController = {
  getMovieDna(req, res) {
    try {
      const userId = req.user.id;
      const watched = memoryDb.find('watched', { userId });
      const ratings = memoryDb.find('ratings', { userId });

      // If user is brand new with few interactions, synthesize a baseline archetypal profile with sample DNA
      const isNewUser = watched.length === 0;

      const genreCounts = {};
      const decadeCounts = {};
      const directorCounts = {};
      let totalRuntime = 0;
      let totalRatingSum = 0;
      let ratingsCount = ratings.length;

      ratings.forEach(r => {
        totalRatingSum += (r.score || 8);
      });

      const watchedMediaList = isNewUser
        ? ALL_MEDIA.slice(0, 4) // preview data
        : watched.map(w => ALL_MEDIA.find(m => String(m.id) === String(w.mediaId))).filter(Boolean);

      watchedMediaList.forEach(m => {
        totalRuntime += (m.runtime || 120);
        (m.genres || []).forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        if (m.director) {
          directorCounts[m.director] = (directorCounts[m.director] || 0) + 1;
        }
        const year = parseInt((m.release_date || m.first_air_date || '2015').substring(0, 4));
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      });

      // Calculate genre percentages
      const totalGenreHits = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1;
      const genreBreakdown = Object.entries(genreCounts)
        .map(([genre, count]) => ({
          genre,
          percentage: Math.round((count / totalGenreHits) * 100),
          count
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Radar dimensions
      const radarDimensions = [
        { label: 'Cerebral Complexity', value: isNewUser ? 88 : Math.min(98, 65 + (genreCounts['Sci-Fi'] || 0) * 8 + (genreCounts['Mystery'] || 0) * 8) },
        { label: 'Kinetic Adrenaline', value: isNewUser ? 75 : Math.min(98, 50 + (genreCounts['Action'] || 0) * 10 + (genreCounts['Thriller'] || 0) * 8) },
        { label: 'Emotional Depth', value: isNewUser ? 82 : Math.min(98, 55 + (genreCounts['Drama'] || 0) * 9 + (genreCounts['Romance'] || 0) * 10) },
        { label: 'Atmospheric Dread', value: isNewUser ? 68 : Math.min(98, 40 + (genreCounts['Horror'] || 0) * 12 + (genreCounts['Crime'] || 0) * 8) },
        { label: 'Visual Grandeur', value: isNewUser ? 94 : Math.min(98, 70 + (genreCounts['Adventure'] || 0) * 8 + (genreCounts['Sci-Fi'] || 0) * 8) },
        { label: 'Intellectual Wit', value: isNewUser ? 60 : Math.min(98, 45 + (genreCounts['Comedy'] || 0) * 10) }
      ];

      // Archetype evaluation
      const topGenre = genreBreakdown[0]?.genre || 'Sci-Fi';
      let archetype = {
        title: 'THE MIND-BENDER',
        badge: 'Cerebral Visionary',
        quote: 'You don’t watch movies to kill time. You look for puzzle-box stories that challenge reality and linger long after the final cut.',
        accent: '#818CF8'
      };

      if (topGenre === 'Action' || topGenre === 'Thriller') {
        archetype = {
          title: 'THE ADRENALINE PURIST',
          badge: 'Visceral Cinephile',
          quote: 'You crave kinetic momentum, razor-sharp editing, and stories where the tension never lets go of your pulse.',
          accent: '#F59E0B'
        };
      } else if (topGenre === 'Drama') {
        archetype = {
          title: 'THE EXISTENTIAL AUTEUR',
          badge: 'Character Scholar',
          quote: 'You are drawn to intense psychological character studies, poignant human vulnerability, and generational screenplays.',
          accent: '#38BDF8'
        };
      } else if (topGenre === 'Crime' || topGenre === 'Mystery') {
        archetype = {
          title: 'THE NEO-NOIR SLEUTH',
          badge: 'Shadow Inquisitor',
          quote: 'You thrive in rain-slicked city streets, morally ambiguous antiheroes, and conspiracies lurking in the dark.',
          accent: '#94A3B8'
        };
      } else if (topGenre === 'Horror') {
        archetype = {
          title: 'THE DREAD CONNOISSEUR',
          badge: 'Atmospheric Seeker',
          quote: 'You appreciate slow-creeping dread, psychological chills, and art-house terror over cheap jump scares.',
          accent: '#E11D48'
        };
      }

      const topDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      const topDecades = Object.entries(decadeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([decade, count]) => ({ decade, count }));

      const avgRating = ratingsCount > 0
        ? (totalRatingSum / ratingsCount).toFixed(1)
        : '8.4';

      res.json({
        success: true,
        isBaselinePreview: isNewUser,
        dna: {
          archetype,
          genreBreakdown: genreBreakdown.length > 0 ? genreBreakdown : [
            { genre: 'Sci-Fi', percentage: 35, count: 4 },
            { genre: 'Mystery', percentage: 25, count: 3 },
            { genre: 'Drama', percentage: 20, count: 2 },
            { genre: 'Thriller', percentage: 15, count: 2 },
            { genre: 'Action', percentage: 5, count: 1 }
          ],
          radarDimensions,
          stats: {
            totalWatched: watched.length,
            totalHours: Math.round(totalRuntime / 60) || 8,
            avgRatingGiven: avgRating,
            favoriteRuntime: '120 - 150 mins',
            hiddenGemAffinity: '78% Cult / Prestige',
            topDirectors: topDirectors.length > 0 ? topDirectors : [{ name: 'Christopher Nolan', count: 3 }, { name: 'Denis Villeneuve', count: 2 }],
            topDecades: topDecades.length > 0 ? topDecades : [{ decade: '2010s', count: 5 }, { decade: '2020s', count: 3 }]
          }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
