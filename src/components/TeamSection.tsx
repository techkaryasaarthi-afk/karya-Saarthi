"use client";

import React from "react";
import Image from "next/image";
import { TEAM } from "@/data/portfolioData";
import { ExternalLink, Mail, GraduationCap, Sparkles, CheckCircle2, TrendingUp, Quote, Building2, Users } from "lucide-react";

export default function TeamSection() {
  const founder = TEAM[0]; // Saloni Kumari
  const coreTeam = TEAM.slice(1);
  const orderedCoreTeam = [
    ...coreTeam.filter((member) => member.name === "Damini Yadav"),
    ...coreTeam.filter((member) => member.name !== "Damini Yadav"),
  ];

  return (
    <section id="team" className="py-24 bg-[#121216] relative text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold uppercase tracking-wider">
            Leadership &amp; Core Team
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Driven by <span className="text-[#FF7A00]">Visionary Leadership</span> &amp; Domain Experts
          </h2>
          <p className="text-base sm:text-lg text-zinc-400">
            Started on 15 August 2025 and incorporated as Karyanex Private Limited on 18 May 2026. India&apos;s first project solutions company where education meets execution.
          </p>
        </div>

        {/* Founder Spotlight Card */}
        {founder && (
          <div className="mb-20 glass-card rounded-3xl p-8 sm:p-10 border border-[#FF7A00]/30 bg-gradient-to-br from-white/[0.04] via-transparent to-[#FF7A00]/[0.05] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              
              {/* Founder Image & Quick Meta */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
                <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-[#FF7A00] shadow-2xl shadow-[#FF7A00]/20 shrink-0 group">
                  <Image
                    src={founder.image || "/logo.jpg"}
                    alt={founder.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#FF7A00] text-white shadow-lg whitespace-nowrap">
                    {founder.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-white">{founder.name}</h3>
                  <p className="text-sm font-semibold text-[#FF7A00]">{founder.role}</p>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">August 2025 – Present</p>
                </div>

                {/* Founder Direct Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {founder.social.linkedin && (
                    <a
                      href={founder.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#004E89] text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 border border-white/10"
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
                      className="px-4 py-2 rounded-xl bg-[#FF7A00]/20 hover:bg-[#FF7A00] text-[#FF7A00] hover:text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 border border-[#FF7A00]/40"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{founder.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Founder Story, Mission & Bullet Points */}
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Founder&apos;s Story &amp; Vision
                </div>

                {/* Mission Quote Banner */}
                {founder.quote && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-[#FF7A00]/30 flex items-start gap-3">
                    <Quote className="w-6 h-6 text-[#FF7A00] shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base font-medium italic text-zinc-200">
                      &quot;{founder.quote}&quot;
                    </p>
                  </div>
                )}

                {/* Bio Narrative */}
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {founder.bio}
                </p>

                {/* Education */}
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                  <GraduationCap className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <span><strong>Education:</strong> {founder.education}</span>
                </div>

                {/* Key Achievements & Milestones */}
                {founder.highlights && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Key Highlights &amp; Milestones
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {founder.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-zinc-300 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
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
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 text-[#FF7A00] border border-[#FF7A00]/30"
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

        {/* Section Subhead: Core Leadership Team */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A00]/25 bg-[#FF7A00]/[0.06] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB15C] shadow-[0_0_24px_rgba(255,122,0,0.08)]">
            <Users className="h-3.5 w-3.5" />
            The people behind the work
          </div>
          <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Core Leadership <span className="text-zinc-600">&amp;</span>
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFB347] to-[#FFD28A] sm:ml-2">
              Domain Leads
            </span>
          </h3>
          <div className="mx-auto mt-4 mb-3 h-px w-24 bg-gradient-to-r from-transparent via-[#FF7A00]/80 to-transparent" />
          <p className="text-sm sm:text-base text-zinc-400">
            The dedicated team executing operations, engineering, marketing, and client partnerships.
          </p>
        </div>

        {/* Core Leadership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {orderedCoreTeam.map((member, idx) => (
            <div
              key={idx}
              className="leadership-card glass-card card-interactive-lift relative overflow-hidden rounded-3xl p-7 border border-white/10 flex flex-col justify-between group hover:border-[#FF7A00]/40 transition-all"
            >
              <div className="relative z-10 space-y-4">
                {/* Header Avatar Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="team-photo-ring relative w-20 h-20 rounded-2xl p-[2px] shadow-lg shadow-[#FF7A00]/20 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <div className="relative z-10 w-full h-full rounded-[14px] overflow-hidden bg-zinc-900">
                      <Image
                        src={member.image || "/logo.jpg"}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 shrink-0">
                    {member.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FF7A00] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#FF7A00] font-semibold mt-0.5">{member.role}</p>
                  
                  {member.education && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{member.education}</span>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="text-zinc-300 hover:text-[#FF7A00] transition-colors truncate"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {member.bio}
                </p>

                {/* Experience & Skills */}
                <div className="rounded-2xl border border-[#FF7A00]/15 bg-gradient-to-br from-[#FF7A00]/[0.07] via-white/[0.02] to-transparent p-3.5">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FFB15C]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Skills &amp; Expertise
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {member.expertise.length} SPECIALTIES
                    </span>
                  </div>
                  <span className="mb-2.5 block text-[10px] font-semibold leading-relaxed text-zinc-400">
                    {member.experience}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-[#FF7A00]/25 bg-[#17130F] px-2.5 py-1 text-[10px] font-semibold text-[#FFD08A] shadow-[0_0_12px_rgba(255,122,0,0.06)] transition-all duration-200 hover:border-[#FFB347]/60 hover:bg-[#FF7A00]/15 hover:text-white"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action & Social Links */}
              <div className="relative z-10 pt-4 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#004E89] text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
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
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF7A00] text-zinc-300 hover:text-white transition-colors"
                      title={`Send email to ${member.name}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  Verified Team
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Network Power Banner */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 text-center grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-extrabold text-white">7 Core Members</div>
            <p className="text-xs text-zinc-400 mt-1">Full-Time Product &amp; Strategy Experts</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#FF6B35]">500+ Expert Vendors</div>
            <p className="text-xs text-zinc-400 mt-1">Niche Developers, Marketers &amp; PhD Consultants</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1BAC6E]">2,000+ Clients Served</div>
            <p className="text-xs text-zinc-400 mt-1">Students, Startups &amp; Businesses Across India</p>
          </div>
        </div>

      </div>
    </section>
  );
}
