import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken, verifyRefreshToken, signAccessToken, type TokenPayload } from '@/lib/auth/jwt'
import { createServerClient } from '@supabase/ssr'
import { rateLimit, buildKey } from '@/lib/security/rateLimit'

// ─── Hostname helpers ────────────────────────────────────────────────────────

/**
 * Returns true when the request is coming from the admin subdomain.
 * Supports:
 *   - admin.karyasaarthi.com  (production)
 *   - admin.localhost          (local dev with /etc/hosts alias)
 *   - localhost:PORT/via NEXT_PUBLIC_IS_ADMIN_HOST=true env override (dev preview)
 */
function isAdminHost(req: NextRequest): boolean {
  const host = req.headers.get('host') || ''
  // Env override: set NEXT_PUBLIC_IS_ADMIN_HOST=true in a .env.admin.local file
  // when running the dev server to test admin domain behaviour locally.
  if (process.env.NEXT_PUBLIC_IS_ADMIN_HOST === 'true') return true
  return host.startsWith('admin.')
}

const ADMIN_DOMAIN =
  process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'https://admin.karyasaarthi.com'

const MAIN_DOMAIN =
  process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://karyasaarthi.com'

/** Extract real IP — works on Vercel, Cloudflare, and local */
function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  )
}

/** Detect obviously malicious request patterns */
function isSuspicious(pathname: string, req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') || ''

  const maliciousPaths = [
    '/.env', '/.git', '/wp-admin', '/wp-login', '/phpmyadmin',
    '/admin.php', '/config.php', '/.htaccess', '/xmlrpc.php',
    '/shell', '/cmd', '/eval', '/exec', '/../', '/etc/passwd',
    '/proc/self', '/cgi-bin', '/.aws', '/.ssh',
  ]
  if (maliciousPaths.some(p => pathname.toLowerCase().includes(p))) return true

  const badAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'nuclei', 'dirbuster', 'gobuster']
  if (badAgents.some(a => ua.toLowerCase().includes(a))) return true

  return false
}

