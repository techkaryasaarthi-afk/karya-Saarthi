"use client";

/**
 * Navbar Component (Karya Saarthi)
 * 
 * Optimized Navigation Header:
 * - Left: Clickable brand logo & "TEACH + COMPLETE SOLUTIONS" tagline with smooth scroll to top (#top)
 * - Center: Navigation links (Home, Services, Case Studies, ROI Estimator, About Us, Contact Us)
 * - Right: ONLY primary solid orange "Free Consultation →" CTA with pill styling & hover elevation
 * - Sticky Glassmorphism: (sticky top-0 z-50 bg-white/90 backdrop-blur-md) with subtle bottom border
 * - Mobile: Responsive hamburger menu displaying all links + full-width CTA
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";

interface NavbarProps {
  onOpenConsultation: () => void;
  onOpenPortfolioPdf?: () => void;
}

export default function Navbar({ onOpenConsultation }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links: Home, Services, Case Studies, ROI Estimator, About Us, Contact Us
  const navLinks = [
    { name: "Home", href: "#top" },
    { name: "Services", href: "#services" },
    { name: "Case Studies", href: "#case-studies" },
    { name: "ROI Estimator", href: "#roi-estimator" },
    { name: "About Us", href: "#about" },
    { name: "Contact Us", href: "#contact" },
  ];

  // Smooth scroll handler for links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#top" || href === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      return;
    }
    const targetId = href.replace("#", "");
    const element =
      document.getElementById(targetId) ||
      (targetId === "case-studies" ? document.getElementById("projects") : null) ||
      (targetId === "roi-estimator" ? document.getElementById("roi-calculator") : null);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Logo scroll to top handler
  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled
          ? "bg-white/90 dark:bg-[#0E0E11]/90 border-b border-gray-200/90 dark:border-zinc-800 shadow-sm"
          : "bg-white/80 dark:bg-[#0E0E11]/80 border-b border-gray-200/60 dark:border-zinc-800/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Section: Brand Logo (Clickable to scroll smoothly to top) */}
          <a
            href="#top"
            onClick={handleScrollToTop}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 cursor-pointer select-none"
            aria-label="Karya Saarthi - Scroll to top"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#FF7A00] shadow-md shadow-[#FF7A00]/20 group-hover:scale-105 transition-transform shrink-0 bg-white p-0.5">
              <Image
                src="/logo.jpg"
                alt="Karya Saarthi Logo"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base sm:text-lg font-black tracking-normal text-slate-900 dark:text-white flex items-center gap-1 leading-none">
                KARYA <span className="text-[#FF7A00]">SAARTHI</span>
              </span>
              <p className="text-[9px] sm:text-[10px] text-[#FF7A00] font-extrabold tracking-wider uppercase mt-0.5">
                TEACH + COMPLETE SOLUTIONS
              </p>
            </div>
          </a>

          {/* Center Section: Navigation Links with gap-6/xl:gap-7 & subtle warm-orange hover */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-gray-700 dark:text-zinc-200 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] transition-colors whitespace-nowrap py-1 relative group"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF7A00] rounded-full group-hover:w-full transition-all duration-200" />
              </a>
            ))}
          </nav>

          {/* Right Section: Primary CTA Only (Solid Orange Button with Pill Styling & Elevation Effect) */}
          <div className="hidden lg:flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenConsultation}
              className="group text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 rounded-full text-white bg-[#FF7A00] hover:bg-[#e66e00] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF7A00]/25 hover:shadow-lg hover:shadow-[#FF7A00]/35 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Free Consultation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Responsive Hamburger Toggle for Mobile & Tablet */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-[#FF7A00] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FF7A00]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-zinc-800 px-5 pt-3 pb-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium text-gray-700 hover:text-[#FF7A00] hover:bg-orange-50/50 dark:text-zinc-200 dark:hover:text-[#FF7A00] dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800/50 last:border-b-0"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
              </a>
            ))}
          </div>

          {/* Mobile Full-Width Solid Orange CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#e66e00] shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
