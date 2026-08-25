import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Bookmark, Star, Film, Tv, Clock, Heart, Trash2,
  Sparkles, ArrowRight, Filter, Eye
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAudio } from '../context/AudioContext';
import MediaCard from '../components/common/MediaCard';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('watched'); // 'watched' | 'watchlist'
  const [watchedFilter, setWatchedFilter] = useState('all'); // 'all' | 'highest' | 'movies' | 'tv'

  const { watchedList, watchlist, unmarkWatched, toggleWatchlist } = useLibrary();
  const { playClick } = useAudio();

  // Filter watched items
  const filteredWatched = watchedList.filter(item => {
    if (watchedFilter === 'movies') return item.media?.media_type === 'movie';
    if (watchedFilter === 'tv') return item.media?.media_type === 'tv' || item.media?.first_air_date;
    if (watchedFilter === 'highest') return (item.userRating || 0) >= 8;
    return true;
  });

  const totalHours = Math.round(watchedList.reduce((acc, curr) => acc + (curr.media?.runtime || 110), 0) / 60);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Strip with Live Metrics */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
                Personal Cinema Vault
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              My Cinematic Library
            </h1>
            <p className="text-sm text-slate-400 max-w-lg font-light">
              Your personal archive of logged stories, custom ratings, and curated watchlist priorities.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-noir-900/80 p-3 rounded-2xl border border-white/10 glass-panel">
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Watched</span>
              <span className="font-display font-bold text-lg text-white">{watchedList.length}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hours</span>
              <span className="font-display font-bold text-lg text-gold-400">{totalHours}h</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Watchlist</span>
              <span className="font-display font-bold text-lg text-white">{watchlist.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 bg-noir-950 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button
            onClick={() => {
              playClick();
              setActiveTab('watched');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'watched'
                ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Your Watched ({watchedList.length})</span>
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('watchlist');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'watchlist'
                ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Watchlist ({watchlist.length})</span>
          </button>
        </div>

        {/* TAB 1: WATCHED LIBRARY */}
        {activeTab === 'watched' && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Watched' },
                { id: 'highest', label: '★ Highest Rated by You (8+)' },
                { id: 'movies', label: 'Feature Films' },
                { id: 'tv', label: 'TV & Series' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playClick();
                    setWatchedFilter(f.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all shrink-0 ${
                    watchedFilter === f.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-noir-900 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredWatched.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {filteredWatched.map((item) => (
                  <div key={item.mediaId} className="relative group">
                    <MediaCard media={item.media} showMatch={false} />
                    {item.userRating && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-white shadow-md">
                          ★ {item.userRating}/10
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-4 bg-noir-900/40 rounded-3xl border border-white/5 p-8">
                <Film className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl text-white">
                    Nothing logged in this category yet.
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                    Start your movie journey by marking titles as watched and rating them to calibrate your Movie DNA.
                  </p>
                </div>
                <Link
                  to="/explore"
                  onClick={playClick}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider"
                >
                  <span>Explore Cinema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {watchlist.map((item) => (
                  <div key={item.mediaId} className="relative group">
                    <MediaCard media={item.media} showMatch={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-4 bg-noir-900/40 rounded-3xl border border-white/5 p-8">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl text-white">
                    Your Watchlist is empty.
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                    Save intriguing titles for later while exploring the catalog or when rolling the Surprise Me room.
                  </p>
                </div>
                <Link
                  to="/explore"
                  onClick={playClick}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider"
                >
                  <span>Discover Titles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
