"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  X,
  Search,
  Receipt,
  TrendingUp,
  DollarSign,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

type Collection = {
  id: string;
  studentId: string;
  studentName: string;
  feeTypeId: string;
  feeTypeName: string;
  month: string;
  amountDue: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  receiptNo: string;
};

type Student = { id: string; fullName: string; studentId: string };
type FeeType = { id: string; name: string };

type CollectionForm = {
  studentId: string;
  feeTypeId: string;
  month: string;
  amountDue: string;
  paidAmount: string;
  paymentDate: string;
  paymentMethod: string;
};

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);

const emptyForm: CollectionForm = {
  studentId: "",
  feeTypeId: "",
  month: `${currentMonth}-01`,
  amountDue: "",
  paidAmount: "",
  paymentDate: today,
  paymentMethod: "CASH",
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

export default function FeeCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [colRes, stuRes, typeRes] = await Promise.all([
        fetch("/api/fee-collections", { cache: "no-store" }),
        fetch("/api/students", { cache: "no-store" }),
        fetch("/api/fee-types", { cache: "no-store" }),
      ]);

      const colData = await safeJson(colRes);
      const stuData = await safeJson(stuRes);
      const typeData = await safeJson(typeRes);

      setCollections(Array.isArray(colData) ? colData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
      setFeeTypes(Array.isArray(typeData) ? typeData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateField<K extends keyof CollectionForm>(
    field: K,
    value: CollectionForm[K]
  ) {
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
      if (!form.studentId) throw new Error("Please select a student.");
      if (!form.feeTypeId) throw new Error("Please select a fee type.");
      if (!form.month) throw new Error("Fee month is required.");
      if (!form.amountDue) throw new Error("Amount due is required.");

      const response = await fetch("/api/fee-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          feeTypeId: form.feeTypeId,
          month: form.month,
          amountDue: Number(form.amountDue),
          paidAmount: Number(form.paidAmount || 0),
          paymentDate: form.paymentDate,
          paymentMethod: form.paymentMethod,
        }),
      });

      const data = await safeJson(response);
      if (!response.ok) throw new Error(data.error || "Failed to save payment.");

      setMessage("Fee payment recorded successfully.");
      setForm(emptyForm);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment.");
    } finally {
      setSaving(false);
    }
  }

  const filteredCollections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return collections.filter((c) => {
      const searchable = `${c.studentName} ${c.receiptNo} ${c.feeTypeName}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [collections, search, statusFilter]);

  const stats = useMemo(() => {
    const total = collections.length;
    const totalCollected = collections.reduce(
      (sum, c) => sum + Number(c.paidAmount || 0),
      0
    );
    const totalPending = collections.reduce(
      (sum, c) => sum + Number(c.remainingAmount || 0),
      0
    );
    const paidCount = collections.filter((c) => c.status === "SUCCESS").length;
    return { total, totalCollected, totalPending, paidCount };
  }, [collections]);

  return (
    <DashboardLayout>
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                Payment Records
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Fee Collections
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
                Record student payments, generate receipts and track pending
                balances.
              </p>
            </div>

            <MagneticButton
              onClick={openAddForm}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#0A1628] shadow-xl transition hover:shadow-2xl"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Record Payment
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
            label="Total Payments"
            value={stats.total}
            icon={Receipt}
            gradient="from-indigo-500 to-indigo-700"
          />
          <StatCard
            label="Collected"
            value={Math.round(stats.totalCollected)}
            icon={TrendingUp}
            gradient="from-emerald-500 to-teal-600"
            prefix="Rs "
          />
          <StatCard
            label="Pending"
            value={Math.round(stats.totalPending)}
            icon={DollarSign}
            gradient="from-amber-500 to-orange-600"
            prefix="Rs "
          />
          <StatCard
            label="Paid Count"
            value={stats.paidCount}
            icon={Wallet}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <SpotlightCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5 md:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  Payment History
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredCollections.length} of {collections.length} payments
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="modern-select md:w-auto"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : filteredCollections.length === 0 ? (
              <EmptyState
                icon={<Receipt className="h-8 w-8" />}
                title="No payments yet"
                description="Record your first fee payment to get started."
                action={
                  <MagneticButton
                    onClick={openAddForm}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg"
                  >
                    + Record Payment
                  </MagneticButton>
                }
              />
            ) : (
              <div className="grid gap-3">
                {filteredCollections.map((c) => (
                  <article
                    key={c.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                          <Receipt className="h-6 w-6" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-white">
                              {c.studentName}
                            </h4>
                            <StatusBadge status={c.status} />
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {c.receiptNo} • {c.feeTypeName || "Fee"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 lg:flex lg:items-center lg:gap-6">
                        <InfoPill label="Due" value={`Rs ${c.amountDue}`} />
                        <InfoPill
                          label="Paid"
                          value={`Rs ${c.paidAmount}`}
                          highlight
                        />
                        <InfoPill
                          label="Remaining"
                          value={`Rs ${c.remainingAmount}`}
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(c.paymentDate).toLocaleDateString("en-GB")}
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
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    New Payment
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white md:text-3xl">
                    Record Fee Payment
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
                    Student <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={form.studentId}
                    onChange={(e) => updateField("studentId", e.target.value)}
                    className="modern-select"
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Fee Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={form.feeTypeId}
                    onChange={(e) => updateField("feeTypeId", e.target.value)}
                    className="modern-select"
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
                    Fee Month <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.month}
                    onChange={(e) => updateField("month", e.target.value)}
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Amount Due (Rs.) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.amountDue}
                    onChange={(e) => updateField("amountDue", e.target.value)}
                    placeholder="5000"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Paid Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.paidAmount}
                    onChange={(e) => updateField("paidAmount", e.target.value)}
                    placeholder="5000"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => updateField("paymentDate", e.target.value)}
                    className="modern-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => updateField("paymentMethod", e.target.value)}
                    className="modern-select"
                  >
                    <option value="CASH">Cash</option>
                    <option value="JAZZCASH">JazzCash</option>
                    <option value="EASYPAISA">EasyPaisa</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="ONLINE">Online</option>
                    <option value="OTHER">Other</option>
                  </select>
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
                  {saving ? "Recording..." : "Record Payment"}
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
  prefix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  prefix?: string;
}) {
  return (
    <SpotlightCard className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 md:text-xs">
            {label}
          </p>
          <p className="mt-1.5 truncate text-2xl font-black md:mt-2 md:text-3xl">
            {prefix}
            <AnimatedCounter value={value} />
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur md:h-12 md:w-12 md:rounded-2xl">
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </SpotlightCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    FAILED: "border-red-400/30 bg-red-400/10 text-red-300",
    VERIFIED: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        map[status] || "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}

function InfoPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-sm font-bold ${
          highlight ? "text-emerald-300" : "text-slate-300"
        }`}
      >
        {value}
      </p>
    </div>
  );
}