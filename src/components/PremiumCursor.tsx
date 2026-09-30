"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PremiumCursor() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setMounted(true);

    const touchCheck = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touchCheck);

    if (touchCheck) return;

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);

      const target = e.target as HTMLElement;
      const clickable = target.closest(
        "a, button, [role='button'], input, textarea, select"
      );
      setIsPointer(!!clickable);
    };

    const leave = () => setIsHidden(true);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!mounted || isTouch) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      animate={{
        x: position.x - (isPointer ? 20 : 14),
        y: position.y - (isPointer ? 20 : 14),
        opacity: isHidden ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.5,
      }}
    >
      <div
        className={`rounded-full border-2 transition-all duration-300 ${
          isPointer
            ? "h-10 w-10 border-cyan-400 bg-cyan-400/10 backdrop-blur-sm"
            : "h-7 w-7 border-indigo-400/60 bg-indigo-400/5"
        }`}
      />
    </motion.div>
  );
}