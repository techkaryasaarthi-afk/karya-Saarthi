'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Show cursors once mouse is detected
    dot.style.opacity  = '1'
    ring.style.opacity = '1'

    // Hide the default cursor globally
    document.documentElement.style.cursor = 'none'

    let mouseX = -100, mouseY = -100   // real pointer
    let ringX  = -100, ringY  = -100   // lagging ring
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      // Dot snaps instantly
      dot.style.transform  = `translate(${mouseX}px, ${mouseY}px)`

      // Ring follows with smooth lag (lower t = more lag)
      ringX = lerp(ringX, mouseX, 0.10)
      ringY = lerp(ringY, mouseY, 0.10)
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`

      rafId = requestAnimationFrame(tick)
    }

    // Scale ring on interactive elements
    const onEnter = () => {
      ring.style.transform  // flush
      ring.style.width      = '48px'
      ring.style.height     = '48px'
      ring.style.opacity    = '0.6'
      ring.style.background = 'rgba(106,76,245,0.15)'
      ring.style.border     = '1.5px solid rgba(106,76,245,0.7)'
      dot.style.background  = '#6a4cf5'
      dot.style.transform   = `translate(${mouseX}px, ${mouseY}px) scale(1.8)`
    }

    const onLeave = () => {
      ring.style.width      = '28px'
      ring.style.height     = '28px'
      ring.style.opacity    = '0.5'
      ring.style.background = 'transparent'
      ring.style.border     = '1.5px solid rgba(255,122,61,0.7)'
      dot.style.background  = '#ff7a3d'
      dot.style.transform   = `translate(${mouseX}px, ${mouseY}px) scale(1)`
    }

    const INTERACTIVE = 'a,button,input,textarea,select,[role="button"],[tabindex]'

    const attachListeners = () => {
      document.querySelectorAll<HTMLElement>(INTERACTIVE).forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    // Attach once + re-attach after dynamic content loads
    attachListeners()
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
      document.documentElement.style.cursor = ''
    }
  }, [])

  const shared: React.CSSProperties = {
    position: 'fixed',
    top:      0,
    left:     0,
    pointerEvents: 'none',
    zIndex:   99999,
    willChange: 'transform',
    opacity:  0,         // hidden until mouse first moves
  }

  return (
    <>
      {/* ── Inner dot: sharp & instant ─────────────────────────── */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          ...shared,
          width:        6,
          height:       6,
          marginTop:    -3,
          marginLeft:   -3,
          borderRadius: '50%',
          background:   '#ff7a3d',
          transition:   'background 0.2s, transform 0.08s ease-out',
          boxShadow:    '0 0 6px rgba(255,122,61,0.8)',
        }}
      />

      {/* ── Outer ring: smooth lag + glow ──────────────────────── */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          ...shared,
          width:        28,
          height:       28,
          marginTop:    -14,
          marginLeft:   -14,
          borderRadius: '50%',
          background:   'transparent',
          border:       '1.5px solid rgba(255,122,61,0.7)',
          transition:   'width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s, background 0.25s, border 0.25s',
          backdropFilter: 'blur(1px)',
        }}
      />
    </>
  )
}
