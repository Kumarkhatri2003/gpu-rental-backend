import { GpuPreviewData } from "@/types/gpu";
import { Cpu, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GpuPreviewCardProps {
  gpu: GpuPreviewData;
}

export function GpuPreviewCard({ gpu }: GpuPreviewCardProps) {
  return (
    <Card
      variant="default"
      className="group relative flex flex-col justify-between overflow-hidden p-6 hover:-translate-y-1 hover:shadow-corporate-hover transition-all duration-200"
    >
      <div>
        <Card.Header className="p-0 pb-4 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-primary border border-primary/20 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <Card.Title className="text-lg font-bold tracking-tight">{gpu.name}</Card.Title>
          </div>
          {gpu.available && (
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Available
            </span>
          )}
        </Card.Header>
        
        <Card.Content className="p-0">
          <div className="space-y-3 my-4 py-3 border-y border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">VRAM Capacity</span>
              <span className="font-bold text-foreground">{gpu.memory} GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Location</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {gpu.location}
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">Rental Rate</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xl font-extrabold text-foreground">NPR {gpu.price}</span>
              <span className="text-xs text-muted-foreground font-normal">/ hr</span>
            </div>
          </div>
        </Card.Content>
      </div>
      
      <Card.Footer className="p-0 pt-2">
        <Link href="/marketplace" className="w-full">
          <Button variant="primary" size="md" fullWidth className="font-semibold gap-2 shadow-xs">
            <Zap className="w-4 h-4" />
            <span>Rent GPU</span>
          </Button>
        </Link>
      </Card.Footer>
    </Card>
  );
}
