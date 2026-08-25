import React from 'react';
import { Sparkles } from 'lucide-react';
import MediaCard from '../common/MediaCard';

export default function SimilarityGrid({ items = [], referenceTitle = 'This Title' }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
              Intelligent Vector Mapping
            </span>
          </div>
          <h3 className="font-display font-bold text-xl text-white tracking-tight">
            If You Liked "{referenceTitle}"...
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Ranked by narrative tone, thematic depth, and directorial style.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <MediaCard key={item.id} media={item} showMatch={true} />
        ))}
      </div>
    </div>
  );
}
