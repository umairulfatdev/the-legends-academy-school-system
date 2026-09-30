"use client";

import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  fatherName: string | null;
  motherName: string | null;
  contactNumber: string | null;
  address: string | null;
  gender: string | null;
};

type StudentForm = {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  contactNumber: string;
  address: string;
  gender: string;
};

const emptyForm: StudentForm = {
  studentId: "",
  admissionNumber: "",
  fullName: "",
  fatherName: "",
  motherName: "",
  contactNumber: "",
  address: "",
  gender: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);

      const response = await fetch("/api/students");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load students.");
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(
    field: keyof StudentForm,
    value: string
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (editingId) {
        const response = await fetch("/api/students", {
  method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to update student."
          );
        }

        setMessage("Student updated successfully.");
      } else {
        const response = await fetch("/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to create student."
          );
        }

        setMessage("Student added successfully.");
      }

      resetForm();
      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(student: Student) {
    setEditingId(student.id);

    setForm({
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      fullName: student.fullName,
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      contactNumber: student.contactNumber || "",
      address: student.address || "",
      gender: student.gender || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
     const response = await fetch("/api/students", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete student."
        );
      }

      setMessage("Student deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete student."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              School Management
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Students
            </h1>

            <p className="mt-2 text-slate-500">
              Manage student records, admissions and contact information.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Students
            </p>

            <p className="text-3xl font-black text-blue-700">
              {students.length}
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

        {/* Add/Edit Student */}
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {editingId
                  ? "Edit Student"
                  : "Add New Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the student's basic information below.
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
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Student ID
              </label>

              <input
                value={form.studentId}
                onChange={(e) =>
                  handleChange("studentId", e.target.value)
                }
                placeholder="STU-001"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Admission Number
              </label>

              <input
                value={form.admissionNumber}
                onChange={(e) =>
                  handleChange(
                    "admissionNumber",
                    e.target.value
                  )
                }
                placeholder="ADM-2026-001"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full Name
              </label>

              <input
                value={form.fullName}
                onChange={(e) =>
                  handleChange("fullName", e.target.value)
                }
                placeholder="Student full name"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Gender
              </label>

              <select
                value={form.gender}
                onChange={(e) =>
                  handleChange("gender", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Father's Name
              </label>

              <input
                value={form.fatherName}
                onChange={(e) =>
                  handleChange("fatherName", e.target.value)
                }
                placeholder="Father's name"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Mother's Name
              </label>

              <input
                value={form.motherName}
                onChange={(e) =>
                  handleChange("motherName", e.target.value)
                }
                placeholder="Mother's name"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Contact Number
              </label>

              <input
                value={form.contactNumber}
                onChange={(e) =>
                  handleChange(
                    "contactNumber",
                    e.target.value
                  )
                }
                placeholder="03XX-XXXXXXX"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Address
              </label>

              <input
                value={form.address}
                onChange={(e) =>
                  handleChange("address", e.target.value)
                }
                placeholder="Student address"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Student"
                  : "Add Student"}
              </button>
            </div>
          </form>
        </section>

        {/* Student List */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8">
            <h2 className="text-2xl font-black">
              Student List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All registered students.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-bold text-slate-700">
                No students found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first student using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">
                      Student
                    </th>

                    <th className="px-6 py-4">
                      Student ID
                    </th>

                    <th className="px-6 py-4">
                      Admission No.
                    </th>

                    <th className="px-6 py-4">
                      Father's Name
                    </th>

                    <th className="px-6 py-4">
                      Contact
                    </th>

                    <th className="px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {student.fullName}
                        </p>

                        <p className="text-xs text-slate-400">
                          {student.gender || "Gender not specified"}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {student.studentId}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.admissionNumber}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.fatherName || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.contactNumber || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(student)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteStudent(student.id)
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