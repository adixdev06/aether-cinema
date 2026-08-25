import React from 'react';
import { Star, Clock, Film, Sparkles, User, Calendar } from 'lucide-react';

export default function StatBreakdown({ stats, genreBreakdown = [] }) {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-noir-900/60 border border-white/5 space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Total Logged
          </span>
          <div className="font-display font-bold text-2xl text-white">
            {stats.totalWatched} <span className="text-xs text-slate-400 font-sans font-normal">titles</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-noir-900/60 border border-white/5 space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Hours Immersed
          </span>
          <div className="font-display font-bold text-2xl text-gold-400">
            {stats.totalHours}h
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-noir-900/60 border border-white/5 space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Average Rating
          </span>
          <div className="font-display font-bold text-2xl text-emerald-400 flex items-center gap-1">
            <Star className="w-4 h-4 fill-emerald-400" />
            <span>{stats.avgRatingGiven}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-noir-900/60 border border-white/5 space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Runtime Sweet Spot
          </span>
          <div className="font-display font-bold text-sm text-slate-200 truncate pt-1">
            {stats.favoriteRuntime || '115 - 145 min'}
          </div>
        </div>
      </div>

      {/* Genre Percentage Progress Bars */}
      <div className="p-6 rounded-3xl bg-noir-900/60 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-base text-white">
            Genre Taste Distribution
          </h4>
          <span className="text-xs text-slate-400">Calculated from ratings & logs</span>
        </div>

        <div className="space-y-3">
          {genreBreakdown.slice(0, 5).map((g, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{g.genre}</span>
                <span className="text-gold-400 font-mono font-bold">{g.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-noir-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(5, g.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directors & Decades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Directors */}
        <div className="p-5 rounded-2xl bg-noir-900/60 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
            <User className="w-4 h-4" />
            <span>Favorite Filmmakers</span>
          </div>
          <div className="space-y-2">
            {(stats.topDirectors || []).map((dir, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-noir-850 border border-white/5 text-xs">
                <span className="font-semibold text-white">{dir.name}</span>
                <span className="text-slate-400 font-mono">{dir.count} logged</span>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Decades */}
        <div className="p-5 rounded-2xl bg-noir-900/60 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
            <Calendar className="w-4 h-4" />
            <span>Era Distribution</span>
          </div>
          <div className="space-y-2">
            {(stats.topDecades || []).map((dec, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-noir-850 border border-white/5 text-xs">
                <span className="font-semibold text-white">{dec.decade}</span>
                <span className="text-slate-400 font-mono">{dec.count} titles</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
