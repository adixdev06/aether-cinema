import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Play, Bookmark, Check, Heart, Sparkles, Clock, Calendar,
  Film, Tv, ArrowLeft, Share2, Award, ShieldCheck
} from 'lucide-react';
import api from '../api/client';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { handleImageError } from '../utils/imageFallback';
import CastSection from '../components/media/CastSection';
import SeasonsGuide from '../components/media/SeasonsGuide';
import SimilarityGrid from '../components/media/SimilarityGrid';
import TrailerModal from '../components/common/TrailerModal';
import RatingModal from '../components/common/RatingModal';
import CinemaPlayerModal from '../components/player/CinemaPlayerModal';
import { HeroSkeleton } from '../components/common/Skeleton';

export default function DetailPage() {
  const { type, id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const { playClick, playChime } = useAudio();
  const { isWatched, inWatchlist, markWatched, unmarkWatched, toggleWatchlist, getRating, showToast } = useLibrary();

  useEffect(() => {
    async function loadMediaDetails() {
      setLoading(true);
      try {
        const res = await api.get(`/movies/${id}?type=${type || 'movie'}`);
        if (res.data.success) {
          setMedia(res.data.data);
        }
      } catch (err) {
        console.error('Detail fetch error', err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    loadMediaDetails();
  }, [id, type]);

  if (loading) return <HeroSkeleton />;
  if (!media) {
    return (
      <div className="py-40 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-white">Title not found in archive.</h2>
        <Link to="/explore" className="text-gold-400 text-sm">Return to Catalog →</Link>
      </div>
    );
  }

  const watched = isWatched(media.id);
  const watchlisted = inWatchlist(media.id);
  const userScore = getRating(media.id);
  const isTv = media.media_type === 'tv' || media.first_air_date || (media.seasons && media.seasons.length > 0);
  const releaseYear = (media.release_date || media.first_air_date || '').substring(0, 4);

  const handleShare = () => {
    playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Cinematic link copied to clipboard');
    }
  };

  return (
    <div className="pb-24">
      {/* 4K Backdrop Header Section */}
      <div className="relative w-full min-h-[75vh] flex items-end pb-12 pt-28 overflow-hidden bg-noir-950">
        <img
          src={media.backdrop_path || media.poster_path}
          alt={media.title || media.name}
          onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-35"
        />

        {/* Ambient Dark Blurs */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950 via-noir-950/80 to-transparent" />

        {/* Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-start md:items-end gap-8">
          {/* High-res Poster Card */}
          <div className="w-44 sm:w-56 md:w-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-noir-900 aspect-[2/3] relative group">
            <img
              src={media.poster_path}
              alt={media.title || media.name}
              onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
              className="w-full h-full object-cover"
            />
            {/* Poster Overlay Button */}
            <button
              onClick={() => {
                playClick();
                if (media.is_free_stream || media.stream_url) {
                  setCinemaModalOpen(true);
                } else if (media.trailer_key) {
                  setTrailerOpen(true);
                }
              }}
              className="absolute inset-0 bg-noir-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white transition-opacity duration-300 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="font-display font-bold text-xs uppercase tracking-wider">
                {media.is_free_stream ? 'Stream Full Movie' : 'Play Preview'}
              </span>
            </button>
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-4 max-w-3xl">
            {/* Format & Tags Strip */}
            <div className="flex flex-wrap items-center gap-2">
              {media.is_free_stream ? (
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-noir-950 shadow-md">
                  ★ 100% Free Full Movie
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  {isTv ? 'TV Series' : 'Feature Film'}
                </span>
              )}
              {media.license && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {media.license}
                </span>
              )}
              {media.genres?.map((g) => (
                <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                  {g}
                </span>
              ))}
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1">
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {media.title || media.name}
              </h1>
              {media.tagline && (
                <p className="text-sm sm:text-base text-gold-300/80 italic font-light">
                  "{media.tagline}"
                </p>
              )}
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1 text-gold-400 font-bold">
                <Star className="w-4 h-4 fill-gold-400" />
                <span className="text-sm">{(media.vote_average || 8.0).toFixed(1)}</span>
                <span className="text-slate-500">({(media.vote_count || 1200).toLocaleString()} votes)</span>
              </div>
              <span>•</span>
              {releaseYear && <span>{releaseYear}</span>}
              <span>•</span>
              {media.runtime && <span>{media.runtime} mins</span>}
              {media.director && (
                <>
                  <span>•</span>
                  <span>Dir. {media.director}</span>
                </>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary Stream CTA: Link to full WatchPage or open modal */}
              {media.is_free_stream ? (
                <Link
                  to={`/watch/${media.id}`}
                  onClick={playClick}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-gold-500/25 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream Full Movie (Free)</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    playClick();
                    setCinemaModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream HD Preview</span>
                </button>
              )}

              {/* Watch Trailer Secondary if trailer available */}
              {media.trailer_key && (
                <button
                  onClick={() => {
                    playClick();
                    setTrailerOpen(true);
                  }}
                  className="px-4 py-3 rounded-2xl bg-noir-900/80 hover:bg-noir-850 text-slate-200 border border-white/10 font-semibold text-xs flex items-center gap-2"
                >
                  <Film className="w-4 h-4 text-gold-400" />
                  <span>Trailer</span>
                </button>
              )}

              {/* Watchlist */}
              <button
                onClick={() => toggleWatchlist(media)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                  watchlisted
                    ? 'bg-gold-500 text-noir-950 border-gold-400 shadow-md'
                    : 'bg-noir-900/80 hover:bg-noir-850 text-slate-200 border-white/10 backdrop-blur-md'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${watchlisted ? 'fill-current' : ''}`} />
                <span>{watchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {/* Mark Watched */}
              <button
                onClick={() => {
                  if (watched) {
                    unmarkWatched(media.id, media.title || media.name);
                  } else {
                    markWatched(media);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                  watched
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-noir-900/80 hover:bg-noir-850 text-slate-200 border-white/10 backdrop-blur-md'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{watched ? 'Watched' : 'Mark Watched'}</span>
              </button>

              {/* Rate */}
              <button
                onClick={() => {
                  playClick();
                  setRatingModalOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                  userScore
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-noir-900/80 hover:bg-noir-850 text-slate-200 border-white/10 backdrop-blur-md'
                }`}
              >
                <Star className={`w-4 h-4 ${userScore ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                <span>{userScore ? `Your Score: ${userScore}/10` : 'Rate Title'}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-noir-900/80 hover:bg-noir-850 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Overview & AI Why You'll Love This Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis & Keywords */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xl text-white">
                The Narrative Synopsis
              </h3>
              <p className="text-base text-slate-300 leading-relaxed font-light">
                {media.overview}
              </p>
            </div>

            {/* Keyword tags */}
            {media.keywords && media.keywords.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Thematic Descriptors
                </span>
                <div className="flex flex-wrap gap-2">
                  {media.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-noir-900 text-xs text-slate-300 border border-white/5">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Why You'll Love This AI Box */}
          <div className="p-6 rounded-3xl bg-noir-900/80 border border-gold-500/20 glass-panel-elevated space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-gold-400">
                Why You’ll Love This
              </h4>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>Exemplifies high critical resonance ({media.vote_average?.toFixed(1)} rating)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>Signature directorial pacing and atmospheric world-building</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>Rich thematic cohesion across {media.genres?.slice(0, 2).join(' and ')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* TV Series Seasons & Episodes Guide */}
        {isTv && media.seasons && (
          <SeasonsGuide
            seasons={media.seasons}
            numberOfEpisodes={media.number_of_episodes}
            status={media.status}
          />
        )}

        {/* Ensemble Cast & Director */}
        <CastSection cast={media.cast} director={media.director} />

        {/* If You Liked This Similarity Grid */}
        <SimilarityGrid
          items={media.similarRecommendations}
          referenceTitle={media.title || media.name}
        />
      </div>

      {/* Modals */}
      <CinemaPlayerModal
        isOpen={cinemaModalOpen}
        onClose={() => setCinemaModalOpen(false)}
        media={media}
      />

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={media.trailer_key}
        title={media.title || media.name}
      />

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        media={media}
      />
    </div>
  );
}
