import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Compass, Star, Bookmark, Check, Info, Film } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { handleImageError } from '../../utils/imageFallback';
import TrailerModal from '../common/TrailerModal';
import CinemaPlayerModal from '../player/CinemaPlayerModal';

export default function HeroCinematic({ featuredList = [], onOpenSurprise }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
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
      {/* Dynamic 4K Backdrop with High Luminance & Contrast */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMedia.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="absolute inset-0 z-0 bg-noir-950"
        >
          <img
            src={currentMedia.backdrop_path || currentMedia.poster_path}
            alt={currentMedia.title || currentMedia.name}
            onError={(e) => handleImageError(e, currentMedia.title || currentMedia.name, currentMedia.genres ? currentMedia.genres[0] : 'Cinema')}
            className="w-full h-full object-cover object-top opacity-70 filter brightness-90 contrast-105"
          />
          {/* Ambient Cinematic Gradient Masks */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir-950/90 via-noir-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Container with Hero Poster Art */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-end justify-between gap-8">
        {/* Left Column: Headline, Synopsis & CTAs */}
        <div className="max-w-2xl space-y-6">
          {/* Brand Vision Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-noir-900/90 border border-white/15 text-xs font-semibold backdrop-blur-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-gold-400 uppercase tracking-widest text-[11px] font-bold">
              {currentMedia.genres ? currentMedia.genres.slice(0, 2).join(' • ') : 'Sensory Discovery'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200 font-mono">
              ★ {(currentMedia.vote_average || 8.0).toFixed(1)} / 10
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-gold-300 font-semibold">{currentMedia.director || 'Auteur Film'}</span>
          </div>

          {/* Large Hero Headline */}
          <div className="space-y-2">
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05] drop-shadow-2xl">
              {currentMedia.title || currentMedia.name}
            </h1>
            {currentMedia.tagline && (
              <p className="text-base sm:text-lg text-gold-300 font-medium italic tracking-wide drop-shadow">
                "{currentMedia.tagline}"
              </p>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal line-clamp-3 max-w-2xl drop-shadow">
            {currentMedia.overview}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {/* Primary Stream Button */}
            {currentMedia.is_free_stream ? (
              <Link
                to={`/watch/${currentMedia.id}`}
                onClick={playClick}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-gold-500/30 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream Full Movie</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  playClick();
                  setCinemaModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-gold-500/30 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream Preview</span>
              </button>
            )}

            {/* Surprise Me CTA */}
            <button
              onClick={() => {
                playClick();
                onOpenSurprise();
              }}
              className="px-5 py-3.5 rounded-2xl bg-noir-900/90 hover:bg-white/20 text-white font-medium text-sm border border-white/20 backdrop-blur-xl transition-all flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Surprise Me</span>
            </button>

            {/* Trailer CTA */}
            {currentMedia.trailer_key && (
              <button
                onClick={() => {
                  playClick();
                  setTrailerOpen(true);
                }}
                className="px-4 py-3.5 rounded-2xl bg-noir-900/90 hover:bg-white/20 text-slate-200 hover:text-white font-medium text-sm border border-white/15 backdrop-blur-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <Film className="w-4 h-4 text-gold-400" />
                <span>Trailer</span>
              </button>
            )}

            {/* Watchlist Quick Button */}
            <button
              onClick={() => toggleWatchlist(currentMedia)}
              className={`p-3.5 rounded-2xl border transition-all shadow-lg ${
                watchlisted
                  ? 'bg-gold-500 text-noir-950 border-gold-400'
                  : 'bg-noir-900/90 hover:bg-white/20 text-white border-white/15 backdrop-blur-xl'
              }`}
              title={watchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${watchlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Details Link */}
            <Link
              to={`/media/${type}/${currentMedia.id}`}
              onClick={playClick}
              className="p-3.5 rounded-2xl bg-noir-900/90 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 backdrop-blur-xl transition-all shadow-lg"
              title="Full Details"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>

          {/* Carousel Pagination Ticks */}
          {featuredList.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {featuredList.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    playClick();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentIndex === idx ? 'w-10 bg-gold-400 shadow-md shadow-gold-500/50' : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  title={item.title || item.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Prominent Featured Poster Artwork Badge */}
        <div className="hidden lg:block shrink-0">
          <Link
            to={`/media/${type}/${currentMedia.id}`}
            onClick={playClick}
            className="group relative block w-56 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-gold-500/30 hover:border-gold-400 shadow-2xl shadow-gold-500/10 transition-all duration-500 hover:scale-105"
          >
            <img
              src={currentMedia.poster_path}
              alt={currentMedia.title || currentMedia.name}
              onError={(e) => handleImageError(e, currentMedia.title || currentMedia.name, currentMedia.genres ? currentMedia.genres[0] : 'Cinema')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-md bg-gold-500/90 text-noir-950 font-bold">
                Featured
              </span>
              <span className="text-white/90 font-mono">
                ★ {(currentMedia.vote_average || 8.0).toFixed(1)}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Embedded Cinema Stream Player Modal */}
      <CinemaPlayerModal
        isOpen={cinemaModalOpen}
        onClose={() => setCinemaModalOpen(false)}
        media={currentMedia}
      />

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
