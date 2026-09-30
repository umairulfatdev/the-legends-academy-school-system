"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  X,
  Search,
  Pencil,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

type FeeType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

type FeeTypeForm = {
  name: string;
  description: string;
  isActive: boolean;
};

const emptyForm: FeeTypeForm = {
  name: "",
  description: "",
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

export default function FeeTypesPage() {
  const [types, setTypes] = useState<FeeType[]>([]);
  const [form, setForm] = useState<FeeTypeForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ───────── LOAD ─────────
  async function loadTypes() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/fee-types", { cache: "no-store" });
      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to load fee types.");
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fee types.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTypes();
  }, []);

  // ───────── FORM ─────────
  function updateField<K extends keyof FeeTypeForm>(field: K, value: FeeTypeForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(item: FeeType) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
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

  // ───────── SAVE (CREATE + UPDATE) ─────────
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!form.name.trim()) throw new Error("Fee type name is required.");

      // ✅ KEY FIX — editingId ho to PUT, warna POST
      const response = await fetch("/api/fee-types", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                name: form.name.trim(),
                description: form.description.trim() || null,
                isActive: form.isActive,
              }
            : {
                name: form.name.trim(),
                description: form.description.trim() || null,
                isActive: form.isActive,
              }
        ),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save fee type.");

      setMessage(editingId ? "Fee type updated." : "Fee type created.");
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fee type.");
    } finally {
      setSaving(false);
    }
  }

  // ───────── DELETE ─────────
  async function deleteFeeType(id: string) {
    const item = types.find((t) => t.id === id);
    const confirmed = window.confirm(
      `Delete "${item?.name || "this fee type"}" permanently?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/fee-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to delete fee type.");

      setMessage("Fee type deleted successfully.");
      await loadTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fee type.");
    }
  }

  // ───────── FILTER ─────────
  const filteredTypes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return types;
    return types.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t.description || "").toLowerCase().includes(query)
    );
  }, [types, search]);

  const activeCount = types.filter((t) => t.isActive).length;

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
                Fee Types
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Define categories of fees — tuition, transport, exam, library,
                sports and more.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add Fee Type
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
            label="Total Types"
            value={types.length}
            icon={Wallet}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Inactive"
            value={types.length - activeCount}
            icon={XCircle}
            gradient="from-rose-500 to-pink-600"
          />
          <StatCard
            label="Categories"
            value={types.length}
            icon={Tag}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Fee Categories
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredTypes.length} of {types.length} types
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fee types..."
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
                    className="h-40 animate-pulse rounded-3xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredTypes.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-8 w-8" />}
                title="No fee types yet"
                description="Create your first fee category to get started."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Add Fee Type
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTypes.map((item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-400/20" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                          <Tag className="h-6 w-6" />
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
                        {item.name}
                      </h4>

                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                        {item.description || "No description"}
                      </p>

                      {/* ✅ Edit + Delete Buttons */}
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
                          onClick={() => deleteFeeType(item.id)}
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

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0A1628]/95 shadow-2xl backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    {editingId ? "Edit Category" : "New Category"}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    {editingId ? "Update Fee Type" : "Create Fee Type"}
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
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Fee Type Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Tuition Fee"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                    placeholder="Optional description"
                    className="modern-textarea resize-none"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-white/5 accent-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-300">
                    Active (visible for fee structures)
                  </span>
                </label>
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
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Type"}
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