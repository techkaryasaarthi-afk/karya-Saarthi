/**
 * Supabase admin client for API routes.
 *
 * KEY DIFFERENCE from lib/supabase/server.ts:
 * - Uses SERVICE_ROLE_KEY (bypasses RLS) — for server-side only
 * - Does NOT use cookies() — safe for API routes and background tasks
 * - Singleton pattern: reuses the same client across requests in the same
 *   serverless function instance (avoids creating a new TCP connection per request)
 *
 * USAGE: import { supabaseAdmin } from '@/lib/supabase/admin'
 * DO NOT use this on the client side — SERVICE_ROLE_KEY must never be exposed.
 */

import { createClient } from '@supabase/supabase-js'

// Module-level singleton — shared across requests in the same warm instance.
// Each cold-start gets a fresh instance (that's fine — connections pool at
// the Supabase Supavisor level, not here).
let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (_client) return _client

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-client-info': 'karyasaarthi-server' },
    },
  })

  return _client
}

// Convenience re-export — matches the createClient() call pattern in existing routes
export const supabaseAdmin = getSupabaseAdmin()
