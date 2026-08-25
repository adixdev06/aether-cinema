import React from 'react';
import { User, Film } from 'lucide-react';

export default function CastSection({ cast = [], director = null }) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="font-display font-bold text-lg text-white tracking-wide">
          Ensemble & Visionary Team
        </h3>
        {director && (
          <span className="text-xs text-gold-400 font-mono">
            Directed by <strong className="text-white">{director}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.map((person, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-noir-900/60 border border-white/5 hover:border-white/15 transition-all"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-noir-850 shrink-0 border border-white/10">
              {person.profile_path ? (
                <img
                  src={person.profile_path}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h5 className="font-display font-semibold text-xs text-white truncate">
                {person.name}
              </h5>
              <p className="text-[11px] text-slate-400 truncate">
                {person.character || 'Cast'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
