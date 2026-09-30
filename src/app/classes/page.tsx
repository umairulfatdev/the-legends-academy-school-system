"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  Users,
  GraduationCap,
  Hash,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

type ClassRoom = {
  id: string;
  name: string;
  section: string | null;
  roomNumber: string | null;
  capacity: number | null;
  teacherId: string | null;
  status: string;
};

type ClassForm = {
  name: string;
  section: string;
  roomNumber: string;
  capacity: string;
  classTeacher: string;
  academicYear: string;
};

const emptyForm: ClassForm = {
  name: "",
  section: "",
  roomNumber: "",
  capacity: "",
  classTeacher: "",
  academicYear: "",
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Server returned invalid response (${response.status}).` };
  }
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [form, setForm] = useState<ClassForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadClasses() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/classes", { cache: "no-store" });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load classes.");
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  function updateField(field: keyof ClassForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: ClassRoom) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      section: item.section || "",
      roomNumber: item.roomNumber || "",
      capacity: item.capacity ? String(item.capacity) : "",
      classTeacher: item.teacherId || "",
      academicYear: "",
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!form.name.trim()) throw new Error("Class name is required.");

      const payload = {
        name: form.name,
        section: form.section,
        roomNumber: form.roomNumber,
        capacity: form.capacity ? Number(form.capacity) : null,
        teacherId: form.classTeacher || null,
      };

      const response = await fetch("/api/classes", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save class.");

      setMessage(
        editingId ? "Class updated successfully." : "Class created successfully."
      );
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save class.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteClass(id: string) {
    const item = classes.find((c) => c.id === id);
    const confirmed = window.confirm(
      `Delete ${item?.name || "this class"} permanently?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      const response = await fetch("/api/classes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to delete class.");
      setMessage("Class deleted successfully.");
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class.");
    }
  }

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return classes.filter((item) => {
      const searchable = `${item.name} ${item.section || ""} ${item.roomNumber || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesSection =
        sectionFilter === "ALL" || (item.section || "") === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [classes, search, sectionFilter]);

  const totalCapacity = classes.reduce(
    (sum, c) => sum + (c.capacity || 0),
    0
  );

  const sections = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.section) set.add(c.section);
    });
    return Array.from(set);
  }, [classes]);

  return (
    <DashboardLayout>
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Academic Structure
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Classes & Sections
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Manage classrooms, sections, room allocations and academic
                structure in one connected system.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add New Class
            </MagneticButton>
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

      {message && (
        <Reveal>
          <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 font-semibold text-emerald-300 backdrop-blur">
            ✓ {message}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Classes"
            value={classes.length}
            icon={BookOpen}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Sections"
            value={sections.length}
            icon={Hash}
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            label="Total Capacity"
            value={totalCapacity}
            icon={Users}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Academic Year"
            value={new Date().getFullYear()}
            icon={GraduationCap}
            gradient="from-amber-500 to-orange-600"
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Class Directory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredClasses.length} of {classes.length} classes displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search classes..."
                    className="modern-input w-full pl-11 md:w-72"
                  />
                </div>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Sections</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-52 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No classes found"
                description="Try changing your search/filter or create a new class."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Create Class
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map((item) => (
                  <ClassCard
                    key={item.id}
                    item={item}
                    onEdit={openEditForm}
                    onDelete={deleteClass}
                  />
                ))}
              </div>
            )}
          </div>
        </SpotlightCard>
      </Reveal>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-8 w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0A1628]/95 shadow-2xl backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Class Editor" : "New Classroom"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Class" : "Create New Class"}
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
                <Field
                  label="Class Name"
                  required
                  value={form.name}
                  onChange={(v) => updateField("name", v)}
                  placeholder="Class 10"
                />
                <Field
                  label="Section"
                  value={form.section}
                  onChange={(v) => updateField("section", v)}
                  placeholder="A"
                />
                <Field
                  label="Room Number"
                  value={form.roomNumber}
                  onChange={(v) => updateField("roomNumber", v)}
                  placeholder="R-101"
                />
                <Field
                  label="Capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(v) => updateField("capacity", v)}
                  placeholder="40"
                />
                <Field
                  label="Class Teacher"
                  value={form.classTeacher}
                  onChange={(v) => updateField("classTeacher", v)}
                  placeholder="Teacher name"
                />
                <Field
                  label="Academic Year"
                  value={form.academicYear}
                  onChange={(v) => updateField("academicYear", v)}
                  placeholder="2026"
                />
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
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Class"}
                </MagneticButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

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
    <SpotlightCard className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black">
            <AnimatedCounter value={value} />
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </SpotlightCard>
  );
}

function ClassCard({
  item,
  onEdit,
  onDelete,
}: {
  item: ClassRoom;
  onEdit: (c: ClassRoom) => void;
  onDelete: (id: string) => void;
}) {
  const isActive = (item.status || "").toUpperCase() === "ACTIVE";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05]">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-400/20" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-violet-500/30">
            {item.name.replace(/[^0-9]/g, "").slice(0, 2) || "CL"}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              isActive
                ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            {item.status || "ACTIVE"}
          </span>
        </div>

        <h4 className="mt-5 text-2xl font-black text-white">
          {item.name}
          {item.section && (
            <span className="ml-2 text-lg font-bold text-cyan-400">
              • {item.section}
            </span>
          )}
        </h4>

        <div className="mt-5 space-y-2.5">
          {item.roomNumber && (
            <InfoRow icon={Hash} label="Room" value={item.roomNumber} />
          )}
          <InfoRow
            icon={Users}
            label="Capacity"
            value={item.capacity ? `${item.capacity} students` : "Not set"}
          />
        </div>

        <div className="mt-5 flex gap-2 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
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