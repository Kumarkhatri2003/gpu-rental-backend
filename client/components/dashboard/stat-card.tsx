import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}

export function StatCard({ label, value, sub, accent, warn }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden bg-card border-border",
        accent && "border-primary/30",
        warn && "border-destructive/30"
      )}
    >
      {accent && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-primary to-transparent" 
        />
      )}
      {warn && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-br from-destructive to-transparent" 
        />
      )}
      <CardContent className="p-5 flex flex-col gap-1 relative z-10">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={cn(
          "text-2xl font-semibold leading-none text-foreground",
          accent && "text-primary",
          warn && "text-destructive"
        )}>
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}
