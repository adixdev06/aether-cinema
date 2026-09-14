import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Fingerprint, RefreshCw, Users, UserPlus, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ArchetypeCard from '../components/dna/ArchetypeCard';
import DnaRadarChart from '../components/dna/DnaRadarChart';
import StatBreakdown from '../components/dna/StatBreakdown';
import FriendCompareModal from '../components/dna/FriendCompareModal';
import { GridSkeleton } from '../components/common/Skeleton';
import { useAudio } from '../context/AudioContext';
import { useLibrary } from '../context/LibraryContext';
import { handleImageError } from '../utils/imageFallback';

export default function MovieDnaPage() {
  const [activeTab, setActiveTab] = useState('dna'); // 'dna' | 'friends'
  const [dnaData, setDnaData] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);

  const { playClick, playChime } = useAudio();
  const { showToast } = useLibrary();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dnaRes, friendsRes] = await Promise.all([
          api.get('/movie-dna'),
          api.get('/friends')
        ]);
        if (dnaRes.data.success) {
          setDnaData(dnaRes.data);
        }
        if (friendsRes.data.success) {
          setFriends(friendsRes.data.friends);
        }
      } catch (err) {
        console.error('DNA / Friends load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

    setAddingFriend(true);
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
      setAddingFriend(false);
    }
  };

  const handleShareDna = () => {
    playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Personal Movie DNA link copied to clipboard!');
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-gold-400" />
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
                Cognitive Taste Matrix & Social Resonance
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Movie DNA & Friends Hub
            </h1>
            <p className="text-sm text-slate-400 max-w-xl font-light">
              Your 9-dimensional narrative preferences, directorial affinities, and direct taste resonance with friends.
            </p>
          </div>

          {/* Unified Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-noir-900 border border-white/10 glass-panel-elevated self-start md:self-auto">
            <button
              onClick={() => {
                playClick();
                setActiveTab('dna');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'dna'
                  ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Dna className="w-4 h-4" />
              <span>My Movie DNA</span>
            </button>
            <button
              onClick={() => {
                playClick();
                setActiveTab('friends');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'friends'
                  ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Friends & Taste Match ({friends.length})</span>
            </button>
          </div>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : activeTab === 'dna' && dnaData ? (
          /* TAB 1: PERSONAL MOVIE DNA */
          <div className="space-y-12">
            {/* Top Grid: Archetype Badge + Taste Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Archetype Personality Card */}
              <ArchetypeCard archetype={dnaData.dna.archetype} />

              {/* Radar Chart */}
              <div className="p-8 rounded-3xl bg-noir-900/60 border border-white/10 glass-panel-elevated flex flex-col items-center justify-center relative shadow-2xl">
                <span className="text-xs uppercase font-bold tracking-wider text-gold-400 mb-2">
                  Multi-Axis Taste Radar
                </span>
                <DnaRadarChart dimensions={dnaData.dna.radarDimensions} />
              </div>
            </div>

            {/* Comprehensive Metrics & Distribution Breakdown */}
            <StatBreakdown
              stats={dnaData.dna.stats}
              genreBreakdown={dnaData.dna.genreBreakdown}
            />

            {/* Embedded Friends Taste Comparison Mini-Shelf */}
            <div className="rounded-3xl bg-noir-900/80 border border-white/10 p-6 sm:p-8 glass-panel-elevated space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <h3 className="font-display font-bold text-xl text-white">
                      Compare Your DNA with Friends
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    See how your radar overlaps with friends and discover "Watch Together" picks.
                  </p>
                </div>
                <button
                  onClick={handleShareDna}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-bold text-slate-200 border border-white/10 transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <Share2 className="w-3.5 h-3.5 text-gold-400" />
                  <span>Share My DNA Link</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {friends.map(f => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-noir-850 border border-white/5 hover:border-gold-400/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gold-500/30"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-xs text-white truncate">
                          {f.name}
                        </h4>
                        <span className="text-[10px] text-gold-400 font-mono">
                          {f.matchPercentage}% Taste Resonance
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompare(f)}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-gold-500 hover:text-noir-950 text-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Compare Radar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: FRIENDS & TASTE RESONANCE HUB */
          <div className="space-y-8">
            {/* Add Friend Bar */}
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
                  disabled={addingFriend}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{addingFriend ? 'Connecting...' : 'Connect Friend'}</span>
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
                  {/* Header */}
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

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                        Resonance
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

                  {/* Top Rated Films */}
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

                  {/* Compare Action */}
                  <button
                    onClick={() => handleCompare(friend)}
                    className="w-full py-3 rounded-2xl bg-noir-850 hover:bg-gold-500 hover:text-noir-950 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-gold-400 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Dna className="w-4 h-4 text-gold-400 group-hover:text-noir-950" />
                    <span>Compare Dual Radar & Watch Together</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dual Radar Comparison Modal */}
      <FriendCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        comparison={selectedComparison}
      />
    </div>
  );
}
