"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  UserCheck,
  UserX,
  Plus,
  X,
  Filter,
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

type Student = {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  fatherName: string | null;
  gender: string | null;
  rollNumber: string | null;
  contactNumber: string | null;
  address: string | null;
  status: string;
};

type StudentForm = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  dateOfBirth: string;
  gender: string;
  rollNumber: string;
  contactNumber: string;
  parentContact: string;
  address: string;
  emergencyContact: string;
  previousSchool: string;
};

const emptyForm: StudentForm = {
  studentId: "",
  admissionNumber: "",
  fullName: "",
  fatherName: "",
  motherName: "",
  guardianName: "",
  dateOfBirth: "",
  gender: "",
  rollNumber: "",
  contactNumber: "",
  parentContact: "",
  address: "",
  emergencyContact: "",
  previousSchool: "",
};

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: `Server returned invalid response (${response.status}).`,
    };
  }
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/students", { cache: "no-store" });
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load students.");
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function updateField(field: keyof StudentForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setEditingId(student.id);

    setForm({
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      fullName: student.fullName,
      fatherName: student.fatherName || "",
      motherName: "",
      guardianName: "",
      dateOfBirth: "",
      gender: student.gender || "",
      rollNumber: student.rollNumber || "",
      contactNumber: student.contactNumber || "",
      parentContact: "",
      address: student.address || "",
      emergencyContact: "",
      previousSchool: "",
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
      if (!form.studentId.trim()) throw new Error("Student ID is required.");
      if (!form.admissionNumber.trim())
        throw new Error("Admission number is required.");
      if (!form.fullName.trim()) throw new Error("Student name is required.");

      const response = await fetch("/api/students", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save student.");
      }

      setMessage(
        editingId
          ? "Student profile updated successfully."
          : "Student registered successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id: string) {
    const student = students.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Delete ${student?.fullName || "this student"} permanently?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete student.");
      }

      setMessage("Student deleted successfully.");
      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete student."
      );
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const searchableText = `
        ${student.fullName}
        ${student.studentId}
        ${student.admissionNumber}
        ${student.fatherName || ""}
        ${student.rollNumber || ""}
        ${student.contactNumber || ""}
      `.toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesGender =
        genderFilter === "ALL" ||
        (student.gender || "").toUpperCase() === genderFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (student.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [students, search, genderFilter, statusFilter]);

  const activeStudents = students.filter(
    (s) => (s.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const maleStudents = students.filter(
    (s) => (s.gender || "").toUpperCase() === "MALE"
  ).length;

  const femaleStudents = students.filter(
    (s) => (s.gender || "").toUpperCase() === "FEMALE"
  ).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Academic Records
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Student Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Manage student registrations, profiles, contact information,
                academic identity and enrollment records.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add New Student
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
            label="Total Students"
            value={students.length}
            icon={Users}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Active Students"
            value={activeStudents}
            icon={UserCheck}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Male Students"
            value={maleStudents}
            icon={GraduationCap}
            gradient="from-violet-500 to-indigo-600"
          />
          <StatCard
            label="Female Students"
            value={femaleStudents}
            icon={UserX}
            gradient="from-pink-500 to-rose-600"
          />
        </div>
      </Reveal>

      {/* Directory */}
      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          {/* Toolbar */}
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Student Directory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredStudents.length} of {students.length} students
                  displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="modern-input w-full pl-11 md:w-72"
                  />
                </div>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-8 w-8" />}
                title="No students found"
                description="Try changing your search/filter or register a new student."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Register Student
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    onEdit={openEditForm}
                    onDelete={deleteStudent}
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
          <div className="my-8 w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0A1628]/95 shadow-2xl backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Profile Editor" : "New Registration"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Student" : "Register New Student"}
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
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field
                  label="Student ID"
                  required
                  value={form.studentId}
                  onChange={(v) => updateField("studentId", v)}
                  placeholder="STU-001"
                />
                <Field
                  label="Admission Number"
                  required
                  value={form.admissionNumber}
                  onChange={(v) => updateField("admissionNumber", v)}
                  placeholder="ADM-2026-001"
                />
                <Field
                  label="Full Name"
                  required
                  value={form.fullName}
                  onChange={(v) => updateField("fullName", v)}
                  placeholder="Student full name"
                />
                <Field
                  label="Father Name"
                  value={form.fatherName}
                  onChange={(v) => updateField("fatherName", v)}
                  placeholder="Father name"
                />
                <Field
                  label="Mother Name"
                  value={form.motherName}
                  onChange={(v) => updateField("motherName", v)}
                  placeholder="Mother name"
                />
                <Field
                  label="Guardian Name"
                  value={form.guardianName}
                  onChange={(v) => updateField("guardianName", v)}
                  placeholder="Guardian name"
                />
                <Field
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(v) => updateField("dateOfBirth", v)}
                />
                <SelectField
                  label="Gender"
                  value={form.gender}
                  onChange={(v) => updateField("gender", v)}
                  options={[
                    ["", "Select gender"],
                    ["MALE", "Male"],
                    ["FEMALE", "Female"],
                    ["OTHER", "Other"],
                  ]}
                />
                <Field
                  label="Roll Number"
                  value={form.rollNumber}
                  onChange={(v) => updateField("rollNumber", v)}
                  placeholder="Roll number"
                />
                <Field
                  label="Student Contact"
                  value={form.contactNumber}
                  onChange={(v) => updateField("contactNumber", v)}
                  placeholder="03XX-XXXXXXX"
                />
                <Field
                  label="Parent Contact"
                  value={form.parentContact}
                  onChange={(v) => updateField("parentContact", v)}
                  placeholder="03XX-XXXXXXX"
                />
                <Field
                  label="Emergency Contact"
                  value={form.emergencyContact}
                  onChange={(v) => updateField("emergencyContact", v)}
                  placeholder="Emergency contact"
                />
                <Field
                  label="Previous School"
                  value={form.previousSchool}
                  onChange={(v) => updateField("previousSchool", v)}
                  placeholder="Previous school"
                />
                <div className="md:col-span-2 lg:col-span-3">
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
                    : "Register Student"}
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
// HELPER COMPONENTS
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

function StudentCard({
  student,
  index,
  onEdit,
  onDelete,
}: {
  student: Student;
  index: number;
  onEdit: (s: Student) => void;
  onDelete: (id: string) => void;
}) {
  const status = (student.status || "").toUpperCase();
  const isActive = status === "ACTIVE";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05] md:p-6">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 via-cyan-400 to-violet-500 opacity-0 transition group-hover:opacity-100" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-black text-white shadow-lg shadow-indigo-500/30">
            {student.fullName.trim().charAt(0).toUpperCase()}
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-600 shadow">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-black text-white md:text-xl">
                {student.fullName}
              </h4>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                  isActive
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {student.status || "UNKNOWN"}
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-400">
              ID: {student.studentId || "—"} • Admission:{" "}
              {student.admissionNumber || "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {student.gender || "Gender not specified"} • Roll No:{" "}
              {student.rollNumber || "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoPill label="Father" value={student.fatherName || "Not provided"} />
          <InfoPill
            label="Contact"
            value={student.contactNumber || "Not provided"}
          />
          <InfoPill label="Address" value={student.address || "Not provided"} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(student.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-300">{value}</p>
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