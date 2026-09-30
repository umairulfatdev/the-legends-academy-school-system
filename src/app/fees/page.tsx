"use client";

import Link from "next/link";
import {
  Wallet,
  Layers,
  Receipt,
  BarChart3,
  ArrowRight,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "@/components/ui/DashboardLayout";
import Reveal from "@/components/ui/Reveal";
import SpotlightCard from "@/components/ui/SpotlightCard";

const modules = [
  {
    href: "/fees/types",
    label: "Fee Types",
    description: "Define categories like tuition, transport, exam",
    icon: Wallet,
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    href: "/fees/structures",
    label: "Fee Structures",
    description: "Assign amounts to classes and fee types",
    icon: Layers,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    href: "/fees/collections",
    label: "Fee Collections",
    description: "Record payments and generate receipts",
    icon: Receipt,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/fees/reports",
    label: "Fee Reports",
    description: "Analytics, defaulters and collection insights",
    icon: BarChart3,
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function FeesPage() {
  return (
    <DashboardLayout>
      <Reveal>
        <div className="page-header mb-6">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Finance Module
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Fees Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-blue-100/80 md:text-base">
              Manage the complete fee lifecycle — from defining types and
              structures to collecting payments and generating reports.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid gap-5 sm:grid-cols-2">
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <Reveal key={mod.href} delay={0.1 + index * 0.05}>
                <Link href={mod.href}>
                  <SpotlightCard className="group relative overflow-hidden p-7 transition hover:-translate-y-1">
                    <div
                      className={`absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gradient-to-br ${mod.gradient} opacity-10 blur-3xl transition group-hover:opacity-20`}
                    />

                    <div className="relative">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mod.gradient} text-white shadow-lg`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>

                      <h3 className="mt-5 text-2xl font-black text-white">
                        {mod.label}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {mod.description}
                      </p>

                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                        Open
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </DashboardLayout>
  );
}