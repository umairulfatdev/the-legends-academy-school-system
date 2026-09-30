"use client";

import { ReactNode } from "react";
import PremiumNavbar from "./PremiumNavbar";
import PremiumCursor from "@/components/PremiumCursor";
import PageTransition from "./PageTransition";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <>
      <PremiumCursor />

      <div className="noise-overlay relative min-h-screen overflow-x-hidden bg-[#0A1628] text-white">
        {/* Aurora background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="aurora absolute inset-0" />

          <div className="absolute left-[-160px] top-[-160px] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]" />
          <div className="absolute right-[-180px] top-[10%] h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute bottom-[-200px] left-[30%] h-[540px] w-[540px] rounded-full bg-indigo-500/15 blur-[120px]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_55%)]" />
        </div>

        <PremiumNavbar />

        <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
  <PageTransition>{children}</PageTransition>
</main>
      </div>
    </>
  );
}