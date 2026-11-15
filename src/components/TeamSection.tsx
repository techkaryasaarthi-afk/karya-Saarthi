"use client";

import React from "react";
import Image from "next/image";
import { TEAM } from "@/data/portfolioData";
import {
  ExternalLink,
  Mail,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Quote,
  Users,
  Award,
  ShieldCheck,
  Code,
  PenTool,
  Cpu,
  Briefcase,
  Laptop,
} from "lucide-react";

export default function TeamSection() {
  const founder = TEAM[0]; // Saloni Kumari
  const coreTeam = TEAM.slice(1);
  const orderedCoreTeam = [
    ...coreTeam.filter((member) => member.name === "Damini Yadav"),
    ...coreTeam.filter((member) => member.name !== "Damini Yadav"),
  ];

  return (
    <section id="team" className="py-24 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 dark:from-[#0E0E11] dark:via-[#121216] dark:to-[#0E0E11] relative text-slate-900 dark:text-white border-t border-gray-200/80 dark:border-white/5 transition-colors duration-300">
      {/* Subtle Ambient Warm Glow behind the section */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-orange-400/5 via-amber-400/5 to-emerald-400/5 dark:from-orange-500/10 dark:via-transparent dark:to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00] text-xs font-bold uppercase tracking-wider shadow-xs">
            Leadership &amp; Core Team
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FF8A00] to-[#FFA000]">Visionary Leadership</span> &amp; Domain Experts
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Started on 15 August 2025 and incorporated as Karyanex Private Limited on 18 May 2026. India&apos;s first project solutions company where education meets execution.
          </p>
        </div>

        {/* 1. Founder Spotlight Card (Crisp, High-Contrast Executive Layout) */}
        {founder && (
          <div className="mb-20 bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden backdrop-blur-xl transition-all">
            {/* Ambient Background Corner Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              
              {/* Founder Image & Quick Meta */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-orange-500/30 group-hover:border-[#FF7A00] shadow-xl shadow-orange-500/10 shrink-0 group transition-all">
                  <Image
                    src={founder.image || "/logo.jpg"}
                    alt={founder.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold px-3.5 py-1 rounded-full bg-[#FF7A00] text-white shadow-lg whitespace-nowrap">
                    {founder.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{founder.name}</h3>
                  <p className="text-sm font-bold text-[#FF7A00] mt-0.5">{founder.role}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">August 2025 – Present • Karyanex Private Limited</p>
                </div>

                {/* Founder Direct Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  {founder.social.linkedin && (
                    <a
                      href={founder.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#004E89] text-slate-700 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-[#004E89] dark:hover:text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 border border-gray-200 dark:border-zinc-700 shadow-sm cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                      <span>Connect on LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {founder.email && (
                    <a
                      href={`mailto:${founder.email}`}
                      className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-[#FF7A00] text-[#FF7A00] hover:text-white dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-[#FF7A00] dark:hover:text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 border border-orange-200 dark:border-orange-900/50 shadow-sm cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{founder.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Founder Story, Mission & Bullet Points */}
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Founder&apos;s Vision &amp; Origin Story
                </div>

                {/* Mission Quote Banner */}
                {founder.quote && (
                  <div className="border-l-4 border-[#FF7A00] bg-gradient-to-r from-orange-50/80 via-orange-50/40 to-transparent dark:from-zinc-800/80 dark:to-transparent p-4 sm:p-5 rounded-r-2xl flex items-start gap-3 shadow-xs">
                    <Quote className="w-6 h-6 text-[#FF7A00] shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base font-semibold italic text-slate-800 dark:text-zinc-100 leading-relaxed">
                      &quot;{founder.quote}&quot;
                    </p>
                  </div>
                )}

                {/* Bio Narrative */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {founder.bio}
                </p>

                {/* Education */}
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 font-mono bg-slate-50 dark:bg-zinc-800/80 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700/80">
                  <GraduationCap className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <span><strong>Education:</strong> {founder.education}</span>
                </div>

                {/* Key Achievements & Milestones */}
                {founder.highlights && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Key Highlights &amp; Milestones
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {founder.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300 p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/60 hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#1BAC6E] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Expertise Tags */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {founder.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-3 py-1 rounded-full bg-orange-50 text-[#C2410C] dark:bg-zinc-800 dark:text-[#FFD08A] border border-orange-200/80 dark:border-zinc-700 shadow-2xs"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 2. Section Subhead: Core Leadership Team */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
            <Users className="h-3.5 w-3.5" />
            The People Behind The Work
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Core Leadership <span className="text-slate-400 dark:text-zinc-600">&amp;</span>
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FF8A00] to-[#FFA000] sm:ml-2">
              Domain Leads
            </span>
          </h3>
          <div className="mx-auto mt-4 mb-3 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent" />
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            The dedicated team executing operations, engineering, marketing, and client partnerships.
          </p>
        </div>

        {/* 3. Core Leadership Cards Grid (Crisp White SaaS Cards with Rich Visual Hierarchy) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {orderedCoreTeam.map((member, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:border-[#FF7A00]/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle orange accent stripe at top on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 space-y-4">
                {/* Header Avatar & Role Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-orange-500/25 group-hover:border-[#FF7A00] shadow-md shadow-orange-500/10 group-hover:scale-105 transition-all duration-300 shrink-0 bg-slate-100 dark:bg-zinc-800 p-0.5">
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden">
                      <Image
                        src={member.image || "/logo.jpg"}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 shrink-0 max-w-[62%] text-right leading-tight">
                    {member.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF7A00] transition-colors tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FF7A00] font-bold mt-0.5">{member.role}</p>
                  
                  {member.education && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span className="truncate">{member.education}</span>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="text-slate-600 dark:text-zinc-300 hover:text-[#FF7A00] transition-colors truncate"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pt-1">
                  {member.bio}
                </p>

                {/* Experience & Skills Box */}
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#FF7A00]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Skills &amp; Expertise
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      {member.expertise.length} SPECIALTIES
                    </span>
                  </div>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    {member.experience}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-orange-400 hover:text-[#FF7A00] text-[11px] font-semibold px-2.5 py-1 transition-colors shadow-2xs"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action & Social Links */}
              <div className="relative z-10 pt-4 mt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#004E89] text-slate-700 hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                      <span>LinkedIn</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#FF7A00] text-slate-700 hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
                      title={`Send email to ${member.name}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Team</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Network Power Banner (Premium Metric Showcase Strip) */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-center grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/80 dark:divide-zinc-800">
          <div className="pt-4 first:pt-0 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">3 Core Members</div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">Full-Time Product &amp; Strategy Experts</p>
          </div>
          <div className="pt-4 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#FF7A00] tracking-tight">500+ Expert Vendors &amp; Freelancers</div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">Niche Developers, Marketers &amp; Freelance Consultants</p>
            {/* Small Icons Underneath Freelancers & Vendors */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-[#FF7A00] text-[10px] font-semibold border border-[#FF7A00]/25 shadow-2xs hover:scale-105 transition-transform" title="Full-Stack Developers">
                <Code className="w-3 h-3" />
                <span>Devs</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-semibold border border-blue-500/25 shadow-2xs hover:scale-105 transition-transform" title="UI/UX Designers & Freelancers">
                <PenTool className="w-3 h-3" />
                <span>Design</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/25 shadow-2xs hover:scale-105 transition-transform" title="PhD Academic Scholars">
                <GraduationCap className="w-3 h-3" />
                <span>Scholars</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-semibold border border-purple-500/25 shadow-2xs hover:scale-105 transition-transform" title="AI & ML Engineers">
                <Cpu className="w-3 h-3" />
                <span>AI/ML</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/25 shadow-2xs hover:scale-105 transition-transform" title="Growth Marketers">
                <Briefcase className="w-3 h-3" />
                <span>Marketing</span>
              </span>
            </div>
          </div>
          <div className="pt-4 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1BAC6E] tracking-tight">2,000+ Clients Served</div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">Students, Startups &amp; Businesses Across India</p>
          </div>
        </div>

      </div>
    </section>
  );
}
