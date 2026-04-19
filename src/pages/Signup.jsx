import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import '../App.css'

const quotes = [
  "The best time to start is now.",
  "A goal without a plan is just a wish.",
  "You don't have to be great to start.",
  "One small commitment. That's all it takes.",
  "Your future self will thank you for this.",
]

const quote = quotes[Math.floor(Math.random() * quotes.length)]

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` }
    })
    setLoading(false)
    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists.')
      } else {
        setError(error.message)
      }
    } else if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists.')
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-[420px]">
          <div className="bg-white/70 backdrop-blur-[20px] rounded-3xl border border-[#BEE8D2] px-8 py-10 shadow-sm text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-[22px] font-semibold text-[#2B1D25] mb-2" style={{ fontFamily: "'Lora', serif" }}>
              Check your email
            </h2>
            <p className="text-[#7A687A] text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="text-[#2E7A50] font-medium">{email}</span>.
              <br />Click it to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-sm text-[#B8446A] font-medium hover:underline no-underline"
            >
              Back to login →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <a href="/" className="fixed top-4 left-4 inline-flex items-center gap-1 text-xs text-[#7A687A] hover:text-[#2E7A50] no-underline transition-colors bg-white/60 backdrop-blur-[12px] border border-[#BEE8D2] rounded-full px-3 py-1.5">
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
        <div className="bg-white/70 backdrop-blur-[20px] rounded-3xl border border-[#BEE8D2] px-8 py-9 shadow-sm">

          <h1 className="text-[26px] font-semibold text-[#2B1D25] mb-1 leading-tight text-center" style={{ fontFamily: "'Lora', serif" }}>
            Start your journey
          </h1>
          <p className="text-[#2E7A50] text-sm italic mb-6 text-center">{quote}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7A687A] mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/80 border border-[#BEE8D2] rounded-xl px-4 py-2.5 text-[#2B1D25] text-sm focus:outline-none focus:border-[#98D4B0] focus:ring-2 focus:ring-[#98D4B0]/20 transition placeholder:text-[#A8C4B0]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A687A] mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/80 border border-[#BEE8D2] rounded-xl px-4 py-2.5 text-[#2B1D25] text-sm focus:outline-none focus:border-[#98D4B0] focus:ring-2 focus:ring-[#98D4B0]/20 transition placeholder:text-[#A8C4B0]"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A687A] mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-white/80 border border-[#BEE8D2] rounded-xl px-4 py-2.5 text-[#2B1D25] text-sm focus:outline-none focus:border-[#98D4B0] focus:ring-2 focus:ring-[#98D4B0]/20 transition placeholder:text-[#A8C4B0]"
                placeholder="Re-enter your password"
              />
            </div>

            {error && (
              <p className="text-[#B8446A] text-sm bg-[#FFF0F4] border border-[#F5CFDC] rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#98D4B0] text-[#2E7A50] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#82C89E] hover:-translate-y-px transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7A687A] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B8446A] font-medium hover:underline no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
