import { GPU } from "@/types";
import { ArrowRight, Server } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface AvailableGpusProps {
  gpus: GPU[];
}

export function AvailableGpus({ gpus }: AvailableGpusProps) {
  if (gpus.length === 0) {
    return (
      <Card className="bg-card border-border h-full flex flex-col justify-center min-h-[200px]">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center">
          <Server className="h-8 w-8 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No GPUs available</h3>
          <p className="text-muted-foreground">Check back soon for new inventory.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Available GPUs</h2>
        </div>
        
        <div className="flex flex-col gap-3 flex-1">
          {gpus.slice(0, 3).map((gpu) => (
            <div 
              key={gpu.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">{gpu.model}</span>
                <span className="text-xs text-muted-foreground">{gpu.vram} GB VRAM</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-foreground">NPR {gpu.pricePerHour}</span>
                <span className="text-xs text-muted-foreground block">/ hr</span>
              </div>
            </div>
          ))}
        </div>

        <Link 
          href="/marketplace"
          className="mt-4 w-full flex items-center justify-center py-2.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
        >
          Browse all <ArrowRight className="ml-1 w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
