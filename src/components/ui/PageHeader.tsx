import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
};

export default function PageHeader({
  badge,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  action,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {badge && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              {badge}
            </div>
          )}

          <h1 className="text-2xl font-black tracking-tight md:text-4xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-blue-100/80 md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {action}

          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}