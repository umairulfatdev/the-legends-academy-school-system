"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Users,
  BookOpen,
  BarChart3,
  Wallet,
  ClipboardCheck,
} from "lucide-react";

const quickLinks = [
  { icon: Users, label: "Students", href: "/students", color: "from-indigo-500 to-indigo-700" },
  { icon: GraduationCap, label: "Teachers", href: "/teachers", color: "from-cyan-500 to-blue-600" },
  { icon: BookOpen, label: "Classes", href: "/classes", color: "from-violet-500 to-indigo-600" },
  { icon: ClipboardCheck, label: "Attendance", href: "/attendance", color: "from-emerald-500 to-teal-600" },
  { icon: BarChart3, label: "Exams", href: "/exams", color: "from-amber-500 to-orange-600" },
  { icon: Wallet, label: "Fees", href: "/fees", color: "from-pink-500 to-rose-600" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1628] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-160px] top-[-160px] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]" />
        <div className="absolute right-[-180px] top-[10%] h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[540px] w-[540px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-2xl shadow-indigo-500/40"
        >
          <GraduationCap className="h-10 w-10 text-white" />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-5 py-2 text-sm font-bold text-cyan-300 backdrop-blur"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_#06B6D4]" />
          Smart School Management System
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl text-center text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-[82px]"
        >
          The Legends
          <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent">
            Academy & School
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-7 max-w-2xl text-center text-base leading-8 text-slate-400 sm:text-lg"
        >
          A modern, intelligent and connected platform for students, teachers
          and administrators. Everything your school needs — in one premium
          experience.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 font-black text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-1"
          >
            Enter School Portal
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
          >
            View Dashboard
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-20 w-full max-w-4xl"
        >
          <p className="mb-5 text-center text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Quick Access
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.06]"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg transition group-hover:scale-110`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}