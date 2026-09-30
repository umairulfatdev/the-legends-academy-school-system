"use client";

export function SkeletonCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl ${className}`}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-white/5" />
        <div className="h-5 w-3/4 rounded-lg bg-white/5" />
        <div className="h-3 w-full rounded-lg bg-white/5" />
        <div className="h-3 w-2/3 rounded-lg bg-white/5" />
      </div>

      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function SkeletonStatCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-20 rounded bg-white/5" />
          <div className="h-8 w-24 rounded bg-white/5" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/5" />
      </div>

      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function SkeletonRow({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-white/5" />

        <div className="flex-1 animate-pulse space-y-2">
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>

        <div className="hidden gap-2 sm:flex">
          <div className="h-9 w-20 animate-pulse rounded-xl bg-white/5" />
          <div className="h-9 w-20 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.03] p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-white/5"
            style={{ width: `${60 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 animate-pulse rounded bg-white/5"
              style={{ width: `${50 + Math.random() * 80}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}