'use client'

import { useEffect, useRef } from 'react'

/**
 * useReveal — attaches IntersectionObserver to a container ref.
 * Adds "visible" class to children with "reveal" class when they enter viewport.
 * Replaces framer-motion whileInView for scroll-reveal animations.
 */
export function useReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll<HTMLElement>('.reveal')
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Once revealed, stop observing for performance
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [options])

  return ref as React.RefObject<HTMLElement>
}

/**
 * useSingleReveal — attaches IntersectionObserver to a single element.
 * Returns [ref, isVisible].
 */
export function useSingleReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return ref as React.RefObject<HTMLElement>
}
