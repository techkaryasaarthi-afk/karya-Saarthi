/**
 * DESIGN.md Token System — TypeScript exports
 * Single source of truth for use in inline styles and dynamic logic.
 */

export const colors = {
  primary:          '#ffffff',
  onPrimary:        '#000000',
  accentBlue:       '#0099ff',
  ink:              '#ffffff',
  inkMuted:         '#999999',
  canvas:           '#090909',
  surface1:         '#141414',
  surface2:         '#1c1c1c',
  hairline:         '#262626',
  hairlineSoft:     '#1a1a1a',
  inverseCanvas:    '#ffffff',
  inverseInk:       '#000000',
  gradientMagenta:  '#d44df0',
  gradientViolet:   '#6a4cf5',
  gradientOrange:   '#ff7a3d',
  gradientCoral:    '#ff5577',
  semanticSuccess:  '#22c55e',
  adminBase:        '#141414',
} as const

export const radii = {
  xs:   '4px',
  sm:   '6px',
  md:   '10px',
  lg:   '15px',
  xl:   '20px',
  xxl:  '30px',
  pill: '100px',
  full: '9999px',
} as const

export const spacing = {
  hair:    '1px',
  xxs:     '4px',
  xs:      '8px',
  sm:      '12px',
  md:      '15px',
  lg:      '20px',
  xl:      '30px',
  xxl:     '40px',
  section: '96px',
} as const

export const typography = {
  displayXxl: {
    fontSize:      'clamp(52px, 9vw, 110px)',
    fontWeight:    '500',
    lineHeight:    '0.85',
    letterSpacing: '-5.5px',
  },
  displayXl: {
    fontSize:      'clamp(40px, 7vw, 85px)',
    fontWeight:    '500',
    lineHeight:    '0.95',
    letterSpacing: '-4.25px',
  },
  displayLg: {
    fontSize:      'clamp(32px, 5vw, 62px)',
    fontWeight:    '500',
    lineHeight:    '1.00',
    letterSpacing: '-3.1px',
  },
  displayMd: {
    fontSize:      '32px',
    fontWeight:    '500',
    lineHeight:    '1.13',
    letterSpacing: '-1.0px',
  },
  headline: {
    fontSize:      '22px',
    fontWeight:    '700',
    lineHeight:    '1.20',
    letterSpacing: '-0.8px',
  },
  subhead: {
    fontSize:      '24px',
    fontWeight:    '400',
    lineHeight:    '1.30',
    letterSpacing: '-0.01px',
  },
  bodyLg: {
    fontSize:      '18px',
    fontWeight:    '400',
    lineHeight:    '1.30',
    letterSpacing: '-0.18px',
  },
  body: {
    fontSize:      '15px',
    fontWeight:    '400',
    lineHeight:    '1.30',
    letterSpacing: '-0.15px',
  },
  bodySm: {
    fontSize:      '14px',
    fontWeight:    '500',
    lineHeight:    '1.40',
    letterSpacing: '-0.14px',
  },
  caption: {
    fontSize:      '13px',
    fontWeight:    '500',
    lineHeight:    '1.20',
    letterSpacing: '-0.13px',
  },
  micro: {
    fontSize:      '12px',
    fontWeight:    '400',
    lineHeight:    '1.20',
    letterSpacing: '-0.12px',
  },
  button: {
    fontSize:      '14px',
    fontWeight:    '500',
    lineHeight:    '1.0',
    letterSpacing: '-0.14px',
  },
} as const

export const elevation = {
  flat: 'none',
  level2: 'rgba(255,255,255,0.10) 0 0.5px 0 0 inset, rgba(0,0,0,0.25) 0 10px 30px',
  focus: 'rgba(0,153,255,0.15) 0 0 0 1px, rgba(0,153,255,0.30) 0 0 0 3px',
} as const

export const animation = {
  duration: {
    instant: '100ms',
    fast:    '150ms',
    normal:  '200ms',
    slow:    '300ms',
    reveal:  '500ms',
  },
  easing: {
    out:     'cubic-bezier(0.0, 0, 0.2, 1)',
    inOut:   'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
    accord:  'cubic-bezier(0.87, 0, 0.13, 1)',
  },
} as const

/** Status chip semantic color mapping */
export const statusColors: Record<string, { bg: string; text: string }> = {
  requirement_submitted: { bg: colors.surface2,        text: colors.inkMuted },
  requirement_review:    { bg: '#1a1a2e',               text: '#818cf8' },
  quotation_sent:        { bg: '#1a1a2e',               text: colors.accentBlue },
  approved:              { bg: '#0d1f17',               text: colors.semanticSuccess },
  in_progress:           { bg: '#1a1500',               text: '#facc15' },
  testing:               { bg: '#1a0d00',               text: colors.gradientOrange },
  revision:              { bg: '#1a0008',               text: colors.gradientCoral },
  delivered:             { bg: '#0d1a1a',               text: '#2dd4bf' },
  completed:             { bg: '#0d1f17',               text: colors.semanticSuccess },
  // vendor status
  assigned:              { bg: '#0d1020',               text: colors.accentBlue },
  review:                { bg: '#1a0d1a',               text: colors.gradientMagenta },
  cancelled:             { bg: '#1a0808',               text: '#f87171' },
}
