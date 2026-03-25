export default function PostLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="space-y-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
          {/* Breadcrumb */}
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>

          {/* Tags + date */}
          <div className="flex gap-3">
            <div className="h-6 w-6 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-28 bg-muted/60 rounded animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-full max-w-xl bg-muted/60 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted/40 rounded animate-pulse"
              style={{
                width: `${70 + Math.random() * 30}%`,
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
