"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, TrendingUp, Clock } from "lucide-react";

interface RoiCalculatorProps {
  onSendEstimate: (service: string, estimate: string) => void;
}

export default function RoiCalculator({ onSendEstimate }: RoiCalculatorProps) {
  const [selectedService, setSelectedService] = useState<string>("web");
  const [complexity, setComplexity] = useState<string>("medium");
  const [urgency, setUrgency] = useState<string>("standard");

  // Estimation calculation logic based on pricing specs
  const getEstimate = () => {
    let minBudget = 10000;
    let maxBudget = 50000;
    let timeline = "2-4 Weeks";
    let roi = "300% projected ROI via automated conversion & lead capture";

    if (selectedService === "web") {
      if (complexity === "low") {
        minBudget = 10000; maxBudget = 30000; timeline = "1-2 Weeks";
        roi = "2.5x increase in website visitor lead conversion";
      } else if (complexity === "medium") {
        minBudget = 30000; maxBudget = 85000; timeline = "2-4 Weeks";
        roi = "4.0x increase in brand authority & automated payment processing";
      } else {
        minBudget = 85000; maxBudget = 200000; timeline = "4-6 Weeks";
        roi = "12% conversion rate and ₹3L+ projected monthly sales";
      }
    } else if (selectedService === "mobile") {
      if (complexity === "low") {
        minBudget = 30000; maxBudget = 75000; timeline = "2-4 Weeks";
        roi = "2,500+ downloads within 30 days of launch";
      } else if (complexity === "medium") {
        minBudget = 75000; maxBudget = 200000; timeline = "4-6 Weeks";
        roi = "95% 90-day retention and ₹2L MRR potential";
      } else {
        minBudget = 200000; maxBudget = 500000; timeline = "6-8 Weeks";
        roi = "100k+ download capability & enterprise scalability";
      }
    } else if (selectedService === "marketing") {
      if (complexity === "low") {
        minBudget = 5000; maxBudget = 15000; timeline = "Monthly Retainer";
        roi = "35+ qualified leads per month";
      } else if (complexity === "medium") {
        minBudget = 15000; maxBudget = 35000; timeline = "Monthly Retainer";
        roi = "5.2x return on ad spend (ROAS)";
      } else {
        minBudget = 35000; maxBudget = 50000; timeline = "Monthly Retainer";
        roi = "Complete brand GTM and 10x social media reach growth";
      }
    } else if (selectedService === "ai") {
      if (complexity === "low") {
        minBudget = 30000; maxBudget = 75000; timeline = "4-6 Weeks";
        roi = "40% reduction in customer response handling time";
      } else if (complexity === "medium") {
        minBudget = 75000; maxBudget = 150000; timeline = "6-10 Weeks";
        roi = "Custom fine-tuned model deployed with 99.2% inference accuracy";
      } else {
        minBudget = 150000; maxBudget = 400000; timeline = "10-14 Weeks";
        roi = "Autonomous enterprise AI workflow replacing 150+ human hours/mo";
      }
    } else if (selectedService === "academic") {
      if (complexity === "low") {
        minBudget = 5000; maxBudget = 15000; timeline = "1-2 Weeks";
        roi = "Turnitin verified zero AI plagiarism guarantee (<5%)";
      } else if (complexity === "medium") {
        minBudget = 15000; maxBudget = 35000; timeline = "2-4 Weeks";
        roi = "UGC Care / Scopus indexed standard compliance";
      } else {
        minBudget = 35000; maxBudget = 80000; timeline = "4-8 Weeks";
        roi = "Top-tier IEEE / ACM publication and journal acceptance";
      }
    } else if (selectedService === "consulting") {
      if (complexity === "low") {
        minBudget = 10000; maxBudget = 30000; timeline = "2-4 Weeks";
        roi = "Validated Lean Canvas and competitive positioning map";
      } else if (complexity === "medium") {
        minBudget = 30000; maxBudget = 60000; timeline = "4-8 Weeks";
        roi = "Investor-ready pitch deck and GTM roadmap";
      } else {
        minBudget = 60000; maxBudget = 100000; timeline = "8-12 Weeks";
        roi = "Series A fundraising prep (₹5Cr target round)";
      }
    }

    if (urgency === "fast") {
      minBudget = Math.round(minBudget * 1.15);
      maxBudget = Math.round(maxBudget * 1.15);
      timeline = "Accelerated (" + timeline + ")";
    }

    return {
      budgetStr: `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`,
      timeline,
      roi,
    };
  };

  const estimate = getEstimate();

  return (
    <section id="roi-calculator" className="py-24 bg-slate-50 dark:bg-[#0E0E11] relative text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider">
            Interactive Cost &amp; ROI Estimator
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Calculate Your <span className="text-[#FF6B35]">Project Investment</span> &amp; ROI
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Select your requirements below to instantly generate a transparent cost estimate, timeline projection, and expected growth metrics.
          </p>
        </div>

        {/* Estimator Card Widget */}
        <div className="glass-card rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Select Service */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
                1. Select Service Offering:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { id: "web", label: "Website Dev" },
                  { id: "mobile", label: "Mobile App" },
                  { id: "marketing", label: "Digital Marketing" },
                  { id: "ai", label: "AI & ML System" },
                  { id: "academic", label: "Research Support" },
                  { id: "consulting", label: "Business Consulting" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`p-2.5 sm:p-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      selectedService === s.id
                        ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-lg shadow-[#FF6B35]/25"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:border-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Project Scope / Complexity */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
                2. Project Scope &amp; Complexity Level:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: "low", label: "Startup / Basic MVP", desc: "Essential features" },
                  { id: "medium", label: "Scale-Up / Growth", desc: "Custom integrations" },
                  { id: "high", label: "Enterprise Grade", desc: "Advanced AI & scale" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setComplexity(c.id)}
                    className={`p-3 sm:p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      complexity === c.id
                        ? "bg-[#FF6B35]/10 border-[#FF6B35] text-slate-900 dark:bg-[#FF6B35]/15 dark:text-white"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-bold">{c.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 sm:mt-1">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Urgency */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
                3. Delivery Timeline Preference:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  { id: "standard", label: "Standard Delivery", desc: "Regular sprint pacing" },
                  { id: "fast", label: "Accelerated Sprint", desc: "Priority execution (+15%)" },
                ].map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setUrgency(u.id)}
                    className={`p-3 sm:p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      urgency === u.id
                        ? "bg-[#FF6B35]/10 border-[#FF6B35] text-slate-900 dark:bg-[#FF6B35]/15 dark:text-white"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-bold">{u.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 sm:mt-1">{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results Summary Column with Interactive Lift & Glow */}
          <div className="lg:col-span-5 bg-white dark:bg-gradient-to-br dark:from-[#181820] dark:to-[#121217] p-5 sm:p-7 rounded-2xl border border-[#FF6B35]/40 space-y-5 sm:space-y-6 relative overflow-hidden shadow-xl card-interactive-lift group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-all duration-500" />

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                Instant Estimate Summary
              </span>
              <Sparkles className="w-5 h-5 text-[#FF6B35] group-hover:rotate-12 transition-transform duration-300" />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Estimated Price Range:</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#FF6B35] break-words">{estimate.budgetStr}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Estimated Timeline:</span>
                <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  {estimate.timeline}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-[#1BAC6E]/10 dark:border-[#1BAC6E]/20 text-xs space-y-1">
                <span className="font-bold text-[#1BAC6E] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Projected ROI &amp; Impact:
                </span>
                <p className="text-slate-700 dark:text-zinc-200">{estimate.roi}</p>
              </div>
            </div>

            <button
              onClick={() => {
                const serviceLabel = selectedService.toUpperCase();
                onSendEstimate(serviceLabel, `${estimate.budgetStr} (${estimate.timeline})`);
              }}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#FF8855] shadow-lg shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lock In This Estimate &amp; Request Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
