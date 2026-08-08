import { GpuPreviewData } from "@/types/gpu";

import { Cpu, MapPin } from "lucide-react";
import Link from "next/link";

interface GpuPreviewCardProps {
  gpu: GpuPreviewData;
}

export function GpuPreviewCard({ gpu }: GpuPreviewCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#121212] p-6 shadow-sm transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2B55E8]/10 rounded-lg text-[#2B55E8]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[18px] text-white tracking-tight">{gpu.name}</h3>
          </div>
          {gpu.available && (
            <span className="flex items-center text-[12px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
              Available
            </span>
          )}
        </div>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#a1a1aa]">VRAM</span>
            <span className="font-bold text-white">{gpu.memory} GB</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#a1a1aa]">Location</span>
            <span className="font-medium text-white flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#a1a1aa]" />
              {gpu.location}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
            <span className="text-[13px] text-[#a1a1aa]">Price</span>
            <div className="flex items-baseline">
              <span className="text-[20px] font-bold text-white">NPR {gpu.price}</span>
              <span className="text-[#a1a1aa] text-[12px] ml-1">/ hr</span>
            </div>
          </div>
        </div>
      </div>
      
      <Link 
        href="/marketplace"
        className="w-full h-10 mt-2 inline-flex items-center justify-center rounded-md bg-[#2B55E8] text-[14px] font-semibold text-white transition-all hover:bg-[#315FFF] hover:shadow-[0_8px_20px_rgba(43,85,232,0.24)]"
      >
        View GPU
      </Link>
    </div>
  );
}
