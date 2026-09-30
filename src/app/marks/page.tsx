"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Save,
  Search,
  Trophy,
  Users,
  TrendingUp,
  XCircle,
  Loader2,
  Award,
  FileText,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type TestInfo = {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  totalMarks: number;
  passingMarks: number;
};

type StudentMark = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  markId: string | null;
  obtained: number | "";
  remarks: string;
};

type TestOption = {
  id: string;
  title: string;
  subject?: { name: string } | null;
  classRoom?: { name: string } | null;
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

function MarksPageContent() {                   
  const searchParams = useSearchParams();
  const initialTestId = searchParams.get("testId") || "";

  const [tests, setTests] = useState<TestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState(initialTestId);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [students, setStudents] = useState<StudentMark[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD TEST LIST ─────────
  useEffect(() => {
    async function loadTests() {
      try {
        const response = await fetch("/api/tests", { cache: "no-store" });
        const data = await safeJson(response);
        setTests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  // ───────── LOAD MARKS FOR SELECTED TEST ─────────
  async function loadMarks(testId: string) {
    if (!testId) {
      setTestInfo(null);
      setStudents([]);
      return;
    }

    try {
      setLoadingMarks(true);
      setError("");

      const response = await fetch(`/api/marks?testId=${testId}`, {
        cache: "no-store",
      });
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load marks.");
      }

      setTestInfo(data.test);
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marks.");
    } finally {
      setLoadingMarks(false);
    }
  }

  useEffect(() => {
    if (selectedTestId) {
      loadMarks(selectedTestId);
    }
  }, [selectedTestId]);

  // ───────── UPDATE MARK ─────────
  function updateMark(studentId: string, field: "obtained" | "remarks", value: string) {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;

        if (field === "obtained") {
          if (value === "") return { ...s, obtained: "" };
          const num = Number(value);
          if (Number.isNaN(num)) return s;
          return { ...s, obtained: num };
        }

        return { ...s, remarks: value };
      })
    );
  }

  // ───────── SAVE ALL MARKS ─────────
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!testInfo) throw new Error("Please select an exam first.");

      const results = students
        .filter((s) => s.obtained !== "")
        .map((s) => ({
          studentId: s.studentId,
          obtained: Number(s.obtained),
          remarks: s.remarks || "",
        }));

      if (results.length === 0) {
        throw new Error("Please enter marks for at least one student.");
      }

      const response = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: testInfo.id, results }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save marks.");

      setMessage("Marks saved successfully.");
      await loadMarks(testInfo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save marks.");
    } finally {
      setSaving(false);
    }
  }

  // ───────── FILTER STUDENTS ─────────
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(query) ||
        s.rollNumber.toLowerCase().includes(query)
    );
  }, [students, search]);

  // ───────── STATS ─────────
  const stats = useMemo(() => {
    const entered = students.filter((s) => s.obtained !== "").length;
    const total = students.length;
    const average =
      entered > 0
        ? Math.round(
            students
              .filter((s) => s.obtained !== "")
              .reduce((sum, s) => sum + Number(s.obtained), 0) / entered
          )
        : 0;
    const passed =
      testInfo && entered > 0
        ? students.filter(
            (s) => s.obtained !== "" && Number(s.obtained) >= testInfo.passingMarks
          ).length
        : 0;
    const failed = entered - passed;
    return { entered, total, average, passed, failed };
  }, [students, testInfo]);

  // ───────── GRADE CALCULATOR ─────────
  function getGrade(obtained: number | ""): string {
    if (obtained === "" || !testInfo) return "—";
    const percent = (Number(obtained) / testInfo.totalMarks) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    if (percent >= 33) return "E";
    return "F";
  }

  function getGradeColor(grade: string) {
    switch (grade) {
      case "A+":
      case "A":
        return "text-emerald-300 border-emerald-400/30 bg-emerald-400/10";
      case "B":
        return "text-cyan-300 border-cyan-400/30 bg-cyan-400/10";
      case "C":
        return "text-indigo-300 border-indigo-400/30 bg-indigo-400/10";
      case "D":
      case "E":
        return "text-amber-300 border-amber-400/30 bg-amber-400/10";
      case "F":
        return "text-red-300 border-red-400/30 bg-red-400/10";
      default:
        return "text-slate-400 border-white/10 bg-white/5";
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Marks Entry
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Enter Student Marks
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
              Select an exam, enter marks for every student, and save with
              automatic grade calculation.
            </p>

            {/* Test Selector */}
            <div className="mt-6 max-w-xl">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-cyan-300">
                Select Exam
              </label>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="modern-select"
              >
                <option value="">— Choose an exam —</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                    {t.subject?.name ? ` • ${t.subject.name}` : ""}
                    {t.classRoom?.name ? ` • ${t.classRoom.name}` : ""}
                  </option>
                ))}
              </select>
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

      {/* Loading state */}
      {loading || loadingMarks ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : !testInfo ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No exam selected"
          description="Choose an exam from the dropdown above to start entering marks."
        />
      ) : (
        <>
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
                label="Marks Entered"
                value={stats.entered}
                icon={Trophy}
                gradient="from-cyan-500 to-blue-600"
              />
              <StatCard
                label="Passed"
                value={stats.passed}
                icon={Award}
                gradient="from-emerald-500 to-teal-600"
              />
              <StatCard
                label="Failed"
                value={stats.failed}
                icon={XCircle}
                gradient="from-red-500 to-rose-600"
              />
            </div>
          </Reveal>

          {/* Marks Table */}
          <Reveal delay={0.15}>
            <SpotlightCard className="overflow-hidden p-0">
              <div className="border-b border-white/10 p-5 md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white md:text-2xl">
                      {testInfo.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Total: {testInfo.totalMarks} • Passing:{" "}
                      {testInfo.passingMarks} • Average: {stats.average}
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search student..."
                      className="modern-input w-full pl-11 md:w-64"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/[0.03]">
                      <tr>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          #
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Student
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Roll
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Marks
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Grade
                        </th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => {
                          const grade = getGrade(s.obtained);
                          return (
                            <tr
                              key={s.studentId}
                              className="border-b border-white/5 transition hover:bg-white/[0.03]"
                            >
                              <td className="px-4 py-4 text-sm font-black text-slate-500">
                                {idx + 1}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white">
                                    {s.studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-white">
                                    {s.studentName}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-400">
                                {s.rollNumber || "—"}
                              </td>

                              <td className="px-4 py-4">
                                <input
                                  type="number"
                                  min={0}
                                  max={testInfo.totalMarks}
                                  value={s.obtained}
                                  onChange={(e) =>
                                    updateMark(s.studentId, "obtained", e.target.value)
                                  }
                                  placeholder="—"
                                  className="modern-input w-24 py-2 text-center font-black"
                                />
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-block rounded-lg border px-3 py-1 text-xs font-black ${getGradeColor(
                                    grade
                                  )}`}
                                >
                                  {grade}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={s.remarks}
                                  onChange={(e) =>
                                    updateMark(s.studentId, "remarks", e.target.value)
                                  }
                                  placeholder="Optional remarks"
                                  className="modern-input py-2 text-sm"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end md:p-7">
                  <MagneticButton
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save All Marks
                      </>
                    )}
                  </MagneticButton>
                </div>
              </form>
            </SpotlightCard>
          </Reveal>
        </>
      )}
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
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <SpotlightCard className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 md:text-xs">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-black md:mt-2 md:text-3xl">
            <AnimatedCounter value={value} />
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur md:h-12 md:w-12 md:rounded-2xl">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </SpotlightCard>
  );
}
export default function MarksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A1628] text-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <MarksPageContent />
    </Suspense>
  );
}