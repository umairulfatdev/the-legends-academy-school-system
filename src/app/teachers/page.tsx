"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  Plus,
  X,
  Mail,
  Phone,
  Award,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

// ─────────────────────────────────────────
// TYPES (exact API match)
// ─────────────────────────────────────────

type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  qualification: string | null;
  contactNumber: string | null;
  email: string | null;
  address: string | null;
  joiningDate: string | null;
  employmentStatus: string;
};

type TeacherForm = {
  teacherId: string;
  name: string;
  qualification: string;
  contactNumber: string;
  email: string;
  address: string;
  joiningDate: string;
  employmentStatus: string;
};

const emptyForm: TeacherForm = {
  teacherId: "",
  name: "",
  qualification: "",
  contactNumber: "",
  email: "",
  address: "",
  joiningDate: "",
  employmentStatus: "ACTIVE",
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

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<TeacherForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD ─────────
  async function loadTeachers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/teachers", { cache: "no-store" });
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load teachers.");
      }

      // API returns { teachers: [...] }
      setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  // ───────── FORM ─────────
  function updateField(field: keyof TeacherForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({
      teacherId: teacher.teacherId,
      name: teacher.name,
      qualification: teacher.qualification || "",
      contactNumber: teacher.contactNumber || "",
      email: teacher.email || "",
      address: teacher.address || "",
      joiningDate: teacher.joiningDate
        ? teacher.joiningDate.slice(0, 10)
        : "",
      employmentStatus: teacher.employmentStatus || "ACTIVE",
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

  // ───────── SUBMIT ─────────
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      // Validation matching API
      if (!form.teacherId.trim()) throw new Error("Teacher ID is required.");
      if (!form.name.trim()) throw new Error("Teacher name is required.");

      const payload = {
        teacherId: form.teacherId.trim(),
        name: form.name.trim(),
        qualification: form.qualification.trim() || null,
        contactNumber: form.contactNumber.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        joiningDate: form.joiningDate || null,
        employmentStatus: form.employmentStatus || "ACTIVE",
      };

      const response = await fetch("/api/teachers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save teacher.");
      }

      setMessage(
        editingId
          ? "Teacher updated successfully."
          : "Teacher registered successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save teacher.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeacher(id: string) {
    const teacher = teachers.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Delete ${teacher?.name || "this teacher"} permanently?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/teachers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to delete teacher.");

      setMessage("Teacher deleted successfully.");
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete teacher.");
    }
  }

  // ───────── FILTER ─────────
  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const searchable = `
        ${teacher.name}
        ${teacher.teacherId}
        ${teacher.email || ""}
        ${teacher.contactNumber || ""}
        ${teacher.qualification || ""}
      `.toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus =
        statusFilter === "ALL" ||
        (teacher.employmentStatus || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const activeTeachers = teachers.filter(
    (t) => (t.employmentStatus || "").toUpperCase() === "ACTIVE"
  ).length;

  return (
    <DashboardLayout>
      {/* Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Faculty Management
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Our Teachers
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Manage teaching staff, qualifications and academic
                responsibilities from one connected platform.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add New Teacher
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
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Teachers"
            value={teachers.length}
            icon={Users}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Active"
            value={activeTeachers}
            icon={Award}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Inactive"
            value={teachers.length - activeTeachers}
            icon={GraduationCap}
            gradient="from-rose-500 to-pink-600"
          />
          <StatCard
            label="Faculty Size"
            value={teachers.length}
            icon={GraduationCap}
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
                  Faculty Directory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredTeachers.length} of {teachers.length} teachers displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search teachers..."
                    className="modern-input w-full pl-11 md:w-72"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="RESIGNED">Resigned</option>
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
                    className="h-56 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredTeachers.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-8 w-8" />}
                title="No teachers found"
                description="Try changing your search/filter or add a new teacher."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Add Teacher
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onEdit={openEditForm}
                    onDelete={deleteTeacher}
                  />
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
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Faculty Editor" : "New Teacher"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Teacher" : "Register New Teacher"}
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
                  label="Teacher ID"
                  required
                  value={form.teacherId}
                  onChange={(v) => updateField("teacherId", v)}
                  placeholder="TCH-001"
                />
                <Field
                  label="Full Name"
                  required
                  value={form.name}
                  onChange={(v) => updateField("name", v)}
                  placeholder="Teacher full name"
                />
                <Field
                  label="Qualification"
                  value={form.qualification}
                  onChange={(v) => updateField("qualification", v)}
                  placeholder="M.Sc, B.Ed"
                />
                <Field
                  label="Contact Number"
                  value={form.contactNumber}
                  onChange={(v) => updateField("contactNumber", v)}
                  placeholder="03XX-XXXXXXX"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  placeholder="teacher@school.com"
                />
                <Field
                  label="Joining Date"
                  type="date"
                  value={form.joiningDate}
                  onChange={(v) => updateField("joiningDate", v)}
                />
                <SelectField
                  label="Employment Status"
                  value={form.employmentStatus}
                  onChange={(v) => updateField("employmentStatus", v)}
                  options={[
                    ["ACTIVE", "Active"],
                    ["INACTIVE", "Inactive"],
                    ["ON_LEAVE", "On Leave"],
                    ["RESIGNED", "Resigned"],
                  ]}
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={3}
                    placeholder="Complete residential address"
                    className="modern-textarea resize-none"
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
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Register Teacher"}
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

function TeacherCard({
  teacher,
  onEdit,
  onDelete,
}: {
  teacher: Teacher;
  onEdit: (t: Teacher) => void;
  onDelete: (id: string) => void;
}) {
  const isActive = (teacher.employmentStatus || "").toUpperCase() === "ACTIVE";

  const initials = teacher.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinedDate = teacher.joiningDate
    ? new Date(teacher.joiningDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-400/20" />

      <div className="relative">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="gradient-ring">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A1628] text-xl font-black text-white">
              {initials || "T"}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-lg font-black text-white">
              {teacher.name}
            </h4>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
              {teacher.qualification || "Faculty Member"}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                isActive
                  ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              {teacher.employmentStatus || "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-5 space-y-2.5">
          <InfoRow icon={GraduationCap} label="ID" value={teacher.teacherId} />
          {teacher.email && (
            <InfoRow icon={Mail} label="Email" value={teacher.email} />
          )}
          {teacher.contactNumber && (
            <InfoRow icon={Phone} label="Phone" value={teacher.contactNumber} />
          )}
          {joinedDate && (
            <InfoRow icon={CalendarDays} label="Joined" value={joinedDate} />
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => onEdit(teacher)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(teacher.id)}
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-300">
        {label}
      </label>
      <select
        value={value}
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