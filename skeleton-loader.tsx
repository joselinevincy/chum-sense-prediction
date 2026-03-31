export function FormSkeleton() {
  return (
    <div className="w-full max-w-3xl p-8 bg-card rounded-lg border border-border space-y-8 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>

      {/* Form section skeletons */}
      {[...Array(4)].map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-4 pb-6 border-b border-muted">
          <div className="h-5 bg-muted rounded w-1/4"></div>

          {[...Array(2)].map((_, fieldIdx) => (
            <div key={fieldIdx} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ))}

      {/* Submit button skeleton */}
      <div className="h-12 bg-muted rounded w-full"></div>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="w-full max-w-3xl space-y-6 animate-pulse">
      {/* Risk Meter skeleton */}
      <div className="p-10 bg-card rounded-lg border border-border flex flex-col items-center gap-8">
        <div className="w-80 h-40 bg-muted rounded-lg"></div>
        <div className="h-12 bg-muted rounded w-48"></div>
      </div>

      {/* Analysis card skeleton */}
      <div className="p-8 space-y-3 bg-card rounded-lg border border-border">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>

      {/* Factors card skeleton */}
      <div className="p-8 space-y-4 bg-card rounded-lg border border-border">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="h-6 w-6 bg-muted rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
