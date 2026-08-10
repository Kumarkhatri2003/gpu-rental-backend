import { Session, GPU } from "@/types";
import { ArrowRight, Server, Terminal } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActiveSessionSectionProps {
  session: Session | null;
  gpu: GPU | null;
}

export function ActiveSessionSection({ session, gpu }: ActiveSessionSectionProps) {
  if (!session) {
    return (
      <Card className="bg-card border-border h-full flex flex-col justify-center min-h-[300px]">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 mb-4">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-medium text-foreground">No active session</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Rent a GPU to get started with your compute workloads.
          </p>
          <Link href="/marketplace" passHref>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Browse GPUs
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isPending = session.status === "pending";

  if (isPending) {
    return (
      <Card className="bg-card border-border h-full flex flex-col justify-center min-h-[300px]">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-2xl animate-pulse bg-yellow-500/10 border border-yellow-500/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Server className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-lg font-medium text-yellow-500">Request Pending</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Waiting for GPU allocation &middot; {gpu?.model || "Unknown GPU"}
          </p>
          <Link href={`/sessions/${session.id}`} passHref>
            <Button variant="outline" className="text-muted-foreground hover:text-foreground">
              View Request Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Active state calculation
  const startTime = new Date(session.startTime);
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider truncate max-w-[120px]">
              {session.id.substring(0, 8)}...
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-lg p-3 bg-secondary/30 border border-border/50 flex flex-col gap-0.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Duration</p>
            <p className="text-lg font-semibold text-foreground">{durationStr}</p>
            <p className="text-[10px] text-muted-foreground">Running</p>
          </div>
          <div className="rounded-lg p-3 bg-secondary/30 border border-border/50 flex flex-col gap-0.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current Cost</p>
            <p className="text-lg font-semibold text-foreground">
              {session.totalCost !== null ? `NPR ${session.totalCost.toLocaleString()}` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {gpu ? `NPR ${gpu.pricePerHour}/hr` : "—"}
            </p>
          </div>
          <div className="rounded-lg p-3 bg-secondary/30 border border-border/50 flex flex-col gap-0.5 col-span-2 md:col-span-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GPU Model</p>
            <p className="text-lg font-semibold text-foreground truncate">{gpu?.model || "Unknown"}</p>
            <p className="text-[10px] text-muted-foreground">{gpu?.vram ? `${gpu.vram} GB VRAM` : "—"}</p>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link href={`/sessions/${session.id}`} className="w-full block">
            <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all">
              <Terminal className="mr-2 h-4 w-4" /> Open Session Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
