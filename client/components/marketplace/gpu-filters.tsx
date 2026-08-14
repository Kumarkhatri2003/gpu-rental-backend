"use client";

import React from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import { GpuFilters } from "@/types/gpu";

export interface ModelCount {
  name: string;
  count: number;
}

export interface LocationCount {
  name: string;
  count: number;
}

interface GpuFiltersProps {
  filters: GpuFilters;
  onChange: (filters: GpuFilters) => void;
  onReset: () => void;
  availableModels: ModelCount[];
  availableLocations: LocationCount[];
  hasActiveFilters: boolean;
  className?: string;
}

const vramOptions: { label: string; value: number | null }[] = [
  { label: "All VRAM", value: null },
  { label: "8 GB+", value: 8 },
  { label: "12 GB+", value: 12 },
  { label: "16 GB+", value: 16 },
  { label: "24 GB+", value: 24 },
  { label: "48 GB+", value: 48 },
  { label: "80 GB+", value: 80 },
];

export function GpuFiltersPanel({
  filters,
  onChange,
  onReset,
  availableModels,
  availableLocations,
  hasActiveFilters,
  className = "",
}: GpuFiltersProps) {
  const toggleModel = (modelName: string) => {
    const isSelected = filters.models.includes(modelName);
    const newModels = isSelected
      ? filters.models.filter((m) => m !== modelName)
      : [...filters.models, modelName];
    onChange({ ...filters, models: newModels });
  };

  const toggleLocation = (locName: string) => {
    const isSelected = filters.locations.includes(locName);
    const newLocations = isSelected
      ? filters.locations.filter((l) => l !== locName)
      : [...filters.locations, locName];
    onChange({ ...filters, locations: newLocations });
  };

  return (
    <div
      className={`flex flex-col gap-6 rounded-xl border border-white/10 bg-[#121212] p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#2B55E8]" />
          <h2 className="font-bold text-sm text-white tracking-wide uppercase">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* 1. GPU Model Filter */}
      {availableModels.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            GPU Model
          </label>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {availableModels.map(({ name, count }) => {
              const isSelected = filters.models.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleModel(name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? "bg-[#2B55E8]/20 text-white border border-[#2B55E8]/40"
                      : "text-zinc-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#2B55E8] border-[#2B55E8] text-white"
                          : "border-zinc-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{name}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VRAM Filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          VRAM Memory
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {vramOptions.map((opt) => {
            const isSelected =
              opt.value === null
                ? filters.minVram === null
                : filters.minVram === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    minVram: opt.value === filters.minVram ? null : opt.value,
                  })
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                  isSelected
                    ? "bg-[#2B55E8] text-white shadow-[0_0_12px_rgba(43,85,232,0.3)]"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price per Hour (NPR) Filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Price / Hour (NPR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-[11px] text-zinc-500 mb-1">Min (NPR)</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice !== null ? filters.minPrice : ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Math.max(0, Number(e.target.value));
                onChange({ ...filters, minPrice: val });
              }}
              className="h-9 w-full rounded-lg bg-[#0a0a0a] px-3 text-xs text-white placeholder:text-zinc-600 border border-white/10 outline-none focus:border-[#2B55E8]"
            />
          </div>
          <div>
            <span className="block text-[11px] text-zinc-500 mb-1">Max (NPR)</span>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxPrice !== null ? filters.maxPrice : ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Math.max(0, Number(e.target.value));
                onChange({ ...filters, maxPrice: val });
              }}
              className="h-9 w-full rounded-lg bg-[#0a0a0a] px-3 text-xs text-white placeholder:text-zinc-600 border border-white/10 outline-none focus:border-[#2B55E8]"
            />
          </div>
        </div>
      </div>

      {/* 4. Location Filter */}
      {availableLocations.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Location
          </label>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {availableLocations.map(({ name, count }) => {
              const isSelected = filters.locations.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleLocation(name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? "bg-[#2B55E8]/20 text-white border border-[#2B55E8]/40"
                      : "text-zinc-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#2B55E8] border-[#2B55E8] text-white"
                          : "border-zinc-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{name}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Availability Filter */}
      <div className="pt-3 border-t border-white/10">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-medium text-zinc-300">
            Available now only
          </span>
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) =>
              onChange({ ...filters, availableOnly: e.target.checked })
            }
            className="w-4 h-4 rounded border-zinc-700 bg-black text-[#2B55E8] focus:ring-[#2B55E8] focus:ring-offset-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
