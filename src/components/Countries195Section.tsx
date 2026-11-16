"use client";

import React, { useState, useMemo } from "react";
import { COUNTRIES_195, CountryItem } from "@/data/countries195";
import { useCountry } from "@/context/CountryContext";
import {
  Globe,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Minimize2,
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
  const {
    selectedCountry,
    setSelectedCountry,
    selectQuickCurrency,
    isCountriesModalOpen: contextModalOpen,
    openCountriesModal,
    closeCountriesModal,
    t,
  } = useCountry();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All 195");
  const [isExpanded, setIsExpanded] = useState(false);

  const isModalOpen = isOpenModal || contextModalOpen;

  const handleClose = () => {
    closeCountriesModal();
    if (onCloseModal) onCloseModal();
  };

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    setTimeout(() => {
      handleClose();
    }, 200);
  };

  const handleSelectQuickCurrency = (currencyCode: string) => {
    selectQuickCurrency(currencyCode);
    setTimeout(() => {
      handleClose();
    }, 200);
  };

  // Quick Currency options matching Screenshot 2
  const quickCurrencies = [
    { label: "IN INR (₹)", code: "INR", symbol: "₹" },
    { label: "US USD ($)", code: "USD", symbol: "$" },
    { label: "GB GBP (£)", code: "GBP", symbol: "£" },
    { label: "EU EUR (€)", code: "EUR", symbol: "€" },
    { label: "CA CAD (C$)", code: "CAD", symbol: "C$" },
    { label: "AU AUD (A$)", code: "AUD", symbol: "A$" },
    { label: "AE AED (AED)", code: "AED", symbol: "AED" },
  ];

  // Category Tabs matching Screenshot 2
  const categoryTabs = ["All 195", "⭐ Popular", "Asia", "Europe", "Americas", "MEA"];

  // Filtered countries based on search and active tab
  const filteredCountries = useMemo(() => {
    return COUNTRIES_195.filter((c) => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === "⭐ Popular") {
        matchesTab = !!c.isPopular;
      } else if (activeTab === "Asia") {
        matchesTab = c.region === "Asia";
      } else if (activeTab === "Europe") {
        matchesTab = c.region === "Europe";
      } else if (activeTab === "Americas") {
        matchesTab = c.region === "Americas";
      } else if (activeTab === "MEA") {
        matchesTab = c.region === "MEA";
      }

      // Search query filter
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesTab;

      const matchesSearch =
        c.englishName.toLowerCase().includes(query) ||
        c.nativeName.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.currency.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [searchQuery, activeTab]);

  // First 48 countries for continuous running marquee ticker
  const marqueeCountries = useMemo(() => {
    return COUNTRIES_195.slice(0, 48);
  }, []);

  return (
    <>
      {/* 1. Global Reach 195 Countries Interactive Running Ticker Strip */}
      <section className="py-8 bg-slate-100/90 dark:bg-[#0E0E11] border-y border-slate-200 dark:border-white/10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shrink-0">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#FF7A00]">
                  <span>Global Currency & Real-Time Language · 195 Countries</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1BAC6E] animate-ping" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Pan-India Roots, <span className="text-[#FF7A00]">Worldwide Execution</span>
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={openCountriesModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:border-[#FF7A00] hover:text-[#FF7A00] shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{selectedCountry.flag} Active: {selectedCountry.englishName} ({selectedCountry.symbol} {selectedCountry.currency})</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FF7A00]/15 text-[#FF7A00] font-extrabold">
                195 Countries ▾
              </span>
            </button>
          </div>
        </div>

        {/* Marquee Row */}
        <div className="relative w-full overflow-hidden flex items-center">
          <div
            className="flex gap-3 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] py-1 cursor-pointer"
            onClick={openCountriesModal}
          >
            {[...marqueeCountries, ...marqueeCountries].map((country, idx) => {
              const isCurrent = selectedCountry.code === country.code;
              return (
                <div
                  key={`${country.code}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCountry(country);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105 ${
                    isCurrent
                      ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/30 ring-2 ring-[#FF7A00]/40"
                      : "bg-white/95 dark:bg-zinc-900/95 text-slate-800 dark:text-zinc-200 border border-slate-200/90 dark:border-zinc-800 hover:border-[#FF7A00]/60 shadow-2xs"
                  }`}
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="font-bold">{country.nativeName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">
                    ({country.englishName})
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    {country.symbol} {country.currency}
                  </span>
                  {country.isHQ && (
                    <span className="text-[9px] uppercase tracking-wider bg-white/20 px-1.5 py-0.2 rounded font-extrabold">
                      HQ
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Full 195 Countries Modal (Exact UI matching Screenshot 2) */}
      {isModalOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-3xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col shadow-2xl text-slate-900 dark:text-white transition-all duration-300 animate-modal-pop ${
              isExpanded ? "max-w-6xl h-[92vh]" : "max-w-4xl"
            }`}
          >
            {/* Header: Exact text from Screenshot 2 */}
            <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0084FF] shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Select Your Country (195 Countries Supported)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 pl-7">
                  Prices and language automatically convert in real time across the website.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>195 / 195</span>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Currency Bar: Exact style from Screenshot 2 */}
            <div className="py-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                  ⚡ QUICK CURRENCY:
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                  Active: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{selectedCountry.symbol} {selectedCountry.currency}</strong>
                </span>
              </div>

              {/* Currency Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {quickCurrencies.map((qc) => {
                  const isActive = selectedCountry.currency === qc.code;
                  return (
                    <button
                      key={qc.code}
                      type="button"
                      onClick={() => handleSelectQuickCurrency(qc.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md ring-2 ring-slate-900/20 dark:ring-white/30 scale-105"
                          : "bg-slate-50 dark:bg-zinc-800/70 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {qc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input Bar: Exact placeholder from Screenshot 2 */}
            <div className="pt-3 pb-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#0084FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 195 countries or cities (e.g. India, USA, China, Pakistan, London, Tokyo)..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs: Exact list from Screenshot 2 */}
            <div className="flex flex-wrap items-center gap-1 pb-3 shrink-0">
              {categoryTabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {filteredCountries.length} available
              </span>
            </div>

            {/* Country List: Exact 2-Column Grid Layout matching Screenshot 2 */}
            <div className="overflow-y-auto flex-1 pr-1.5 py-1 grid grid-cols-1 md:grid-cols-2 gap-2 border-y border-slate-100 dark:border-zinc-800/80">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer group ${
                      isSelected
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/30"
                        : "bg-white dark:bg-zinc-900/60 border-slate-100 dark:border-zinc-800/90 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-800 dark:text-zinc-200"
                    }`}
                  >
                    {/* Left: Code + Flag + Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 w-5 text-center">
                        {c.code}
                      </span>
                      <span className="text-base shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {c.englishName}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                            ({c.code})
                          </span>
                        </div>
                        {/* Native mother-tongue script display */}
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                          {c.nativeName}
                        </div>
                      </div>
                    </div>

                    {/* Right: Currency Symbol and Code */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-xs font-semibold text-slate-600 dark:text-zinc-400">
                        {c.currency} ({c.symbol})
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-200 dark:border-zinc-700 group-hover:border-[#FF7A00] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredCountries.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No country found matching &quot;{searchQuery}&quot;. Try searching by country name, city, or currency.
                </div>
              )}
            </div>

            {/* Footer: Exact style from Screenshot 2 */}
            <div className="pt-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span>Selected:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{selectedCountry.flag}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedCountry.code} {selectedCountry.englishName}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ({selectedCountry.symbol} {selectedCountry.currency})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300 hover:text-[#0084FF] transition-colors cursor-pointer font-semibold"
                >
                  {isExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Compact View</span>
                    </>
                  ) : (
                    <>
                      <span>Expand View</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#0084FF]" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-bold text-xs shadow-md shadow-[#FF7A00]/25 transition-all cursor-pointer"
                >
                  Apply &amp; Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
