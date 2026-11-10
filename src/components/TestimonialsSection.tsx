"use client";

import React, { useState } from "react";
import { TESTIMONIALS } from "@/data/portfolioData";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0E0E11] relative text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider">
            Client Testimonials &amp; Social Proof
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trusted by <span className="text-[#FF6B35]">Founders</span>, Researchers &amp; SMBs
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Read real feedback from clients who launched apps, published IEEE papers, and scaled online revenue with Karya Saarthi.
          </p>
        </div>

        {/* Featured Interactive Testimonial Spotlight */}
        <div className="glass-card rounded-3xl p-5 sm:p-8 md:p-12 border border-[#FF6B35]/30 shadow-xl relative mb-16 max-w-4xl mx-auto overflow-hidden">
          <Quote className="w-10 h-10 sm:w-16 sm:h-16 text-[#FF6B35]/10 absolute top-4 sm:top-6 right-4 sm:right-6 pointer-events-none" />

          <div className="space-y-5 sm:space-y-6 relative z-10">
            {/* Stars */}
            <div className="flex items-center gap-1.5 text-amber-500">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 ml-1.5 sm:ml-2">
                5.0 Verified Review
              </span>
            </div>

            {/* Quote text */}
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-800 dark:text-zinc-100 leading-relaxed italic">
              &quot;{current.text}&quot;
            </p>

            {/* Author */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FFA000] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shadow-[#FF6B35]/25 border-2 border-[#FF6B35] shrink-0 select-none">
                  {current.client ? current.client.trim().charAt(0).toUpperCase() : "K"}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{current.client}</h3>
                  <p className="text-xs text-[#FF6B35] font-semibold">{current.role} • {current.company}</p>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 block">
                    Service: {current.serviceUsed}
                  </span>
                </div>
              </div>

              {/* Slider controls */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-slate-100 hover:bg-[#FF6B35] hover:text-white border border-slate-200 dark:bg-white/5 dark:hover:bg-[#FF6B35] dark:border-white/10 transition-all text-slate-700 dark:text-white cursor-pointer"
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-slate-100 hover:bg-[#FF6B35] hover:text-white border border-slate-200 dark:bg-white/5 dark:hover:bg-[#FF6B35] dark:border-white/10 transition-all text-slate-700 dark:text-white cursor-pointer"
                  aria-label="Next Testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof & Rating Badges with Interactive Lift */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="glass-card card-interactive-lift p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 group">
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1 group-hover:text-[#FF7A00] transition-colors">
              <span>Google Reviews</span>
            </div>
            <div className="text-2xl font-black text-[#FF7A00] mt-1 group-hover:scale-110 transition-transform duration-300">4.8 / 5</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">150+ Verified Reviews</p>
          </div>

          <div className="glass-card card-interactive-lift p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 group">
            <div className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#0D9488] transition-colors">Clutch.co</div>
            <div className="text-2xl font-black text-[#0D9488] mt-1 group-hover:scale-110 transition-transform duration-300">4.9 / 5</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Top 2% Agencies</p>
          </div>

          <div className="glass-card card-interactive-lift p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 group">
            <div className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">GoodFirms</div>
            <div className="text-2xl font-black text-blue-500 mt-1 group-hover:scale-110 transition-transform duration-300">4.8 / 5</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Verified Partner</p>
          </div>

          <div className="glass-card card-interactive-lift p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 group">
            <div className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF9E00] transition-colors">Press Coverage</div>
            <div className="text-sm font-bold text-amber-500 mt-2">Inc42 • YourStory</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Startup Magazine</p>
          </div>
        </div>

      </div>
    </section>
  );
}
