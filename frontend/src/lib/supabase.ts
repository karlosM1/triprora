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

const authStorage = {
  getItem(key: string) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key: string, value: string) {
    const remember = localStorage.getItem(REMEMBER_ME_KEY) !== 'false'
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

export function setRememberMePreference(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')
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
