"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import { SortOption } from "@/types/gpu";

interface GpuSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "VRAM: Low to High", value: "vram-asc" },
  { label: "VRAM: High to Low", value: "vram-desc" },
];

export function GpuSort({ value, onChange }: GpuSortProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="gpu-sort-select" className="text-xs text-zinc-400 font-medium hidden sm:inline whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="gpu-sort-select"
          aria-label="Sort GPU listings"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="h-11 appearance-none rounded-lg bg-[#121212] pl-9 pr-8 text-sm font-medium text-white border border-white/10 outline-none transition-all hover:border-white/20 focus:border-[#2B55E8] focus:ring-1 focus:ring-[#2B55E8] cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#18181b] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
