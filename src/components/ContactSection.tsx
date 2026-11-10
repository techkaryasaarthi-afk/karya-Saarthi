"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface ContactSectionProps {
  initialService?: string;
  initialEstimate?: string;
}

export default function ContactSection({ initialService = "", initialEstimate = "" }: ContactSectionProps) {
  const [activeTab, setActiveTab] = useState<"consultation" | "quote" | "demo">("consultation");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: initialService || "Website Development",
    budget: initialEstimate || "₹30,000 - ₹85,000",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          budget: formData.budget,
          notes: formData.message,
          meetingType: activeTab === "consultation" ? "30-Min Call" : activeTab === "quote" ? "Custom Quote" : "Live Demo",
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

  return (
    <section id="contact" className="py-24 bg-slate-50 dark:bg-[#0E0E11] relative text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold uppercase tracking-wider">
            Call To Action &amp; Contact
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ready to <span className="text-[#FF6B35]">Transform</span> Your Idea?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Reach out to our engineering and strategy team today. Guaranteed response within 24 hours.
          </p>
        </div>

        {/* 3 Action Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab("consultation")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "consultation"
                ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:bg-zinc-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Free Consultation</span>
          </button>

          <button
            onClick={() => setActiveTab("quote")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "quote"
                ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:bg-zinc-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Get Custom Scope Quote</span>
          </button>

          <button
            onClick={() => setActiveTab("demo")}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "demo"
                ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-white/10 dark:hover:bg-zinc-800"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Book Live Work Demo</span>
          </button>
        </div>

        {/* 2 Column Layout: Form + Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Column */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-7 sm:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl relative">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#1BAC6E]/20 text-[#1BAC6E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiry Received Successfully!</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
                  Thank you, <strong className="text-[#FF6B35]">{formData.name}</strong>. Our team lead will inspect your project requirements and get in touch within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeTab === "consultation" && "Schedule 30-Min Discovery Call"}
                    {activeTab === "quote" && "Request Detailed Project Proposal"}
                    {activeTab === "demo" && "Book Live Portfolio Demo Walkthrough"}
                  </h3>
                  <span className="text-xs font-mono text-[#FF6B35] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Response &lt; 24h
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                      Interested Service
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
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
                  <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                    Project Budget Target
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
                  >
                    <option value="₹5,000 - ₹25,000">₹5,000 - ₹25,000 (Academic / Basic)</option>
                    <option value="₹30,000 - ₹85,000">₹30,000 - ₹85,000 (Website / App MVP)</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000 (Growth / Custom ML)</option>
                    <option value="₹2,50,000+">₹2,50,000+ (Enterprise SaaS &amp; Full GTM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                    Brief Project Details or Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your project goals, preferred tech stack, or deadlines..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-[#FF6B35] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="relative overflow-hidden w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF7A00] via-[#FF8A00] to-[#FFA000] hover:opacity-95 shadow-xl shadow-[#FF7A00]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {/* Animated Light Sweep Effect */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shine-sweep pointer-events-none" />
                  <Send className="w-4 h-4 group-hover:translate-x-1.5 transition-transform relative z-10" />
                  <span className="relative z-10">Submit Inquiry &amp; Request Proposal</span>
                </button>
              </form>
            )}

          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Email Directory Card */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6B35] shrink-0" />
                Department Email Directory
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">General Inquiries:</span>
                  <a href={`mailto:${CONTACT_INFO.emails.general}`} className="text-slate-800 dark:text-white hover:text-[#FF6B35] font-mono break-all">{CONTACT_INFO.emails.general}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">Projects &amp; Sales:</span>
                  <a href={`mailto:${CONTACT_INFO.emails.sales}`} className="text-slate-800 dark:text-white hover:text-[#FF6B35] font-mono break-all">{CONTACT_INFO.emails.sales}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">HR &amp; Internships:</span>
                  <a href={`mailto:${CONTACT_INFO.emails.hr}`} className="text-slate-800 dark:text-white hover:text-[#FF6B35] font-mono break-all">{CONTACT_INFO.emails.hr}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-0.5">
                  <span className="text-slate-500 dark:text-zinc-400">Partnerships:</span>
                  <a href={`mailto:${CONTACT_INFO.emails.partnerships}`} className="text-slate-800 dark:text-white hover:text-[#FF6B35] font-mono break-all">{CONTACT_INFO.emails.partnerships}</a>
                </div>
              </div>
            </div>

            {/* Phone Numbers Card */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                Phone Numbers &amp; Support Lines
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">Main Office Line:</span>
                  <a href={`tel:${CONTACT_INFO.phones.office}`} className="text-slate-800 dark:text-white hover:text-blue-500 font-mono">{CONTACT_INFO.phones.office}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">Sales Desk:</span>
                  <a href={`tel:${CONTACT_INFO.phones.sales}`} className="text-slate-800 dark:text-white hover:text-blue-500 font-mono">{CONTACT_INFO.phones.sales}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-slate-500 dark:text-zinc-400">HR Desk:</span>
                  <a href={`tel:${CONTACT_INFO.phones.hr}`} className="text-slate-800 dark:text-white hover:text-blue-500 font-mono">{CONTACT_INFO.phones.hr}</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-0.5 text-[#E63946] font-bold">
                  <span>Emergency Support:</span>
                  <a href={`tel:${CONTACT_INFO.phones.emergency}`} className="font-mono">{CONTACT_INFO.phones.emergency}</a>
                </div>
              </div>
            </div>

            {/* Registered Office Address */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1BAC6E]" />
                Registered Office Address
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {CONTACT_INFO.address}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
