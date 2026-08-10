import { Session } from "@/types";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecentSessionsProps {
  sessions: Session[];
  getGpuModel: (gpuId: string) => string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; colorClass: string }> = {
    active: { label: "Active", colorClass: "text-green-500" },
    completed: { label: "Completed", colorClass: "text-muted-foreground" },
    cancelled: { label: "Cancelled", colorClass: "text-muted-foreground" },
    pending: { label: "Pending", colorClass: "text-yellow-500" },
    failed: { label: "Failed", colorClass: "text-destructive" },
  };
  
  const cfg = map[status] || map["completed"];
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs font-medium", cfg.colorClass)}>
      {status === 'active' || status === 'pending' || status === 'failed' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      ) : null}
      {cfg.label}
    </span>
  );
}

export function RecentSessions({ sessions, getGpuModel }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card className="bg-card border-border h-full flex flex-col justify-center min-h-[200px]">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center">
          <History className="h-8 w-8 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-4">Your completed GPU rentals will appear here.</p>
          <Link 
            href="/marketplace"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Browse GPUs
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Recent Sessions</h2>
          <Link 
            href="/sessions"
            className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center"
          >
            View all <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-5 gap-2 pb-2 mb-1 border-b border-border/50">
            {['ID', 'GPU', 'Duration', 'Cost', 'Status'].map((h) => (
              <p key={h} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{h}</p>
            ))}
          </div>

          {sessions.map((session, i) => {
            const model = getGpuModel(session.gpuId);
            
            // Calculate duration
            const start = new Date(session.startTime);
            const end = session.endTime ? new Date(session.endTime) : new Date();
            const diffMs = end.getTime() - start.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const duration = diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;

            return (
              <Link 
                key={session.id} 
                href={`/sessions/${session.id}`}
                className={cn(
                  "grid grid-cols-5 gap-2 py-2.5 transition-colors cursor-pointer hover:bg-secondary/20",
                  i < sessions.length - 1 ? "border-b border-border/30" : "border-none"
                )}
              >
                <p className="font-mono text-xs text-muted-foreground truncate">{session.id.substring(0, 8)}</p>
                <p className="font-mono text-xs text-foreground truncate" title={model}>{model}</p>
                <p className="font-mono text-xs text-muted-foreground">{duration}</p>
                <p className="font-mono text-xs text-foreground">
                  {session.totalCost ? `NPR ${session.totalCost}` : "—"}
                </p>
                <div className="flex items-center">
                  <StatusBadge status={session.status} />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
