"use client";

/**
 * ProjectBannerIllustration Component
 * 
 * Renders thematic 3D-styled animated device illustrations for all 6 case studies:
 * 1. FitPro: Mobile fitness tracking device with glowing heartbeat pulse & calorie burn meter
 * 2. LearnFlow: Mini code IDE window with syntax highlighting and compiler terminal status
 * 3. HandMade Stories: E-commerce live storefront card with 5-star rating, pricing & instant checkout
 * 4. QuickDeliver: AI Route HUD with interactive SVG vector path, route nodes & predictive ETA
 * 5. Dr. Neha Kapoor: IEEE certified research document with peer-review stamp & Turnitin plagiarism score
 * 6. TaskFlow: SaaS Series A MRR growth chart with dynamic gradient velocity bars & funding target
 */

import React from "react";
import {
  Smartphone,
  Activity,
  Flame,
  Laptop,
  Code,
  Sparkles,
  ShoppingBag,
  Tag,
  Star,
  Cpu,
  Navigation,
  FileText,
  Award,
  Rocket,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface ProjectBannerIllustrationProps {
  projectId: string;
}

export default function ProjectBannerIllustration({ projectId }: ProjectBannerIllustrationProps) {
  switch (projectId) {
    case "fitpro":
      // Health & Fitness App: Interactive smartphone with workout activity ring & pulse wave
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-[#FF6B35]/30 via-rose-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          {/* Floating UI Elements Container */}
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* Phone Screen Mockup */}
            <div className="relative w-28 sm:w-32 h-40 rounded-2xl bg-slate-900/85 dark:bg-black/80 backdrop-blur-md border border-white/20 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[-6deg] group-hover:rotate-[-2deg] transition-all duration-500">
              {/* Notch */}
              <div className="w-8 h-1 bg-white/30 rounded-full mx-auto" />
              
              {/* Activity Circle & Metrics */}
              <div className="space-y-1.5 my-auto">
                <div className="flex items-center justify-center relative">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" className="text-white/10" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#FF6B35"
                      strokeWidth="3.5"
                      strokeDasharray="113"
                      strokeDashoffset="28"
                      strokeLinecap="round"
                      fill="transparent"
                      className="animate-pulse"
                    />
                  </svg>
                  <Flame className="w-5 h-5 text-amber-400 absolute" />
                </div>
                
                {/* Simulated EKG Pulse Wave */}
                <svg className="w-full h-4 text-emerald-400" viewBox="0 0 100 20" fill="none">
                  <path
                    d="M0 10 H30 L38 2 L46 18 L54 6 L62 14 L70 10 H100"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                </svg>
              </div>

              {/* Bottom Stat Bar */}
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-300 bg-white/10 rounded-md px-1.5 py-0.5">
                <span>Daily Burn</span>
                <span className="text-[#FF7A00] font-bold">850 kcal</span>
              </div>
            </div>

            {/* Floating Live Badge */}
            <div className="absolute -top-1 right-1 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-[#FF6B35]/40 shadow-lg flex items-center gap-1.5 text-[9px] font-bold text-[#FF6B35] animate-float">
              <Activity className="w-3 h-3 text-[#FF6B35] animate-ping" />
              <span>500+ Trainers</span>
            </div>
          </div>
        </div>
      );

    case "learnflow":
      // Online Education: Coding IDE window with syntax lines, graduation cap & conversion badge
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* Glassmorphic Code IDE Window */}
            <div className="relative w-36 sm:w-40 h-36 rounded-xl bg-slate-900/90 dark:bg-black/85 backdrop-blur-md border border-indigo-400/30 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[4deg] group-hover:rotate-[1deg] transition-all duration-500">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[8px] font-mono text-zinc-400">learnflow.ts</span>
              </div>

              {/* Code Snippets */}
              <div className="space-y-1 font-mono text-[8px] leading-tight text-zinc-300">
                <p className="text-purple-300">const growth = &quot;10x&quot;;</p>
                <p className="text-emerald-300">students.enroll(2500);</p>
                <div className="flex items-center gap-1 text-indigo-300">
                  <span>scale.toMarket()</span>
                  <span className="w-1.5 h-2.5 bg-indigo-400 animate-pulse" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full w-[85%]" />
              </div>
            </div>

            {/* Floating Conversion Pill */}
            <div className="absolute -top-1 right-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-indigo-500/40 shadow-lg flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 animate-float">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>8% Conversion</span>
            </div>
          </div>
        </div>
      );

    case "handmade-stories":
    case "handmadestories":
      // E-Commerce Store: Shopping showcase card with price badge, 5-star rating & checkout
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* Storefront Product Card Mockup */}
            <div className="relative w-32 sm:w-36 h-38 rounded-2xl bg-slate-900/90 dark:bg-black/85 backdrop-blur-md border border-emerald-400/40 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[-4deg] group-hover:rotate-[0deg] transition-all duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono">
                  LIVE STORE
                </span>
              </div>

              {/* 5-Star Visual & Product details */}
              <div className="space-y-1 py-0.5">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                  ))}
                  <span className="text-[8px] font-mono text-zinc-300 ml-1">4.9</span>
                </div>
                <div className="text-[10px] font-bold text-white leading-tight">
                  Handmade Stories
                </div>
                <div className="text-[9px] font-mono text-emerald-400 font-bold">
                  ₹2,499 · Razorpay
                </div>
              </div>

              {/* Mini Cart Button */}
              <div className="w-full py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-bold text-center flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30">
                <span>Instant Checkout</span>
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Floating Tag Badge */}
            <div className="absolute -top-1 right-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-emerald-500/40 shadow-lg flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 animate-float">
              <Tag className="w-3 h-3 text-emerald-500" />
              <span>12% Conversion</span>
            </div>
          </div>
        </div>
      );

    case "quickdeliver":
      // AI & Logistics: Radar wave grid with neural route nodes & live delivery indicator
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* Radar / Route HUD Card */}
            <div className="relative w-36 sm:w-40 h-36 rounded-2xl bg-slate-900/90 dark:bg-black/85 backdrop-blur-md border border-cyan-400/30 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[3deg] group-hover:rotate-[0deg] transition-all duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[8px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  AI ROUTE HUD
                </span>
                <span className="text-[8px] font-mono text-emerald-400">ONLINE</span>
              </div>

              {/* Dynamic Connected Node Path */}
              <div className="relative h-14 w-full flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                  <line x1="50" y1="0" x2="50" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
                  {/* Glowing Route Line */}
                  <path
                    d="M10 30 Q 30 10, 50 25 T 90 10"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                  {/* Nodes */}
                  <circle cx="10" cy="30" r="3" fill="#3B82F6" />
                  <circle cx="50" cy="25" r="3" fill="#06B6D4" />
                  <circle cx="90" cy="10" r="3.5" fill="#10B981" className="animate-ping" />
                  <circle cx="90" cy="10" r="3.5" fill="#10B981" />
                </svg>
              </div>

              {/* Bottom Accuracy Metric */}
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-300 bg-white/10 rounded-md px-1.5 py-0.5">
                <span>Predictive ETA</span>
                <span className="text-cyan-400 font-bold">-35% Time</span>
              </div>
            </div>

            {/* Floating Accuracy Pill */}
            <div className="absolute -top-1 right-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-cyan-500/40 shadow-lg flex items-center gap-1 text-[9px] font-bold text-cyan-600 dark:text-cyan-400 animate-float">
              <Navigation className="w-3 h-3 text-cyan-500" />
              <span>99.2% AI Accuracy</span>
            </div>
          </div>
        </div>
      );

    case "dr-neha-kapoor":
    case "drnehakapoor":
      // Academic Research: IEEE Journal certified sheet with seal & Turnitin score
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* Research Paper Mockup Sheet */}
            <div className="relative w-36 sm:w-40 h-36 rounded-2xl bg-slate-900/90 dark:bg-black/85 backdrop-blur-md border border-amber-400/40 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[-3deg] group-hover:rotate-[0deg] transition-all duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[8px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  IEEE ACCESS
                </span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded-full">ACCEPTED</span>
              </div>

              {/* Abstract Preview Lines */}
              <div className="space-y-1.5 py-1">
                <div className="h-1.5 bg-amber-400/50 rounded w-full" />
                <div className="h-1 bg-white/20 rounded w-4/5" />
                <div className="h-1 bg-white/20 rounded w-3/4" />
                <div className="h-1 bg-white/20 rounded w-5/6" />
              </div>

              {/* Verification Stamp */}
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-300 bg-white/10 rounded-md px-1.5 py-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Peer Reviewed
                </span>
                <span className="text-amber-400 font-bold">Q1 Journal</span>
              </div>
            </div>

            {/* Floating Turnitin Pill */}
            <div className="absolute -top-1 right-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-amber-500/40 shadow-lg flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 animate-float">
              <FileText className="w-3 h-3 text-amber-500" />
              <span>Turnitin 0% AI Plagiarism</span>
            </div>
          </div>
        </div>
      );

    case "taskflow":
      // SaaS Platform: Sprint Kanban & Series A Funding Rocket chart
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Ambient Mesh Gradient */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-gradient-to-br from-[#FF7A00]/25 via-pink-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          
          <div className="absolute right-3 top-3 bottom-3 w-48 sm:w-56 flex items-center justify-end pr-2 group-hover:translate-x-[-4px] transition-transform duration-500">
            {/* SaaS Metrics Dashboard Card */}
            <div className="relative w-36 sm:w-40 h-36 rounded-2xl bg-slate-900/90 dark:bg-black/85 backdrop-blur-md border border-[#FF7A00]/30 p-2.5 shadow-2xl flex flex-col justify-between transform rotate-[3deg] group-hover:rotate-[0deg] transition-all duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[8px] font-mono text-[#FF7A00] font-bold flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  MRR VELOCITY
                </span>
                <span className="text-[8px] font-mono text-pink-400">SERIES A</span>
              </div>

              {/* Growth Bars */}
              <div className="flex items-end justify-between h-14 px-1 gap-1.5">
                <div className="w-3.5 bg-gradient-to-t from-orange-500/40 to-orange-500 h-[35%] rounded-t-sm" />
                <div className="w-3.5 bg-gradient-to-t from-orange-500/40 to-orange-500 h-[55%] rounded-t-sm" />
                <div className="w-3.5 bg-gradient-to-t from-pink-500/50 to-pink-500 h-[75%] rounded-t-sm" />
                <div className="w-3.5 bg-gradient-to-t from-[#FF7A00] to-pink-500 h-[100%] rounded-t-sm relative shadow-lg shadow-pink-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute -top-1 left-1/2 -translate-x-1/2 animate-ping" />
                </div>
              </div>

              {/* Bottom Target */}
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-300 bg-white/10 rounded-md px-1.5 py-0.5">
                <span>Fundraising Target</span>
                <span className="text-[#FF7A00] font-bold">₹5 Crore</span>
              </div>
            </div>

            {/* Floating Rocket Pill */}
            <div className="absolute -top-1 right-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-[#FF7A00]/40 shadow-lg flex items-center gap-1 text-[9px] font-bold text-[#FF7A00] animate-float">
              <Rocket className="w-3 h-3 text-[#FF7A00]" />
              <span>MVP to ₹5Cr Seed</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
