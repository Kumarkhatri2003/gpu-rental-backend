import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { GpuPreviewCard } from "./GpuPreviewCard";
import { previewGpus } from "@/types/gpu";
import { Button } from "@/components/ui/button";

export function MarketplacePreview() {
  return (
    <section className="py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Cpu className="w-4 h-4" />
              <span>Live Compute Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Available GPUs
            </h2>
            <p className="text-base text-muted-foreground mt-2 leading-relaxed">
              Browse verified compute nodes available for immediate deployment.
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="group gap-2 font-semibold">
              <span>View All GPUs</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-primary" />
            </Button>
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
