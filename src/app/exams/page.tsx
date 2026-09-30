"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  X,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Trophy,
  Clock,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

type Test = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  totalMarks: number;
  passingMarks: number;
  testDate: string;
  startTime: string | null;
  durationMinutes: number | null;
  isPublished: boolean;
  classRoom?: { name: string } | null;
  subject?: { name: string } | null;
  teacher?: { name: string } | null;
};

type TestForm = {
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  totalMarks: string;
  passingMarks: string;
  testDate: string;
  startTime: string;
  durationMinutes: string;
  isPublished: boolean;
};

const emptyForm: TestForm = {
  title: "",
  description: "",
  type: "EXAM",
  classId: "",
  subjectId: "",
  teacherId: "",
  totalMarks: "100",
  passingMarks: "33",
  testDate: "",
  startTime: "",
  durationMinutes: "",
  isPublished: false,
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

export default function ExamsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [form, setForm] = useState<TestForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD ─────────
  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [testsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        fetch("/api/tests", { cache: "no-store" }),
        fetch("/api/classes", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
        fetch("/api/teachers", { cache: "no-store" }),
      ]);

      const testsData = await safeJson(testsRes);
      const classesData = await safeJson(classesRes);
      const subjectsData = await safeJson(subjectsRes);
      const teachersData = await safeJson(teachersRes);

      setTests(Array.isArray(testsData) ? testsData : []);
      setClasses(
        Array.isArray(classesData)
          ? classesData
          : Array.isArray(classesData.classes)
          ? classesData.classes
          : []
      );
      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : Array.isArray(subjectsData.subjects)
          ? subjectsData.subjects
          : []
      );
      setTeachers(
        Array.isArray(teachersData)
          ? teachersData
          : Array.isArray(teachersData.teachers)
          ? teachersData.teachers
          : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // ───────── FORM ─────────
  function updateField<K extends keyof TestForm>(field: K, value: TestForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!form.title.trim()) throw new Error("Title is required.");
      if (!form.classId) throw new Error("Please select a class.");
      if (!form.subjectId) throw new Error("Please select a subject.");
      if (!form.teacherId) throw new Error("Please select a teacher.");
      if (!form.testDate) throw new Error("Test date is required.");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type || "EXAM",
        classId: form.classId,
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        testDate: form.testDate,
        startTime: form.startTime || null,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : null,
        isPublished: form.isPublished,
      };

      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to create exam.");

      setMessage("Exam created successfully.");
      setForm(emptyForm);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save exam.");
    } finally {
      setSaving(false);
    }
  }

  // ───────── FILTER ─────────
  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tests.filter((t) => {
      const searchable = `${t.title} ${t.classRoom?.name || ""} ${t.subject?.name || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesType = typeFilter === "ALL" || t.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [tests, search, typeFilter]);

  const stats = useMemo(() => {
    const total = tests.length;
    const published = tests.filter((t) => t.isPublished).length;
    const upcoming = tests.filter(
      (t) => new Date(t.testDate) > new Date()
    ).length;
    return { total, published, upcoming };
  }, [tests]);

  return (
    <DashboardLayout>
      {/* Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Examinations
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Exams & Tests
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Create, schedule and publish exams for every class and subject.
                Enter marks directly from each exam card.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Create Exam
            </MagneticButton>
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
            label="Total Exams"
            value={stats.total}
            icon={FileText}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={Trophy}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={Clock}
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            label="This Month"
            value={tests.filter((t) => {
              const d = new Date(t.testDate);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length}
            icon={CalendarDays}
            gradient="from-amber-500 to-orange-600"
          />
        </div>
      </Reveal>

      {/* List */}
      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Exam Schedule
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredTests.length} of {tests.length} exams displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search exams..."
                    className="modern-input w-full pl-11 md:w-64"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Types</option>
                  <option value="EXAM">Exam</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="TEST">Test</option>
                  <option value="ASSIGNMENT">Assignment</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-56 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredTests.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No exams yet"
                description="Create your first exam to get started."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Create Exam
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            )}
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-8 w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0A1628]/95 shadow-2xl backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    New Examination
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    Create Exam
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Title"
                    required
                    value={form.title}
                    onChange={(v) => updateField("title", v)}
                    placeholder="Mid Term Mathematics"
                  />
                </div>

                <SelectField
                  label="Type"
                  value={form.type}
                  onChange={(v) => updateField("type", v)}
                  options={[
                    ["EXAM", "Exam"],
                    ["QUIZ", "Quiz"],
                    ["TEST", "Test"],
                    ["ASSIGNMENT", "Assignment"],
                  ]}
                />

                <SelectField
                  label="Class"
                  required
                  value={form.classId}
                  onChange={(v) => updateField("classId", v)}
                  options={[
                    ["", "Select class"],
                    ...classes.map((c) => [c.id, c.name]),
                  ]}
                />

                <SelectField
                  label="Subject"
                  required
                  value={form.subjectId}
                  onChange={(v) => updateField("subjectId", v)}
                  options={[
                    ["", "Select subject"],
                    ...subjects.map((s) => [s.id, s.name]),
                  ]}
                />

                <SelectField
                  label="Teacher"
                  required
                  value={form.teacherId}
                  onChange={(v) => updateField("teacherId", v)}
                  options={[
                    ["", "Select teacher"],
                    ...teachers.map((t) => [t.id, t.name]),
                  ]}
                />

                <Field
                  label="Total Marks"
                  required
                  type="number"
                  value={form.totalMarks}
                  onChange={(v) => updateField("totalMarks", v)}
                  placeholder="100"
                />

                <Field
                  label="Passing Marks"
                  required
                  type="number"
                  value={form.passingMarks}
                  onChange={(v) => updateField("passingMarks", v)}
                  placeholder="33"
                />

                <Field
                  label="Exam Date"
                  required
                  type="date"
                  value={form.testDate}
                  onChange={(v) => updateField("testDate", v)}
                />

                <Field
                  label="Start Time"
                  type="time"
                  value={form.startTime}
                  onChange={(v) => updateField("startTime", v)}
                />

                <Field
                  label="Duration (minutes)"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(v) => updateField("durationMinutes", v)}
                  placeholder="90"
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    placeholder="Exam description, syllabus, or instructions"
                    className="modern-textarea resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => updateField("isPublished", e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 accent-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-300">
                      Publish immediately (visible to students)
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <MagneticButton
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Exam"}
                </MagneticButton>
              </div>
            </form>
          </div>
        </div>
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

function TestCard({ test }: { test: Test }) {
  const testDate = new Date(test.testDate);
  const isUpcoming = testDate > new Date();
  const isPublished = test.isPublished;

  const formattedDate = testDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-400/20" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <FileText className="h-7 w-7" />
          </div>

          <div className="flex flex-col items-end gap-1">
            {isPublished ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Published
              </span>
            ) : (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                Draft
              </span>
            )}

            {isUpcoming && (
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Upcoming
              </span>
            )}
          </div>
        </div>

        <h4 className="mt-5 line-clamp-2 text-lg font-black text-white">
          {test.title}
        </h4>

        {test.description && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
            {test.description}
          </p>
        )}

        <div className="mt-5 space-y-2.5">
          <InfoRow
            icon={BookOpen}
            label="Subject"
            value={test.subject?.name || "—"}
          />
          <InfoRow
            icon={GraduationCap}
            label="Class"
            value={test.classRoom?.name || "—"}
          />
          <InfoRow
            icon={CalendarDays}
            label="Date"
            value={formattedDate}
          />
          <InfoRow
            icon={Trophy}
            label="Marks"
            value={`${test.passingMarks} / ${test.totalMarks}`}
          />
        </div>

        <Link
          href={`/marks?testId=${test.id}`}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-white"
        >
          <Eye className="h-4 w-4" />
          Enter Marks
        </Link>
      </div>
    </article>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03]">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="truncate font-bold text-slate-300">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="modern-input"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="modern-select"
      >
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}