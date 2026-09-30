"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  name: string;
  rollNo?: string | null;
};

type FeeType = {
  id: string;
  name: string;
  amount?: number;
};

type FeeCollection = {
  id: string;
  studentId: string;
  studentName?: string;
  feeTypeId: string;
  feeTypeName?: string;
  month: string;
  amountDue: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  receiptNo: string;
};

export default function FeeCollectionPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [payments, setPayments] = useState<FeeCollection[]>([]);

  const [studentId, setStudentId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [month, setMonth] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [studentsResponse, feeTypesResponse, paymentsResponse] =
        await Promise.all([
          fetch("/api/students", { cache: "no-store" }),
          fetch("/api/fee-types", { cache: "no-store" }),
          fetch("/api/fee-collections", { cache: "no-store" }),
        ]);

      const studentsData = await studentsResponse.json();
      const feeTypesData = await feeTypesResponse.json();
      const paymentsData = await paymentsResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.error || "Unable to load students."
        );
      }

      if (!feeTypesResponse.ok) {
        throw new Error(
          feeTypesData.error || "Unable to load fee types."
        );
      }

      if (!paymentsResponse.ok) {
        throw new Error(
          paymentsData.error || "Unable to load fee payments."
        );
      }

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : studentsData.students || []
      );

      setFeeTypes(
        Array.isArray(feeTypesData)
          ? feeTypesData
          : feeTypesData.feeTypes || []
      );

      setPayments(
        Array.isArray(paymentsData)
          ? paymentsData
          : paymentsData.payments || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fee collection data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFeeTypeChange(id: string) {
    setFeeTypeId(id);

    const selected = feeTypes.find((item) => item.id === id);

    if (selected?.amount !== undefined) {
      setAmountDue(String(selected.amount));
    }
  }

  function resetForm() {
    setStudentId("");
    setFeeTypeId("");
    setMonth("");
    setAmountDue("");
    setPaidAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Cash");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    if (!feeTypeId) {
      setError("Please select a fee type.");
      return;
    }

    if (!month) {
      setError("Please select a month.");
      return;
    }

    const due = Number(amountDue);
    const paid = Number(paidAmount);

    if (!Number.isFinite(due) || due <= 0) {
      setError("Amount due must be greater than 0.");
      return;
    }

    if (!Number.isFinite(paid) || paid < 0) {
      setError("Paid amount cannot be negative.");
      return;
    }

    if (paid > due) {
      setError("Paid amount cannot be greater than amount due.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/fee-collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          feeTypeId,
          month,
          amountDue: due,
          paidAmount: paid,
          paymentDate,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save fee payment."
        );
      }

      setMessage("Fee payment saved successfully.");

      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save fee payment."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalDue = payments.reduce(
    (sum, payment) => sum + Number(payment.amountDue || 0),
    0
  );

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.paidAmount || 0),
    0
  );

  const totalRemaining = payments.reduce(
    (sum, payment) => sum + Number(payment.remainingAmount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-600 px-10 py-7 text-white">
        <div>
          <h1 className="text-3xl font-bold">
            The Legends Academy & School System
          </h1>

          <p className="mt-1 text-lg">
            Fee Collection
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
        <div className="mb-8">
          <h2 className="text-4xl font-black">
            Fee Collection
          </h2>

          <p className="mt-2 text-slate-500">
            Collect and manage student fee payments.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-400">
              Total Due
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              Rs. {totalDue}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-400">
              Total Paid
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              Rs. {totalPaid}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-400">
              Remaining
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              Rs. {totalRemaining}
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

        {/* Collection Form */}
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black">
              Collect Student Fee
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter payment information below.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Student */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Student
              </label>

              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              >
                <option value="">
                  Select Student
                </option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                    {student.rollNo
                      ? ` (${student.rollNo})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fee Type
              </label>

              <select
                value={feeTypeId}
                onChange={(e) =>
                  handleFeeTypeChange(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              >
                <option value="">
                  Select Fee Type
                </option>

                {feeTypes.map((feeType) => (
                  <option key={feeType.id} value={feeType.id}>
                    {feeType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Month
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Amount Due */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Amount Due
              </label>

              <input
                type="number"
                min="1"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Paid Amount
              </label>

              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Date
              </label>

              <input
                type="date"
                value={paymentDate}
                onChange={(e) =>
                  setPaymentDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {/* Remaining */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Remaining Amount
              </label>

              <div className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-bold text-red-600">
                Rs.{" "}
                {Math.max(
                  0,
                  Number(amountDue || 0) -
                    Number(paidAmount || 0)
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Fee Payment"}
              </button>
            </div>
          </form>
        </section>

        {/* Payment List */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8">
            <h2 className="text-2xl font-black">
              Fee Payment List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All recorded student fee payments.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No fee payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Receipt</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Fee Type</th>
                    <th className="px-6 py-4">Month</th>
                    <th className="px-6 py-4">Due</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Remaining</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold">
                        {payment.receiptNo}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {payment.studentName ||
                          payment.studentId}
                      </td>

                      <td className="px-6 py-4">
                        {payment.feeTypeName ||
                          payment.feeTypeId}
                      </td>

                      <td className="px-6 py-4">
                        {payment.month}
                      </td>

                      <td className="px-6 py-4">
                        Rs. {payment.amountDue}
                      </td>

                      <td className="px-6 py-4 font-semibold text-green-600">
                        Rs. {payment.paidAmount}
                      </td>

                      <td className="px-6 py-4 font-semibold text-red-600">
                        Rs. {payment.remainingAmount}
                      </td>

                      <td className="px-6 py-4">
                        {payment.paymentMethod}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            payment.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "PARTIAL"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payment.status}
                        </span>
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