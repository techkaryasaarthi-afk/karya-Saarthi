"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Star, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { BRAND } from "@/data/portfolioData";

interface HeroProps {
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
}

export default function Hero({ onOpenConsultation, onOpenQuote }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50 dark:bg-[#0E0E11] text-slate-900 dark:text-white transition-colors duration-300">
      {/* 1. Fast, Clearly Visible Animated Background Square Grid */}
      <div 
        className="absolute inset-0 animated-grid-pattern opacity-70 [mask-image:radial-gradient(ellipse_85%_75%_at_50%_40%,#000_50%,transparent_95%)] pointer-events-none z-0"
      />

      {/* Gentle, Subtle Ambient Warm Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#FF7A00]/10 dark:bg-[#FF7A00]/12 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[#004E89]/8 dark:bg-[#004E89]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Logo Emblem Header styled with Logo Colors */}
          <div className="max-w-full inline-flex items-center gap-2.5 sm:gap-3.5 bg-white/90 dark:bg-[#121216]/90 border border-slate-200 dark:border-[#004E89]/60 hover:border-[#FF7A00]/70 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5 backdrop-blur-md shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-[#FF7A00]/15 animate-float transition-colors">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#FF7A00] shadow-md shadow-[#FF7A00]/40 shrink-0 bg-white p-0.5">
              <Image src="/logo.jpg" alt="Karya Saarthi Emblem" fill className="object-contain rounded-full" />
            </div>
            <span className="text-[11px] sm:text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 leading-tight text-left sm:text-center">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0D9488] animate-ping shrink-0" />
              <span>India&apos;s 1st &quot;Teach + Complete&quot; Project Platform</span>
            </span>
          </div>

          {/* Main Title Tagline with Animated Logo Color Gradient */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] text-slate-900 dark:text-white break-words">
            Real Work. <br className="hidden sm:inline" />
            <span className="logo-gradient-animated">Real Learning. Real Growth.</span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {BRAND.mission} We bridge the gap between learning and doing through rapid startup MVPs, scalable web &amp; mobile solutions, AI data models, and research support.
          </p>

          {/* Action CTAs with Light Sweep Animation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenConsultation}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#FF7A00] via-[#FF8A00] to-[#FFA000] hover:opacity-95 shadow-xl shadow-[#FF7A00]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {/* Animated Light Sweep Effect */}
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shine-sweep pointer-events-none" />
              <span className="relative z-10">Schedule Free Consultation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform relative z-10" />
            </button>

            <button
              onClick={onOpenQuote}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/15 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FF6B35]" />
              <span>Get Custom Quote</span>
            </button>

            <a
              href="#roi-calculator"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-medium text-slate-600 hover:text-[#FF6B35] dark:text-zinc-400 dark:hover:text-[#FF6B35] transition-colors text-center"
            >
              Calculate Project ROI →
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1BAC6E]" />
              <span>Bootstrapped &amp; Profitable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
              <span>100% Turnitin Verified Quality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.8/5 Rating (150+ Reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero Stat Banner with Interactive Lift & Glow */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-[#FF6B35] group-hover:scale-110 transition-transform duration-300">
              {BRAND.keyStats.revenueFirst3Months}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              Revenue in First 3 Months
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:text-[#FF8855] group-hover:scale-110 transition-all duration-300">
              {BRAND.keyStats.totalProjects}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              Successful Projects Delivered
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-[#1BAC6E] group-hover:scale-110 transition-transform duration-300">
              {BRAND.keyStats.rating}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              Client Satisfaction Rating
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:text-[#FF6B35] group-hover:scale-110 transition-all duration-300">
              {BRAND.keyStats.satisfaction}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              Client Retention &amp; Happiness
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
