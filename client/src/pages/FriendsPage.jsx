import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Sparkles, Share2, Star, Check, ArrowRight, Dna, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { handleImageError } from '../utils/imageFallback';
import FriendCompareModal from '../components/dna/FriendCompareModal';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHandle, setNewHandle] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const { playClick, playChime } = useAudio();
  const { showToast } = useLibrary();

  useEffect(() => {
    async function loadFriends() {
      try {
        const res = await api.get('/friends');
        if (res.data.success) {
          setFriends(res.data.friends);
        }
      } catch (err) {
        console.error('Failed to load friends', err);
      } finally {
        setLoading(false);
      }
    }
    loadFriends();
  }, []);

  const handleCompare = async (friend) => {
    playClick();
    try {
      const res = await api.post('/friends/compare', { friendId: friend.id });
      if (res.data.success) {
        setSelectedComparison(res.data.comparison);
        setCompareModalOpen(true);
        playChime();
      }
    } catch (err) {
      console.error('Comparison error', err);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setAdding(true);
    try {
      const res = await api.post('/friends/add', { handle: newHandle });
      if (res.data.success) {
        setFriends(prev => [res.data.friend, ...prev]);
        setNewHandle('');
        showToast(`Connected with ${res.data.friend.handle}!`);
        playChime();
      }
    } catch (err) {
      console.error('Add friend error', err);
    } finally {
      setAdding(false);
    }
  };

  const handleShareDna = () => {
    playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/movie-dna`);
      showToast('Personal Movie DNA link copied to clipboard!');
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-bold">
              Social Synapses • Taste Network
            </span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            Friends & Movie DNA
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Compare 9D taste radar dimensions, discover shared cinematic obsessions, and unlock unified "Watch Together" curation.
          </p>
        </div>

        {/* Share DNA Action */}
        <button
          onClick={handleShareDna}
          className="px-6 py-3 rounded-2xl bg-noir-900/90 hover:bg-white/15 text-white border border-white/15 backdrop-blur-xl transition-all flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105"
        >
          <Share2 className="w-4 h-4 text-gold-400" />
          <span>Share Your Movie DNA</span>
        </button>
      </div>

      {/* Add Friend Input Form */}
      <div className="bg-noir-900/80 border border-white/10 rounded-3xl p-6 glass-panel-elevated shadow-xl">
        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="Enter friend's @username or email to connect..."
              className="w-full px-5 py-3.5 rounded-2xl bg-noir-850 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-gold-400/50"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>{adding ? 'Connecting...' : 'Connect Friend'}</span>
          </button>
        </form>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {friends.map(friend => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-noir-900/90 border border-white/10 hover:border-gold-400/40 p-6 glass-panel-elevated shadow-xl space-y-6 transition-all duration-300 group"
          >
            {/* Friend Profile Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500/30 group-hover:border-gold-400 shadow-md transition-colors"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">
                      {friend.name}
                    </h3>
                    <span className="text-xs text-gold-400 font-mono">
                      {friend.handle}
                    </span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[11px] font-bold bg-white/5 text-slate-300 border border-white/10">
                    {friend.archetype?.badge || 'Cinema Lover'}
                  </span>
                </div>
              </div>

              {/* Match Percentage Badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Match
                </span>
                <span className="font-display font-black text-2xl text-gold-400">
                  {friend.matchPercentage}%
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              "{friend.bio}"
            </p>

            {/* Favorite Films Mini-Row */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                Top Rated Masterpieces
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {(friend.favoriteMedia || []).map(media => (
                  <Link
                    key={media.id}
                    to={`/media/${media.media_type || 'movie'}/${media.id}`}
                    className="w-14 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 hover:border-gold-400 transition-all shrink-0 hover:scale-105"
                    title={media.title || media.name}
                  >
                    <img
                      src={media.poster_path}
                      alt={media.title || media.name}
                      onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Compare CTA */}
            <button
              onClick={() => handleCompare(friend)}
              className="w-full py-3 rounded-2xl bg-noir-850 hover:bg-gold-500 hover:text-noir-950 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-gold-400 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Dna className="w-4 h-4 text-gold-400 group-hover:text-noir-950" />
              <span>Compare Movie DNA & Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Modal */}
      <FriendCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        comparison={selectedComparison}
      />
    </div>
  );
}
