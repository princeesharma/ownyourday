import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AppShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login')
      } else {
        setUser(data.session.user)
      }
    })
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <span className="font-bold tracking-tight">OwnYourDay</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#666]">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#888] hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Goals</h2>
          <p className="text-[#666] text-sm">Your goals will live here.</p>
        </div>
      </main>
    </div>
  )
}
