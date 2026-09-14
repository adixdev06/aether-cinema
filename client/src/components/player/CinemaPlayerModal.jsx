import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Sparkles, Share2 } from 'lucide-react';
import CinemaPlayer from './CinemaPlayer';
import { useAudio } from '../../context/AudioContext';

export default function CinemaPlayerModal({
  isOpen,
  onClose,
  media
}) {
  const { playClick } = useAudio();

  if (!isOpen || !media) return null;

  const sources = media.sources || [
    {
      label: media.stream_type === 'mp4' ? "High-Speed Direct HTML5 Stream" : "Official Preview Stream",
      type: media.stream_type || (media.stream_url ? 'mp4' : 'youtube'),
      url: media.stream_url || (media.trailer_key ? `https://www.youtube.com/embed/${media.trailer_key}?autoplay=1&rel=0&modestbranding=1` : null),
      quality: media.stream_quality || "1080p Full HD"
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-8 bg-noir-950/92 backdrop-blur-2xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-6xl bg-noir-900 border border-white/10 rounded-3xl overflow-hidden glass-panel-elevated shadow-2xl relative my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-noir-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                <Film className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-white tracking-wider block">
                  {media.title || media.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {media.is_free_stream ? "★ 100% Free Full-Length Masterpiece (No Copyright)" : "★ Official Studio Preview"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`${window.location.origin}/watch/${media.id}`);
                  }
                }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 px-3"
                title="Share stream link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Embedded Player */}
          <div className="p-2 sm:p-6 bg-noir-950">
            <CinemaPlayer
              title={media.title || media.name}
              sources={sources}
              poster={media.backdrop_path || media.poster_path}
              license={media.license || (media.is_free_stream ? "Public Domain / CC-BY" : "Official Preview Player")}
              quality={media.stream_quality || "1080p Full HD"}
              isFreeStream={media.is_free_stream}
              onClose={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
