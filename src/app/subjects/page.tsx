"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  Hash,
  Target,
  Award,
  TrendingUp,
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

type Subject = {
  id: string;
  name: string;
  code: string | null;
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
};

type SubjectForm = {
  name: string;
  code: string;
  totalMarks: string;
  passingMarks: string;
};

const emptyForm: SubjectForm = {
  name: "",
  code: "",
  totalMarks: "100",
  passingMarks: "40",
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

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<SubjectForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD ─────────
  async function loadSubjects() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/subjects", { cache: "no-store" });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load subjects.");

      // API returns { subjects: [...] }
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  // ───────── FORM ─────────
  function updateField<K extends keyof SubjectForm>(field: K, value: SubjectForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: Subject) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      code: item.code || "",
      totalMarks: String(item.totalMarks),
      passingMarks: String(item.passingMarks),
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // ───────── SUBMIT (CREATE + UPDATE) ─────────
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!form.name.trim()) throw new Error("Subject name is required.");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        totalMarks: Number(form.totalMarks || 100),
        passingMarks: Number(form.passingMarks || 40),
      };

      const url = editingId ? `/api/subjects/${editingId}` : "/api/subjects";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save subject.");

      setMessage(editingId ? "Subject updated." : "Subject created.");
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject.");
    } finally {
      setSaving(false);
    }
  }

  // ───────── DELETE ─────────
  async function deleteSubject(id: string) {
    const item = subjects.find((s) => s.id === id);
    const confirmed = window.confirm(
      `Delete "${item?.name || "this subject"}" permanently?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`/api/subjects/${id}`, {
        method: "DELETE",
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to delete subject.");

      setMessage("Subject deleted successfully.");
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject.");
    }
  }

  // ───────── FILTER ─────────
  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.code || "").toLowerCase().includes(query)
    );
  }, [subjects, search]);

  // ───────── STATS ─────────
  const stats = useMemo(() => {
    const total = subjects.length;
    const withCode = subjects.filter((s) => s.code).length;
    const avgTotal = total > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.totalMarks, 0) / total)
      : 0;
    const avgPassing = total > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.passingMarks, 0) / total)
      : 0;
    return { total, withCode, avgTotal, avgPassing };
  }, [subjects]);

  return (
    <DashboardLayout>
      {/* Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Academic Subjects
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Subjects
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Manage the subjects offered across classes, along with their
                total marks and passing criteria.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add Subject
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
            label="Total Subjects"
            value={stats.total}
            icon={BookMarked}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="With Codes"
            value={stats.withCode}
            icon={Hash}
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            label="Avg Total Marks"
            value={stats.avgTotal}
            icon={Target}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Avg Passing"
            value={stats.avgPassing}
            icon={Award}
            gradient="from-amber-500 to-orange-600"
          />
        </div>
      </Reveal>

      {/* Directory */}
      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Subject Directory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredSubjects.length} of {subjects.length} subjects
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subjects..."
                  className="modern-input w-full pl-11 md:w-64"
                />
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <EmptyState
                icon={<BookMarked className="h-8 w-8" />}
                title="No subjects yet"
                description="Add your first subject to get started."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Add Subject
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-400/20" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                          <BookMarked className="h-6 w-6" />
                        </div>

                        {item.code && (
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                            {item.code}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-5 text-lg font-black text-white">
                        {item.name}
                      </h4>

                      <div className="mt-4 space-y-2">
                        <InfoRow
                          icon={Target}
                          label="Total Marks"
                          value={String(item.totalMarks)}
                        />
                        <InfoRow
                          icon={Award}
                          label="Passing Marks"
                          value={String(item.passingMarks)}
                        />
                        <InfoRow
                          icon={TrendingUp}
                          label="Pass %"
                          value={`${Math.round(
                            (item.passingMarks / item.totalMarks) * 100
                          )}%`}
                        />
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-white/10 pt-5">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSubject(item.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0A1628]/95 shadow-2xl backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Edit Subject" : "New Subject"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Subject" : "Create Subject"}
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
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Subject Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => updateField("code", e.target.value)}
                    placeholder="e.g. MATH-101"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Total Marks <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.totalMarks}
                    onChange={(e) => updateField("totalMarks", e.target.value)}
                    placeholder="100"
                    className="modern-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Passing Marks <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.passingMarks}
                    onChange={(e) => updateField("passingMarks", e.target.value)}
                    placeholder="40"
                    className="modern-input"
                  />
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
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 font-black text-white shadow-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Subject"}
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