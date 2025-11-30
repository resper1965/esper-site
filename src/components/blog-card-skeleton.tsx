import { cn } from "@/lib/utils";

interface BlogCardSkeletonProps {
  showRightBorder?: boolean;
}

export function BlogCardSkeleton({ showRightBorder = true }: BlogCardSkeletonProps) {
  return (
    <div
      className={cn(
        "block relative animate-pulse",
        "before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-['']",
        "after:absolute after:-top-0.5 after:left-0 after:z-0 after:h-px after:w-screen after:bg-border after:content-['']",
        showRightBorder && "md:border-r border-border border-b-0"
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
