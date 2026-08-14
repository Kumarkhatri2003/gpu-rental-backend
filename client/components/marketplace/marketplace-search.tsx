"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface MarketplaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarketplaceSearch({
  value,
  onChange,
  placeholder = "Search GPUs by model (e.g. RTX 4090, A6000)...",
}: MarketplaceSearchProps) {
  return (
    <div className="relative w-full">
      <label htmlFor="marketplace-gpu-search" className="sr-only">
        Search GPUs
      </label>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          id="marketplace-gpu-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg bg-[#121212] pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 border border-white/10 outline-none transition-all focus:border-[#2B55E8] focus:ring-1 focus:ring-[#2B55E8]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 p-1 text-zinc-400 hover:text-white rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
