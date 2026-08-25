import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function WhyThisBadge({ reasons = [], matchScore = 92, title = 'This Title' }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const { playClick } = useAudio();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          playClick();
          setOpen(!open);
        }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-noir-900/90 hover:bg-noir-800 text-gold-400 border border-gold-500/30 backdrop-blur-md transition-all shadow-md"
        title="Why this was recommended"
      >
        <Sparkles className="w-3 h-3 text-gold-400" />
        <span>Why this?</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-full right-0 mb-2 w-72 p-4 rounded-2xl glass-panel-elevated bg-noir-900/95 border border-gold-500/20 text-slate-100 shadow-2xl z-50 pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="font-display font-bold text-xs tracking-wider text-gold-400">
                  {matchScore}% MATCH RATIONALE
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-2 font-medium">
              Why we picked <span className="text-white font-semibold">{title}</span>:
            </p>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400/80 shrink-0 mt-0.5" />
                  <span className="text-[11px]">{reason}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
