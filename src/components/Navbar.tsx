"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Sparkles, ArrowRight, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  onOpenConsultation: () => void;
  onOpenPortfolioPdf: () => void;
}

export default function Navbar({ onOpenConsultation, onOpenPortfolioPdf }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Services", href: "#services" },
    { name: "Case Studies", href: "#projects" },
    { name: "ROI Estimator", href: "#roi-calculator" },
    { name: "Outcomes", href: "#outcomes" },
    { name: "About Us", href: "#about" },
    { name: "Team", href: "#team" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#0E0E11]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 py-2.5 sm:py-3 shadow-md dark:shadow-2xl"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 xl:gap-4 group mr-2 xl:mr-8 shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 rounded-full overflow-hidden border-2 border-[#FF6B35] shadow-xl shadow-[#FF6B35]/30 group-hover:scale-105 transition-transform shrink-0 bg-white p-0.5">
              <Image
                src="/logo.jpg"
                alt="Karya Saarthi Logo"
                fill
                className="object-contain rounded-full"
                sizes="(max-width: 640px) 40px, (max-width: 1280px) 48px, 56px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-xl xl:text-2xl font-black tracking-normal text-slate-900 dark:text-white flex items-center gap-1 sm:gap-1.5 leading-none">
                KARYA <span className="text-[#FF6B35]">SAARTHI</span>
              </span>
              <p className="text-[8px] sm:text-[10px] xl:text-xs text-[#FF6B35] font-extrabold tracking-widest uppercase mt-0.5">
                Teach + Complete Solutions
              </p>
            </div>
          </Link>

          {/* Desktop & Laptop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-5 shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[11px] xl:text-sm font-semibold text-slate-600 hover:text-[#FF6B35] dark:text-zinc-300 dark:hover:text-[#FF6B35] transition-colors whitespace-nowrap px-1 py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop & Laptop Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Toggle Light / Dark Theme"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-700 hover:text-[#FF6B35] transition-colors" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            <button
              onClick={onOpenPortfolioPdf}
              className="text-[11px] xl:text-xs font-bold px-2.5 xl:px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-zinc-200 dark:hover:text-white dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/15 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span className="hidden xl:inline">Portfolio PDF</span>
              <span className="xl:hidden">PDF</span>
            </button>
            
            <button
              onClick={onOpenConsultation}
              className="relative group text-xs xl:text-sm font-bold px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl text-white bg-gradient-to-r from-[#FF7A00] to-[#FFA000] hover:opacity-95 transition-all shadow-lg shadow-[#FF7A00]/25 flex items-center gap-1.5 xl:gap-2 whitespace-nowrap"
            >
              <span>Free Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 xl:w-4 xl:h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile & Tablet Hamburger Button + Quick Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
              aria-label="Toggle Responsive Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FF6B35]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/15 px-5 pt-4 pb-6 space-y-3 shadow-2xl animate-fadeIn max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#FF6B35] hover:bg-slate-100 dark:text-zinc-200 dark:hover:text-[#FF6B35] dark:hover:bg-white/5 transition-all border-b border-slate-100 dark:border-white/5"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              </a>
            ))}
          </div>

          <div className="pt-3 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortfolioPdf();
              }}
              className="w-full py-3 rounded-xl text-xs font-bold text-center bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/15 dark:text-white flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span>Download Portfolio PDF</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-center bg-[#FF6B35] text-white shadow-xl shadow-[#FF6B35]/25 flex items-center justify-center gap-2"
            >
              <span>Schedule Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
