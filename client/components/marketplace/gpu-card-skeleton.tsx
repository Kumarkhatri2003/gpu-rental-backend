import React from "react";

export function GpuCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121212] p-5">
      <div>
        {/* Header Skeleton */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
            <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-zinc-800 rounded-full animate-pulse" />
        </div>

        {/* Specs Skeleton */}
        <div className="space-y-2.5 py-3 border-t border-b border-white/5 my-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-12 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-4 w-20 bg-zinc-800/70 rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-4 w-24 bg-zinc-800/70 rounded animate-pulse" />
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="flex items-baseline justify-between pt-1 pb-4">
          <div className="h-4 w-10 bg-zinc-800/70 rounded animate-pulse" />
          <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="w-full h-10 rounded-lg bg-zinc-800 animate-pulse" />
    </div>
  );
}
