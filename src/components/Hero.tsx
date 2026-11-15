"use client";

import React from "react";
import { ArrowRight, Star, CheckCircle2, ShieldCheck } from "lucide-react";
import { BRAND } from "@/data/portfolioData";
import { useCountry } from "@/context/CountryContext";

interface HeroProps {
  onOpenConsultation: () => void;
  onOpenQuote?: () => void;
}

export default function Hero({ onOpenConsultation }: HeroProps) {
  const { t, convertBudget } = useCountry();
  return (
    <section id="hero" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-slate-50 dark:bg-[#0E0E11] text-slate-900 dark:text-white transition-colors duration-300">
      {/* 1. Fast, Clearly Visible Animated Background Square Grid */}
      <div 
        className="absolute inset-0 animated-grid-pattern opacity-70 [mask-image:radial-gradient(ellipse_85%_75%_at_50%_40%,#000_50%,transparent_95%)] pointer-events-none z-0"
      />

      {/* Gentle, Subtle Ambient Warm Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#FF7A00]/10 dark:bg-[#FF7A00]/12 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[#004E89]/8 dark:bg-[#004E89]/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Radial Gradient Glow Behind Headline */}
      <div className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[700px] h-[320px] bg-[radial-gradient(ellipse_at_center,rgba(255,122,0,0.12),rgba(27,172,110,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,122,0,0.16),rgba(0,78,137,0.10),transparent_70%)] blur-2xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* 1. Top Pill Badge: Clean subtle pulsing green dot */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md hover:border-[#FF7A00]/40 transition-colors">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1BAC6E] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1BAC6E]" />
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-zinc-200">
              {t("hero.badge", "India's 1st 'Teach + Complete' Project Platform")}
            </span>
          </div>

          {/* Main Title Tagline with Animated Logo Color Gradient */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] text-slate-900 dark:text-white break-words">
            {t("hero.titleRealWork", "Real Work.")} <br className="hidden sm:inline" />
            <span className="logo-gradient-animated">
              {t("hero.titleRealLearning", "Real Learning.")} {t("hero.titleRealGrowth", "Real Growth.")}
            </span>
          </h1>

          {/* 2. Tightened Subheadline Copy (30-35 words, crisp 3-line value proposition) */}
          <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t("hero.subtitle", "Empowering students, startups, and enterprises with end-to-end execution. We bridge the gap between learning and doing through rapid MVPs, full-stack software development, AI solutions, and specialized research support.")}
          </p>

          {/* 3. Simplified 2 High-Impact CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            {/* Primary CTA: Solid warm orange with subtle shadow and hover lift */}
            <button
              onClick={onOpenConsultation}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#FF7A00] to-[#FF9000] hover:from-[#FF6A00] hover:to-[#FF8000] shadow-lg shadow-[#FF7A00]/25 hover:shadow-xl hover:shadow-[#FF7A00]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t("hero.ctaFree", "Schedule Free Consultation")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA: Clean bordered outline with subtle hover background tint */}
            <a
              href="#roi-calculator"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-slate-800 dark:text-zinc-100 hover:text-[#FF7A00] dark:hover:text-[#FF9000] bg-white/80 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/15 shadow-sm hover:border-[#FF7A00]/50 dark:hover:border-[#FF7A00]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group text-center cursor-pointer"
            >
              <span>{t("hero.ctaRoi", "Calculate Project ROI")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FF7A00]" />
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1BAC6E]" />
              <span>{t("hero.profitable", "Bootstrapped & Profitable")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
              <span>{t("hero.verified", "100% Turnitin Verified Quality")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{t("hero.rating", "4.8/5 Rating (150+ Reviews)")}</span>
            </div>
          </div>
        </div>

        {/* Hero Stat Banner with Interactive Lift & Glow */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-[#FF6B35] group-hover:scale-110 transition-transform duration-300">
              {convertBudget(BRAND.keyStats.revenueFirst3Months)}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              {t("hero.statRevenue", "Revenue in First 3 Months")}
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:text-[#FF8855] group-hover:scale-110 transition-all duration-300">
              {BRAND.keyStats.totalProjects}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              {t("hero.statProjects", "Successful Projects Delivered")}
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-[#1BAC6E] group-hover:scale-110 transition-transform duration-300">
              {BRAND.keyStats.rating}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              {t("hero.statRating", "Client Satisfaction Rating")}
            </div>
          </div>

          <div className="glass-card card-interactive-lift rounded-2xl p-4 sm:p-6 text-center border border-slate-200/80 dark:border-white/10 group cursor-default">
            <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white group-hover:text-[#FF6B35] group-hover:scale-110 transition-all duration-300">
              {BRAND.keyStats.satisfaction}
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
              {t("hero.statRetention", "Client Retention & Happiness")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