// Web Crypto SHA-256 helper compatible with Next.js Edge middleware runtime
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const INTERNAL_ROLES = ['super_admin', 'board_member', 'admin', 'pending_admin', 'pillar_member']

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIP(request)
  const adminHost = isAdminHost(request)

  // ─── Skip rate limiting & auth for Next.js internals ───────────────────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ─── Block suspicious/scanner requests ─────────────────────────────────
  if (isSuspicious(pathname, request)) {
    return new NextResponse(null, { status: 404 })
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HOSTNAME ROUTING
  // ═══════════════════════════════════════════════════════════════════════

  if (adminHost) {
    // ── admin.karyasaarthi.com ──────────────────────────────────────────
    //
    // Root "/" → redirect to /admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    // "/login" on admin host → rewrite to /staff-login internally
    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/staff-login'
      return NextResponse.rewrite(url)
    }
    // Block public user-facing routes from admin domain
    const publicOnlyRoutes = ['/signup', '/services', '/about', '/contact', '/blogs', '/events', '/podcasts', '/hackathons']
    if (publicOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
      return NextResponse.redirect(new URL(MAIN_DOMAIN + pathname))
    }
    // Everything else (including /admin/*, /api/*, /staff-login, /dashboard, /vendor)
    // falls through to the normal auth logic below.

  } else {
    // ── karyasaarthi.com (main public site) ────────────────────────────
    //
    // Block /admin/* → redirect to admin subdomain
    if (pathname.startsWith('/admin')) {
      // Preserve the path: karyasaarthi.com/admin/crm → admin.karyasaarthi.com/admin/crm
      return NextResponse.redirect(new URL(ADMIN_DOMAIN + pathname + request.nextUrl.search))
    }
    // /staff-login → redirect to admin subdomain login
    if (pathname === '/staff-login') {
      return NextResponse.redirect(new URL(ADMIN_DOMAIN + '/login'))
    }
    // /api/admin/* on main domain — still works (same origin Vercel deployment)
    // Only UI routes are blocked above. API routes pass through.
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════════════════════════════

  // Tier 1: Auth endpoints — very strict (10 req / 60s, then 5 min block)
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/staff-register') ||
    pathname.startsWith('/api/auth/send-signup-otp') ||
    pathname.startsWith('/api/auth/verify-otp') ||
    pathname.startsWith('/api/auth/forgot-password') ||
    pathname.startsWith('/api/auth/reset-password')
  ) {
    const result = rateLimit(buildKey(ip, 'auth'), {
      limit: 10,
      windowMs: 60_000,
      blockDurationMs: 5 * 60_000, // 5 min block
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.retryAfter ?? 60_000) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
  }

  // Tier 2: General API endpoints — 300/min
  else if (pathname.startsWith('/api/')) {
    const result = rateLimit(buildKey(ip, 'api'), {
      limit: 300,
      windowMs: 60_000,
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '300',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
  }

  // ─── Static files — skip everything else ────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES — no auth needed
  // ═══════════════════════════════════════════════════════════════════════

  const publicPaths = [
    '/', '/login', '/signup', '/staff-login', '/forgot-password',
    '/blogs', '/services', '/about', '/contact', '/events',
    '/terms', '/privacy', '/disclaimer', '/refund', '/cookies',
    '/api/auth/login', '/api/auth/signup', '/api/auth/refresh',
    '/api/auth/forgot-password', '/api/auth/verify-otp',
    '/api/auth/reset-password', '/api/auth/send-signup-otp',
    '/api/services', '/api/events', '/api/newsletter',
    '/api/public', '/api/chat/ai', '/api/health',
  ]

  const isPublic = publicPaths.some(p =>
    pathname === p ||
    (p === '/blogs'        && pathname.startsWith('/blogs/')) ||
    (p === '/services'     && pathname.startsWith('/services/')) ||
    (p === '/events'       && pathname.startsWith('/events/')) ||
    (p === '/api/services' && pathname.startsWith('/api/services')) ||
    (p === '/api/events'   && pathname.startsWith('/api/events')) ||
    (p === '/api/public'   && pathname.startsWith('/api/public'))
  ) ||
  (pathname.startsWith('/api/admin/blogs') && request.nextUrl.searchParams.get('public') === 'true') ||
  (pathname.startsWith('/api/admin/about') && request.nextUrl.searchParams.get('public') === 'true')

  if (isPublic) return NextResponse.next()

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH VERIFICATION & TRANSPARENT REFRESH
  // ═══════════════════════════════════════════════════════════════════════

  const accessToken = request.cookies.get('access_token')?.value
  let user: TokenPayload | null = null
  let newAccessTokenToSet: string | null = null

  if (accessToken) {
    user = await verifyAccessToken(accessToken)
  }

  // Only run DB-hitting refresh if:
  // 1. We don't have a valid access token AND
  // 2. This is NOT a Next.js internal prefetch request
  const isNextjsPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('rsc') === '1'

  if (!user && !isNextjsPrefetch) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (refreshToken) {
      try {
        const payload = await verifyRefreshToken(refreshToken)
        if (payload) {
          const tokenHash = await sha256(refreshToken)

          let mockResponse = NextResponse.next()
          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name) { return request.cookies.get(name)?.value },
                set(name, value, options) {
                  request.cookies.set({ name, value, ...options })
                  mockResponse = NextResponse.next({ request: { headers: request.headers } })
                  mockResponse.cookies.set({ name, value, ...options })
                },
                remove(name, options) {
                  request.cookies.set({ name, value: '', ...options })
                  mockResponse = NextResponse.next({ request: { headers: request.headers } })
                  mockResponse.cookies.set({ name, value: '', ...options })
                }
              }
            }
          )

          // ⚠️ CRITICAL: 3s timeout on ALL Supabase middleware calls
          const timeout = (ms: number) =>
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))

          const tokenResult = await Promise.race([
            supabase.from('refresh_tokens').select('id').eq('token_hash', tokenHash).eq('revoked', false).single(),
            timeout(3000),
          ])
          const storedToken = tokenResult.data

          if (storedToken) {
            const userResult = await Promise.race([
              supabase.from('users').select('id, email, role, department, pillar_role, is_approved').eq('id', payload.userId).single(),
              timeout(3000),
            ])
            const userData = userResult.data

            if (userData) {
              const newAccessToken = await signAccessToken({
                userId: userData.id,
                email: userData.email,
                role: userData.role,
                department: userData.department || null,
                pillarRole: userData.pillar_role || null,
                isApproved: userData.is_approved || false,
              })

              newAccessTokenToSet = newAccessToken
              user = {
                userId: userData.id,
                email: userData.email,
                role: userData.role,
                department: userData.department || null,
                pillarRole: userData.pillar_role || null,
                isApproved: userData.is_approved || false,
              }
            }
          }
        }
      } catch (err) {
        // On timeout or DB error: fail open — user stays logged out temporarily.
        // Far better than a 504 for everyone.
        if (process.env.NODE_ENV !== 'production') {
          console.error('Middleware transparent refresh error:', err)
        }
      }
    }
  }

  // Helper: attach refreshed token cookie to the final response
  const withRefresh = (res: NextResponse): NextResponse => {
    if (newAccessTokenToSet) {
      res.cookies.set('access_token', newAccessTokenToSet, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      })
    }
    return res
  }

  // ─── Unauthenticated ─────────────────────────────────────────────────────
  if (!user) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api/admin') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/vendor')
      ) {
        // On admin host: redirect to /login (which rewrites to /staff-login)
        // On main host: /admin/* was already redirected to admin domain above
        const loginUrl = pathname.startsWith('/admin')
          ? (adminHost ? '/login' : ADMIN_DOMAIN + '/login')
          : '/login'
        return withRefresh(NextResponse.redirect(new URL(loginUrl, request.url)))
      }
      return withRefresh(NextResponse.next())
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/vendor')) {
      return withRefresh(NextResponse.next())
    }
    if (pathname.startsWith('/admin')) {
      return withRefresh(NextResponse.redirect(new URL(adminHost ? '/login' : ADMIN_DOMAIN + '/login', request.url)))
    }
    return withRefresh(NextResponse.next())
  }

  // ─── Admin / Internal routes ─────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (user.role === 'super_admin') return withRefresh(NextResponse.next())

    if (user.role === 'board_member') {
      if (
        pathname.startsWith('/admin/board') ||
        pathname.startsWith('/api/admin/board') ||
        pathname.startsWith('/admin/staff') ||
        pathname.startsWith('/api/admin/staff') ||
        pathname.startsWith('/admin/profile') ||
        pathname.startsWith('/api/admin/about') ||
        pathname.startsWith('/api/admin/announcements') ||
        pathname === '/admin'
      ) {
        return withRefresh(NextResponse.next())
      }
      return withRefresh(NextResponse.redirect(new URL('/admin/board', request.url)))
    }

    if (user.role === 'pillar_member' && user.pillarRole) {
      const allowedPage = `/admin/pillars/${user.pillarRole}`
      const allowedApi1 = `/api/admin/pillars/${user.pillarRole}`
      const allowedApi2 = `/api/admin/${user.pillarRole}`
      if (
        pathname.startsWith(allowedPage) ||
        pathname.startsWith(allowedApi1) ||
        pathname.startsWith(allowedApi2)
      ) return withRefresh(NextResponse.next())

      if (pathname.startsWith('/api/')) {
        return withRefresh(NextResponse.json({ error: 'Unauthorized pillar access' }, { status: 403 }))
      }
      return withRefresh(NextResponse.redirect(new URL(allowedPage, request.url)))
    }

    if (user.role === 'admin' && user.isApproved) {
      const effectiveDept = user.pillarRole === 'digital' ? 'digital' : user.department
      if (pathname === '/admin' && effectiveDept) {
        return withRefresh(NextResponse.redirect(new URL(`/admin/${effectiveDept}`, request.url)))
      }
      if (effectiveDept) {
        const restrictedDepts = ['hr', 'finance', 'operations', 'marketing', 'digital']
        const targetDept = restrictedDepts.find(d => pathname.startsWith(`/admin/${d}`))
        if (targetDept && targetDept !== effectiveDept) {
          return withRefresh(NextResponse.redirect(new URL(`/admin/${effectiveDept}`, request.url)))
        }
      }
      return withRefresh(NextResponse.next())
    }

    if (user.role === 'pending_admin' || (user.role === 'admin' && !user.isApproved)) {
      if (pathname.startsWith('/api/')) {
        return withRefresh(NextResponse.json({ error: 'Admin account pending approval' }, { status: 403 }))
      }
      return withRefresh(NextResponse.redirect(new URL('/dashboard?pending=1', request.url)))
    }

    if (pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/admin/projects/tasks')) return withRefresh(NextResponse.next())
      return withRefresh(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }))
    }
    const fallback = user.role === 'vendor' ? '/vendor' : '/dashboard'
    return withRefresh(NextResponse.redirect(new URL(fallback, request.url)))
  }

  // ─── Vendor routes ────────────────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    if (user.role !== 'vendor' && user.role !== 'super_admin') {
      return withRefresh(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
  }

  // ─── Dashboard (customer only) ────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (INTERNAL_ROLES.includes(user.role) && user.role !== 'pending_admin') {
      // Admin users who land on main site dashboard → send to admin subdomain
      return withRefresh(NextResponse.redirect(new URL(ADMIN_DOMAIN + '/admin', request.url)))
    }
    if (user.role === 'vendor') {
      return withRefresh(NextResponse.redirect(new URL('/vendor', request.url)))
    }
  }

  return withRefresh(NextResponse.next())
}

export const config = {
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/api/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/vendor',
    '/vendor/:path*',
    '/staff-login',
    '/login',
  ],
}
