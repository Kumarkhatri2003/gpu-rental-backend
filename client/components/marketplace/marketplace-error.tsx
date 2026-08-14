import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface MarketplaceErrorProps {
  message?: string;
  onRetry: () => void;
}

export function MarketplaceError({
  message = "Something went wrong while loading the marketplace.",
  onRetry,
}: MarketplaceErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] rounded-xl border border-red-500/20 bg-[#121212] p-8 text-center">
      <div className="p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Unable to load GPUs
      </h3>

      <p className="text-sm text-zinc-400 max-w-md mb-6">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2B55E8] text-sm font-semibold text-white hover:bg-[#315FFF] hover:shadow-[0_8px_20px_rgba(43,85,232,0.25)] transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
