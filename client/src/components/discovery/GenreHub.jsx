import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import MediaCard from '../common/MediaCard';
import { useAudio } from '../../context/AudioContext';

export default function GenreHub() {
  const [genres, setGenres] = useState([]);
  const [activeGenreIndex, setActiveGenreIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { playClick } = useAudio();

  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await api.get('/recommendations/genres');
        if (res.data.success) {
          setGenres(res.data.genres);
        }
      } catch (e) {
        console.error('Failed to load genre hub', e);
      } finally {
        setLoading(false);
      }
    }
    loadGenres();
  }, []);

  if (loading || !genres.length) return null;

  const currentGenre = genres[activeGenreIndex] || genres[0];

  return (
    <section className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
              Curated Genre Vault • Distinct Masterworks
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Explore by Genre
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-lg">
            Handpicked benchmark cinema for every storytelling taste, strictly curated with no duplicate entries.
          </p>
        </div>

        {/* View All in Explore */}
        <Link
          to={`/explore?genre=${encodeURIComponent(currentGenre.genre)}`}
          className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <span>Explore All {currentGenre.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Genre Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g, idx) => (
          <button
            key={g.id}
            onClick={() => {
              playClick();
              setActiveGenreIndex(idx);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
              activeGenreIndex === idx
                ? 'bg-gold-500 text-noir-950 border-gold-400 shadow-lg shadow-gold-500/25 scale-[1.03]'
                : 'bg-noir-900/80 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Media Cards Grid for Selected Genre */}
      <motion.div
        key={currentGenre.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
      >
        {currentGenre.items.map(media => (
          <MediaCard
            key={media.id}
            media={media}
            showMatch={true}
          />
        ))}
      </motion.div>
    </section>
  );
}
