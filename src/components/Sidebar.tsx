"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Students",
    href: "/students",
    icon: "🎓",
  },
  {
    label: "Teachers",
    href: "/teachers",
    icon: "👨‍🏫",
  },
  {
    label: "Classes",
    href: "/classes",
    icon: "🏫",
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: "✓",
  },
  {
    label: "Exams & Results",
    href: "/exams",
    icon: "📝",
  },
  {
    label: "Marks",
    href: "/marks",
    icon: "📊",
  },
  {
    label: "Fees",
    href: "/fees",
    icon: "💳",
  },
  {
    label: "Fee Collection",
    href: "/fee-collection",
    icon: "💰",
  },
  {
    label: "Fee Reports",
    href: "/fees/reports",
    icon: "📈",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 border-r border-white/20 bg-slate-950 text-white shadow-2xl lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl shadow-lg">
              🏫
            </div>

            <div>
              <h1 className="text-lg font-extrabold">
                Legends Academy
              </h1>

              <p className="text-xs text-slate-400">
                School Management
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                    active
                      ? "bg-white/20"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/30 to-cyan-500/20 p-4">
            <p className="text-sm font-bold">
              The Legends Academy
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Smart School Management System
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}