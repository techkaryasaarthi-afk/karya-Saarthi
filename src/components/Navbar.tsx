"use client";

/**
 * Navbar Component (Karya Saarthi)
 * 
 * Optimized Navigation Header:
 * - Left: Clickable brand logo & "TEACH + COMPLETE SOLUTIONS" tagline with smooth scroll to top (#top)
 * - Center: Navigation links (Home, Services, Case Studies, ROI Estimator, About Us, Contact Us)
 * - Right: Theme Toggle (Light/Dark) + primary solid orange "Free Consultation →" CTA
 * - Fixed Glassmorphism: (fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md) stays visible on scroll
 * - Mobile: Responsive theme toggle + hamburger menu displaying all links + full-width CTA
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Mail,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCountry } from "@/context/CountryContext";

interface NavbarProps {
  onOpenConsultation: () => void;
  onOpenPortfolioPdf?: () => void;
  onOpenCountriesModal?: () => void;
}

export default function Navbar({ onOpenConsultation, onOpenCountriesModal }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { selectedCountry, t } = useCountry();
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

  // Navigation links localized to active country's language (English for India)
  const navLinks = [
    { name: t("nav.home", "Home"), href: "#top" },
    { name: t("nav.services", "Services"), href: "#services" },
    { name: t("nav.caseStudies", "Case Studies"), href: "#case-studies" },
    { name: t("nav.roiEstimator", "ROI Estimator"), href: "#roi-estimator" },
    { name: t("nav.aboutUs", "About Us"), href: "#about" },
    { name: t("nav.contactUs", "Contact Us"), href: "#contact" },
  ];

  // Smooth scroll handler for links with header offset
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
      const headerOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
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
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled
          ? "bg-white/95 dark:bg-[#0E0E11]/95 border-b border-gray-200/90 dark:border-zinc-800 shadow-md py-0"
          : "bg-white/90 dark:bg-[#0E0E11]/90 border-b border-gray-200/60 dark:border-zinc-800/60"
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

          {/* Right Section: Quick Icons (Email, WhatsApp, Phone, 195 Countries) + Theme Toggle + Primary CTA */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Small Email Icon Button */}
            <a
              href="mailto:support@karyasaarthi.com"
              className="p-2.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] bg-slate-100 hover:bg-orange-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
              title="Email: support@karyasaarthi.com"
              aria-label="Email support@karyasaarthi.com"
            >
              <Mail className="w-4 h-4 text-slate-700 dark:text-zinc-200" />
            </a>

            {/* Small WhatsApp Icon Button */}
            <a
              href="https://wa.me/918595025753?text=Hi%20Karya%20Saarthi%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-emerald-500 bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs group/wa"
              title="WhatsApp: +91 8595025753"
              aria-label="WhatsApp +91 8595025753"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] group-hover/wa:scale-110 transition-transform" />
            </a>

            {/* 195 Countries Pill Button (Matches Screenshot 2 style) */}
            {onOpenCountriesModal && (
              <button
                type="button"
                onClick={onOpenCountriesModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-[#FF7A00] bg-slate-100 hover:bg-orange-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                title={`${selectedCountry.englishName} (${selectedCountry.currency} ${selectedCountry.symbol}) • 195 Countries Supported`}
              >
                <span className="text-sm">{selectedCountry.flag}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedCountry.code}</span>
                <span className="hidden xl:inline text-slate-600 dark:text-zinc-400 font-normal">
                  {selectedCountry.englishName}
                </span>
                <span className="font-mono text-[#FF7A00]">({selectedCountry.symbol} {selectedCountry.currency})</span>
                <span className="text-slate-300 dark:text-zinc-600">|</span>
                <span className="text-slate-600 dark:text-zinc-300">195 Countries</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] bg-slate-100 hover:bg-orange-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Primary CTA (Solid Orange Button with Pill Styling & Elevation Effect) */}
            <button
              type="button"
              onClick={onOpenConsultation}
              className="group text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full text-white bg-[#FF7A00] hover:bg-[#e66e00] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF7A00]/25 hover:shadow-lg hover:shadow-[#FF7A00]/35 hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-1"
            >
              <span>{t("nav.consultation", "Free Consultation")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Responsive Mobile Controls: WhatsApp, Email, Theme, Hamburger */}
          <div className="lg:hidden flex items-center gap-1.5">
            <a
              href="https://wa.me/918595025753?text=Hi%20Karya%20Saarthi%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
              title="WhatsApp +91 8595025753"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4.5 h-4.5 text-[#25D366]" />
            </a>

            <a
              href="mailto:support@karyasaarthi.com"
              className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
              title="Email support@karyasaarthi.com"
              aria-label="Email"
            >
              <Mail className="w-4.5 h-4.5" />
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:text-[#FF7A00] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 dark:text-zinc-200 hover:text-[#FF7A00] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF7A00]" /> : <Menu className="w-5 h-5" />}
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

          {/* Mobile Direct Contact Quick Bar */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://wa.me/918595025753?text=Hi%20Karya%20Saarthi%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href="mailto:support@karyasaarthi.com"
              className="py-2.5 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[#FF7A00] border border-orange-200 dark:border-orange-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>

          {/* 195 Countries Button in Mobile Drawer */}
          {onOpenCountriesModal && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCountriesModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-bold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.englishName} ({selectedCountry.symbol} {selectedCountry.currency})</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF7A00]">
                195 Countries ▾
              </span>
            </button>
          )}

          {/* Mobile Drawer Theme Toggle Row */}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-200 flex items-center gap-2">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-700 text-slate-800 dark:text-white border border-gray-200 dark:border-zinc-600 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {/* Mobile Full-Width Solid Orange CTA Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#e66e00] shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>{t("nav.consultation", "Free Consultation")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
