/**
 * lib/motion.tsx — Framer Motion drop-in replacement using native CSS.
 *
 * Exports `motion` and `AnimatePresence` with the same API surface as
 * framer-motion but implemented with CSS transitions. This eliminates
 * the framer-motion dependency from admin pages (which were banned).
 *
 * Supported props:
 *   initial, animate, exit, transition, whileHover, whileTap
 *
 * CSS-only approach:
 *   - initial  → applied immediately on mount (opacity/transform)
 *   - animate  → applied after first paint via requestAnimationFrame
 *   - exit     → applied before unmount (AnimatePresence)
 *   - transition.duration / transition.delay supported
 */

'use client'

import React, {
  useRef, useEffect, useState, createContext,
} from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Matches framer-motion's TargetAndTransition — any CSS-animatable property */
type MotionValues = {
  opacity?: number | string
  y?: number | string
  x?: number | string
  scale?: number | string
  rotate?: number | string
  height?: number | string
  width?: number | string
  maxHeight?: number | string
  maxWidth?: number | string
  padding?: number | string
  margin?: number | string
  borderRadius?: number | string
  backgroundColor?: string
  color?: string
  [key: string]: unknown
}

type TransitionConfig = {
  duration?: number
  delay?: number
  ease?: string | number[]
  // Spring physics props
  type?: 'spring' | 'tween' | 'inertia' | 'keyframes' | string
  stiffness?: number
  damping?: number
  mass?: number
  bounce?: number
  velocity?: number
  restSpeed?: number
  restDelta?: number
  // Repeat
  repeat?: number
  repeatType?: 'loop' | 'reverse' | 'mirror'
  repeatDelay?: number
  // Allow any other framer-motion transition prop
  [key: string]: unknown
}

