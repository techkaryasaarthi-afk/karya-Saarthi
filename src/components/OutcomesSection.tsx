"use client";

import React from "react";
import { OUTCOMES_SUMMARY, PROJECT_OUTCOMES_TABLE } from "@/data/portfolioData";
import { CheckCircle } from "lucide-react";

export default function OutcomesSection() {
  return (
    <section id="outcomes" className="py-24 bg-white dark:bg-[#121216] relative text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1BAC6E]/10 border border-[#1BAC6E]/30 text-[#1BAC6E] text-xs font-semibold uppercase tracking-wider">
            Results &amp; Measurable Outcomes
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Data-Driven <span className="text-[#1BAC6E]">Performance</span> &amp; Track Record
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            We focus on measurable business impact—revenue generated, hours saved, and cost efficiency—rather than vanity metrics.
          </p>
        </div>

        {/* Portfolio Wide Metrics Grid with Logo Accent Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {OUTCOMES_SUMMARY.map((item, idx) => (
            <div
              key={idx}
              className="glass-card card-interactive-lift rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 group space-y-2 relative overflow-hidden"
            >
              {/* Top Logo Color Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7A00] via-[#0D9488] to-[#004E89] opacity-75 group-hover:opacity-100 transition-opacity" />

              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                {item.metric}
              </span>
              <p className="text-3xl font-black text-[#0D9488] group-hover:scale-105 group-hover:text-[#FF7A00] transition-all duration-300">
                {item.value}
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Project Specific Outcomes Table */}
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 p-4 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Project-Specific ROI Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Comparing timeline savings, cost recovery, and client revenues</p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#1BAC6E]/10 text-[#1BAC6E] border border-[#1BAC6E]/30 w-fit">
              Verified Client Benchmarks
            </span>
          </div>

          <div className="overflow-x-auto -mx-2 px-2 pb-1">
            <table className="w-full text-left text-xs sm:text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 font-mono uppercase">
                  <th className="py-3 px-3 sm:px-4">Project Name</th>
                  <th className="py-3 px-3 sm:px-4">Time Saved</th>
                  <th className="py-3 px-3 sm:px-4">Cost Saved / ROI</th>
                  <th className="py-3 px-3 sm:px-4">Revenue Generated</th>
                  <th className="py-3 px-3 sm:px-4">User / Reach Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {PROJECT_OUTCOMES_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#FF6B35] shrink-0" />
                      <span>{row.project}</span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600 dark:text-zinc-300 font-medium">{row.timeSaved}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-[#1BAC6E] font-semibold">{row.costSaved}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-[#FF6B35] font-bold">{row.revenue}</td>
                    <td className="py-3.5 px-3 sm:px-4 text-blue-600 dark:text-blue-400 font-medium">{row.reach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sm:hidden text-[10px] text-slate-400 dark:text-zinc-500 font-mono text-center">
            ← Scroll horizontally to see full metrics →
          </p>
        </div>

      </div>
    </section>
  );
}
