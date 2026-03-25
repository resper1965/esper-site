export default function BlogLoading() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Title skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-96 bg-muted/60 rounded-lg animate-pulse" />
        </div>

        {/* Post cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 space-y-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-full bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
