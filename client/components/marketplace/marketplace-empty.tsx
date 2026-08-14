import React from "react";
import { ServerOff, RotateCcw } from "lucide-react";

interface MarketplaceEmptyProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function MarketplaceEmpty({
  hasActiveFilters,
  onClearFilters,
}: MarketplaceEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] rounded-xl border border-white/10 bg-[#121212] p-8 text-center">
      <div className="p-3.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 mb-4">
        <ServerOff className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        {hasActiveFilters ? "No GPUs found" : "No GPUs available"}
      </h3>

      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        {hasActiveFilters
          ? "There are no GPUs matching your current search or filter criteria. Try broadening your parameters."
          : "There are currently no GPU compute instances registered on the network. Please check back later."}
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2B55E8]/15 border border-[#2B55E8]/30 text-sm font-medium text-[#a8bbff] hover:bg-[#2B55E8]/25 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
