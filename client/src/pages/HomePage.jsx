import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Film, Flame, Award, ArrowRight } from 'lucide-react';
import api from '../api/client';
import HeroCinematic from '../components/media/HeroCinematic';
import MoodMatrix from '../components/discovery/MoodMatrix';
import MediaCarousel from '../components/media/MediaCarousel';
import SurpriseMeModal from '../components/discovery/SurpriseMeModal';
import { useAudio } from '../context/AudioContext';

export default function HomePage({ onOpenSurprise, surpriseOpen, onCloseSurprise }) {
  const [trending, setTrending] = useState([]);
  const [personalizedFeeds, setPersonalizedFeeds] = useState(null);
  const [universes, setUniverses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playClick } = useAudio();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [trendingRes, recsRes, universesRes] = await Promise.all([
          api.get('/movies/trending'),
          api.get('/recommendations/personalized'),
          api.get('/movies/universes')
        ]);

        if (trendingRes.data.success) {
          setTrending(trendingRes.data.results);
        }
        if (recsRes.data.success) {
          setPersonalizedFeeds(recsRes.data.feeds);
        }
        if (universesRes.data.success) {
          setUniverses(universesRes.data.universes);
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Fullscreen Theatrical Hero */}
      <HeroCinematic
        featuredList={trending.slice(0, 5)}
        onOpenSurprise={onOpenSurprise}
      />

      {/* Mood Matrix - Emotional Resonance Engine */}
      <MoodMatrix />

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

      {/* Curated Universe Channels Banner / Showcase */}
      <section className="py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
                  Curated Universes
                </span>
              </div>
              <h2 className="font-display font-extrabold text-3xl text-white tracking-tight">
                Explore Thematic Universes
              </h2>
            </div>
            <Link
              to="/explore"
              onClick={playClick}
              className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
            >
              <span>View All 20+ Channels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {universes.slice(0, 3).map((u) => (
              <Link
                key={u.id}
                to={`/explore?universe=${u.id}`}
                onClick={playClick}
                className="group relative rounded-3xl overflow-hidden p-6 bg-noir-900 border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                <div className="space-y-2">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
                    style={{ backgroundColor: `${u.accent}20`, color: u.accent }}
                  >
                    {u.badge}
                  </span>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-gold-400 transition-colors">
                    {u.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-2">
                    {u.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
                  <span>{u.count} Featured Titles</span>
                  <span className="text-gold-400 group-hover:translate-x-1 transition-transform font-bold">
                    Explore Universe →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Row 3: Hidden Gems & Underrated Masterpieces */}
      {personalizedFeeds?.hiddenGems && personalizedFeeds.hiddenGems.length > 0 && (
        <MediaCarousel
          title="Hidden Gems & Overlooked Brilliance"
          subtitle="Festival favorites, cult classics, and quiet masterworks flying under mainstream radar."
          badge="Cult & Indie"
          items={personalizedFeeds.hiddenGems}
        />
      )}

      {/* Row 4: Trending Across the Platform */}
      <MediaCarousel
        title="Trending In The Archive"
        subtitle="The most explored and discussed titles this week."
        badge="Popular"
        items={trending}
      />

      {/* Movie Universe Callout Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-noir-900 via-noir-850 to-noir-900 border border-white/10 glass-panel-elevated shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Interactive Cosmos Engine</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                Enter The Movie Universe
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Discover cinema through a 2D force-directed gravity field. Trace how Nolan connects to Villeneuve, how neo-noir feeds cyberpunk, and uncover unexpected narrative connections.
              </p>
              <Link
                to="/universe"
                onClick={playClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-gold-500/20"
              >
                <span>Launch Interactive Universe</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Graphic Representation */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-white/10 bg-noir-950 flex items-center justify-center shadow-inner">
              <div className="w-44 h-44 rounded-full border border-gold-500/30 animate-spin-slow flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-indigo-400/40 animate-pulse flex items-center justify-center bg-gold-500/10">
                  <span className="font-display font-black text-xl text-gold-400">Æ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surprise Me Theatrical Modal */}
      <SurpriseMeModal
        isOpen={surpriseOpen}
        onClose={onCloseSurprise}
      />
    </div>
  );
}
