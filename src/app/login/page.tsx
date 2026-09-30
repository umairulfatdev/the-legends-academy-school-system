"use client";

import { FormEvent, useState } from "react";
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
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
          {/* Logo */}
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

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_#06B6D4]" />
              Welcome Back
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-[-0.03em] xl:text-6xl">
              Empowering
              <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                Tomorrow&apos;s Leaders.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Manage students, teachers, classes, attendance, fees,
              examinations and school activities from one powerful platform.
            </p>

            {/* Feature Bullets */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Users, text: "5000+ Students" },
                { icon: GraduationCap, text: "200+ Teachers" },
                { icon: BookOpen, text: "Smart Classes" },
                { icon: TrendingUp, text: "Live Analytics" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 text-xs text-slate-500"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Secure • Modern • Easy to Manage
          </motion.div>
        </section>

        {/* ───── RIGHT: Login Form ───── */}
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
              {/* Glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative">
                {/* Header */}
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    <Sparkles className="h-3 w-3" />
                    Admin Portal
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-white">
                    Sign in to your account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Enter your credentials to access the school management
                    dashboard.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
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
                        placeholder="admin@legends.edu"
                        autoComplete="email"
                        required
                        className="modern-input w-full pl-11"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-black text-slate-300"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          alert("Password reset will be added soon.")
                        }
                        className="text-xs font-bold text-cyan-400 transition hover:text-cyan-300"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                  </div>

                  {/* Remember Me */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-400">
                      Remember me for 30 days
                    </span>
                  </label>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 backdrop-blur"
                    >
                      ⚠ {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-4 font-black text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to Dashboard
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Signup Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="font-black text-cyan-400 transition hover:text-cyan-300"
                    >
                      Create an account
                    </button>
                  </p>
                </div>

                {/* Divider */}
                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Secure Access
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Note */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-xs leading-5 text-slate-500">
                    Authorized school administrators only. Your account and
                    school data are protected.
                  </p>
                </div>
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