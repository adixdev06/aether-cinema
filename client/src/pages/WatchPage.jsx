import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film, ShieldCheck, Sparkles, Star, Clock, Calendar,
  Share2, Bookmark, Check, ArrowLeft, Play, Users, MessageSquare, Award
} from 'lucide-react';
import api from '../api/client';
import CinemaPlayer from '../components/player/CinemaPlayer';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { handleImageError } from '../utils/imageFallback';

export default function WatchPage() {
  const { id } = useParams();
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { playClick, playChime } = useAudio();
  const { isWatched, inWatchlist, markWatched, unmarkWatched, toggleWatchlist, showToast } = useLibrary();

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      try {
        const res = await api.get(`/movies/stream/${id}`);
        if (res.data.success) {
          setStreamData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load stream', err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    loadStream();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center space-y-4 bg-noir-950">
        <div className="w-12 h-12 rounded-full border-2 border-gold-500/20 border-t-gold-400 animate-spin" />
        <p className="font-display font-bold text-sm uppercase tracking-widest text-gold-400">
          Preparing Theater Projection...
        </p>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="min-h-screen pt-36 pb-24 max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-display font-bold text-3xl text-white">Stream Not Located</h2>
        <p className="text-slate-400 text-sm">The requested film archive was not found or is currently offline.</p>
        <Link
          to="/stream"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Free Cinema Lounge</span>
        </Link>
      </div>
    );
  }

  const watched = isWatched(streamData.id);
  const watchlisted = inWatchlist(streamData.id);

  const handleShare = () => {
    playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Cinematic Stream link copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWatchPartyInvite = () => {
    playChime();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/watch/${streamData.id}?party=true`);
      showToast('Watch Party synchronized link copied! Send to your friends.');
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 text-slate-100 pt-24 pb-28">
      {/* Back to Lounge Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
        <Link
          to="/stream"
          onClick={playClick}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cinema Lounge</span>
        </Link>

        {/* License Verification Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{streamData.license || '100% Legal & Free'}</span>
        </div>
      </div>

      {/* Main Theater Video Player */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 mb-12">
        <CinemaPlayer
          title={streamData.title || streamData.name}
          sources={streamData.sources}
          poster={streamData.backdrop_path || streamData.poster_path}
          license={streamData.license || 'Public Domain / Creative Commons'}
          quality={streamData.stream_quality || '1080p Full HD'}
          isFreeStream={streamData.is_free_stream}
          isTheaterDefault={true}
        />
      </div>

      {/* Details, Actions & Technical Specs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title Bar & Quick Actions Strip */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30">
                {streamData.stream_quality || "1080p Full HD"}
              </span>
              {streamData.genres?.map((g) => (
                <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              {streamData.title || streamData.name}
            </h1>

            {streamData.tagline && (
              <p className="text-sm sm:text-base text-gold-300/80 italic font-light">
                "{streamData.tagline}"
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Watch Party Button */}
            <button
              onClick={handleWatchPartyInvite}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Watch Together Party</span>
            </button>

            {/* Watchlist */}
            <button
              onClick={() => toggleWatchlist(streamData)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                watchlisted
                  ? 'bg-gold-500 text-noir-950 border-gold-400 shadow-md'
                  : 'bg-noir-900 hover:bg-noir-850 text-slate-200 border-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${watchlisted ? 'fill-current' : ''}`} />
              <span>{watchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            {/* Mark Watched */}
            <button
              onClick={() => {
                if (watched) {
                  unmarkWatched(streamData.id, streamData.title || streamData.name);
                } else {
                  markWatched(streamData);
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                watched
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'bg-noir-900 hover:bg-noir-850 text-slate-200 border-white/10'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{watched ? 'Watched' : 'Mark Watched'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-noir-900 hover:bg-noir-850 text-slate-300 hover:text-white border border-white/10 transition-all"
              title="Copy stream link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative & Technical Specifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis, Cast, Director */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xl text-white">
                Archival Synopsis
              </h3>
              <p className="text-base text-slate-300 leading-relaxed font-light">
                {streamData.overview}
              </p>
            </div>

            {/* Director & Cast Strip */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {streamData.director && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 font-medium">Director:</span>
                  <span className="text-gold-400 font-bold">{streamData.director}</span>
                </div>
              )}
              {streamData.cast && streamData.cast.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Lead Ensemble
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {streamData.cast.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-noir-900 text-xs text-slate-300 border border-white/5">
                        <strong className="text-white">{c.name}</strong> as {c.character}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Broadcast & Copyright Specs Card */}
          <div className="p-6 rounded-3xl bg-noir-900/80 border border-gold-500/20 glass-panel-elevated space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Award className="w-4 h-4 text-gold-400" />
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-gold-400">
                Stream Specifications
              </h4>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Master License:</span>
                <span className="text-emerald-400 font-bold">{streamData.license || "Public Domain"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Encoding Quality:</span>
                <span className="text-white font-semibold">{streamData.stream_quality || "1080p Full HD"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Runtime:</span>
                <span className="text-white">{streamData.runtime || 90} mins</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Audio Channels:</span>
                <span className="text-white">Spatial Stereo / 5.1 Ready</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Digital Copyright:</span>
                <span className="text-emerald-400 font-bold">100% Free & Legal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Up Next in Cinema Lounge */}
        {streamData.relatedStreams && streamData.relatedStreams.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Next Up in Free Cinema Lounge
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Continue streaming legendary copyright-free masterworks
                </p>
              </div>
              <Link
                to="/stream"
                onClick={playClick}
                className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300"
              >
                View All Free Titles →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {streamData.relatedStreams.map((item) => (
                <Link
                  key={item.id}
                  to={`/watch/${item.id}`}
                  onClick={playClick}
                  className="group block rounded-2xl overflow-hidden bg-noir-900 border border-white/5 hover:border-gold-500/40 transition-all hover:scale-105"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden relative bg-noir-850">
                    <img
                      src={item.poster_path}
                      alt={item.title}
                      onError={(e) => handleImageError(e, item.title, item.genres ? item.genres[0] : 'Cinema')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-noir-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h5 className="font-display font-bold text-xs text-white truncate group-hover:text-gold-400">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.genres ? item.genres[0] : 'Feature'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
