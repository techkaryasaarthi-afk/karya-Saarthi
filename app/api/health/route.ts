import { NextResponse } from 'next/server'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

// Lightweight health check — used by:
// 1. Uptime monitors (UptimeRobot, Vercel deployment checks)
// 2. Load balancers / CDN health probes
// 3. Your own monitoring dashboards
//
// Returns 200 + JSON payload on healthy state.
// Returns 503 if DB is unreachable (so monitors can alert before users complain).

export async function GET() {
  const start = Date.now()

  try {
    // Quick DB ping — just check if Supabase is reachable
    // We use the anon key (no auth needed for health checks)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        // 5s timeout — if DB takes longer than this, we're degraded
        signal: AbortSignal.timeout(5000),
      }
    )

    const dbLatency = Date.now() - start
    const dbOk = res.ok || res.status === 400 // 400 = reachable but empty query

    return NextResponse.json(
      {
        status: dbOk ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        latency: {
          db: `${dbLatency}ms`,
        },
        services: {
          database: dbOk ? 'up' : 'down',
          app: 'up',
        },
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
      },
      {
        status: dbOk ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Check': 'karyasaarthi',
        },
      }
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error',
        services: {
          database: 'down',
          app: 'up',
        },
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}
