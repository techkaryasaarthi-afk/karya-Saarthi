"use client";

import React, { useState, useMemo } from "react";
import { COUNTRIES_195, CountryItem } from "@/data/countries195";
import {
  Globe,
  Search,
  X,
  ExternalLink,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface Countries195SectionProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onOpenConsultation?: () => void;
}

export default function Countries195Section({
  isOpenModal = false,
  onCloseModal,
  onOpenConsultation,
}: Countries195SectionProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const isModalOpen = isOpenModal || internalModalOpen;
  const handleClose = () => {
    setInternalModalOpen(false);
    if (onCloseModal) onCloseModal();
  };

  const regions = ["All", "Asia", "Middle East", "Europe", "Americas", "Africa", "Oceania"];

  // Filtered countries based on search and region
  const filteredCountries = useMemo(() => {
    return COUNTRIES_195.filter((c) => {
      const matchesRegion = selectedRegion === "All" || c.region === selectedRegion;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesRegion;
      const matchesSearch =
        c.englishName.toLowerCase().includes(query) ||
        c.nativeName.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query);
      return matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedRegion]);

  // First 40 countries for the continuous marquee
  const marqueeCountries = useMemo(() => {
    return COUNTRIES_195.slice(0, 48);
  }, []);

  return (
    <>
      {/* 1. Global Reach 195 Countries Interactive Strip / Marquee */}
      <section className="py-10 bg-slate-100/90 dark:bg-[#0E0E11] border-y border-slate-200 dark:border-white/10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shrink-0">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#FF7A00]">
                  <span>Global Operations · 195 Countries</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1BAC6E] animate-ping" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Pan-India Roots, <span className="text-[#FF7A00]">Worldwide Execution</span>
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInternalModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:border-[#FF7A00] hover:text-[#FF7A00] shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore All 195 Countries</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FF7A00]/15 text-[#FF7A00] font-extrabold">
                195
              </span>
            </button>
          </div>
        </div>

        {/* Marquee Row 1 */}
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="flex gap-3 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] py-1 cursor-pointer" onClick={() => setInternalModalOpen(true)}>
            {[...marqueeCountries, ...marqueeCountries].map((country, idx) => (
              <div
                key={`${country.code}-${idx}`}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 ${
                  country.isHQ
                    ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/30 ring-2 ring-[#FF7A00]/40"
                    : "bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-800 hover:border-[#FF7A00]/50 shadow-2xs"
                }`}
              >
                <span className="text-base">{country.flag}</span>
                <span className="font-bold">{country.nativeName}</span>
                {!country.isHQ && (
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">
                    ({country.englishName})
                  </span>
                )}
                {country.isHQ && (
                  <span className="text-[9px] uppercase tracking-wider bg-white/20 px-1.5 py-0.2 rounded font-extrabold">
                    HQ
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Full Searchable 195 Countries Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[90vh] flex flex-col shadow-2xl text-slate-900 dark:text-white animate-modal-pop">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF7A00]">
                  <Globe className="w-4 h-4 text-[#FF7A00]" />
                  <span>195 Sovereign Countries Worldwide</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Global Project Delivery Directory
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Every country shown in its authentic mother tongue script (India kept in English). 24/7 delivery across all timezones.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-transform duration-200 hover:rotate-90 hover:scale-110 cursor-pointer shrink-0"
                aria-label="Close Countries Directory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar & Region Filter Tabs */}
            <div className="py-4 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by country name (e.g. India, Japan, 日本, France, Deutschland, مصر)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/40 focus:border-[#FF7A00] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Region Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {regions.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedRegion === reg
                        ? "bg-[#FF7A00] text-white shadow-sm shadow-[#FF7A00]/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {reg}
                  </button>
                ))}
                <span className="ml-auto text-xs font-mono text-slate-500 dark:text-zinc-400">
                  Showing {filteredCountries.length} of 195
                </span>
              </div>
            </div>

            {/* Countries Grid */}
            <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-2">
              {filteredCountries.map((c) => (
                <div
                  key={c.code}
                  className={`p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${
                    c.isHQ
                      ? "bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent border-[#FF7A00] shadow-md shadow-[#FF7A00]/15"
                      : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200/90 dark:border-zinc-800/80 hover:border-[#FF7A00]/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
                        {c.code}
                      </span>
                    </div>

                    {/* Native Name (Mother Tongue) */}
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate" title={c.nativeName}>
                      {c.nativeName}
                    </h4>

                    {/* English Name */}
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {c.englishName}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 dark:text-zinc-500">{c.region}</span>
                    {c.isHQ ? (
                      <span className="font-extrabold text-[#FF7A00] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#FF7A00]" />
                        <span>HQ</span>
                      </span>
                    ) : (
                      <span className="text-emerald-500 font-medium">Supported</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Direct 24/7 Global Delivery Support in English &amp; Native Formats</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="https://wa.me/918595025753?text=Hi%20Karya%20Saarthi%2C%20I%20am%20inquiring%20about%20your%20services%20from%20international%20delivery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp (+91 8595025753)</span>
                </a>
                <a
                  href="mailto:support@karyasaarthi.com"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-bold transition-all shadow-xs"
                >
                  <span>support@karyasaarthi.com</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
