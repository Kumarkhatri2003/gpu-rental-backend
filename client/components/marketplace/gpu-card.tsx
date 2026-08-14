"use client";

import React from "react";
import Link from "next/link";
import { Cpu, MapPin } from "lucide-react";
import { MarketplaceGPU } from "@/types/gpu";

interface GpuCardProps {
  gpu: MarketplaceGPU;
}

export function GpuCard({ gpu }: GpuCardProps) {
  const isAvailable = gpu.availability === "available";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#121212] p-5 transition-all duration-200 hover:border-white/25 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
      <div>
        {/* Top Header: Model Name & Availability Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#2B55E8]/10 text-[#2B55E8] border border-[#2B55E8]/20 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white tracking-tight truncate">
              {gpu.name}
            </h3>
          </div>

          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
              isAvailable
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isAvailable
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400"
              }`}
            />
            {isAvailable ? "Available" : gpu.availability}
          </span>
        </div>

        {/* Core Specs: VRAM & Location */}
        <div className="space-y-2.5 py-3 border-t border-b border-white/5 my-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-zinc-400">VRAM</span>
            <span className="font-semibold text-white">{gpu.vram} GB VRAM</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-zinc-400">Location</span>
            <span className="font-medium text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {gpu.location}
            </span>
          </div>
        </div>

        {/* Price display */}
        <div className="flex items-baseline justify-between pt-1 pb-4">
          <span className="text-xs text-zinc-400">Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              NPR {gpu.pricePerHour.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400 font-normal">/ hour</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href={`/marketplace/gpu/${gpu.id}`}
        className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-[#2B55E8] text-sm font-semibold text-white transition-all hover:bg-[#315FFF] hover:shadow-[0_8px_20px_rgba(43,85,232,0.25)] focus:ring-2 focus:ring-[#2B55E8] focus:outline-none"
      >
        View GPU
      </Link>
    </div>
  );
}
