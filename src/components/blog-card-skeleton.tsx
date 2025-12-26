import { cn } from "@/lib/utils";

interface BlogCardSkeletonProps {
  showRightBorder?: boolean;
}

export function BlogCardSkeleton({ }: BlogCardSkeletonProps) {
  return (
    <div
      className={cn(
        "block w-full max-w-md animate-pulse",
        "border border-border rounded-lg bg-card overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Thumbnail skeleton */}
        <div className="relative w-full h-48 bg-muted" />

        <div className="p-6 flex flex-col gap-3 flex-1">
          {/* Category badge skeleton */}
          <div className="flex items-center gap-2">
            <div className="rounded-full w-8 h-8 bg-muted" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-full" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
