"use client";

/**
 * ContactSection Component (FEAT-#3-Portfolio-2026)
 * 
 * Interactive consultation booking and inquiry form:
 * - Segmented toggle control for Consultation, Quote, and Live Demo
 * - High-conversion SaaS form styling with clear focus rings and responsive layouts
 * - Scannable department email and telephone support cards with 1-click clipboard copy
 */

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CONTACT_INFO } from "@/data/portfolioData";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Calendar,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface ContactSectionProps {
  initialService?: string;
  initialEstimate?: string;
}

export default function ContactSection({ initialService = "", initialEstimate = "" }: ContactSectionProps) {
  const [activeTab, setActiveTab] = useState<"consultation" | "quote" | "demo">("consultation");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: initialService || "Website Development",
    budget: initialEstimate || "₹30,000 - ₹85,000",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
    if (initialEstimate) {
      setFormData((prev) => ({ ...prev, budget: initialEstimate }));
    }
  }, [initialService, initialEstimate]);

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/portfolio/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          budget: formData.budget,
          message: formData.message,
          notes: formData.message,
          meetingType: activeTab === "consultation" ? "30-Min Call" : activeTab === "quote" ? "Custom Quote" : "Live Demo",
          source: "Portfolio Website",
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
    
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Top 3 essential email directories
  const essentialEmails = [
    { key: "email-general", label: "General Inquiries", value: CONTACT_INFO.emails.general || "info@karyasaarthi.com" },
    { key: "email-sales", label: "Projects & Sales", value: CONTACT_INFO.emails.sales || "projects@karyasaarthi.com" },
    { key: "email-hr", label: "HR & Internships", value: CONTACT_INFO.emails.hr || "hr@karyasaarthi.com" },
  ];

  // Top 3 essential phone lines
  const essentialPhones = [
    { key: "phone-office", label: "Main Office Line", value: CONTACT_INFO.phones.office || "+91 9153780969" },
    { key: "phone-sales", label: "Sales & Project Desk", value: CONTACT_INFO.phones.sales || "+91 9153780969" },
    { key: "phone-emergency", label: "24/7 Priority Support", value: CONTACT_INFO.phones.emergency || "+91 9153780969" },
  ];

  return (
    <section id="contact" className="py-24 bg-slate-50 dark:bg-[#0E0E11] relative text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-semibold uppercase tracking-wider">
            Call To Action &amp; Contact
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ready to <span className="text-[#FF7A00]">Transform</span> Your Idea?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Reach out to our engineering and strategy team today. Guaranteed response within 24 hours.
          </p>
        </div>

        {/* 1. Unified Segmented Tab Switcher inside subtle rounded pill container */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1.5 bg-gray-100 dark:bg-zinc-800/80 rounded-full border border-gray-200/80 dark:border-zinc-700/60 max-w-full overflow-x-auto gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("consultation")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "consultation"
                  ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/25"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Free Consultation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quote")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "quote"
                  ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/25"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Get Custom Scope Quote</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("demo")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === "demo"
                  ? "bg-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/25"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Book Live Work Demo</span>
            </button>
          </div>
        </div>

        {/* 2 Column Layout: Form + Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 2. Left Form Card (Crisp white, subtle border, soft shadow, polished SaaS inputs) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/90 rounded-3xl p-7 sm:p-10 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative transition-colors">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#1BAC6E]/20 text-[#1BAC6E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiry Received Successfully!</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
                  Thank you, <strong className="text-[#FF7A00]">{formData.name}</strong>. Our team lead will inspect your project requirements and get in touch within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {activeTab === "consultation" && "Schedule 30-Min Discovery Call"}
                    {activeTab === "quote" && "Request Detailed Project Proposal"}
                    {activeTab === "demo" && "Book Live Portfolio Demo Walkthrough"}
                  </h3>
                  <span className="text-xs font-mono text-[#FF7A00] font-semibold flex items-center gap-1.5 bg-[#FF7A00]/10 px-2.5 py-1 rounded-full border border-[#FF7A00]/20 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    Response &lt; 24h
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                      Interested Service
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Website Development">Website Development</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="AI & ML Solutions">AI &amp; Machine Learning Solutions</option>
                      <option value="Research & Academic Support">Research &amp; Academic Support</option>
                      <option value="Business Consulting">Business Consulting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Project Budget Target
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm cursor-pointer"
                  >
                    <option value="₹5,000 - ₹25,000">₹5,000 - ₹25,000 (Academic / Basic)</option>
                    <option value="₹30,000 - ₹85,000">₹30,000 - ₹85,000 (Website / App MVP)</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000 (Growth / Custom ML)</option>
                    <option value="₹2,50,000+">₹2,50,000+ (Enterprise SaaS &amp; Full GTM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Brief Project Details or Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your project goals, preferred tech stack, or deadlines..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 sm:py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all shadow-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="relative overflow-hidden w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF7A00] via-[#FF8A00] to-[#FFA000] hover:from-[#f06e00] hover:to-[#ff9500] shadow-lg shadow-[#FF7A00]/25 hover:shadow-xl hover:shadow-[#FF7A00]/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine-sweep pointer-events-none" />
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                  <span className="relative z-10">Submit Inquiry &amp; Request Proposal</span>
                </button>
              </form>
            )}

          </div>

          {/* 3. Simplified Right-Side Contact Cards (Clean, Scannable, Clickable, 1-Click Copy with Tooltip) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 1: Department Email Directory */}
            <div className="bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-md shadow-slate-200/40 dark:shadow-none space-y-4 transition-colors">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF7A00] shrink-0" />
                Department Email Directory
              </h4>
              <div className="space-y-3 divide-y divide-gray-100 dark:divide-zinc-800/80">
                {essentialEmails.map((item) => (
                  <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        {item.label}
                      </p>
                      <a
                        href={`mailto:${item.value}`}
                        className="text-xs sm:text-sm font-semibold font-mono text-slate-800 dark:text-zinc-200 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] transition-colors truncate block"
                      >
                        {item.value}
                      </a>
                    </div>
                    
                    <div className="relative shrink-0 flex items-center">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, item.key)}
                        aria-label={`Copy ${item.label}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF7A00] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all cursor-pointer"
                        title="Copy email"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      
                      {copiedKey === item.key && (
                        <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-white shadow-md z-20 whitespace-nowrap animate-fadeIn">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Phone Numbers & Support Lines */}
            <div className="bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-md shadow-slate-200/40 dark:shadow-none space-y-4 transition-colors">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF7A00] shrink-0" />
                Phone Numbers &amp; Support Lines
              </h4>
              <div className="space-y-3 divide-y divide-gray-100 dark:divide-zinc-800/80">
                {essentialPhones.map((item) => (
                  <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        {item.label}
                      </p>
                      <a
                        href={`tel:${item.value.replace(/\s+/g, "")}`}
                        className="text-xs sm:text-sm font-semibold font-mono text-slate-800 dark:text-zinc-200 hover:text-[#FF7A00] dark:hover:text-[#FF7A00] transition-colors truncate block"
                      >
                        {item.value}
                      </a>
                    </div>
                    
                    <div className="relative shrink-0 flex items-center">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, item.key)}
                        aria-label={`Copy ${item.label}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF7A00] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all cursor-pointer"
                        title="Copy phone"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      
                      {copiedKey === item.key && (
                        <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-white shadow-md z-20 whitespace-nowrap animate-fadeIn">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Registered Office Address */}
            <div className="bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-md shadow-slate-200/40 dark:shadow-none space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  Registered Office Address
                </h4>
                <div className="relative shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleCopy(CONTACT_INFO.address, "office-address")}
                    aria-label="Copy Registered Office Address"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF7A00] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all cursor-pointer"
                    title="Copy address"
                  >
                    {copiedKey === "office-address" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  {copiedKey === "office-address" && (
                    <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-white shadow-md z-20 whitespace-nowrap animate-fadeIn">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                {CONTACT_INFO.address}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
