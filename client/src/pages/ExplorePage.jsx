import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Star, Film, Tv, Sparkles, RefreshCcw } from 'lucide-react';
import api from '../api/client';
import MediaCard from '../components/common/MediaCard';
import { GridSkeleton } from '../components/common/Skeleton';
import { useAudio } from '../context/AudioContext';

const GENRES = ['All', 'Sci-Fi', 'Drama', 'Action', 'Thriller', 'Crime', 'Horror', 'Animation', 'Comedy', 'Mystery', 'History'];
const DECADES = ['All', '2020', '2010', '2000', '1990', '1980'];
const RATINGS = [
  { label: 'All Ratings', value: '' },
  { label: '★ 8.5+ Masterpieces', value: '8.5' },
  { label: '★ 8.0+ Acclaimed', value: '8.0' },
  { label: '★ 7.5+ High Quality', value: '7.5' }
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playClick } = useAudio();

  const [mediaType, setMediaType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedDecade, setSelectedDecade] = useState('All');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilteredMedia();
  }, [mediaType, selectedGenre, selectedDecade, minRating, sortBy]);

  const fetchFilteredMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mediaType !== 'all') params.append('mediaType', mediaType);
      if (selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (selectedDecade !== 'All') params.append('decade', selectedDecade);
      if (minRating) params.append('minRating', minRating);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/movies/filter?${params.toString()}`);
      if (res.data.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.error('Filter fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    playClick();
    setMediaType('all');
    setSelectedGenre('All');
    setSelectedDecade('All');
    setMinRating('');
    setSortBy('rating');
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400"></span>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
              Archival Exploration
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            The Complete Cinema Universe
          </h1>
          <p className="text-sm text-slate-400 max-w-xl font-light">
            Filter through our complete multi-dimensional catalog by format, era, genre affinities, and critical acclaim.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-6 rounded-3xl bg-noir-900/80 border border-white/10 glass-panel space-y-6">
          {/* Format Tabs & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 bg-noir-950/80 p-1.5 rounded-2xl border border-white/5 w-fit">
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'movie', label: 'Feature Films' },
                { id: 'tv', label: 'TV & Series' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setMediaType(tab.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                    mediaType === tab.id
                      ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold-400 transition-colors w-fit"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

          {/* Genre Chips */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Genre Frequency
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    playClick();
                    setSelectedGenre(g);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all shrink-0 ${
                    selectedGenre === g
                      ? 'bg-white/20 text-white border border-white/30 shadow-inner'
                      : 'bg-noir-850 hover:bg-noir-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdown Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Decade */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Release Era
              </label>
              <select
                value={selectedDecade}
                onChange={(e) => {
                  playClick();
                  setSelectedDecade(e.target.value);
                }}
                className="w-full bg-noir-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
              >
                {DECADES.map((d) => (
                  <option key={d} value={d} className="bg-noir-900">
                    {d === 'All' ? 'All Decades' : `${d}s Cinema`}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Rating Floor
              </label>
              <select
                value={minRating}
                onChange={(e) => {
                  playClick();
                  setMinRating(e.target.value);
                }}
                className="w-full bg-noir-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
              >
                {RATINGS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-noir-900">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Sort Algorithm
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  playClick();
                  setSortBy(e.target.value);
                }}
                className="w-full bg-noir-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
              >
                <option value="rating" className="bg-noir-900">Highest Critical Rating</option>
                <option value="votes" className="bg-noir-900">Most Explored & Voted</option>
                <option value="recency" className="bg-noir-900">Release Date (Newest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Displaying <strong className="text-white">{results.length}</strong> matching titles</span>
          <span>Dual Format Engine active</span>
        </div>

        {/* Media Grid */}
        {loading ? (
          <GridSkeleton count={12} />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {results.map((item) => (
              <MediaCard key={item.id} media={item} showMatch={false} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-white">No titles match this filter</h3>
              <p className="text-xs text-slate-400">Try broadening your rating floor or decade selection.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-gold-500 text-noir-950 font-bold text-xs uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
