import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Ghost, Sparkles, CloudRain, Moon, Laugh, Heart,
  Compass, Eye, Gem, Sun, Shield, Skull, Flame, Palette, ChevronRight, Check
} from 'lucide-react';
import api from '../../api/client';
import { useAudio } from '../../context/AudioContext';
import MediaCard from '../common/MediaCard';
import { GridSkeleton } from '../common/Skeleton';

const ICON_MAP = {
  Brain, Zap, Ghost, Sparkles, CloudRain, Moon, Laugh, Heart,
  Compass, Eye, Gem, Sun, Shield, Skull, Flame, Palette
};

export default function MoodMatrix() {
  const [moods, setMoods] = useState([]);
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [activeMoodData, setActiveMoodData] = useState(null);
  const [moodMedia, setMoodMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playClick, playChime } = useAudio();

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await api.get('/discovery/moods');
      if (res.data.success) {
        setMoods(res.data.moods);
        // Default to mind-bending
        handleSelectMood(res.data.moods[0].id, res.data.moods[0]);
      }
    } catch (err) {
      console.error('Error fetching moods', err);
    }
  };

  const handleSelectMood = async (moodId, moodObj) => {
    playClick();
    setSelectedMoodId(moodId);
    if (moodObj) setActiveMoodData(moodObj);
    setLoading(true);

    try {
      const res = await api.get(`/discovery/mood/${moodId}`);
      if (res.data.success) {
        setMoodMedia(res.data.results);
        setActiveMoodData(res.data.mood);
      }
    } catch (err) {
      console.error('Error loading mood recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
                Emotional Resonance Engine
              </span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              What are you in the mood for?
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Choose your emotional frequency. Our discovery engine calibrates narrative tone, pacing, and philosophical depth.
          </p>
        </div>

        {/* Mood Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-10">
          {moods.map((m) => {
            const Icon = ICON_MAP[m.icon] || Sparkles;
            const isSelected = selectedMoodId === m.id;

            return (
              <button
                key={m.id}
                onClick={() => handleSelectMood(m.id, m)}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-noir-850 border-gold-400/80 shadow-lg shadow-gold-500/10 scale-[1.03] ring-1 ring-gold-400/40'
                    : 'bg-noir-900/60 hover:bg-noir-850 border-white/5 hover:border-white/20'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isSelected ? `${m.accent}25` : 'rgba(255,255,255,0.03)',
                    color: isSelected ? m.accent : '#94A3B8'
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-semibold tracking-tight line-clamp-2 ${
                  isSelected ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Mood Banner & Results */}
        {activeMoodData && (
          <motion.div
            key={activeMoodData.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-noir-900 via-noir-850 to-noir-900 border border-white/10 glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${activeMoodData.accent}20`, color: activeMoodData.accent }}
                >
                  Active Mood Channel
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeMoodData.genres?.join(' • ')}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                {activeMoodData.label}
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                {activeMoodData.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {activeMoodData.keywords?.slice(0, 4).map((kw, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  #{kw}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Media Results Grid */}
        {loading ? (
          <GridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {moodMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <MediaCard media={item} showMatch={true} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
