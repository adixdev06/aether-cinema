import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Check, Bookmark, Play, Info, Sparkles } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAudio } from '../../context/AudioContext';
import { handleImageError } from '../../utils/imageFallback';
import WhyThisBadge from '../discovery/WhyThisBadge';

export default function MediaCard({ media, showMatch = true, priority = false }) {
  const { isWatched, inWatchlist, markWatched, unmarkWatched, toggleWatchlist, getRating } = useLibrary();
  const { playClick, playChime } = useAudio();
  const [hovered, setHovered] = useState(false);

  if (!media) return null;

  const watched = isWatched(media.id);
  const watchlisted = inWatchlist(media.id);
  const userScore = getRating(media.id);
  const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');
  const year = (media.release_date || media.first_air_date || '').substring(0, 4);

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-noir-900 border border-white/5 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/10"
      onMouseEnter={() => {
        setHovered(true);
        playClick();
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster Image Container */}
      <Link
        to={`/media/${type}/${media.id}`}
        className="relative block aspect-[2/3] w-full overflow-hidden bg-noir-850"
      >
        <img
          src={media.poster_path}
          alt={media.title || media.name}
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Match / Free Stream Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {media.is_free_stream ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-gold-500 text-noir-950 shadow-lg shadow-gold-500/30">
              <Play className="w-2.5 h-2.5 fill-current" />
              FREE STREAM
            </span>
          ) : showMatch && media.matchScore ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider bg-noir-950/90 text-gold-400 border border-gold-500/30 backdrop-blur-md shadow-lg">
              <Sparkles className="w-2.5 h-2.5" />
              {media.matchScore}% MATCH
            </span>
          ) : null}
        </div>

        {/* Format / Watched Indicator */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
          {watched && (
            <span className="p-1 rounded-full bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm" title="Watched">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-noir-900/80 text-slate-300 border border-white/10 backdrop-blur-md">
            {type === 'tv' ? 'Series' : 'Film'}
          </span>
        </div>

        {/* Quick Floating Action Bar on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-gradient-to-t from-noir-950 via-noir-950/90 to-transparent">
          <div className="flex items-center gap-2">
            {/* Watchlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWatchlist(media);
              }}
              className={`p-2 rounded-full border transition-all ${
                watchlisted
                  ? 'bg-gold-500 text-noir-950 border-gold-400 shadow-lg shadow-gold-500/30'
                  : 'bg-noir-900/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
              }`}
              title={watchlisted ? 'In your Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${watchlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Mark Watched Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (watched) {
                  unmarkWatched(media.id, media.title || media.name);
                } else {
                  markWatched(media);
                }
              }}
              className={`p-2 rounded-full border transition-all ${
                watched
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
                  : 'bg-noir-900/80 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
              }`}
              title={watched ? 'Marked as Watched' : 'Mark as Watched'}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            {/* Stream Play Button if free stream */}
            {media.is_free_stream && (
              <Link
                to={`/watch/${media.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  playClick();
                }}
                className="p-2 rounded-full bg-gold-500 hover:bg-gold-400 text-noir-950 shadow-lg shadow-gold-500/30 transition-all"
                title="Stream Full Movie (Free)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </Link>
            )}
          </div>

          {/* Why Badge popover */}
          {media.whyReasons && media.whyReasons.length > 0 && (
            <WhyThisBadge reasons={media.whyReasons} matchScore={media.matchScore} title={media.title || media.name} />
          )}
        </div>
      </Link>

      {/* Metadata Bottom Card */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-noir-900/40">
        <div>
          <Link
            to={`/media/${type}/${media.id}`}
            className="font-display font-semibold text-sm text-slate-100 group-hover:text-gold-400 transition-colors line-clamp-1"
          >
            {media.title || media.name}
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
            {year && <span>{year}</span>}
            {media.genres && media.genres.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate">{media.genres[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Ratings and User Score */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-gold-400" />
            <span>{(media.vote_average || 7.5).toFixed(1)}</span>
          </div>

          {userScore ? (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              You: {userScore}/10
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-light">
              {media.director ? media.director.split(' ').pop() : 'Curated'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
