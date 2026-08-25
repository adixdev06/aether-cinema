import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Film, Tv, Star, User, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import { useAudio } from '../../context/AudioContext';
import { handleImageError } from '../../utils/imageFallback';

export default function CommandSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { playClick, playChime } = useAudio();

  // Keyboard shortcut listener for '/' and 'Escape'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !isOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        // open is handled by parent, but let's check
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Live search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/movies/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setResults(res.data.results.slice(0, 8));
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Navigation handlers
  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      playClick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      playClick();
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    playChime();
    onClose();
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    navigate(`/media/${type}/${item.id}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-noir-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl bg-noir-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel-elevated"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-gold-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNavigation}
              placeholder="Search by title, director, actor, genre, or mood..."
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div>
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-white/5 text-slate-400 rounded border border-white/10 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
            {results.length > 0 ? (
              results.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isTv = item.media_type === 'tv' || item.first_air_date;
                const year = (item.release_date || item.first_air_date || '').substring(0, 4);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-noir-850 shrink-0 border border-white/10">
                      {item.poster_path ? (
                        <img
                          src={item.poster_path}
                          alt={item.title || item.name}
                          onError={(e) => handleImageError(e, item.title || item.name, item.genres ? item.genres[0] : 'Cinema')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-white truncate">
                          {item.title || item.name}
                        </span>
                        {year && (
                          <span className="text-xs text-slate-400 font-mono">({year})</span>
                        )}
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {isTv ? 'TV' : 'Film'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.director ? `Directed by ${item.director}` : (item.overview || 'Explore details')}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        {item.vote_average > 0 && (
                          <span className="flex items-center gap-1 text-gold-400 font-medium">
                            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        )}
                        {item.genres && (
                          <span>{item.genres.slice(0, 2).join(' • ')}</span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'text-gold-400 translate-x-1' : ''}`} />
                  </div>
                );
              })
            ) : query.trim() ? (
              !loading && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No cinematic results found for "{query}". Try a genre or director name.
                </div>
              )
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <p>Quick suggestions: <span className="text-gold-400 cursor-pointer" onClick={() => setQuery('Nolan')}>Nolan</span> • <span className="text-gold-400 cursor-pointer" onClick={() => setQuery('Sci-Fi')}>Sci-Fi</span> • <span className="text-gold-400 cursor-pointer" onClick={() => setQuery('Severance')}>Severance</span> • <span className="text-gold-400 cursor-pointer" onClick={() => setQuery('Mind-Bending')}>Mind-Bending</span></p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
