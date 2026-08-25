import React, { useState } from 'react';
import { Tv, Clock, PlayCircle } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function SeasonsGuide({ seasons = [], numberOfEpisodes, status }) {
  const [activeSeasonIdx, setActiveSeasonIdx] = useState(0);
  const { playClick } = useAudio();

  if (!seasons || seasons.length === 0) return null;

  const currentSeason = seasons[activeSeasonIdx] || seasons[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-gold-400" />
            <h3 className="font-display font-bold text-lg text-white tracking-wide">
              Seasons & Episode Archives
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {seasons.length} Seasons • {numberOfEpisodes || 20} Episodes • Status: <span className="text-slate-200">{status || 'Series'}</span>
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {seasons.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                playClick();
                setActiveSeasonIdx(idx);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all shrink-0 ${
                activeSeasonIdx === idx
                  ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                  : 'bg-noir-900 hover:bg-noir-850 text-slate-300 border border-white/5'
              }`}
            >
              {s.name || `Season ${s.season_number}`}
            </button>
          ))}
        </div>
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(currentSeason.episodes || [
          { episode_number: 1, name: "Pilot Premiere", runtime: 55, overview: "An explosive premiere setting the psychological stakes in motion." },
          { episode_number: 2, name: "The Fracture", runtime: 52, overview: "Deepening tensions reveal hidden alliances under pressure." },
          { episode_number: 3, name: "Turning Point", runtime: 58, overview: "A critical discovery changes the trajectory of the investigation." }
        ]).map((ep, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 rounded-2xl bg-noir-900/60 border border-white/5 hover:border-white/15 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-noir-850 flex items-center justify-center text-xs font-bold font-mono text-gold-400 border border-white/10 shrink-0 group-hover:border-gold-500/40">
              E{ep.episode_number}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-display font-semibold text-sm text-white truncate">
                  {ep.name}
                </h5>
                {ep.runtime && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    {ep.runtime}m
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {ep.overview}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
