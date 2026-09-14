import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Film, Sparkles, ShieldCheck, Search, Tv,
  Layers, Star, Clock, Info, Check, Bookmark, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { handleImageError } from '../utils/imageFallback';
import CinemaPlayerModal from '../components/player/CinemaPlayerModal';

export default function CinemaLoungePage() {
  const [channels, setChannels] = useState([]);
  const [groupedChannels, setGroupedChannels] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalMedia, setModalMedia] = useState(null);
  const { playClick, playChime } = useAudio();
  const { isWatched, inWatchlist, markWatched, toggleWatchlist } = useLibrary();

  useEffect(() => {
    async function loadStreams() {
      setLoading(true);
      try {
        const res = await api.get('/movies/streams');
        if (res.data.success) {
          setChannels(res.data.channels || []);
          setGroupedChannels(res.data.groupedChannels || []);
          setStreams(res.data.streams || []);
        }
      } catch (err) {
        console.error('Failed to load free cinema streams', err);
      } finally {
        setLoading(false);
      }
    }
    loadStreams();
  }, []);

  const featured = streams[0] || null;

  const filteredStreams = streams.filter((s) => {
    const matchesChannel = selectedChannel === 'all' || s.channel === selectedChannel;
    const matchesSearch = !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.director && s.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.genres && s.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-noir-950 text-slate-100 pt-24 pb-28">
      {/* Featured Spotlight Banner */}
      {featured && selectedChannel === 'all' && !searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-noir-900 shadow-2xl min-h-[480px] flex items-end p-6 sm:p-10">
            <img
              src={featured.backdrop_path || featured.poster_path}
              alt={featured.title}
              onError={(e) => handleImageError(e, featured.title, featured.genres ? featured.genres[0] : 'Cinema')}
              className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-95 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-noir-950/90 via-noir-950/40 to-transparent" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SPOTLIGHT • {featured.license || '100% Free & Legal'}</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
                {featured.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-xl">
                {featured.overview}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/watch/${featured.id}`}
                  onClick={playClick}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-gold-500/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream Full Movie (Free)</span>
                </Link>

                <button
                  onClick={() => {
                    playClick();
                    setModalMedia(featured);
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-noir-900/90 hover:bg-white/20 text-white font-medium text-xs border border-white/20 backdrop-blur-xl transition-all flex items-center gap-2"
                >
                  <Tv className="w-4 h-4 text-gold-400" />
                  <span>Quick Play Modal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header & Channel Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Public Domain & Open Source Archive</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              AETHER Cinema Lounge
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Stream legendary cinema, George A. Romero horror, Buster Keaton silent stunts, and 4K Blender animation completely free without any copyright restrictions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search free cinema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-noir-900/90 border border-white/10 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        {/* Channels Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {channels.map((ch) => {
            const active = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  playClick();
                  setSelectedChannel(ch.id);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  active
                    ? 'bg-gold-500 text-noir-950 border-gold-400 shadow-md font-bold'
                    : 'bg-noir-900 text-slate-300 hover:text-white hover:bg-noir-850 border-white/5'
                }`}
              >
                <span>{ch.title}</span>
                {ch.badge && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    active ? 'bg-noir-950 text-gold-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    {ch.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-gold-500/20 border-t-gold-400 animate-spin" />
            <p className="text-xs text-gold-400 font-mono">Loading free streaming catalog...</p>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-noir-900/50 rounded-3xl border border-white/5 p-8">
            <Film className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="font-display font-bold text-lg text-white">No streams found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search or channel filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredStreams.map((media) => {
              const watched = isWatched(media.id);
              const watchlisted = inWatchlist(media.id);

              return (
                <div
                  key={media.id}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-noir-900 border border-white/5 hover:border-gold-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold-500/10 hover:-translate-y-1"
                >
                  {/* Poster Art with 1-Click Stream Overlay */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-noir-850">
                    <img
                      src={media.poster_path}
                      alt={media.title}
                      onError={(e) => handleImageError(e, media.title, media.genres ? media.genres[0] : 'Cinema')}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                    {/* Quality & Free Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-gold-500 text-noir-950 shadow-md">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        FREE STREAM
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider bg-noir-950/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                        {media.license || 'Public Domain'}
                      </span>
                    </div>

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-noir-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 backdrop-blur-xs p-4">
                      <Link
                        to={`/watch/${media.id}`}
                        onClick={playClick}
                        className="w-12 h-12 rounded-full bg-gold-500 text-noir-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        title="Stream in Full Theater"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </Link>

                      <button
                        onClick={() => {
                          playClick();
                          setModalMedia(media);
                        }}
                        className="text-[11px] font-bold text-white uppercase tracking-wider hover:text-gold-400 pt-1"
                      >
                        Quick Popup
                      </button>
                    </div>
                  </div>

                  {/* Metadata Bottom Card */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-noir-900/40">
                    <div>
                      <Link
                        to={`/watch/${media.id}`}
                        onClick={playClick}
                        className="font-display font-semibold text-sm text-slate-100 hover:text-gold-400 transition-colors line-clamp-1"
                      >
                        {media.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span>{media.runtime ? `${media.runtime}m` : 'Feature'}</span>
                        <span>•</span>
                        <span className="truncate">{media.genres ? media.genres[0] : 'Cinema'}</span>
                      </div>
                    </div>

                    {/* Rating & Actions Strip */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-1 text-gold-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-gold-400" />
                        <span>{(media.vote_average || 8.0).toFixed(1)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleWatchlist(media)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            watchlisted ? 'bg-gold-500 text-noir-950 border-gold-400' : 'text-slate-400 hover:text-white border-white/10'
                          }`}
                          title="Watchlist"
                        >
                          <Bookmark className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => markWatched(media)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            watched ? 'bg-emerald-500 text-white border-emerald-400' : 'text-slate-400 hover:text-white border-white/10'
                          }`}
                          title="Mark Watched"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cinema Lightbox Modal */}
      <CinemaPlayerModal
        isOpen={Boolean(modalMedia)}
        onClose={() => setModalMedia(null)}
        media={modalMedia}
      />
    </div>
  );
}
