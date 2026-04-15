import { createClient } from '@supabase/supabase-js'
import { env } from '@/shared/config/env'

// Public client (anon key) — used only for Realtime Broadcast subscriptions.
// It does not access database rows directly; sensitive data always flows
// through the backend API authenticated with the user's own JWT.
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})
