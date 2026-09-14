import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Film, Flame, Award, ArrowRight, Shuffle, Users } from 'lucide-react';
import api from '../api/client';
import HeroCinematic from '../components/media/HeroCinematic';
import MoodMatrix from '../components/discovery/MoodMatrix';
import MediaCarousel from '../components/media/MediaCarousel';
import GenreHub from '../components/discovery/GenreHub';
import SurpriseMeModal from '../components/discovery/SurpriseMeModal';
import { useAudio } from '../context/AudioContext';

export default function HomePage({ onOpenSurprise, surpriseOpen, onCloseSurprise }) {
  const [trending, setTrending] = useState([]);
  const [freeStreams, setFreeStreams] = useState([]);
  const [personalizedFeeds, setPersonalizedFeeds] = useState(null);
  const [shuffledPicks, setShuffledPicks] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [universes, setUniverses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playClick, playChime } = useAudio();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [trendingRes, recsRes, universesRes, shuffleRes, streamsRes] = await Promise.all([
          api.get('/movies/trending'),
          api.get('/recommendations/personalized'),
          api.get('/movies/universes'),
          api.get('/recommendations/shuffle'),
          api.get('/movies/streams')
        ]);

        if (trendingRes.data.success) {
          setTrending(trendingRes.data.results);
        }
        if (streamsRes.data.success) {
          setFreeStreams(streamsRes.data.streams || []);
        }
        if (recsRes.data.success) {
          setPersonalizedFeeds(recsRes.data.feeds);
        }
        if (universesRes.data.success) {
          setUniverses(universesRes.data.universes);
        }
        if (shuffleRes.data.success) {
          setShuffledPicks(shuffleRes.data.results);
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleReshuffle = async () => {
    playClick();
    setShuffling(true);
    try {
      const res = await api.get('/recommendations/shuffle');
      if (res.data.success) {
        setShuffledPicks(res.data.results);
        playChime();
      }
    } catch (err) {
      console.error('Shuffle error', err);
    } finally {
      setShuffling(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Fullscreen Theatrical Hero */}
      <HeroCinematic
        featuredList={trending.slice(0, 5)}
        onOpenSurprise={onOpenSurprise}
      />

      {/* Mood Matrix - Emotional Resonance Engine */}
      <MoodMatrix />

      {/* Genre Hub - Curated Non-Repeating Masterworks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GenreHub />
      </div>

      {/* 100% Free Cinema Stream Lounge (Public Domain & Open Cinema) */}
      {freeStreams && freeStreams.length > 0 && (
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold">
                100% Free & Legal • No Copyright Cinema
              </span>
            </div>
            <Link
              to="/stream"
              onClick={playClick}
              className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300 flex items-center gap-1 group"
            >
              <span>Explore All Free Streams</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <MediaCarousel
            title="Free Cinema Lounge & Open Masterworks"
            subtitle="Stream full-length Public Domain horror, Fritz Lang sci-fi, Buster Keaton comedies, and 4K Blender animation."
            badge="▶ Free To Watch"
            items={freeStreams}
          />
        </section>
      )}

      {/* Dynamic Shuffle Discovery Section with Re-seed Button */}
      {shuffledPicks && shuffledPicks.length > 0 && (
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
                Dynamic Shuffle • Eclectic Discovery
              </span>
            </div>
            <button
              onClick={handleReshuffle}
              disabled={shuffling}
              className="px-4 py-2 rounded-xl bg-noir-900 border border-white/10 hover:border-gold-400 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 shadow-md hover:scale-105"
            >
              <Shuffle className={`w-3.5 h-3.5 text-gold-400 ${shuffling ? 'animate-spin' : ''}`} />
              <span>{shuffling ? 'Reshuffling...' : 'Reshuffle Picks'}</span>
            </button>
          </div>
          <MediaCarousel
            title="Fresh Shuffle & Underrated Gems"
            subtitle="Spanning critically acclaimed indie masterworks, foreign breakthroughs, and essential classics."
            badge="Reseeded"
            items={shuffledPicks}
          />
        </section>
      )}

      {/* Personalized Row 1: Picked For Your Taste */}
      {personalizedFeeds?.pickedForYou && personalizedFeeds.pickedForYou.length > 0 && (
        <MediaCarousel
          title="Curated For Your Taste Profile"
          subtitle="Ranked by your genre vectors, directorial affinities, and rating patterns."
          badge="Personalized"
          items={personalizedFeeds.pickedForYou}
        />
      )}

      {/* Personalized Row 2: Because You Loved [Anchor Title] */}
      {personalizedFeeds?.becauseYouLoved?.items && personalizedFeeds.becauseYouLoved.items.length > 0 && (
        <MediaCarousel
          title={`Because You Loved "${personalizedFeeds.becauseYouLoved.anchorTitle}"`}
          subtitle="Sharing dense philosophical worldbuilding, pacing, and visual mastery."
          badge="Thematic Affinity"
          items={personalizedFeeds.becauseYouLoved.items}
        />
      )}

      {/* Row 3: Hidden Gems & Underrated Masterpieces */}
      {personalizedFeeds?.hiddenGems && personalizedFeeds.hiddenGems.length > 0 && (
        <MediaCarousel
          title="Hidden Gems & Overlooked Brilliance"
          subtitle="Festival favorites, cult classics, and quiet masterworks flying under mainstream radar."
          badge="Cult & Indie"
          items={personalizedFeeds.hiddenGems}
        />
      )}

      {/* Social Friends Section Callout */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 bg-gradient-to-r from-noir-900 via-noir-850 to-noir-900 border border-white/10 glass-panel-elevated shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Social Taste Synapses</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Compare Movie DNA With Friends
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Connect with fellow cinephiles, overlay your 9-dimensional taste radars, and get unified "Watch Together Tonight" recommendations tailored for both of you.
              </p>
            </div>
            <Link
              to="/friends"
              onClick={playClick}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-gold-500/25 flex items-center gap-2 hover:scale-105 shrink-0"
            >
              <span>Explore Friends Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Row 4: Trending Across the Platform */}
      <MediaCarousel
        title="Trending In The Archive"
        subtitle="The most explored and discussed titles this week."
        badge="Popular"
        items={trending}
      />

      {/* Surprise Me Theatrical Modal */}
      <SurpriseMeModal
        isOpen={surpriseOpen}
        onClose={onCloseSurprise}
      />
    </div>
  );
}
