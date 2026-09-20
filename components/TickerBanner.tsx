'use client'

import { useEffect, useRef, useState } from 'react'

interface TickerBannerProps {
  text: string
  color?: string
  bg?: string
  enabled?: boolean
}

export default function TickerBanner({
  text,
  color = '#FF6B35',
  bg = '#0d0d0d',
  enabled = true,
}: TickerBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check session storage — hide if already dismissed this session
    try {
      if (sessionStorage.getItem('ticker-dismissed') === '1') setDismissed(true)
    } catch {}
  }, [])

  if (!enabled || dismissed || !mounted) return null

  const handleDismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem('ticker-dismissed', '1') } catch {}
  }

  // Duplicate text so the marquee loops smoothly
  const repeated = `${text}  •  ${text}  •  ${text}  •  `

  return (
    <div
      role="marquee"
      aria-label="News and promotions ticker"
      style={{
        backgroundColor: bg,
        borderBottom: `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        height: 36,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 51, // above everything including navbar
        flexShrink: 0,
      }}
    >
      {/* Fading left edge */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: `linear-gradient(to right, ${bg}, transparent)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Scrolling track */}
      <div
        className="ticker-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 35s linear infinite',
          willChange: 'transform',
          paddingLeft: '100%',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color,
            fontFamily: 'var(--font-inter, "Inter", sans-serif)',
            letterSpacing: '0.01em',
          }}
        >
          {repeated}
        </span>
      </div>

      {/* Fading right edge */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 36, // leave space for close button
          top: 0,
          bottom: 0,
          width: 60,
          background: `linear-gradient(to left, ${bg}, transparent)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss ticker"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          border: 'none',
          borderLeft: `1px solid ${color}25`,
          cursor: 'pointer',
          color,
          fontSize: 13,
          zIndex: 3,
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}18`)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = bg)}
      >
        ✕
      </button>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}
