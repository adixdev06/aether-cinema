import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, Users, Film, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAudio } from '../../context/AudioContext';
import { handleImageError } from '../../utils/imageFallback';

const AXES = [
  { key: 'cerebral', label: 'Cerebral' },
  { key: 'adrenaline', label: 'Adrenaline' },
  { key: 'dread', label: 'Dread' },
  { key: 'wonder', label: 'Wonder' },
  { key: 'melancholy', label: 'Melancholy' },
  { key: 'wit', label: 'Wit' },
  { key: 'romance', label: 'Romance' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'grit', label: 'Grit' }
];

export default function FriendCompareModal({ isOpen, onClose, comparison }) {
  const { playClick, playChime } = useAudio();

  if (!isOpen || !comparison) return null;

  const { friend, matchPercentage, userVector = {}, friendVector = {}, watchTogetherPicks = [] } = comparison;

  // Generate SVG polygon coordinates for a given vector
  const center = 140;
  const radius = 100;
  const numAxes = AXES.length;

  const getPoints = (vec) => {
    return AXES.map((axis, i) => {
      const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
      const val = vec[axis.key] || 0.5;
      const x = center + Math.cos(angle) * (radius * val);
      const y = center + Math.sin(angle) * (radius * val);
      return `${x},${y}`;
    }).join(' ');
  };

  const userPoints = getPoints(userVector);
  const friendPoints = getPoints(friendVector);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-2xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-4xl bg-noir-900 border border-white/15 rounded-3xl p-6 sm:p-8 glass-panel-elevated shadow-2xl relative my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header comparison banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500/40 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-2xl text-white">
                    {friend.name}
                  </h2>
                  <span className="text-xs text-gold-400 font-mono">
                    {friend.handle}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {friend.archetype?.badge || 'Cinema Explorer'}
                </p>
              </div>
            </div>

            {/* Resonance Match Badge */}
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/10 border border-gold-500/30 text-center">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-bold block">
                Resonance Alignment
              </span>
              <span className="font-display font-black text-3xl text-gold-400">
                {matchPercentage}%
              </span>
            </div>
          </div>

          {/* Body: Dual DNA Radar Chart & Dimension comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 items-center">
            {/* SVG Dual Radar */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-[280px] h-[280px]">
                <svg width="280" height="280" className="overflow-visible">
                  {/* Background concentric polygons */}
                  {[0.25, 0.5, 0.75, 1].map((level, idx) => (
                    <polygon
                      key={idx}
                      points={AXES.map((_, i) => {
                        const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
                        const x = center + Math.cos(angle) * (radius * level);
                        const y = center + Math.sin(angle) * (radius * level);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Spokes */}
                  {AXES.map((axis, i) => {
                    const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
                    const x = center + Math.cos(angle) * radius;
                    const y = center + Math.sin(angle) * radius;
                    const lx = center + Math.cos(angle) * (radius + 18);
                    const ly = center + Math.sin(angle) * (radius + 18);
                    return (
                      <g key={axis.key}>
                        <line
                          x1={center}
                          y1={center}
                          x2={x}
                          y2={y}
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth="1"
                        />
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="9"
                          fill="#94A3B8"
                          className="font-mono uppercase font-semibold"
                        >
                          {axis.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* User Polygon (Golden Amber) */}
                  <polygon
                    points={userPoints}
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                  />

                  {/* Friend Polygon (Cyan Sky) */}
                  <polygon
                    points={friendPoints}
                    fill="rgba(56, 189, 248, 0.22)"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gold-400"></span>
                  <span className="text-white font-medium">Your Taste DNA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <span className="text-white font-medium">{friend.name}'s DNA</span>
                </div>
              </div>
            </div>

            {/* Dimension Breakdown Metrics */}
            <div className="lg:col-span-6 space-y-3 bg-noir-850 p-5 rounded-2xl border border-white/5">
              <h4 className="text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Taste Synergy Breakdown
              </h4>
              <div className="space-y-2.5">
                {AXES.slice(0, 5).map(axis => {
                  const uVal = Math.round((userVector[axis.key] || 0.5) * 100);
                  const fVal = Math.round((friendVector[axis.key] || 0.5) * 100);
                  return (
                    <div key={axis.key} className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="font-medium">{axis.label}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          You: <span className="text-gold-400">{uVal}%</span> | {friend.name.split(' ')[0]}: <span className="text-sky-400">{fVal}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className="h-full bg-gold-400" style={{ width: `${uVal}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Watch Together Tonight Shelf */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-gold-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Watch Together Tonight
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Optimized for unified taste overlap
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {watchTogetherPicks.map(media => {
                const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');
                return (
                  <Link
                    key={media.id}
                    to={`/media/${type}/${media.id}`}
                    onClick={() => {
                      playChime();
                      onClose();
                    }}
                    className="group block rounded-xl overflow-hidden bg-noir-850 border border-white/10 hover:border-gold-400/50 transition-all hover:scale-105"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden">
                      <img
                        src={media.poster_path}
                        alt={media.title || media.name}
                        onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 space-y-0.5">
                      <h4 className="font-display font-semibold text-xs text-white truncate">
                        {media.title || media.name}
                      </h4>
                      <span className="text-[10px] text-gold-400 font-mono">
                        ★ {(media.vote_average || 8.0).toFixed(1)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
