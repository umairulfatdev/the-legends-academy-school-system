"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return { score: 1, label: "Weak", color: "red" };
    if (score <= 3)
      return { score: 2, label: "Fair", color: "amber" };
    if (score === 4)
      return { score: 3, label: "Good", color: "cyan" };
    return { score: 4, label: "Strong", color: "emerald" };
  }, [password]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed.");
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1628] text-white">
      {/* Aurora Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="aurora absolute inset-0" />
        <div className="absolute left-[-160px] top-[-160px] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]" />
        <div className="absolute right-[-180px] top-[10%] h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[540px] w-[540px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* ───── LEFT: Branding ───── */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-2xl shadow-indigo-500/40">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                THE LEGENDS
              </h1>
              <p className="text-xs font-medium tracking-[0.2em] text-cyan-300/70">
                ACADEMY & SCHOOL
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_#06B6D4]" />
              Get Started
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-[-0.03em] xl:text-6xl">
              Start Your
              <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                School Journey.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Create your account and get instant access to the complete
              school management system — students, teachers, fees and more.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-3">
              {[
                "Manage unlimited students & teachers",
                "Real-time attendance & fee tracking",
                "Advanced reports & analytics",
                "Secure & role-based access",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 text-xs text-slate-500"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Your data is encrypted and secure
          </motion.div>
        </section>

        {/* ───── RIGHT: Signup Form ───── */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight">
                  THE LEGENDS
                </h1>
                <p className="text-[10px] font-medium tracking-[0.2em] text-cyan-300/70">
                  ACADEMY & SCHOOL
                </p>
              </div>
            </div>

            {/* Form Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

              <div className="relative">
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    <Sparkles className="h-3 w-3" />
                    Create Account
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-white">
                    Create your account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Fill in your details to get started with The Legends
                    Academy.
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-black text-slate-300"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="modern-input w-full pl-11"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-black text-slate-300"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        required
                        className="modern-input w-full pl-11 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-cyan-400"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {password.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                          <span className="text-slate-500">
                            Password Strength
                          </span>
                          <span
                            className={
                              passwordStrength.color === "red"
                                ? "text-red-400"
                                : passwordStrength.color === "amber"
                                ? "text-amber-400"
                                : passwordStrength.color === "cyan"
                                ? "text-cyan-400"
                                : "text-emerald-400"
                            }
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                i <= passwordStrength.score
                                  ? passwordStrength.color === "red"
                                    ? "bg-red-400"
                                    : passwordStrength.color === "amber"
                                    ? "bg-amber-400"
                                    : passwordStrength.color === "cyan"
                                    ? "bg-cyan-400"
                                    : "bg-emerald-400"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-black text-slate-300"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        required
                        className="modern-input w-full pl-11 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-cyan-400"
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                      {confirmPassword.length > 0 && (
                        <div className="absolute -bottom-6 right-0 flex items-center gap-1 text-[10px] font-black">
                          {passwordsMatch ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">
                                Match
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-red-400" />
                              <span className="text-red-400">
                                No match
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 backdrop-blur"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}

                  {/* Success */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 backdrop-blur"
                    >
                      ✓ {success}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-4 font-black text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Already have an account?
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Login Link */}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-black text-cyan-400 transition hover:border-cyan-400/30 hover:bg-white/10"
                >
                  Sign in instead
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              © {new Date().getFullYear()} The Legends Academy & School System
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}