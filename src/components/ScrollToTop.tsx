"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40 transition-all duration-300 ${
        scrolled ? "opacity-100 scale-100" : "opacity-90 hover:opacity-100 scale-95"
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Karya Saarthi - Scroll to top"
        className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#121216] border-2 border-[#FF7A00] hover:border-[#004E89] text-white flex items-center justify-center shadow-2xl shadow-[#FF7A00]/30 hover:shadow-[#004E89]/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer backdrop-blur-md p-1"
      >
        {/* Glowing Background Pulse */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#FF7A00]/50 to-[#004E89]/50 blur-md pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Circular Logo Image */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
          <Image
            src="/logo.jpg"
            alt="Karya Saarthi Logo"
            fill
            className="object-contain rounded-full"
            priority
          />

          {/* Hover Overlay with Arrow */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
            <ArrowUp className="w-5 h-5 text-[#FF7A00] animate-bounce" />
            <span className="text-[8px] font-black tracking-widest uppercase text-white leading-none mt-0.5">
              TOP
            </span>
          </div>
        </div>

        {/* Floating Mini Arrow Badge (Always visible so users see the direct-upar scroll purpose) */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#004E89] text-white border-2 border-white dark:border-[#121216] flex items-center justify-center shadow-md shadow-[#004E89]/40 group-hover:bg-[#FF7A00] group-hover:scale-110 transition-all duration-200">
          <ArrowUp className="w-3 h-3 text-white" />
        </div>

        {/* Tooltip on Desktop */}
        <span className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-zinc-900/95 text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl border border-white/10 hidden sm:flex items-center gap-1.5 z-20">
          <span>Karya Saarthi • Scroll to Top</span>
          <ArrowUp className="w-3 h-3 text-[#FF7A00]" />
        </span>
      </button>
    </div>
  );
}
