"use client";

/**
 * Footer Component
 * 
 * Comprehensive 5-column footer matching the Karya Saarthi platform standards:
 * - Column 1: Solutions & Services links
 * - Column 2: Learning & Resources documentation links
 * - Column 3: About Us, Core Team, Career, & Official Social Channels
 * - Column 4: Trust, Security & Interactive Legal Modals (Privacy, Terms, Disclaimer, Refund, NDA)
 * - Column 5: Direct contact info (Phone, Email, Working hours, Global service status)
 * - Corporate office registry (CIN, GSTIN, Registered Office Burari Delhi)
 * - Admin portal discreet link & Copyright legal notice
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  ChevronDown,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";

interface FooterProps {
  onOpenAppointment?: () => void;
}

export default function Footer({ onOpenAppointment }: FooterProps) {
  const [activeModal, setActiveModal] = useState<
    "privacy" | "disclaimer" | "terms" | "refund" | "confidentiality" | null
  >(null);

  return (
    <footer className="bg-slate-100 dark:bg-[#0A0A0D] text-slate-600 dark:text-zinc-400 border-t border-slate-200/80 dark:border-white/10 pt-12 pb-10 relative font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Top Operational Advisory & Methodology Guidance Notice */}
        <div className="space-y-2 text-[11px] sm:text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
          <p>
            1. Karya Saarthi operates as an international project solutions provider and academic methodology advisory. All guidance, codebase walkthroughs, and documentation are delivered strictly for legitimate educational and implementation purposes.
          </p>
          <p>
            2. Saarthi Xpress fast-track deliverables are subject to preliminary technical feasibility evaluation and specialist availability. Transparent milestone quotes are provided in advance without undisclosed charges.
          </p>
          <p>
            3. All client code repositories, intellectual property, proprietary data, and research materials remain 100% confidential and client-owned under standard non-disclosure terms.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 dark:bg-white/10" />

        {/* 2. Logo Branding & Connect With Us Social Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#FF7A00] bg-white p-0.5 shadow-md shrink-0">
              <Image
                src="/logo.jpg"
                alt="Karya Saarthi Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white block leading-tight">
                Karya Saarthi
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Your Trusted Work Companion • Global Project Solutions &amp; Technical Execution
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
              Connect with Us:
            </span>
            <div className="flex items-center gap-2">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/karyasaarthi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-[#0077b5] dark:bg-white/5 dark:hover:bg-[#0077b5] text-slate-700 dark:text-zinc-300 hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-slate-300/60 dark:border-white/10 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/karyasaarthi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-[#E1306C] dark:bg-white/5 dark:hover:bg-[#E1306C] text-slate-700 dark:text-zinc-300 hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-slate-300/60 dark:border-white/10 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@karyasaarthi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-[#FF0000] dark:bg-white/5 dark:hover:bg-[#FF0000] text-slate-700 dark:text-zinc-300 hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-slate-300/60 dark:border-white/10 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918595025753"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-[#25D366] dark:bg-white/5 dark:hover:bg-[#25D366] text-slate-700 dark:text-zinc-300 hover:text-white dark:hover:text-white flex items-center justify-center transition-all border border-slate-300/60 dark:border-white/10 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/karyasaarthi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-black dark:bg-white/5 dark:hover:bg-white dark:hover:text-black text-slate-700 dark:text-zinc-300 hover:text-white flex items-center justify-center transition-all border border-slate-300/60 dark:border-white/10 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Main 5 Columns Navigation Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pt-2">
          
          {/* Column 1: Solutions & Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Solutions &amp; Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors">
                  Academic &amp; Research Support
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors">
                  Web &amp; Software Development
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors">
                  Digital Growth &amp; Technical SEO
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors flex items-center gap-1 font-semibold text-[#FF7A00]">
                  <span>⚡ Saarthi Xpress</span>
                  <span className="text-[10px] bg-[#FF7A00]/10 border border-[#FF7A00]/30 px-1.5 py-0.2 rounded font-mono">
                    Fast Track
                  </span>
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors font-medium">
                  Browse All Services
                </a>
              </li>
            </ul>

            {/* Sub-block under Col 1 */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Globally Providing Services</span>
              </span>
              <p className="flex items-center gap-1 text-[11px] text-[#1BAC6E] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1BAC6E]" />
                <span>195 Countries Supported</span>
              </p>
              <p className="text-[11px]">Worldwide Remote Delivery</p>
              <p className="text-[11px]">24/7 Multi-Timezone Technical Support</p>
              <p className="text-[11px]">Structured Milestone Execution</p>
            </div>
          </div>

          {/* Column 2: Learning & Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Learning &amp; Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <a href="#projects" className="hover:text-[#FF7A00] transition-colors">
                  Engineering &amp; Research Blog
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#FF7A00] transition-colors">
                  Verified Case Studies
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#FF7A00] transition-colors">
                  Technical Project Guides
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#FF7A00] transition-colors">
                  Karya Saarthi Podcasts
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#FF7A00] transition-colors">
                  Workshops &amp; Events
                </a>
              </li>
            </ul>

            {/* Sub-block under Col 2: Methodology */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 block">
                Methodology
              </span>
              <p className="text-[11px]">Structured Sprint Roadmaps</p>
              <p className="text-[11px]">Code Architecture Reviews</p>
              <p className="text-[11px]">Interactive Viva Defense Prep</p>
            </div>
          </div>

          {/* Column 3: About Karya Saarthi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About Karya Saarthi
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <a href="#about" className="hover:text-[#FF7A00] transition-colors">
                  About Us &amp; Mission
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-[#FF7A00] transition-colors">
                  Our Core Team
                </a>
              </li>
              <li>
                <a
                  href="https://career.karyasaarthi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF7A00] transition-colors"
                >
                  Career Opportunities
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#FF7A00] transition-colors">
                  Refer &amp; Earn Rewards
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#FF7A00] transition-colors">
                  Influencer Partner Program
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-[#FF7A00] transition-colors">
                  Become a Domain Specialist
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#FF7A00] transition-colors font-medium">
                  Contact &amp; Inquiries
                </a>
              </li>
            </ul>

            {/* Sub-block under Col 3: Official Channels */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 block">
                Official Channels
              </span>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://www.linkedin.com/company/karyasaarthi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-200/80 hover:bg-[#0077b5] hover:text-white dark:bg-white/5 dark:hover:bg-[#0077b5] text-slate-600 dark:text-zinc-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>
                <a
                  href="https://instagram.com/karyasaarthi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-200/80 hover:bg-[#E1306C] hover:text-white dark:bg-white/5 dark:hover:bg-[#E1306C] text-slate-600 dark:text-zinc-400 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a
                  href="https://youtube.com/@karyasaarthi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-200/80 hover:bg-[#FF0000] hover:text-white dark:bg-white/5 dark:hover:bg-[#FF0000] text-slate-600 dark:text-zinc-400 transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a
                  href="https://wa.me/918595025753"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-200/80 hover:bg-[#25D366] hover:text-white dark:bg-white/5 dark:hover:bg-[#25D366] text-slate-600 dark:text-zinc-400 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
                <a
                  href="https://x.com/karyasaarthi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-200/80 hover:bg-black hover:text-white dark:bg-white/5 dark:hover:bg-white dark:hover:text-black text-slate-600 dark:text-zinc-400 transition-colors"
                  aria-label="X"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Trust & Policies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Trust &amp; Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li>
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="hover:text-[#FF7A00] transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("terms")}
                  className="hover:text-[#FF7A00] transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("disclaimer")}
                  className="hover:text-[#FF7A00] transition-colors text-left cursor-pointer"
                >
                  Academic &amp; Fair Use Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("refund")}
                  className="hover:text-[#FF7A00] transition-colors text-left cursor-pointer"
                >
                  Refund &amp; Scope Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("confidentiality")}
                  className="hover:text-[#FF7A00] transition-colors text-left cursor-pointer"
                >
                  Confidentiality Standards
                </button>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF7A00] transition-colors">
                  Site Map
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Direct Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                <a
                  href="tel:+918595025753"
                  className="font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#FF7A00] transition-colors"
                >
                  +91-8595025753
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#004E89] dark:text-blue-400 shrink-0" />
                <a
                  href="mailto:support@karyasaarthi.com"
                  className="font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#FF7A00] transition-colors"
                >
                  support@karyasaarthi.com
                </a>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 pt-1">
                Mon – Sat: 9:00 AM – 7:00 PM IST
              </p>
              <p className="text-[11px] text-[#1BAC6E] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Global Inquiries Welcome</span>
              </p>
            </div>
          </div>

        </div>

        {/* 4. Full Width Corporate Office & Identity Details */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-2 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-slate-800 dark:text-zinc-200">Karyanex Private Limited</strong> · Operating Brand: <strong className="text-[#FF7A00]">Karya Saarthi</strong> · CIN: <span className="font-mono">U85500BR2026PTC085054</span> · GSTIN: <span className="font-mono">10AAMCK8870B1ZN</span> · Corporate Office: Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari, Delhi 110084, India
          </p>
          <p>
            More ways to connect: Call <a href="tel:+918595025753" className="text-[#FF7A00] font-semibold hover:underline">+91-8595025753</a> or <a href="mailto:support@karyasaarthi.com" className="text-[#FF7A00] font-semibold hover:underline">email our solutions desk</a>. Globally Providing Services across 195 countries with 24/7 dedicated support.
          </p>
        </div>

        {/* 5. Bottom Legal & Copyright Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-zinc-400 text-center md:text-left">
          <p>
            © 2026 Karyanex Private Limited (Karya Saarthi). All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-[#FF7A00] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-[#FF7A00] transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveModal("refund")}
              className="hover:text-[#FF7A00] transition-colors cursor-pointer"
            >
              Sales &amp; Refunds
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveModal("disclaimer")}
              className="hover:text-[#FF7A00] transition-colors cursor-pointer"
            >
              Legal &amp; Fair Use
            </button>
            <span>|</span>
            <a href="#services" className="hover:text-[#FF7A00] transition-colors">
              Site Map
            </a>
            <span>|</span>
            <Link href="/admin" className="hover:text-[#FF7A00] transition-colors">
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Globally Providing Services (in India)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

      </div>

      {/* Interactive Policy & Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto text-slate-700 dark:text-zinc-300 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeModal === "privacy" && "Privacy Policy"}
                {activeModal === "disclaimer" && "Academic & Fair Use Disclaimer"}
                {activeModal === "terms" && "Terms of Service & Engagement"}
                {activeModal === "refund" && "Refund & Milestone Scope Policy"}
                {activeModal === "confidentiality" && "Confidentiality & NDA Standards"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm space-y-3 leading-relaxed text-slate-600 dark:text-zinc-300">
              {activeModal === "privacy" && (
                <>
                  <p>
                    Karya Saarthi (operated by Karyanex Private Limited, CIN: U85500BR2026PTC085054) respects your privacy and is committed to protecting the personal data of our users, students, and clients.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">1. Information We Collect</h4>
                  <p>
                    We collect information provided directly when booking consultations, registering for project services, or subscribing to updates. This includes name, email, phone number, and project requirements.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">2. How We Use Information</h4>
                  <p>
                    Information collected is used solely for project execution, client communication, milestone updates, and scheduled appointments. We never sell or rent your personal data to third-party marketers.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">3. Data Security &amp; Contact</h4>
                  <p>
                    All data is encrypted and handled in compliance with applicable Indian IT and Data Protection standards. For questions, contact us at <a href="mailto:support@karyasaarthi.com" className="text-[#FF7A00] underline">support@karyasaarthi.com</a>.
                  </p>
                </>
              )}

              {activeModal === "disclaimer" && (
                <>
                  <p>
                    Karya Saarthi operates as an international project solutions provider and academic methodology advisory. All guidance, codebase walkthroughs, and documentation are delivered strictly for legitimate educational, business, and implementation purposes.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Educational &amp; Technical Services</h4>
                  <p>
                    Our services are designed to mentor, develop, and provide end-to-end technical, business, and research support. Clients and students are encouraged to use research guidance and consulting materials in compliance with their respective institutional guidelines.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Corporate Identity</h4>
                  <p>
                    Karyanex Private Limited holds CIN: U85500BR2026PTC085054 and GST: 10AAMCK8870B1ZN. All invoices and legal notices are issued under Karyanex Private Limited.
                  </p>
                </>
              )}

              {activeModal === "terms" && (
                <>
                  <p>
                    By engaging Karya Saarthi (Karyanex Private Limited) for software development, research methodology consulting, or marketing services, clients agree to milestone-based deliverables with structured sprint reviews.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Milestone Commitments</h4>
                  <p>
                    Sprint milestones, scope items, and technical specifications are documented in advance. Revisions within agreed project specifications are honored prior to sign-off.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Codebase &amp; Repository Delivery</h4>
                  <p>
                    Full source code, production deployment walkthroughs, and architectural assets are transferred to client-owned repositories upon final project milestone clearance.
                  </p>
                </>
              )}

              {activeModal === "refund" && (
                <>
                  <p>
                    Transparent milestone quotes are provided in advance without undisclosed charges. Initial discovery consultations are 100% complimentary.
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Scope Changes &amp; Refunds</h4>
                  <p>
                    In the unlikely event that a sprint deliverable fails agreed technical criteria, rework is conducted without additional fees. Refund requests are evaluated per our written milestone contract agreement.
                  </p>
                </>
              )}

              {activeModal === "confidentiality" && (
                <>
                  <p>
                    All client code repositories, intellectual property, proprietary datasets, and academic materials remain 100% confidential and client-owned under standard non-disclosure agreements (NDA).
                  </p>
                  <h4 className="font-semibold text-slate-900 dark:text-white pt-2">Security Architecture</h4>
                  <p>
                    We apply strict access isolation, private Git repositories, and encrypted environment variable handling for every client engagement.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
}
