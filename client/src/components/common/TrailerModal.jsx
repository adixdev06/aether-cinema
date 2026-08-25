import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';

export default function TrailerModal({ isOpen, onClose, trailerKey, title = 'Official Trailer' }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-noir-950/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-5xl bg-noir-900 border border-white/10 rounded-3xl overflow-hidden glass-panel-elevated shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-noir-950/50">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-gold-400" />
              <span className="font-display font-bold text-sm text-white tracking-wider">
                {title} • Trailer
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 16:9 Video Container */}
          <div className="relative aspect-video w-full bg-noir-950">
            {trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Film className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-base font-medium">Trailer preview unavailable for this archive record.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
