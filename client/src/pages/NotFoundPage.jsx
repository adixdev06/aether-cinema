import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowLeft, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function NotFoundPage() {
  const { playClick } = useAudio();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-24 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-noir-900 border border-white/10 flex items-center justify-center shadow-2xl">
        <Film className="w-10 h-10 text-gold-400 animate-pulse" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-gold-400">
          404 • Signal Lost
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
          The Cinematic Universe Lost Connection
        </h1>
        <p className="text-sm text-slate-400 font-light leading-relaxed">
          The requested coordinate does not exist within the current archival reel.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Link
          to="/"
          onClick={playClick}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/explore"
          onClick={playClick}
          className="px-6 py-3 rounded-2xl bg-noir-900 hover:bg-noir-850 text-slate-200 border border-white/10 font-medium text-xs transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    </div>
  );
}
