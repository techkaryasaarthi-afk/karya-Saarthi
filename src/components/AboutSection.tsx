"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@/data/portfolioData";
import { GraduationCap, Rocket, Building2, Target, Eye } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-[#121216] relative border-t border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider">
            About Karya Saarthi
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bridging the Gap Between <span className="text-[#FF6B35]">Learning</span> &amp; <span className="text-[#004E89]">Doing</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300">
            Started on 15 August 2025 and incorporated on 18 May 2026 as Karyanex Private Limited, Karya Saarthi (Hindi: &quot;Work Partner&quot;) is India&apos;s first &quot;Teach + Complete&quot; project solutions company.
          </p>
        </div>

        {/* 2-Column Story & Brand Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left Column: Visual Brand Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card rounded-3xl p-5 sm:p-8 border border-[#FF6B35]/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/15 dark:bg-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF6B35] bg-white p-0.5 shadow-xl shrink-0">
                  <Image src="/logo.jpg" alt="Karya Saarthi Logo" fill className="object-contain rounded-full" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{BRAND.name}</h3>
                  <p className="text-xs text-[#FF6B35] font-mono">{BRAND.meaning}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-6">
                {BRAND.aboutSummary}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
                <div>
                  <p className="text-slate-500 dark:text-zinc-400">Team Size</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">7 Core + 500+ Vendors</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-zinc-400">Global Reach</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">50+ Cities | 15+ Countries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Primary Target Segments */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Three Primary Segments We Serve</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Segment 1: Students */}
              <div className="glass-card card-interactive-lift p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/15 flex items-center justify-center text-[#FF6B35] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">Students &amp; Interns</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Skill-building internships and hands-on production experience on real client projects.
                </p>
              </div>

              {/* Segment 2: Startups */}
              <div className="glass-card card-interactive-lift p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-[#004E89]/15 dark:bg-[#004E89]/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Rocket className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Early Startups</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Rapid MVP engineering, product strategy, GTM execution, and investor pitch deck readiness.
                </p>
              </div>

              {/* Segment 3: SMBs */}
              <div className="glass-card card-interactive-lift p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-[#1BAC6E]/15 dark:bg-[#1BAC6E]/20 flex items-center justify-center text-[#1BAC6E] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#1BAC6E] transition-colors">SMBs &amp; Enterprises</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Affordable business solutions, modern websites, automated digital marketing, and AI tools.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="glass-card card-interactive-lift p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-4 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">Our Mission</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              &quot;{BRAND.mission}&quot;
            </p>
          </div>

          <div className="glass-card card-interactive-lift p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-4 group cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Our Vision (2030 Goal)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              &quot;{BRAND.vision}&quot;
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
