"use client";

/**
 * Navbar Component (FEAT-#3-Portfolio-2026)
 * 
 * Clean, modern header navigation:
 * - Sticky glassmorphism header (backdrop-blur-md bg-white/80) with subtle bottom border
 * - Brand logo & company identity with warm orange accents
 * - 5 centered navigation links (Home, Services, Case Studies, ROI Estimator, About Us) with gap-8 spacing
 * - Clean right-side actions: Subtle bordered 'Portfolio PDF' button + solid orange 'Free Consultation ->' CTA
 * - Smooth responsive collapse into mobile drawer menu
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, ChevronRight, FileDown } from "lucide-react";

interface NavbarProps {
  onOpenConsultation: () => void;
  onOpenPortfolioPdf: () => void;
}

export default function Navbar({ onOpenConsultation, onOpenPortfolioPdf }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Simplified 5 main navigation links in the center
  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Services", href: "#services" },
    { name: "Case Studies", href: "#projects" },
    { name: "ROI Estimator", href: "#roi-calculator" },
    { name: "About Us", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0E0E11]/80 border-b border-gray-200/80 dark:border-zinc-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
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
                Teach + Complete Solutions
              </p>
            </div>
          </Link>

          {/* 1. Desktop Center Navigation Links (5 links, gap-8 spacing, medium-weight typography) */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-[#FF7A00] transition-colors whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* 2. Desktop Right-Side Action Buttons (Minimal, No Dark Mode Toggle) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Subtle bordered secondary button with document/download icon */}
            <button
              type="button"
              onClick={onOpenPortfolioPdf}
              className="text-xs sm:text-sm font-semibold px-4 py-2 sm:py-2.5 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-white bg-white/60 dark:bg-zinc-800/60 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 transition-all flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#FF7A00]" />
              <span>Portfolio PDF</span>
            </button>
            
            {/* Primary solid orange CTA button with rounded corners and smooth hover effect */}
            <button
              type="button"
              onClick={onOpenConsultation}
              className="group text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white bg-[#FF7A00] hover:bg-[#e66e00] active:scale-[0.98] transition-all shadow-md shadow-[#FF7A00]/25 hover:shadow-lg hover:shadow-[#FF7A00]/35 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Free Consultation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Responsive Hamburger Toggle for Mobile & Tablet */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-orange-600 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FF7A00]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Responsive Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-zinc-800 px-5 pt-3 pb-6 space-y-4 shadow-2xl animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 dark:text-zinc-200 dark:hover:text-[#FF7A00] dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800/50 last:border-b-0"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortfolioPdf();
              }}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#FF7A00]" />
              <span>Portfolio PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#e66e00] shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer"
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
