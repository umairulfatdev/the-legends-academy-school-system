import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center backdrop-blur">
      {icon && (
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-4xl text-indigo-600">
          {icon}
        </div>
      )}

      <h4 className="text-2xl font-black text-slate-800">{title}</h4>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}