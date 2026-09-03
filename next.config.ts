import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block iframe embedding (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Legacy XSS filter for old browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Strict referrer for privacy
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features we don't use
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  // Force HTTPS for 2 years (production only — localhost doesn\'t use HTTPS)
  ...(!isDev ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  }] : []),
  // Cross-Origin-Opener-Policy: isolate top-level context (prevents Spectre, XS-Leaks)
  // 'same-origin-allow-popups' instead of 'same-origin' to allow Razorpay popup checkout
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Cross-Origin-Resource-Policy: prevent other origins from hotlinking our resources
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + inline needed for Next.js hydration + Razorpay + Google Analytics
      // blob: is required for Turbopack HMR (dev) and some payment scripts
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com",
      // script-src-elem explicitly set to avoid 'using script-src as fallback' warning
      "script-src-elem 'self' 'unsafe-inline' blob: https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com",
      // Styles: self + inline (Tailwind CSS-in-JS) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs + Supabase storage + common image hosts
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://picsum.photos https://placehold.co https://i.pravatar.cc https://via.placeholder.com https://upload.wikimedia.org https://vibcare.in https://logo.clearbit.com https://*.cloudinary.com https://drive.google.com https://*.googleusercontent.com",
      // API connections: self + Supabase + Razorpay + Google Analytics
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.razorpay.com https://lumberjack.razorpay.com wss://*.supabase.co https://www.google-analytics.com",
      // Iframes: Razorpay checkout + Google Maps + Looker Studio (GA embed)
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://google.com https://lookerstudio.google.com https://datastudio.google.com",
      // Workers: only self + blob (for Turbopack)
      "worker-src 'self' blob:",
      // Objects: block Flash and plugins
      "object-src 'none'",
      // Base URI: restrict to self
      "base-uri 'self'",
      // Form actions: only self
      "form-action 'self'",
      // Only upgrade insecure requests in production (dev uses plain http)
      ...(!isDev ? ["upgrade-insecure-requests"] : []),
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  // ── React ──────────────────────────────────────────────────────────────────
  reactStrictMode: true,

  // ── Security headers on all routes ────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache-Control for static assets
      // NOTE: use must-revalidate (NOT immutable) so browsers check for
      // new chunks after deploys instead of serving stale cached JS/CSS.
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          // Hashed filenames guarantee uniqueness — immutable is safe here.
          // BUT chunks without content-hash use must-revalidate so browsers
          // don't serve stale modules after deploys.
          { key: 'Cache-Control', value: 'public, max-age=31536000, must-revalidate' },
        ],
      },
    ]
  },

  // ── Image domains (Vercel Image Optimization) ──────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'vibcare.in' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // Own domain assets (services, blogs, marketing images)
      { protocol: 'https', hostname: 'karyasaarthi.com' },
      { protocol: 'https', hostname: 'www.karyasaarthi.com' },
      { protocol: 'http', hostname: 'www.karyasaarthi.com' },
      { protocol: 'http', hostname: 'karyasaarthi.com' },
      // Any subdomain of karyasaarthi.com (e.g., cdn.karyasaarthi.com)
      { protocol: 'https', hostname: '**.karyasaarthi.com' },
      // Vercel deployment previews
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
    // Vercel free plan: minimize transforms to save bandwidth
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // ── Server Actions ─────────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'karyasaarthi.com',
        'www.karyasaarthi.com',
        'admin.karyasaarthi.com',
        'karyasaarthi.vercel.app',
      ],
    },
    // Enable View Transitions API for smooth page fade animations (DESIGN.md #12)
    viewTransition: true,
  },

  // ── Compiler ───────────────────────────────────────────────────────────────
  // Remove console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn', 'info'] }
      : false,
  },

  // ── Build ──────────────────────────────────────────────────────────────────
  typescript: { ignoreBuildErrors: false },

  // ── Turbopack dev: disable persistent disk cache to prevent stale chunks ───
  // This stops the "need hard reset" issue caused by orphaned module chunks
  // (e.g., after removing framer-motion) persisting across dev server restarts.
  ...(isDev ? {
    turbopack: {
      // Disable disk cache in dev so each restart gets fresh chunks
      root: process.cwd(),
    },
  } : {}),

  // ── Power Vercel-specific env ──────────────────────────────────────────────
  // @ts-ignore — allowedDevOrigins is a Next.js 16 extension
  allowedDevOrigins: [
    '10.131.29.105', '10.212.154.105',
    'admin.localhost',
    '*.localhost',
  ],
}

export default nextConfig
