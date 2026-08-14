import React from "react";
import { Cpu } from "lucide-react";

export function MarketplaceHeader() {
  return (
    <div className="flex flex-col gap-2 pb-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#2B55E8]/10 text-[#2B55E8] border border-[#2B55E8]/20">
          <Cpu className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          GPU Marketplace
        </h1>
      </div>
      <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
        Browse available GPUs and find the right compute power for your workload.
      </p>
    </div>
  );
}
