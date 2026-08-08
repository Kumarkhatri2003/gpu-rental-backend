import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GpuPreviewCard } from "./GpuPreviewCard";
import { previewGpus } from "@/types/gpu";

export function MarketplacePreview() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold tracking-tight text-white mb-3">
              Available Compute
            </h2>
            <p className="text-[16px] text-[#d4d4d4]">
              Browse top-tier GPUs ready for your workloads right now.
            </p>
          </div>
          <Link 
            href="/marketplace" 
            className="group flex items-center text-[14px] font-medium text-[#2B55E8] hover:text-[#315FFF] transition-colors"
          >
            View all GPUs 
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewGpus.map((gpu, index) => (
            <GpuPreviewCard key={index} gpu={gpu} />
          ))}
        </div>
      </div>
    </section>
  );
}
