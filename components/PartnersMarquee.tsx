'use client'

import { useEffect, useState, useRef } from 'react'

interface Partner {
  id?: string | number
  name: string
  logo_url?: string | null
  website?: string | null
}

interface PartnersMarqueeProps {
  partners: Partner[]
}

export default function PartnersMarquee({ partners }: PartnersMarqueeProps) {
  // Triple the list so the infinite scroll looks seamless at all viewport widths
  const list = [...partners, ...partners, ...partners]

  return (
    <div className="w-full py-10 bg-white border-t border-slate-100 overflow-hidden relative">
      {/* Section label */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-heading">
          Trusted by Industry Leaders &amp; Partners
        </p>
      </div>

      {/* Scroll track */}
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white to-transparent z-10" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white to-transparent z-10" />

        {/* CSS-animated marquee — no JS jank */}
        <div className="flex gap-6 animate-marquee shrink-0 will-change-transform">
          {list.map((p, idx) => (
            <a
              key={`${p.id ?? p.name}-${idx}`}
              href={p.website ?? '#'}
              target={p.website ? '_blank' : undefined}
              rel="noopener noreferrer"
              title={p.name}
              className="flex items-center justify-center shrink-0 px-8 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-accent/30 hover:scale-105 transition-all duration-300 group"
              style={{ minWidth: '160px', height: '72px' }}
            >
              {p.logo_url ? (
                /* Logo image — grayscale by default, full colour on hover */
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="max-h-9 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    // If logo fails, show the company initial instead
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('[data-fallback]')) {
                      const span = document.createElement('span')
                      span.dataset.fallback = 'true'
                      span.className = 'font-extrabold text-slate-400 group-hover:text-navy text-sm tracking-wide transition-colors'
                      span.textContent = p.name
                      parent.appendChild(span)
                    }
                  }}
                />
              ) : (
                /* No logo URL — show company name as styled text */
                <span className="font-extrabold text-slate-400 group-hover:text-navy text-sm tracking-wide transition-colors select-none">
                  {p.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
