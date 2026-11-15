"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CASE_STUDIES, CaseStudy } from "@/data/portfolioData";
import ProjectBannerIllustration from "./ProjectBannerIllustration";
import {
  ExternalLink,
  CheckCircle2,
  Quote,
  Star,
  X,
  ArrowUpRight,
  TrendingUp,
  FileDown,
} from "lucide-react";
import { useCountry } from "@/context/CountryContext";

interface ProjectsSectionProps {
  onOpenConsultation: () => void;
  onOpenPortfolioPdf?: () => void;
}

export default function ProjectsSection({ onOpenConsultation, onOpenPortfolioPdf }: ProjectsSectionProps) {
  const { t, convertBudget } = useCountry();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [projectsList, setProjectsList] = useState<CaseStudy[]>(CASE_STUDIES);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingProjects(true);

    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Map dynamic Portfolio items from Supabase / CRM
          const mapped: CaseStudy[] = json.data.map((item: any) => {
            const existing = CASE_STUDIES.find(
              (c) => c.id === item.id || c.title.toLowerCase() === item.title.toLowerCase()
            );
            return {
              id: item.id,
              title: item.title,
              image: item.image_url || existing?.image || `/projects/${item.id}.jpg`,
              client: item.client_name || existing?.client || "Enterprise Client",
              industry: item.industry || existing?.industry || "Technology & Services",
              projectType: existing?.projectType || `${(item.category || "web").toUpperCase()} Development`,
              timeline: existing?.timeline || "2-6 weeks",
              budget: item.budget || existing?.budget || "₹50,000",
              category: (item.category?.toLowerCase() || "web") as any,
              challenge: item.description || existing?.challenge || "Comprehensive engineering and scalable architecture.",
              solution: existing?.solution || [
                item.description || "Delivered full-stack development and responsive design.",
                "Integrated secure payment gateways and cloud infrastructure.",
                "Configured CI/CD pipeline and automated analytics.",
              ],
              techStack: Array.isArray(item.tech_stack) && item.tech_stack.length > 0
                ? item.tech_stack
                : (existing?.techStack || ["React", "Next.js", "Node.js", "AWS"]),
              results: existing?.results || [
                "Successfully deployed to production with 99.9% uptime",
                "High user engagement and positive feedback",
                "Scalable microservices ready for enterprise growth",
              ],
              testimonial: existing?.testimonial || {
                quote: "Karya Saarthi delivered the project with unmatched precision, speed, and dedication.",
                author: item.client_name || "Enterprise Partner",
                role: "Client Leader",
              },
              liveLinks: item.live_link
                ? [{ label: "View Live Project", url: item.live_link }]
                : (existing?.liveLinks || []),
            };
          });
          setProjectsList(mapped);
        }
      })
      .catch((err) => console.warn("[ProjectsSection] Live fetch notice:", err))
      .finally(() => {
        if (isMounted) setLoadingProjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "web", label: "Web & E-Commerce" },
    { id: "ai", label: "AI & ML Solutions" },
    { id: "academic", label: "Research & Academic" },
    { id: "saas", label: "SaaS & MVP" },
  ];

  const filteredProjects =
    activeCategory === "all"
      ? projectsList
      : projectsList.filter((p) => p.category === activeCategory);

  return (
    <section id="case-studies" className="py-24 bg-white dark:bg-[#121216] relative text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-white/5 transition-colors duration-300">
      {/* Anchor for backward compatibility with #projects */}
      <div id="projects" className="absolute -top-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold uppercase tracking-wider">
            Featured Projects &amp; Case Studies
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Proven <span className="text-[#FF7A00]">Results</span> Across 500+ Projects
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Explore how Karya Saarthi helped startups, PhD scholars, e-commerce brands, and logistics enterprises achieve 10x ROI, raise capital, and scale seamlessly.
          </p>

          {/* Secondary Portfolio PDF Trigger moved inside Case Studies section */}
          {onOpenPortfolioPdf && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenPortfolioPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:text-[#FF7A00] bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 hover:border-[#FF7A00]/50 shadow-xs transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#FF7A00]" />
                <span>Download Executive Portfolio PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-10 sm:mb-14">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30 ring-2 ring-[#FF6B35]/25"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={`${project.id}-${activeCategory}`}
              className="relative glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 group flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2.5 hover:shadow-2xl hover:shadow-[#FF7A00]/15 dark:hover:shadow-[#FF7A00]/25 hover:border-[#FF7A00]/50 animate-fadeIn"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Top Animated Light Beam on Card Hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-20 pointer-events-none" />

              <div>
                {/* Visual Header Banner with Dynamic Image & Karya Saarthi Logo Emblem */}
                <div className="relative h-52 sm:h-56 bg-slate-900 p-5 sm:p-6 flex flex-col justify-between border-b border-slate-200 dark:border-white/10 overflow-hidden group/banner">
                  {/* Project Showcase Image */}
                  {project.image ? (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-[0.92] group-hover:brightness-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* High-Contrast Gradient Scrim for perfect text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/15 pointer-events-none" />
                    </div>
                  ) : (
                    <ProjectBannerIllustration projectId={project.id} />
                  )}

                  {/* Shimmer Light Sweep on Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

                  <div className="flex items-center justify-between z-10 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/95 dark:bg-zinc-900/90 text-slate-900 dark:text-white backdrop-blur-md border border-white/20 shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                        {project.industry}
                      </span>
                      {/* Karya Saarthi Official Circular Logo Badge with Pulsing Green Dot */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-[#FF7A00]/40 shadow-sm group-hover:border-[#FF7A00] transition-colors shrink-0" title="Verified by Karya Saarthi">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1BAC6E] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1BAC6E]" />
                        </span>
                        <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 group-hover:rotate-12 transition-transform duration-300">
                          <Image src="/logo.jpg" alt="Karya Saarthi" fill className="object-contain" />
                        </div>
                        <span className="text-[9px] font-extrabold text-[#FF7A00] font-mono tracking-tight hidden sm:inline">
                          Karya Saarthi
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#FF7A00] font-bold bg-white/95 dark:bg-zinc-900/95 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm group-hover:scale-105 group-hover:border-[#FF7A00]/60 transition-all duration-200 shrink-0 ml-auto">
                      {convertBudget(project.budget)}
                    </span>
                  </div>

                  <div className="z-10 max-w-full">
                    <p className="text-xs text-slate-300 font-medium truncate drop-shadow-sm">{project.client}</p>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#FF7A00] transition-colors duration-200 leading-tight line-clamp-2 drop-shadow-md">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  {/* Challenge Summary */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      {t("projects.challenge", "The Challenge:")}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {project.challenge}
                    </p>
                  </div>

                  {/* Top Result Highlight with Micro-Bounce on Hover */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#1BAC6E]/10 via-[#1BAC6E]/15 to-[#1BAC6E]/5 border border-[#1BAC6E]/20 text-[#1BAC6E] text-xs font-semibold flex items-center gap-2 group-hover:border-[#1BAC6E]/40 group-hover:bg-[#1BAC6E]/20 transition-all duration-300">
                    <TrendingUp className="w-4 h-4 shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    <span className="line-clamp-1">{project.results[0]}</span>
                  </div>

                  {/* Tech Pills with Micro-Interaction */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/5 hover:border-[#FF7A00]/50 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] hover:scale-105 transition-all duration-200 cursor-default select-none"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-white/5">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer with Interactive Shimmer Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="relative overflow-hidden w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 hover:bg-[#FF6B35] hover:text-white dark:bg-white/5 dark:hover:bg-[#FF6B35] border border-slate-200 hover:border-[#FF6B35] dark:border-white/10 dark:hover:border-[#FF6B35] group-hover:bg-[#FF6B35] group-hover:text-white group-hover:border-[#FF6B35] group-hover:shadow-lg group-hover:shadow-[#FF6B35]/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group/btn"
                >
                  {/* Shimmer Light Sweep */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out pointer-events-none" />
                  <span>{t("projects.readCaseStudy", "Read Full Case Study")}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Case Study Full Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/15 rounded-3xl max-w-3xl w-full p-5 sm:p-8 relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-slate-900 dark:text-white animate-modal-pop">
            
            {/* Close Button with Rotation on Hover */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-400 dark:hover:text-white cursor-pointer z-10 transition-transform duration-200 hover:rotate-90 hover:scale-110"
              aria-label="Close Case Study"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header with Dynamic Visual Banner & Karya Saarthi Badge */}
            <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-slate-900 border border-slate-200 dark:border-white/10 mb-2 pr-10 sm:pr-12 min-h-[160px] flex flex-col justify-end">
              {selectedProject.image ? (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover brightness-[0.7]"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
                </div>
              ) : (
                <ProjectBannerIllustration projectId={selectedProject.id} />
              )}

              <div className="relative z-10 max-w-[85%] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7A00] uppercase tracking-wider mb-1 flex-wrap">
                  <span>{selectedProject.industry}</span>
                  <span>•</span>
                  <span>{selectedProject.projectType}</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px]">
                    <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
                      <Image src="/logo.jpg" alt="KS" fill className="object-contain" />
                    </div>
                    Verified by Karya Saarthi
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight break-words drop-shadow-md">
                  {selectedProject.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-200 font-mono pt-1">
                  <span>Client: <strong className="text-white">{selectedProject.client}</strong></span>
                  <span>Timeline: <strong className="text-[#FF7A00]">{selectedProject.timeline}</strong></span>
                  <span>Budget: <strong className="text-[#1BAC6E]">{selectedProject.budget}</strong></span>
                </div>
              </div>
            </div>

            {/* Challenge Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#FF6B35]">
                1. The Client&apos;s Challenge &amp; Problem
              </h4>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                {selectedProject.challenge}
              </p>
            </div>

            {/* Solution Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                2. Solution Provided by Karya Saarthi
              </h4>
              <ul className="space-y-2">
                {selectedProject.solution.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1BAC6E]">
                3. Measurable Key Performance Results
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedProject.results.map((res, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1BAC6E]/10 border border-[#1BAC6E]/20 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1BAC6E] shrink-0" />
                    <span>{res}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Technology Stack &amp; Tools:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Client Testimonial */}
            <div className="p-5 rounded-2xl bg-orange-50/60 dark:bg-gradient-to-r dark:from-zinc-900 dark:to-[#1A1A22] border border-[#FF6B35]/30 space-y-3 relative">
              <Quote className="w-8 h-8 text-[#FF6B35]/20 absolute top-4 right-4" />
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 italic leading-relaxed">
                &quot;{selectedProject.testimonial.quote}&quot;
              </p>
              <div className="text-xs font-semibold text-[#FF6B35]">
                — {selectedProject.testimonial.author} ({selectedProject.testimonial.role})
              </div>
            </div>

            {/* Live Links */}
            {selectedProject.liveLinks && selectedProject.liveLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedProject.liveLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-200 dark:border-white/10 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Modal Bottom CTAs */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  onOpenConsultation();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#FF8855] shadow-lg shadow-[#FF6B35]/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Start Similar Project With Us</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
