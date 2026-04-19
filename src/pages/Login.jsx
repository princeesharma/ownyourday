import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import '../App.css'

const quotes = [
  "Every day is a chance to begin again.",
  "Small steps still move you forward.",
  "Progress, not perfection.",
  "You showed up. That already counts.",
  "Your goals are worth coming back to.",
]

const quote = quotes[Math.floor(Math.random() * quotes.length)]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/goals')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <a href="/" className="fixed top-4 left-4 inline-flex items-center gap-1 text-xs text-[#7A687A] hover:text-[#B8446A] no-underline transition-colors bg-white/60 backdrop-blur-[12px] border border-[#F5CFDC] rounded-full px-3 py-1.5">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </a>
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-[#2B1D25] font-semibold text-lg no-underline" style={{ fontFamily: "'Lora', serif" }}>
            OwnYourDay
          </a>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-[20px] rounded-3xl border border-[#F5CFDC] px-8 py-9 shadow-sm">

          <h1 className="text-[26px] font-semibold text-[#2B1D25] mb-1 leading-tight text-center" style={{ fontFamily: "'Lora', serif" }}>
            Welcome back
          </h1>
          <p className="text-[#B8446A] text-sm italic mb-6 text-center">{quote}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7A687A] mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/80 border border-[#F5CFDC] rounded-xl px-4 py-2.5 text-[#2B1D25] text-sm focus:outline-none focus:border-[#F9A8C0] focus:ring-2 focus:ring-[#F9A8C0]/20 transition placeholder:text-[#C4A8B4]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A687A] mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/80 border border-[#F5CFDC] rounded-xl px-4 py-2.5 text-[#2B1D25] text-sm focus:outline-none focus:border-[#F9A8C0] focus:ring-2 focus:ring-[#F9A8C0]/20 transition placeholder:text-[#C4A8B4]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[#B8446A] text-sm bg-[#FFF0F4] border border-[#F5CFDC] rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F9A8C0] text-[#B8446A] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F094AE] hover:-translate-y-px transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7A687A] mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#B8446A] font-medium hover:underline no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
