import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy frontend/.env.example to frontend/.env and add your Supabase keys.',
  )
}

export const REMEMBER_EMAIL_KEY = 'triprora-remember-email'
export const REMEMBER_ME_KEY = 'triprora-remember-me'
export const PASSWORD_RECOVERY_KEY = 'triprora-password-recovery'

export function isPasswordRecoveryActive() {
  return sessionStorage.getItem(PASSWORD_RECOVERY_KEY) === 'true'
}

export function setPasswordRecoveryActive(active: boolean) {
  if (active) {
    sessionStorage.setItem(PASSWORD_RECOVERY_KEY, 'true')
    return
  }
  sessionStorage.removeItem(PASSWORD_RECOVERY_KEY)
}

/** True when the current URL is a Supabase password-recovery redirect. */
export function detectPasswordRecoveryFromUrl() {
  if (typeof window === 'undefined') return false

  const search = new URLSearchParams(window.location.search)
  if (search.get('type') === 'recovery') return true

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  if (!hash) return false

  return new URLSearchParams(hash).get('type') === 'recovery'
}

function getSupabaseAuthStorageKey() {
  try {
    const hostname = new URL(supabaseUrl).hostname
    const projectRef = hostname.split('.')[0]
    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}

const authStorage = {
  getItem(key: string) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key: string, value: string) {
    const remember = getRememberMePreference()
    if (remember) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
      return
    }
    sessionStorage.setItem(key, value)
    localStorage.removeItem(key)
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function getRememberMePreference() {
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false'
}

export function setRememberMePreference(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')

  // Keep an existing session in the storage that matches the preference.
  const storageKey = getSupabaseAuthStorageKey()
  if (!storageKey) return

  if (remember) {
    const fromSession = sessionStorage.getItem(storageKey)
    if (fromSession) {
      localStorage.setItem(storageKey, fromSession)
      sessionStorage.removeItem(storageKey)
    }
    return
  }

  const fromLocal = localStorage.getItem(storageKey)
  if (fromLocal) {
    sessionStorage.setItem(storageKey, fromLocal)
    localStorage.removeItem(storageKey)
  }
}

export function getRememberedEmail() {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''
}

export function setRememberedEmail(email: string) {
  localStorage.setItem(REMEMBER_EMAIL_KEY, email)
}

export function clearRememberedEmail() {
  localStorage.removeItem(REMEMBER_EMAIL_KEY)
}

export function getAuthRedirectUrl(path = '/my-bookings') {
  return `${window.location.origin}${path}`
}
