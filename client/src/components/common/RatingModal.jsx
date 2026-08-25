import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Heart, ThumbsUp, Meh, ThumbsDown, Check } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAudio } from '../../context/AudioContext';
import { handleImageError } from '../../utils/imageFallback';

export default function RatingModal({ isOpen, onClose, media }) {
  const { rateMedia, getRating, markWatched, isWatched } = useLibrary();
  const { playClick, playChime } = useAudio();

  const currentScore = media ? (getRating(media.id) || 8) : 8;
  const [score, setScore] = useState(currentScore);
  const [sentiment, setSentiment] = useState('loved');
  const [reviewNote, setReviewNote] = useState('');

  if (!isOpen || !media) return null;

  const sentimentBadges = [
    { id: 'loved', label: 'Loved it', icon: Heart, minScore: 9, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    { id: 'liked', label: 'Liked it', icon: ThumbsUp, minScore: 7, color: 'text-gold-400 border-gold-500/30 bg-gold-500/10' },
    { id: 'okay', label: 'It was okay', icon: Meh, minScore: 5, color: 'text-slate-300 border-white/20 bg-white/5' },
    { id: 'disliked', label: "Didn't like it", icon: ThumbsDown, minScore: 3, color: 'text-red-400 border-red-500/30 bg-red-500/10' }
  ];

  const handleSentimentPick = (item) => {
    playClick();
    setSentiment(item.id);
    setScore(item.minScore);
  };

  const handleSave = () => {
    playChime();
    rateMedia(media.id, score, sentiment);
    if (!isWatched(media.id)) {
      markWatched(media, score, sentiment, reviewNote);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-noir-900 border border-white/10 rounded-2xl p-6 glass-panel-elevated shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={media.poster_path}
              alt={media.title || media.name}
              onError={(e) => handleImageError(e, media.title || media.name, media.genres ? media.genres[0] : 'Cinema')}
              className="w-14 h-20 rounded-lg object-cover border border-white/10 shadow-lg"
            />
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                Rate & Log
              </span>
              <h3 className="font-display font-bold text-lg text-white line-clamp-1">
                {media.title || media.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {(media.release_date || media.first_air_date || '').substring(0, 4)} • {media.director || 'Curated'}
              </p>
            </div>
          </div>

          {/* Quick Sentiment Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {sentimentBadges.map((badge) => {
              const Icon = badge.icon;
              const active = sentiment === badge.id;
              return (
                <button
                  key={badge.id}
                  onClick={() => handleSentimentPick(badge)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? `${badge.color} ring-2 ring-gold-400/50 shadow-md`
                      : 'border-white/5 bg-noir-850 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{badge.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1-10 Slider */}
          <div className="space-y-3 mb-6 bg-noir-850/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Score
              </span>
              <div className="flex items-center gap-1.5 text-gold-400 font-display font-bold text-2xl">
                <Star className="w-5 h-5 fill-gold-400" />
                <span>{score}/10</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => {
                setScore(Number(e.target.value));
                playClick();
              }}
              className="w-full h-2 bg-noir-750 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>1 (Skip)</span>
              <span>5 (Average)</span>
              <span>10 (Masterpiece)</span>
            </div>
          </div>

          {/* Optional Review Note */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Personal Reaction / Notes (Optional)
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="What made this memorable? Pacing, score, ending..."
              rows={2}
              className="w-full bg-noir-850 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold-500/50 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Rating & Update Movie DNA</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
