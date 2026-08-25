import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import MediaCard from '../common/MediaCard';
import { useAudio } from '../../context/AudioContext';

export default function MediaCarousel({ title, subtitle, items = [], seeAllLink = '/explore', badge = null }) {
  const scrollRef = useRef(null);
  const { playClick } = useAudio();

  const handleScroll = (direction) => {
    playClick();
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row Header */}
        <div className="flex items-end justify-between mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  {badge}
                </span>
              )}
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 font-light">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {seeAllLink && (
              <Link
                to={seeAllLink}
                onClick={playClick}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors mr-2 hidden sm:inline"
              >
                Explore More →
              </Link>
            )}

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-full bg-noir-900/80 hover:bg-noir-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-full bg-noir-900/80 hover:bg-noir-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[170px] sm:min-w-[210px] md:min-w-[230px] snap-start shrink-0">
              <MediaCard media={item} showMatch={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
