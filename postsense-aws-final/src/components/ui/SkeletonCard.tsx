import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg bg-muted shimmer" />
        <Skeleton className="h-5 w-1/3 bg-muted shimmer" />
      </div>
      <Skeleton className="h-4 w-full bg-muted shimmer" />
      <Skeleton className="h-4 w-4/5 bg-muted shimmer" />
      <Skeleton className="h-4 w-2/3 bg-muted shimmer" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-7 w-20 rounded-full bg-muted shimmer" />
        <Skeleton className="h-7 w-20 rounded-full bg-muted shimmer" />
      </div>
    </div>
  );
}

export function SkeletonScore() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Skeleton className="h-44 w-44 rounded-full bg-muted shimmer" />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)'
        }} />
      </div>
      <Skeleton className="h-4 w-24 bg-muted shimmer" />
    </div>
  );
}
