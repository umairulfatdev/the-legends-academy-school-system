import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "The Legends Academy & School System",
    template: "%s | The Legends Academy",
  },
  description:
    "A modern, intelligent and connected school management system for students, teachers and administrators.",
  keywords: [
    "school management",
    "education",
    "students",
    "teachers",
    "attendance",
    "exams",
    "fees",
  ],
  authors: [{ name: "The Legends Academy" }],
  openGraph: {
    title: "The Legends Academy & School System",
    description:
      "Modern digital platform for smarter academic management.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
  <ThemeProvider>
    <ToastProvider>{children}</ToastProvider>
  </ThemeProvider>
</body>
    </html>
  );
}