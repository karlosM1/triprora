import type { Session } from '@supabase/supabase-js'
import { isPasswordRecoveryActive, supabase } from '@/lib/supabase'

let cachedSession: Session | null = readStoredSession()

function readStoredSession(): Session | null {
  if (typeof window === 'undefined') return null

  const storageKey = getSupabaseAuthStorageKey()
  if (!storageKey) return null

  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(storageKey)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as Session | { currentSession?: Session | null }
      if ('access_token' in parsed && parsed.access_token) {
        return parsed as Session
      }
      if ('currentSession' in parsed && parsed.currentSession?.access_token) {
        return parsed.currentSession
      }
    } catch {
      continue
    }
  }

  return null
}

function getSupabaseAuthStorageKey() {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) return null

  try {
    const hostname = new URL(url).hostname
    const projectRef = hostname.split('.')[0]
    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}

export function getCachedSession() {
  return cachedSession
}

export function getCachedAccessToken() {
  return cachedSession?.access_token ?? null
}

export function setCachedSession(session: Session | null) {
  cachedSession = session
}

export async function resolveSession() {
  if (isPasswordRecoveryActive()) {
    setCachedSession(null)
    return null
  }

  if (cachedSession) return cachedSession

  const {
    data: { session },
  } = await supabase.auth.getSession()

  setCachedSession(session)
  return session
}
