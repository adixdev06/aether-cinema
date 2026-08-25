import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Compass, Star, Bookmark, Check, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { handleImageError } from '../../utils/imageFallback';
import TrailerModal from '../common/TrailerModal';

export default function HeroCinematic({ featuredList = [], onOpenSurprise }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { playClick, playChime } = useAudio();
  const { isWatched, inWatchlist, markWatched, toggleWatchlist } = useLibrary();
  const navigate = useNavigate();

  const currentMedia = featuredList[currentIndex] || {
    id: 27205,
    title: "Inception",
    media_type: "movie",
    tagline: "Your mind is the scene of the crime.",
    overview: "Cobb, a skilled thief who steals corporate secrets through the use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.",
    backdrop_path: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    poster_path: "https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    vote_average: 8.4,
    release_date: "2010-07-15",
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Action", "Mystery"],
    trailer_key: "YoHD9XEInc0",
    matchScore: 98
  };

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  const watched = isWatched(currentMedia.id);
  const watchlisted = inWatchlist(currentMedia.id);
  const type = currentMedia.media_type || (currentMedia.first_air_date ? 'tv' : 'movie');

  return (
    <div className="relative w-full min-h-[92vh] flex items-end pb-16 pt-28 overflow-hidden">
      {/* Dynamic 4K Backdrop with Smooth Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMedia.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 z-0 bg-noir-950"
        >
          <img
            src={currentMedia.backdrop_path || currentMedia.poster_path}
            alt={currentMedia.title || currentMedia.name}
            onError={(e) => handleImageError(e, currentMedia.title || currentMedia.name, currentMedia.genres ? currentMedia.genres[0] : 'Cinema')}
            className="w-full h-full object-cover object-top opacity-45"
          />
          {/* Ambient Lighting Gradient Bleeds */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir-950 via-noir-950/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Brand Vision Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-noir-900/80 border border-white/10 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-gold-400 uppercase tracking-widest text-[11px] font-bold">
              {currentMedia.genres ? currentMedia.genres.slice(0, 2).join(' • ') : 'Sensory Discovery'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-mono">
              ★ {(currentMedia.vote_average || 8.0).toFixed(1)} / 10
            </span>
          </div>

          {/* Large Hero Headline */}
          <div className="space-y-2">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05]">
              {currentMedia.title || currentMedia.name}
            </h1>
            {currentMedia.tagline && (
              <p className="text-base sm:text-lg text-gold-300/90 font-light italic tracking-wide">
                "{currentMedia.tagline}"
              </p>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light line-clamp-3 max-w-2xl">
            {currentMedia.overview}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {/* Surprise Me - Primary Golden CTA */}
            <button
              onClick={() => {
                playClick();
                onOpenSurprise();
              }}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-gold-500/25 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 fill-noir-950" />
              <span>Surprise Me Tonight</span>
            </button>

            {/* Trailer CTA */}
            {currentMedia.trailer_key && (
              <button
                onClick={() => {
                  playClick();
                  setTrailerOpen(true);
                }}
                className="px-5 py-3.5 rounded-2xl bg-noir-900/80 hover:bg-white/15 text-white font-medium text-sm border border-white/15 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-gold-400 fill-current" />
                <span>Trailer</span>
              </button>
            )}

            {/* Watchlist Quick Button */}
            <button
              onClick={() => toggleWatchlist(currentMedia)}
              className={`p-3.5 rounded-2xl border transition-all ${
                watchlisted
                  ? 'bg-gold-500 text-noir-950 border-gold-400'
                  : 'bg-noir-900/80 hover:bg-white/15 text-white border-white/10 backdrop-blur-md'
              }`}
              title={watchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${watchlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Details Link */}
            <Link
              to={`/media/${type}/${currentMedia.id}`}
              onClick={playClick}
              className="p-3.5 rounded-2xl bg-noir-900/80 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all"
              title="Full Details"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Pagination Ticks */}
        {featuredList.length > 1 && (
          <div className="flex items-center gap-2 mt-8">
            {featuredList.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  playClick();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === idx ? 'w-8 bg-gold-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={item.title || item.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Embedded Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={currentMedia.trailer_key}
        title={currentMedia.title || currentMedia.name}
      />
    </div>
  );
}
