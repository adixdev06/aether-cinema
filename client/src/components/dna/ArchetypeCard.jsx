import React from 'react';
import { Sparkles, Award, Compass, Fingerprint } from 'lucide-react';

export default function ArchetypeCard({ archetype }) {
  if (!archetype) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-noir-900 via-noir-850 to-noir-900 border border-gold-500/30 glass-panel-elevated shadow-2xl space-y-5">
      {/* Top Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-gold-400" />
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-gold-400">
            Cinematic Archetype
          </span>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${archetype.accent}20`, color: archetype.accent, border: `1px solid ${archetype.accent}40` }}
        >
          {archetype.badge}
        </span>
      </div>

      {/* Main Archetype Title */}
      <div className="space-y-1">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
          {archetype.title}
        </h2>
        <div className="w-16 h-1 rounded-full bg-gold-500" />
      </div>

      {/* Quote Statement */}
      <blockquote className="text-sm sm:text-base text-slate-300 italic leading-relaxed font-light border-l-2 border-gold-500/40 pl-4 py-1">
        "{archetype.quote}"
      </blockquote>

      {/* Signature Seal */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
        <span>AETHER Cinephile Vector Profile</span>
        <span className="font-mono text-gold-400">V1.0 Certified</span>
      </div>
    </div>
  );
}
