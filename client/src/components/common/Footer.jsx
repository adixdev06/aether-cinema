import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Heart, Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-white/5 bg-noir-950/80 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-gold-400 to-gold-600 p-0.5 shadow-md shadow-gold-500/20">
                <div className="w-full h-full bg-noir-950 rounded-[5px] flex items-center justify-center">
                  <span className="font-serif font-bold text-xs text-gold-400">Æ</span>
                </div>
              </div>
              <span className="font-display font-bold text-lg tracking-[0.2em] text-white">
                AETHER
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed font-light">
              An intelligent sensory cinema discovery engine built for curious cinephiles. Curating stories around mood, narrative complexity, and personal taste vectors.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Recommendation Engine v1.0 • Live</span>
            </div>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
              Discovery
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-gold-400 transition-colors">Curated Universes</Link>
              </li>
              <li>
                <Link to="/moods" className="hover:text-gold-400 transition-colors">Mood Matrix</Link>
              </li>
              <li>
                <Link to="/universe" className="hover:text-gold-400 transition-colors">Interactive Movie Graph</Link>
              </li>
              <li>
                <Link to="/movie-dna" className="hover:text-gold-400 transition-colors">Personal Movie DNA</Link>
              </li>
            </ul>
          </div>

          {/* Library & Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
              Library & System
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/library" className="hover:text-gold-400 transition-colors">Watched Vault</Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-gold-400 transition-colors">Watchlist Priorities</Link>
              </li>
              <li>
                <span className="text-slate-400">TMDB API & Vector Metadata</span>
              </li>
              <li>
                <span className="text-slate-400">Zero-Tracker Privacy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AETHER CINEMA. All film metadata and posters courtesy of TMDB.</p>
          <p className="flex items-center gap-1">
            Crafted for pure cinematic immersion
          </p>
        </div>
      </div>
    </footer>
  );
}
