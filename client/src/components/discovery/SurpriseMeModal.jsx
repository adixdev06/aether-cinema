import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles, RefreshCw, X, Play, Bookmark, Check, Star, ArrowRight,
  ShieldCheck, Award, HeartHandshake
} from 'lucide-react';
import api from '../../api/client';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { handleImageError } from '../../utils/imageFallback';
import TrailerModal from '../common/TrailerModal';

export default function SurpriseMeModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { playClick, playBoom, playChime, playTick } = useAudio();
  const { isWatched, inWatchlist, markWatched, toggleWatchlist } = useLibrary();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      triggerSurpriseRoll();
    }
  }, [isOpen]);

  const triggerSurpriseRoll = async () => {
    setLoading(true);
    setPick(null);

    // Audio tick simulation
    let count = 0;
    const interval = setInterval(() => {
      playTick();
      count++;
      if (count > 6) clearInterval(interval);
    }, 120);

    try {
      const res = await api.post('/discovery/surprise-me');
      if (res.data.success) {
        setTimeout(() => {
          setPick(res.data.data);
          setLoading(false);
          playBoom();
          playChime();

          // Confetti burst
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#FCD34D', '#6366F1', '#ffffff']
          });
        }, 800);
      }
    } catch (err) {
      console.error('Surprise roll failed', err);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const watched = pick ? isWatched(pick.id) : false;
  const watchlisted = pick ? inWatchlist(pick.id) : false;
  const type = pick ? (pick.media_type || (pick.first_air_date ? 'tv' : 'movie')) : 'movie';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-noir-950/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="w-full max-w-3xl bg-noir-900 border border-white/10 rounded-3xl overflow-hidden glass-panel-elevated shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-30 p-2 rounded-full bg-noir-950/70 hover:bg-noir-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            /* Shuffling Reel Animation */
            <div className="py-24 px-6 text-center space-y-6 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-gold-500/20 border-t-gold-400 animate-spin"></div>
                <Sparkles className="w-8 h-8 text-gold-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-bold">
                  Synthesizing Discovery Engine
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Consulting your taste vectors...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Filtering unwatched catalog, analyzing pacing, ratings, and narrative resonance.
                </p>
              </div>
            </div>
          ) : pick ? (
            /* Reveal Theatrical Card */
            <div>
              {/* Backdrop Header */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-noir-950">
                <img
                  src={pick.backdrop_path || pick.poster_path}
                  alt={pick.title || pick.name}
                  onError={(e) => handleImageError(e, pick.title || pick.name, pick.genres ? pick.genres[0] : 'Cinema')}
                  className="w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/40 to-transparent" />

                {/* Match Badge & Tagline */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500 text-noir-950 shadow-lg shadow-gold-500/30">
                      <Sparkles className="w-3.5 h-3.5 fill-noir-950" />
                      {pick.matchScore}% CURATED MATCH FOR TONIGHT
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                      {pick.title || pick.name}
                    </h2>
                    {pick.tagline && (
                      <p className="text-xs text-slate-300 italic">
                        "{pick.tagline}"
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="flex items-center gap-1 text-gold-400 bg-noir-950/80 px-2.5 py-1 rounded-lg border border-gold-500/20">
                      <Star className="w-3.5 h-3.5 fill-gold-400" />
                      {(pick.vote_average || 8.0).toFixed(1)}
                    </span>
                    <span className="bg-noir-950/80 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10">
                      {(pick.release_date || pick.first_air_date || '').substring(0, 4)}
                    </span>
                    {pick.runtime && (
                      <span className="bg-noir-950/80 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10">
                        {pick.runtime}m
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body Content & Rationale */}
              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm text-slate-300 leading-relaxed font-light line-clamp-3">
                  {pick.overview}
                </p>

                {/* Why Selected Breakdown */}
                {pick.whyReasons && pick.whyReasons.length > 0 && (
                  <div className="bg-noir-850/80 rounded-2xl p-4 border border-white/5 space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-gold-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Why Our Algorithm Selected This
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                      {pick.whyReasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Trailer Button */}
                    {pick.trailer_key && (
                      <button
                        onClick={() => {
                          playClick();
                          setTrailerOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-gold-400" />
                        <span>Watch Trailer</span>
                      </button>
                    )}

                    {/* Watchlist Toggle */}
                    <button
                      onClick={() => toggleWatchlist(pick)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        watchlisted
                          ? 'bg-gold-500 text-noir-950 border-gold-400'
                          : 'bg-noir-850 hover:bg-noir-750 text-slate-200 border-white/10'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${watchlisted ? 'fill-current' : ''}`} />
                      <span>{watchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
                    </button>

                    {/* Mark Watched */}
                    <button
                      onClick={() => markWatched(pick)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        watched
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-noir-850 hover:bg-noir-750 text-slate-200 border-white/10'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{watched ? 'Watched' : 'Mark Watched'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Roll Another */}
                    <button
                      onClick={() => {
                        playClick();
                        triggerSurpriseRoll();
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-noir-800 hover:bg-noir-750 text-slate-300 hover:text-white border border-white/10 text-xs transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Roll Again</span>
                    </button>

                    {/* View Details */}
                    <button
                      onClick={() => {
                        playClick();
                        onClose();
                        navigate(`/media/${type}/${pick.id}`);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20"
                    >
                      <span>Explore Title</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* Trailer Modal if triggered */}
      {pick && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerKey={pick.trailer_key}
          title={pick.title || pick.name}
        />
      )}
    </AnimatePresence>
  );
}
