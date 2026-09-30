"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  CalendarDays,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import EmptyState from "@/components/ui/EmptyState";

type ReportSummary = {
  totalBilled: number;
  totalCollected: number;
  totalRemaining: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
};

type Voucher = {
  id: string;
  voucherNumber: string;
  student: {
    id: string;
    studentId: string;
    fullName: string;
    admissionNumber: string;
  };
  feeMonth: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Invalid response (${response.status})` };
  }
}

export default function FeeReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/fee-reports", { cache: "no-store" });
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load report.");
      }

      setSummary(data.summary || null);
      setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const filteredVouchers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vouchers.filter((v) => {
      const searchable = `${v.student?.fullName || ""} ${v.voucherNumber} ${v.student?.studentId || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, search, statusFilter]);

  const collectionRate = useMemo(() => {
    if (!summary || summary.totalBilled === 0) return 0;
    return Math.round((summary.totalCollected / summary.totalBilled) * 100);
  }, [summary]);

  return (
    <DashboardLayout>
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Analytics
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Fee Reports
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
              Complete overview of fee billing, collections, pending amounts
              and defaulters across all classes.
            </p>
          </div>
        </div>
      </Reveal>

      {error && (
        <Reveal>
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300 backdrop-blur">
            ⚠ {error}
          </div>
        </Reveal>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : !summary ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="No report data"
          description="Reports will appear once fee vouchers are created."
        />
      ) : (
        <>
          {/* Main Summary */}
          <Reveal delay={0.1}>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Total Billed"
                value={Math.round(summary.totalBilled)}
                prefix="Rs "
                icon={Receipt}
                gradient="from-indigo-500 to-indigo-700"
              />
              <StatCard
                label="Collected"
                value={Math.round(summary.totalCollected)}
                prefix="Rs "
                icon={TrendingUp}
                gradient="from-emerald-500 to-teal-600"
              />
              <StatCard
                label="Pending"
                value={Math.round(summary.totalRemaining)}
                prefix="Rs "
                icon={TrendingDown}
                gradient="from-amber-500 to-orange-600"
              />
              <StatCard
                label="Collection Rate"
                value={collectionRate}
                suffix="%"
                icon={BarChart3}
                gradient="from-cyan-500 to-blue-600"
              />
            </div>
          </Reveal>

          {/* Status Breakdown */}
          <Reveal delay={0.15}>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatusCard
                label="Paid"
                value={summary.paidCount}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatusCard
                label="Partial"
                value={summary.partialCount}
                icon={Clock}
                color="amber"
              />
              <StatusCard
                label="Unpaid"
                value={summary.unpaidCount}
                icon={AlertCircle}
                color="rose"
              />
              <StatusCard
                label="Overdue"
                value={summary.overdueCount}
                icon={AlertCircle}
                color="red"
              />
            </div>
          </Reveal>

          {/* Vouchers Table */}
          <Reveal delay={0.2}>
            <SpotlightCard className="overflow-hidden p-0">
              <div className="border-b border-white/10 p-5 md:p-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white md:text-2xl">
                      Fee Vouchers
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {filteredVouchers.length} of {vouchers.length} vouchers
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student/voucher..."
                        className="modern-input w-full pl-11 md:w-64"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="modern-select md:w-auto"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PAID">Paid</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Voucher
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Student
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Month
                      </th>
                      <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Total
                      </th>
                      <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Paid
                      </th>
                      <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Remaining
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                          No vouchers found.
                        </td>
                      </tr>
                    ) : (
                      filteredVouchers.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-white/5 transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3 text-xs font-bold text-cyan-400">
                            {v.voucherNumber}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white">
                                {v.student?.fullName?.charAt(0).toUpperCase() || "S"}
                              </div>
                              <div>
                                <p className="font-bold text-white">
                                  {v.student?.fullName || "—"}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {v.student?.studentId || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-400">
                            {new Date(v.feeMonth).toLocaleDateString("en-GB", {
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-white">
                            Rs {v.totalAmount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-emerald-300">
                            Rs {v.paidAmount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-amber-300">
                            Rs {v.remainingAmount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3">
                            <VoucherStatusBadge status={v.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SpotlightCard>
          </Reveal>
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <SpotlightCard className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 md:text-xs">
            {label}
          </p>
          <p className="mt-1.5 truncate text-2xl font-black md:mt-2 md:text-3xl">
            {prefix}
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur md:h-12 md:w-12 md:rounded-2xl">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </SpotlightCard>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "rose" | "red";
}) {
  const colorMap = {
    emerald: "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
    amber: "text-amber-300 border-amber-400/30 bg-amber-400/5",
    rose: "text-rose-300 border-rose-400/30 bg-rose-400/5",
    red: "text-red-300 border-red-400/30 bg-red-400/5",
  };

  return (
    <div
      className={`rounded-2xl border ${colorMap[color]} p-5 backdrop-blur transition hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black">
            <AnimatedCounter value={value} />
          </p>
        </div>
        <Icon className="h-7 w-7 opacity-70" />
      </div>
    </div>
  );
}

function VoucherStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    PARTIAL: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    UNPAID: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    OVERDUE: "border-red-400/30 bg-red-400/10 text-red-300",
    CANCELLED: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        map[status] || "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}