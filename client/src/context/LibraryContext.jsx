import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAudio } from './AudioContext';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [watchedList, setWatchedList] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [ratings, setRatings] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const { playChime, playClick } = useAudio();

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev && prev.message === message ? null : prev));
    }, 3200);
  };

  const fetchLibrary = useCallback(async () => {
    try {
      const [watchedRes, watchlistRes, ratingsRes] = await Promise.all([
        api.get('/library/watched'),
        api.get('/library/watchlist'),
        api.get('/library/ratings')
      ]);

      if (watchedRes.data.success) {
        setWatchedList(watchedRes.data.items || []);
      }
      if (watchlistRes.data.success) {
        setWatchlist(watchlistRes.data.items || []);
      }
      if (ratingsRes.data.success) {
        const rMap = {};
        (ratingsRes.data.ratings || []).forEach(r => {
          rMap[r.mediaId] = r.score;
        });
        setRatings(rMap);
      }
    } catch (e) {
      console.warn('Could not sync library', e.message);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const isWatched = useCallback((mediaId) => {
    return watchedList.some(item => String(item.mediaId) === String(mediaId));
  }, [watchedList]);

  const inWatchlist = useCallback((mediaId) => {
    return watchlist.some(item => String(item.mediaId) === String(mediaId));
  }, [watchlist]);

  const getRating = useCallback((mediaId) => {
    return ratings[String(mediaId)] || null;
  }, [ratings]);

  const markWatched = async (media, userRating = null, sentiment = 'loved', reviewNote = '') => {
    playChime();
    try {
      const res = await api.post('/library/watched', {
        mediaId: String(media.id),
        title: media.title || media.name,
        poster_path: media.poster_path,
        media_type: media.media_type || 'movie',
        userRating,
        sentiment,
        reviewNote
      });

      if (res.data.success) {
        showToast(`Marked "${media.title || media.name}" as Watched`);
        // Remove from watchlist optimistically
        setWatchlist(prev => prev.filter(i => String(i.mediaId) !== String(media.id)));
        if (userRating) {
          setRatings(prev => ({ ...prev, [String(media.id)]: userRating }));
        }
        fetchLibrary();
      }
    } catch (err) {
      showToast('Failed to update watched status', 'error');
    }
  };

  const unmarkWatched = async (mediaId, title = 'Title') => {
    playClick();
    try {
      await api.delete(`/library/watched/${mediaId}`);
      showToast(`Removed "${title}" from Watched`);
      setWatchedList(prev => prev.filter(i => String(i.mediaId) !== String(mediaId)));
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const toggleWatchlist = async (media, priority = 'watch_next') => {
    const isPresent = inWatchlist(media.id);
    playClick();
    try {
      if (isPresent) {
        await api.delete(`/library/watchlist/${media.id}`);
        setWatchlist(prev => prev.filter(i => String(i.mediaId) !== String(media.id)));
        showToast(`Removed "${media.title || media.name}" from Watchlist`);
      } else {
        await api.post('/library/watchlist', {
          mediaId: String(media.id),
          title: media.title || media.name,
          poster_path: media.poster_path,
          media_type: media.media_type || 'movie',
          priority
        });
        playChime();
        showToast(`Added "${media.title || media.name}" to Watchlist`);
        fetchLibrary();
      }
    } catch (e) {
      showToast('Watchlist action failed', 'error');
    }
  };

  const rateMedia = async (mediaId, score, sentiment = 'loved') => {
    playChime();
    try {
      const res = await api.post('/library/rate', { mediaId: String(mediaId), score, sentiment });
      if (res.data.success) {
        setRatings(prev => ({ ...prev, [String(mediaId)]: score }));
        showToast(`Rated ${score}/10 — Taste profile updated`);
      }
    } catch (e) {
      showToast('Failed to save rating', 'error');
    }
  };

  return (
    <LibraryContext.Provider value={{
      watchedList,
      watchlist,
      ratings,
      toastMessage,
      showToast,
      isWatched,
      inWatchlist,
      getRating,
      markWatched,
      unmarkWatched,
      toggleWatchlist,
      rateMedia,
      refreshLibrary: fetchLibrary
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
