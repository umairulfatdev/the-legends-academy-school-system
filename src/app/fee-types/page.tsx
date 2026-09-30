"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type FeeType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

type FeeForm = {
  name: string;
  description: string;
  isActive: boolean;
};

const emptyForm: FeeForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function FeeTypesPage() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [form, setForm] = useState<FeeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadFeeTypes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/fee-types", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load fee types.");
      }

      setFeeTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fee types."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeeTypes();
  }, []);

  function handleChange(
    field: keyof FeeForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Fee type name is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/fee-types/${editingId}`
        : "/api/fee-types";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          isActive: form.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editingId
              ? "Unable to update fee type."
              : "Unable to add fee type.")
        );
      }

      setMessage(
        editingId
          ? "Fee type updated successfully."
          : "Fee type added successfully."
      );

      resetForm();
      await loadFeeTypes();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(feeType: FeeType) {
    setEditingId(feeType.id);

    setForm({
      name: feeType.name,
      description: feeType.description || "",
      isActive: feeType.isActive,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteFeeType(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this fee type?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/fee-types/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete fee type."
        );
      }

      setMessage("Fee type deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadFeeTypes();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete fee type."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-600 px-10 py-7 text-white">
        <div>
          <h1 className="text-3xl font-bold">
            The Legends Academy & School System
          </h1>

          <p className="mt-1 text-lg">
            Fee Management
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl bg-white px-6 py-4 text-lg font-bold text-blue-600 transition hover:bg-gray-100"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Title */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-4xl font-black">
              Fee Type Management
            </h2>

            <p className="mt-2 text-slate-500">
              Add and manage different types of school fees.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Fee Types
            </p>

            <p className="text-3xl font-black text-green-600">
              {feeTypes.length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {editingId
                  ? "Edit Fee Type"
                  : "Add New Fee Type"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter fee type information below.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fee Type Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                placeholder="Tuition Fee"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Active */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Status
              </label>

              <select
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  handleChange(
                    "isActive",
                    e.target.value === "ACTIVE"
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  handleChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Monthly tuition fee for students..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Fee Type"
                  : "Add Fee Type"}
              </button>
            </div>
          </form>
        </section>

        {/* List */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8">
            <h2 className="text-2xl font-black">
              Fee Type List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All registered fee types.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading fee types...
            </div>
          ) : feeTypes.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-bold text-slate-700">
                No fee types found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first fee type above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">
                      Fee Type
                    </th>

                    <th className="px-6 py-4">
                      Description
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {feeTypes.map((feeType) => (
                    <tr
                      key={feeType.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {feeType.name}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {feeType.description || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            feeType.isActive
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                          }
                        >
                          {feeType.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(feeType)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteFeeType(feeType.id)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}