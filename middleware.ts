import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken, verifyRefreshToken, signAccessToken, type TokenPayload } from '@/lib/auth/jwt'
import { createServerClient } from '@supabase/ssr'
import { rateLimit, buildKey } from '@/lib/security/rateLimit'

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

  // Block common scanner/exploit path patterns
  const maliciousPaths = [
    '/.env', '/.git', '/wp-admin', '/wp-login', '/phpmyadmin',
    '/admin.php', '/config.php', '/.htaccess', '/xmlrpc.php',
    '/shell', '/cmd', '/eval', '/exec', '/../', '/etc/passwd',
    '/proc/self', '/cgi-bin', '/.aws', '/.ssh',
  ]
  if (maliciousPaths.some(p => pathname.toLowerCase().includes(p))) return true

  // Block common scanner user agents
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIP(request)

  // ─── Block suspicious/scanner requests ─────────────────────────────────
  if (isSuspicious(pathname, request)) {
    return new NextResponse(null, { status: 404 })
  }

  // ─── Rate limiting ──────────────────────────────────────────────────────
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

  // Tier 2: General API endpoints — moderate (120 req / 60s)
  else if (pathname.startsWith('/api/')) {
    const result = rateLimit(buildKey(ip, 'api'), {
      limit: 120,
      windowMs: 60_000,
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '120',
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

  // ─── Public routes — no auth needed ─────────────────────────────────────
  const publicPaths = [
    '/', '/login', '/signup', '/staff-login', '/forgot-password',
    '/blogs', '/services', '/about', '/contact', '/events',
    '/api/auth/login', '/api/auth/signup', '/api/auth/refresh',
    '/api/auth/forgot-password', '/api/auth/verify-otp',
    '/api/auth/reset-password', '/api/auth/send-signup-otp',
    '/api/services', '/api/events', '/api/newsletter',
    '/api/public', '/api/chat/ai',
  ]

  const isPublic = publicPaths.some(p =>
    pathname === p ||
    (p === '/blogs' && pathname.startsWith('/blogs/')) ||
    (p === '/services' && pathname.startsWith('/services/')) ||
    (p === '/events' && pathname.startsWith('/events/')) ||
    (p === '/api/services' && pathname.startsWith('/api/services')) ||
    (p === '/api/events' && pathname.startsWith('/api/events')) ||
    (p === '/api/public' && pathname.startsWith('/api/public'))
  ) || 
  (pathname.startsWith('/api/admin/blogs') && request.nextUrl.searchParams.get('public') === 'true') ||
  (pathname.startsWith('/api/admin/about') && request.nextUrl.searchParams.get('public') === 'true')

  if (isPublic) return NextResponse.next()

  // ─── Auth verification & refresh ─────────────────────────────────────────
  const accessToken = request.cookies.get('access_token')?.value
  let user: TokenPayload | null = null
  let newAccessTokenToSet: string | null = null

  if (accessToken) {
    user = await verifyAccessToken(accessToken)
  }

  // Transparent session token refresh
  if (!user) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (refreshToken) {
      try {
        const payload = await verifyRefreshToken(refreshToken)
        if (payload) {
          const tokenHash = await sha256(refreshToken)
          
          // Dummy response to initialize Supabase SSR client
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

          const { data: storedToken } = await supabase
            .from('refresh_tokens')
            .select('*')
            .eq('token_hash', tokenHash)
            .eq('revoked', false)
            .single()

          if (storedToken) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, email, role, department, pillar_role, is_approved')
              .eq('id', payload.userId)
              .single()

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
        console.error('Middleware transparent refresh error:', err)
      }
    }
  }

  // Helper function to attach refreshed token cookie to final response
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

  if (!user) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api/admin') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/vendor')
      ) {
        const loginUrl = INTERNAL_ROLES.some(r => pathname.includes(r)) || pathname.startsWith('/admin')
          ? '/staff-login'
          : '/login'
        return withRefresh(NextResponse.redirect(new URL(loginUrl, request.url)))
      }
      return withRefresh(NextResponse.next())
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/vendor')) {
      return withRefresh(NextResponse.next())
    }
    if (pathname.startsWith('/admin')) {
      return withRefresh(NextResponse.redirect(new URL('/staff-login', request.url)))
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
      return withRefresh(NextResponse.redirect(new URL('/admin', request.url)))
    }
    if (user.role === 'vendor') {
      return withRefresh(NextResponse.redirect(new URL('/vendor', request.url)))
    }
  }

  return withRefresh(NextResponse.next())
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/vendor',
    '/vendor/:path*',
  ],
}
