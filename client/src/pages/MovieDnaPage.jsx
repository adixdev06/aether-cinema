import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Fingerprint, RefreshCw } from 'lucide-react';
import api from '../api/client';
import ArchetypeCard from '../components/dna/ArchetypeCard';
import DnaRadarChart from '../components/dna/DnaRadarChart';
import StatBreakdown from '../components/dna/StatBreakdown';
import { GridSkeleton } from '../components/common/Skeleton';
import { useAudio } from '../context/AudioContext';

export default function MovieDnaPage() {
  const [dnaData, setDnaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playClick } = useAudio();

  useEffect(() => {
    fetchDna();
  }, []);

  const fetchDna = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movie-dna');
      if (res.data.success) {
        setDnaData(res.data);
      }
    } catch (err) {
      console.error('DNA fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-2 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">
              Cognitive Vector Profile
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Your Movie DNA
          </h1>
          <p className="text-sm text-slate-400 max-w-xl font-light">
            An algorithmic synthesis of your narrative preferences, directorial affinities, pacing tolerance, and philosophical tastes.
          </p>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : dnaData ? (
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
