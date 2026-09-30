"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  FileText,
  BarChart3,
  ArrowRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type Student = {
  id: string;
  fullName: string;
  status: string;
  gender: string | null;
};

type Teacher = {
  id: string;
  name: string;
  employmentStatus: string;
};

type ClassRoom = {
  id: string;
  name: string;
};

type Test = {
  id: string;
  title: string;
  testDate: string;
  subject?: { name: string } | null;
  classRoom?: { name: string } | null;
};

type FeeSummary = {
  totalBilled: number;
  totalCollected: number;
  totalRemaining: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);

  const [loading, setLoading] = useState(true);

  // ───────── LOAD ALL ─────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [stuRes, teaRes, clsRes, testRes, feeRes] = await Promise.all([
          fetch("/api/students", { cache: "no-store" }),
          fetch("/api/teachers", { cache: "no-store" }),
          fetch("/api/classes", { cache: "no-store" }),
          fetch("/api/tests", { cache: "no-store" }),
          fetch("/api/fee-reports", { cache: "no-store" }),
        ]);

        const stuData = await safeJson(stuRes);
        const teaData = await safeJson(teaRes);
        const clsData = await safeJson(clsRes);
        const testData = await safeJson(testRes);
        const feeData = await safeJson(feeRes);

        setStudents(Array.isArray(stuData) ? stuData : []);
        setTeachers(
          Array.isArray(teaData.teachers) ? teaData.teachers : []
        );
        setClasses(
          Array.isArray(clsData)
            ? clsData
            : Array.isArray(clsData.classes)
            ? clsData.classes
            : []
        );
        setTests(Array.isArray(testData) ? testData : []);
        setFeeSummary(feeData.summary || null);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // ───────── STATS ─────────
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(
      (s) => (s.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;
    return { totalStudents, activeStudents, totalTeachers, totalClasses };
  }, [students, teachers, classes]);

  // ───────── UPCOMING TESTS ─────────
  const upcomingTests = useMemo(() => {
    const now = new Date();
    return tests
      .filter((t) => new Date(t.testDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
      )
      .slice(0, 4);
  }, [tests]);

  // ───────── COLLECTION RATE ─────────
  const collectionRate = useMemo(() => {
    if (!feeSummary || feeSummary.totalBilled === 0) return 0;
    return Math.round(
      (feeSummary.totalCollected / feeSummary.totalBilled) * 100
    );
  }, [feeSummary]);

  return (
    <DashboardLayout>
      {/* Hero Greeting */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Welcome back 👋
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Here&apos;s everything happening at The Legends Academy today.
              </p>
            </div>

            <Link
              href="/students"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Manage Students
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          {/* Big Stats */}
          <Reveal delay={0.1}>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <BigStatCard
                label="Total Students"
                value={stats.totalStudents}
                subtext={`${stats.activeStudents} active`}
                icon={Users}
                gradient="from-indigo-500 to-indigo-700"
                href="/students"
              />
              <BigStatCard
                label="Teachers"
                value={stats.totalTeachers}
                subtext="Faculty members"
                icon={GraduationCap}
                gradient="from-cyan-500 to-blue-600"
                href="/teachers"
              />
              <BigStatCard
                label="Classes"
                value={stats.totalClasses}
                subtext="Across all grades"
                icon={BookOpen}
                gradient="from-violet-500 to-indigo-600"
                href="/classes"
              />
              <BigStatCard
                label="Fees Collected"
                value={Math.round(feeSummary?.totalCollected || 0)}
                subtext={`${collectionRate}% collection rate`}
                icon={Wallet}
                gradient="from-emerald-500 to-teal-600"
                prefix="Rs "
                href="/fees/reports"
              />
            </div>
          </Reveal>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Fee Overview (Large) */}
            <Reveal delay={0.15} className="lg:col-span-2">
              <SpotlightCard className="bg-white/[0.035] p-6 md:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white md:text-2xl">
                      Fee Overview
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Billing and collection summary
                    </p>
                  </div>

                  <Link
                    href="/fees/reports"
                    className="hidden items-center gap-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300 md:inline-flex"
                  >
                    Full Report
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <MiniStat
                    label="Total Billed"
                    value={Math.round(feeSummary?.totalBilled || 0)}
                    prefix="Rs "
                    icon={FileText}
                    color="cyan"
                  />
                  <MiniStat
                    label="Collected"
                    value={Math.round(feeSummary?.totalCollected || 0)}
                    prefix="Rs "
                    icon={TrendingUp}
                    color="emerald"
                  />
                  <MiniStat
                    label="Pending"
                    value={Math.round(feeSummary?.totalRemaining || 0)}
                    prefix="Rs "
                    icon={TrendingDown}
                    color="amber"
                  />
                </div>

                {/* Collection Progress */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      Collection Progress
                    </span>
                    <span className="font-black text-cyan-400">
                      {collectionRate}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${collectionRate}%` }}
                    />
                  </div>
                </div>

                {/* Status Pills */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatusPill
                    label="Paid"
                    value={feeSummary?.paidCount || 0}
                    color="emerald"
                    icon={CheckCircle2}
                  />
                  <StatusPill
                    label="Partial"
                    value={feeSummary?.partialCount || 0}
                    color="amber"
                    icon={Clock}
                  />
                  <StatusPill
                    label="Unpaid"
                    value={feeSummary?.unpaidCount || 0}
                    color="rose"
                    icon={AlertCircle}
                  />
                  <StatusPill
                    label="Overdue"
                    value={feeSummary?.overdueCount || 0}
                    color="red"
                    icon={AlertCircle}
                  />
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Quick Actions */}
            <Reveal delay={0.2}>
              <SpotlightCard className="h-full bg-white/[0.035] p-6 md:p-7">
                <h3 className="mb-1 text-xl font-black text-white">
                  Quick Actions
                </h3>
                <p className="mb-5 text-sm text-slate-400">
                  Jump to any module
                </p>

                <div className="space-y-2">
                  <QuickAction
                    href="/students"
                    label="Manage Students"
                    icon={Users}
                    color="indigo"
                  />
                  <QuickAction
                    href="/attendance"
                    label="Mark Attendance"
                    icon={ClipboardCheck}
                    color="emerald"
                  />
                  <QuickAction
                    href="/exams"
                    label="Create Exam"
                    icon={FileText}
                    color="cyan"
                  />
                  <QuickAction
                    href="/fees/collections"
                    label="Record Payment"
                    icon={Wallet}
                    color="amber"
                  />
                  <QuickAction
                    href="/marks"
                    label="Enter Marks"
                    icon={BarChart3}
                    color="violet"
                  />
                  <QuickAction
                    href="/subjects"
                    label="Subjects"
                    icon={BookOpen}
                    color="rose"
                  />
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          {/* Upcoming Exams */}
          <Reveal delay={0.25}>
            <SpotlightCard className="mt-6 bg-white/[0.035] p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white md:text-2xl">
                    Upcoming Exams
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Scheduled tests and examinations
                  </p>
                </div>

                <Link
                  href="/exams"
                  className="hidden items-center gap-2 text-sm font-bold text-cyan-400 transition hover:text-cyan-300 md:inline-flex"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {upcomingTests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
                  <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                  <p className="font-bold text-slate-400">
                    No upcoming exams
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create a new exam to see it here
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {upcomingTests.map((test) => {
                    const date = new Date(test.testDate);
                    const daysLeft = Math.ceil(
                      (date.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <Link
                        key={test.id}
                        href={`/marks?testId=${test.id}`}
                        className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                            {daysLeft === 0
                              ? "Today"
                              : daysLeft === 1
                              ? "Tomorrow"
                              : `${daysLeft} days`}
                          </span>
                        </div>

                        <h4 className="mt-3 line-clamp-2 text-sm font-black text-white">
                          {test.title}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {test.subject?.name || "—"} •{" "}
                          {test.classRoom?.name || "—"}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </SpotlightCard>
          </Reveal>
        </>
      )}
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────

function BigStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  gradient,
  href,
  prefix = "",
}: {
  label: string;
  value: number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  href: string;
  prefix?: string;
}) {
  return (
    <Link href={href}>
      <SpotlightCard
        className={`group bg-gradient-to-br ${gradient} p-5 text-white transition hover:-translate-y-1 md:p-6`}
      >
        <div className="relative flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 md:text-xs">
              {label}
            </p>
            <p className="mt-2 truncate text-2xl font-black md:text-3xl">
              {prefix}
              <AnimatedCounter value={value} />
            </p>
            <p className="mt-1 truncate text-xs text-white/60">{subtext}</p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur md:h-12 md:w-12">
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white/80">
          Open
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
        </div>
      </SpotlightCard>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  prefix,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "cyan" | "emerald" | "amber";
}) {
  const colorMap = {
    cyan: "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
          {label}
        </p>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <p className="mt-2 truncate text-xl font-black">
        {prefix}
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusPill({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "rose" | "red";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colorMap = {
    emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
    rose: "border-rose-400/20 bg-rose-400/5 text-rose-300",
    red: "border-red-400/20 bg-red-400/5 text-red-300",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${colorMap[color]}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-lg font-black">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "indigo" | "cyan" | "emerald" | "amber" | "violet" | "rose";
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-300 group-hover:bg-indigo-500",
    cyan: "bg-cyan-500/10 text-cyan-300 group-hover:bg-cyan-500",
    emerald: "bg-emerald-500/10 text-emerald-300 group-hover:bg-emerald-500",
    amber: "bg-amber-500/10 text-amber-300 group-hover:bg-amber-500",
    violet: "bg-violet-500/10 text-violet-300 group-hover:bg-violet-500",
    rose: "bg-rose-500/10 text-rose-300 group-hover:bg-rose-500",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.05]"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition group-hover:text-white ${colorMap[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-bold text-slate-300 transition group-hover:text-white">
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}