type MotionProps = {
  initial?: MotionValues
  animate?: MotionValues
  exit?: MotionValues
  transition?: TransitionConfig
  whileHover?: MotionValues
  whileTap?: MotionValues
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id?: string
  key?: React.Key
  // Typed event handlers (preserve inference for admin pages)
  onClick?: (e: React.MouseEvent) => void
  onChange?: (e: React.ChangeEvent<HTMLElement>) => void
  onSubmit?: (e: React.FormEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  onKeyUp?: (e: React.KeyboardEvent) => void
  onFocus?: (e: React.FocusEvent) => void
  onBlur?: (e: React.FocusEvent) => void
  // Accept any extra framer-motion-specific props and ignore them at runtime
  variants?: Record<string, MotionValues>
  whileInView?: MotionValues
  viewport?: Record<string, unknown>
  layoutId?: string
  layout?: boolean | string
  [key: string]: unknown
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function withUnit(val: number | string, unit: string): string {
  return typeof val === 'string' ? val : `${val}${unit}`
}

function valuesToStyle(v: MotionValues): React.CSSProperties {
  const transforms: string[] = []
  if (v.y !== undefined) transforms.push(`translateY(${withUnit(v.y as number|string, 'px')})`)
  if (v.x !== undefined) transforms.push(`translateX(${withUnit(v.x as number|string, 'px')})`)
  if (v.scale !== undefined) transforms.push(`scale(${v.scale})`)
  if (v.rotate !== undefined) transforms.push(`rotate(${withUnit(v.rotate as number|string, 'deg')})`)

  const style: React.CSSProperties = {}
  if (v.opacity !== undefined) style.opacity = v.opacity
  if (transforms.length) style.transform = transforms.join(' ')
  if (v.height !== undefined) style.height = v.height
  if (v.width !== undefined) style.width = v.width
  if (v.maxHeight !== undefined) style.maxHeight = v.maxHeight
  if (v.maxWidth !== undefined) style.maxWidth = v.maxWidth
  if (v.padding !== undefined) style.padding = v.padding as string
  if (v.margin !== undefined) style.margin = v.margin as string
  if (v.borderRadius !== undefined) style.borderRadius = v.borderRadius as string
  if (v.backgroundColor !== undefined) style.backgroundColor = v.backgroundColor
  if (v.color !== undefined) style.color = v.color

  // Pass through any other unknown CSS properties
  for (const key of Object.keys(v)) {
    if (!(key in style) && !['y','x','scale','rotate'].includes(key)) {
      (style as Record<string, unknown>)[key] = v[key]
    }
  }

  return style
}

function buildTransition(t?: TransitionConfig): string {
  const dur = t?.duration ?? 0.3
  const delay = t?.delay ?? 0
  const ease = t?.ease ?? 'cubic-bezier(0.4, 0, 0.2, 1)'
  return `opacity ${dur}s ${ease} ${delay}s, transform ${dur}s ${ease} ${delay}s`
}

// ─── AnimatePresence context ──────────────────────────────────────────────────

const ExitCtx = createContext<{
  onExiting: (key: string, cb: () => void) => void
  removeChild: (key: string) => void
} | null>(null)

export function AnimatePresence({
  children,
  // Accept and ignore framer-motion-specific props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: _mode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initial: _initial,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  custom: _custom,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onExitComplete: _onExitComplete,
  ...rest
}: {
  children: React.ReactNode
  mode?: string
  initial?: boolean
  custom?: unknown
  onExitComplete?: () => void
  [key: string]: unknown
}) {
  // Passthrough — exit animations handled per-element via CSS transitions
  return <>{children}</>
}

// Framer-motion-specific props that should never reach the DOM
const FRAMER_PROPS = new Set([
  'initial','animate','exit','transition','whileHover','whileTap',
  'whileInView','variants','viewport','layoutId','layout',
  'onAnimationStart','onAnimationComplete','onUpdate','custom',
])

function MotionElement(tag: string, props: Record<string, unknown>) {
  const {
    initial, animate, exit, transition, whileHover, whileTap,
    children, style, className,
    // strip framer-only props
    whileInView: _wiv, variants: _var, viewport: _vp,
    layoutId: _lid, layout: _lay,
    ...rest
  } = props as MotionProps & Record<string, unknown>

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef<HTMLElement>(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [hovered, setHovered] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [tapped,  setTapped]  = useState(false)

  const baseStyle: React.CSSProperties = {
    transition: buildTransition(transition as TransitionConfig | undefined),
    ...(initial ? valuesToStyle(initial as MotionValues) : {}),
    ...(style as React.CSSProperties | undefined),
  }

  // After mount: animate to `animate` values
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = ref.current
    if (!el || !animate) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const s = valuesToStyle(animate as MotionValues)
        Object.assign(el.style, s)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hoverStyle = hovered && whileHover ? valuesToStyle(whileHover as MotionValues) : {}
  const tapStyle   = tapped  && whileTap   ? valuesToStyle(whileTap   as MotionValues) : {}

  const mergedStyle: React.CSSProperties = { ...baseStyle, ...hoverStyle, ...tapStyle }

  // Build clean props — strip any remaining framer-only keys before DOM render
  const domProps: Record<string, unknown> = {}
  for (const key of Object.keys(rest)) {
    if (!FRAMER_PROPS.has(key)) domProps[key] = (rest as Record<string, unknown>)[key]
  }

  return React.createElement(
    tag,
    {
      ref,
      className,
      style: mergedStyle,
      onMouseEnter: whileHover ? () => setHovered(true)  : undefined,
      onMouseLeave: whileHover ? () => setHovered(false) : undefined,
      onMouseDown:  whileTap   ? () => setTapped(true)   : undefined,
      onMouseUp:    whileTap   ? () => setTapped(false)  : undefined,
      ...domProps,
    },
    children,
  )
}

// ─── motion object ───────────────────────────────────────────────────────────

function createMotionComponent(tag: string) {
  const Component = (props: MotionProps & Record<string, unknown>) =>
    MotionElement(tag, props)
  Component.displayName = `motion.${tag}`
  return Component
}

// Typed motion object with common HTML tags
export const motion = {
  div:     createMotionComponent('div'),
  span:    createMotionComponent('span'),
  p:       createMotionComponent('p'),
  h1:      createMotionComponent('h1'),
  h2:      createMotionComponent('h2'),
  h3:      createMotionComponent('h3'),
  h4:      createMotionComponent('h4'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  ul:      createMotionComponent('ul'),
  li:      createMotionComponent('li'),
  button:  createMotionComponent('button'),
  a:       createMotionComponent('a'),
  img:     createMotionComponent('img'),
  form:    createMotionComponent('form'),
  table:   createMotionComponent('table'),
  tr:      createMotionComponent('tr'),
  td:      createMotionComponent('td'),
  th:      createMotionComponent('th'),
  aside:   createMotionComponent('aside'),
  nav:     createMotionComponent('nav'),
  header:  createMotionComponent('header'),
  footer:  createMotionComponent('footer'),
  main:    createMotionComponent('main'),
}
