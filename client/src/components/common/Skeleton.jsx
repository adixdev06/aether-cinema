import React from 'react';

export function MediaCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[2/3] skeleton-shimmer border border-white/5">
      <div className="absolute inset-x-0 bottom-0 p-4 space-y-2 bg-gradient-to-t from-noir-950/90 to-transparent">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-3 bg-white/5 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[85vh] relative skeleton-shimmer flex items-end p-12">
      <div className="max-w-2xl space-y-4">
        <div className="h-10 bg-white/10 rounded w-2/3"></div>
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-4/5"></div>
        <div className="flex gap-4 pt-4">
          <div className="h-12 bg-white/10 rounded-full w-36"></div>
          <div className="h-12 bg-white/5 rounded-full w-36"></div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
