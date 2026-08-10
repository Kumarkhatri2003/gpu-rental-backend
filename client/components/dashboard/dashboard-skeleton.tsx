import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="mb-2">
        <Skeleton className="h-9 w-48 mb-4" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-8" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24 mb-8" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#121212] border-white/10 min-h-[200px]">
        <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
          <Skeleton className="h-4 w-32 mb-8" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-12 mt-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
