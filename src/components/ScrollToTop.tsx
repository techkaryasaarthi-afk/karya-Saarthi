"use client";

/**
 * ScrollToTop Component - Karya Saarthi
 * 
 * Floating scroll-to-top action button:
 * - Appears automatically when user scrolls down (> 180px)
 * - Positioned at bottom-right, neatly aligned directly above the WhatsApp button
 * - Upward arrow with smooth micro-interaction and hover elevation
 * - Smooth scroll directly to the top of the page (window.scrollTo)
 * - Full Dark / Light mode compatibility
 */

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button once user has scrolled past 180px
      if (window.scrollY > 180) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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
      className={`fixed bottom-[78px] right-[20px] sm:bottom-[94px] sm:right-[27px] z-40 transition-all duration-300 ease-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-75 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        type="button"
        title="Scroll to top"
        aria-label="Scroll back to top of the page"
        className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FF8C42] hover:from-[#FF7A00] hover:to-[#FFA043] text-white flex items-center justify-center shadow-lg shadow-[#FF6B35]/35 hover:shadow-xl hover:shadow-[#FF6B35]/50 border border-white/25 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Subtle pulsating glow ring on hover */}
        <div className="absolute -inset-1 rounded-full bg-[#FF6B35]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Upward Arrow Icon with bounce on hover */}
        <ArrowUp className="w-5 h-5 sm:w-5 sm:h-5 text-white transition-transform duration-300 group-hover:-translate-y-1 group-active:translate-y-0 stroke-[2.5]" />

        {/* Floating Tooltip for Desktop */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center whitespace-nowrap bg-slate-900/95 dark:bg-zinc-900/95 border border-white/10 px-2.5 py-1 rounded-lg shadow-xl text-[11px] font-semibold text-white pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
          <span>Scroll to top</span>
          <div className="w-1.5 h-1.5 bg-slate-900/95 dark:bg-zinc-900/95 border-r border-b border-white/10 rotate-[-45deg] -mr-1 ml-1" />
        </div>
      </button>
    </div>
  );
}
