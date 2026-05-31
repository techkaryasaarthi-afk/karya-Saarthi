'use client'

import { motion } from 'framer-motion'

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
  // Duplicate partners array to create a seamless looping effect
  const list = [...partners, ...partners, ...partners]

  return (
    <div className="w-full py-12 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/10 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
          Trusted by Industry Leaders & Partners
        </h3>
      </div>

      {/* Infinite Carousel Container */}
      <div className="relative w-full flex items-center overflow-hidden py-4">
        {/* Left & Right fading gradient masks for premium editorial look */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-8 shrink-0 items-center justify-around min-w-full"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {list.map((p, idx) => (
            <a
              key={`${p.id || p.name}-${idx}`}
              href={p.website || '#'}
              target={p.website ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center px-8 py-4 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:scale-105 hover:border-accent/30 transition-all duration-300 group shrink-0"
              style={{ minWidth: '160px' }}
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="h-7 w-auto object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="font-extrabold text-slate-400 group-hover:text-navy text-sm tracking-wide transition-colors">
                  {p.name}
                </span>
              )}
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
