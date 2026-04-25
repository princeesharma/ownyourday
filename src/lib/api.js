import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
