"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Search,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import EmptyState from "@/components/ui/EmptyState";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type Student = {
  id: string;
  studentId: string;
  fullName: string;
  rollNumber: string | null;
};

type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  remarks: string | null;
  student: Student;
};

type StatusType = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

const statusConfig: Record<
  StatusType,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  PRESENT: {
    label: "Present",
    color: "emerald",
    icon: CheckCircle2,
  },
  ABSENT: {
    label: "Absent",
    color: "red",
    icon: XCircle,
  },
  LATE: {
    label: "Late",
    color: "amber",
    icon: Clock,
  },
  LEAVE: {
  label: "Leave",  
    color: "cyan",
    icon: AlertCircle,
  },
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

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusType>("ALL");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD STUDENTS + ATTENDANCE ─────────
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, attendanceRes] = await Promise.all([
        fetch("/api/students", { cache: "no-store" }),
        fetch(`/api/attendance?date=${selectedDate}`, { cache: "no-store" }),
      ]);

      const studentsData = await safeJson(studentsRes);
      const attendanceData = await safeJson(attendanceRes);

      if (!studentsRes.ok) {
        throw new Error(studentsData.error || "Failed to load students.");
      }
      if (!attendanceRes.ok) {
        throw new Error(attendanceData.error || "Failed to load attendance.");
      }

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setAttendance(
        Array.isArray(attendanceData.attendance) ? attendanceData.attendance : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ───────── MAP STUDENT ID -> ATTENDANCE ─────────
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance.forEach((record) => {
      map.set(record.studentId, record);
    });
    return map;
  }, [attendance]);

  // ───────── SAVE ATTENDANCE ─────────
  async function markAttendance(
    studentId: string,
    status: StatusType,
    remarks?: string
  ) {
    setSavingId(studentId);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          status,
          remarks: remarks || "",
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save attendance.");
      }

      setMessage("Attendance saved successfully.");

      // Update local state
      setAttendance((previous) => {
        const existing = previous.find((a) => a.studentId === studentId);
        if (existing) {
          return previous.map((a) =>
            a.studentId === studentId ? data.attendance : a
          );
        }
        return [...previous, data.attendance];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setSavingId(null);
    }
  }

  // ───────── FILTER STUDENTS ─────────
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const searchable = `${student.fullName} ${student.studentId} ${student.rollNumber || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      if (statusFilter === "ALL") return matchesSearch;

      const record = attendanceMap.get(student.id);
      return matchesSearch && record?.status === statusFilter;
    });
  }, [students, search, statusFilter, attendanceMap]);

  // ───────── STATS ─────────
  const stats = useMemo(() => {
    const present = attendance.filter((a) => a.status === "PRESENT").length;
    const absent = attendance.filter((a) => a.status === "ABSENT").length;
    const late = attendance.filter((a) => a.status === "LATE").length;
    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, rate };
  }, [attendance, students]);

  return (
    <DashboardLayout>
      {/* Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Daily Records
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Attendance Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Track daily attendance for every student with real-time
                updates, remarks and class-level insights.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-cyan-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="modern-input w-auto"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Alerts */}
      {error && (
        <Reveal>
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300 backdrop-blur">
            ⚠ {error}
          </div>
        </Reveal>
      )}

      {message && (
        <Reveal>
          <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 font-semibold text-emerald-300 backdrop-blur">
            ✓ {message}
          </div>
        </Reveal>
      )}

      {/* Stats */}
      <Reveal delay={0.1}>
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={stats.total}
            icon={Users}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Present"
            value={stats.present}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            icon={XCircle}
            gradient="from-red-500 to-rose-600"
          />
          <StatCard
            label="Attendance Rate"
            value={stats.rate}
            suffix="%"
            icon={TrendingUp}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      </Reveal>

      {/* Directory */}
      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Student Attendance
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredStudents.length} of {students.length} students displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="modern-input w-full pl-11 md:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "ALL" | StatusType)
                  }
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="h-8 w-8" />}
                title="No students found"
                description="Try changing your search or filter."
              />
            ) : (
              <div className="grid gap-3">
                {filteredStudents.map((student) => {
                  const record = attendanceMap.get(student.id);
                  const currentStatus = record?.status;
                  const isSaving = savingId === student.id;

                  return (
                    <article
                      key={student.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition hover:border-indigo-400/30 hover:bg-white/[0.05] md:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Student info */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-lg">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate font-black text-white">
                                {student.fullName}
                              </h4>
                              {currentStatus && (
                                <StatusBadge status={currentStatus} />
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              ID: {student.studentId} • Roll:{" "}
                              {student.rollNumber || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(statusConfig) as StatusType[]).map(
                            (status) => {
                              const config = statusConfig[status];
                              const Icon = config.icon;
                              const isActive = currentStatus === status;

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() =>
                                    markAttendance(student.id, status)
                                  }
                                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition disabled:opacity-50 ${
                                    isActive
                                      ? `border-${config.color}-400/50 bg-${config.color}-500/20 text-${config.color}-300`
                                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  {isSaving && isActive ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Icon className="h-3.5 w-3.5" />
                                  )}
                                  {config.label}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </SpotlightCard>
      </Reveal>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  suffix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  suffix?: string;
}) {
  return (
    <SpotlightCard className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 md:text-xs">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-black md:mt-2 md:text-3xl">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur md:h-12 md:w-12 md:rounded-2xl">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </SpotlightCard>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const colorMap = {
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    red: "border-red-400/30 bg-red-400/10 text-red-300",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        colorMap[config.color as keyof typeof colorMap]
      }`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}