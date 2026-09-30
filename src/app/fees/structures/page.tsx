"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Layers,
  Plus,
  X,
  Search,
  Pencil,
  CalendarDays,
  Wallet,
  GraduationCap,
  DollarSign,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

type FeeType = { id: string; name: string };
type ClassRoom = { id: string; name: string };

type FeeStructure = {
  id: string;
  feeTypeId: string;
  classId: string | null;
  amount: string | number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  feeType: FeeType;
  classRoom: ClassRoom | null;
};

type StructureForm = {
  feeTypeId: string;
  classId: string;
  amount: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: StructureForm = {
  feeTypeId: "",
  classId: "",
  amount: "",
  effectiveFrom: today,
  effectiveTo: "",
  isActive: true,
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

export default function FeeStructuresPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  const [form, setForm] = useState<StructureForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [structRes, typesRes, classesRes] = await Promise.all([
        fetch("/api/fee-structures", { cache: "no-store" }),
        fetch("/api/fee-types", { cache: "no-store" }),
        fetch("/api/classes", { cache: "no-store" }),
      ]);

      const structData = await safeJson(structRes);
      const typesData = await safeJson(typesRes);
      const classesData = await safeJson(classesRes);

      setStructures(Array.isArray(structData) ? structData : []);
      setFeeTypes(Array.isArray(typesData) ? typesData : []);
      setClasses(
        Array.isArray(classesData)
          ? classesData
          : Array.isArray(classesData.classes)
          ? classesData.classes
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

  function updateField<K extends keyof StructureForm>(
    field: K,
    value: StructureForm[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: FeeStructure) {
    setEditingId(item.id);
    setForm({
      feeTypeId: item.feeTypeId,
      classId: item.classId || "",
      amount: String(item.amount),
      effectiveFrom: item.effectiveFrom.slice(0, 10),
      effectiveTo: item.effectiveTo ? item.effectiveTo.slice(0, 10) : "",
      isActive: item.isActive,
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
      if (!form.feeTypeId) throw new Error("Please select a fee type.");
      if (!form.amount || Number(form.amount) < 0)
        throw new Error("Amount must be a valid number.");
      if (!form.effectiveFrom) throw new Error("Effective from date is required.");

      const response = await fetch("/api/fee-structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeTypeId: form.feeTypeId,
          classId: form.classId || null,
          amount: Number(form.amount),
          effectiveFrom: form.effectiveFrom,
          effectiveTo: form.effectiveTo || null,
          isActive: form.isActive,
        }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save structure.");

      setMessage("Fee structure saved successfully.");
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save structure.");
    } finally {
      setSaving(false);
    }
  }

  const filteredStructures = useMemo(() => {
    const query = search.trim().toLowerCase();
    return structures.filter((s) => {
      const searchable = `${s.feeType?.name || ""} ${s.classRoom?.name || ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesClass =
        classFilter === "ALL" || (s.classId || "") === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [structures, search, classFilter]);

  const totalAmount = structures.reduce(
    (sum, s) => sum + Number(s.amount || 0),
    0
  );

  const activeCount = structures.filter((s) => s.isActive).length;

  return (
    <DashboardLayout>
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Fee Configuration
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Fee Structures
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Assign fee amounts to classes for each fee type — tuition,
                transport, exam and more.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add Structure
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
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Structures"
            value={structures.length}
            icon={Layers}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={Wallet}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Fee Types"
            value={feeTypes.length}
            icon={GraduationCap}
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            label="Classes"
            value={classes.length}
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
                  Fee Structure Directory
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredStructures.length} of {structures.length} entries
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="modern-input w-full pl-11 md:w-64"
                  />
                </div>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
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
                    className="h-40 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredStructures.length === 0 ? (
              <EmptyState
                icon={<Layers className="h-8 w-8" />}
                title="No fee structures yet"
                description="Add your first fee structure to get started."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Add Structure
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStructures.map((item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-400/20" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                          <DollarSign className="h-6 w-6" />
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            item.isActive
                              ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                              : "border border-white/10 bg-white/5 text-slate-400"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <h4 className="mt-5 text-lg font-black text-white">
                        {item.feeType?.name || "Fee"}
                      </h4>

                      <p className="mt-1 text-xs text-cyan-400">
                        {item.classRoom?.name || "All Classes"}
                      </p>

                      <p className="mt-4 text-2xl font-black text-white">
                        Rs. {Number(item.amount).toLocaleString()}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        From {new Date(item.effectiveFrom).toLocaleDateString("en-GB")}
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
                      </div>
                    </div>
                  </article>
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
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Edit Structure" : "New Structure"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Fee Structure" : "Create Fee Structure"}
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
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Fee Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.feeTypeId}
                    onChange={(e) => updateField("feeTypeId", e.target.value)}
                    className="modern-select"
                    required
                  >
                    <option value="">Select fee type</option>
                    {feeTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Class
                  </label>
                  <select
                    value={form.classId}
                    onChange={(e) => updateField("classId", e.target.value)}
                    className="modern-select"
                  >
                    <option value="">All classes (global)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Amount (Rs.) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    placeholder="5000"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Effective From <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.effectiveFrom}
                    onChange={(e) => updateField("effectiveFrom", e.target.value)}
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Effective To
                  </label>
                  <input
                    type="date"
                    value={form.effectiveTo}
                    onChange={(e) => updateField("effectiveTo", e.target.value)}
                    className="modern-input"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => updateField("isActive", e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 accent-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-300">Active</span>
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
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 font-black text-white shadow-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Structure"}
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