import { createClient } from '@supabase/supabase-js'

// Cliente público (anon key) — solo se usa para suscripciones Realtime Broadcast.
// No accede a datos de la BD directamente; los datos sensibles se obtienen
// siempre a través de la API del backend con el JWT propio del usuario.
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  realtime: { params: { eventsPerSecond: 10 } },
})
