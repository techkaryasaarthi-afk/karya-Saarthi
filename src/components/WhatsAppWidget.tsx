"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "919153780968"; // Country code 91 + 9153780968
  const displayNumber = "+91 9153780968";

  const defaultMessage = "Hello Karya Saarthi, I would like to discuss a project and schedule a consultation.";

  const openWhatsApp = (customMsg?: string) => {
    const text = encodeURIComponent(customMsg || defaultMessage);
    const url = `https://wa.me/${phoneNumber}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-white dark:bg-[#16161B] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden text-slate-900 dark:text-white animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Karya Saarthi WhatsApp</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Online • {displayNumber}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-slate-50 dark:bg-[#16161B]">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed shadow-sm">
              👋 Hi there! Welcome to <strong className="text-[#FF6B35]">Karya Saarthi</strong>.
              <p className="mt-1">
                Need immediate help with your Project, MVP, or want to schedule a 1-on-1 Consultation? Tap below to chat directly with our team!
              </p>
            </div>

            {/* Quick Prompt Options */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => openWhatsApp("Hi, I want to discuss Website / Mobile App development with Karya Saarthi.")}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/5 hover:border-[#25D366]/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <span>💻 Discuss Web / App Development</span>
                <Send className="w-3.5 h-3.5 text-[#25D366] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => openWhatsApp("Hi, I want to book a free project consultation.")}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/5 hover:border-[#25D366]/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <span>📅 Schedule a Project Consultation</span>
                <Send className="w-3.5 h-3.5 text-[#25D366] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => openWhatsApp("Hi, I need assistance with AI/ML or Research Paper publication.")}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/5 hover:border-[#25D366]/40 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
              >
                <span>🤖 AI/ML or Academic Research Support</span>
                <Send className="w-3.5 h-3.5 text-[#25D366] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Direct Open Button */}
            <button
              onClick={() => openWhatsApp()}
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Chat Directly on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="relative group">
        {/* Pulsing Aura */}
        <div className="absolute -inset-1 rounded-full bg-[#25D366]/40 blur-md animate-pulse pointer-events-none group-hover:bg-[#25D366]/60 transition-all" />

        {/* Floating Tooltip (Visible on hover when closed) */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center whitespace-nowrap bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-xl shadow-xl text-xs font-semibold text-white pointer-events-none group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span>Chat on WhatsApp ({displayNumber})</span>
            <div className="w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-[-45deg] -mr-1 ml-1" />
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/40 transition-transform transform hover:scale-105 active:scale-95"
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          )}

          {/* Online badge */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#1BAC6E] border-2 border-[#16161B]" />
        </button>
      </div>

    </div>
  );
}
