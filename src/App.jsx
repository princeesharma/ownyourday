import { useState, useEffect } from 'react'
import './App.css'

const words = ['Day', 'Month', 'Year', 'Life']

function App() {
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase]         = useState('in')

  // Shift the diagonal as user scrolls
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const ratio = maxScroll > 0 ? scrolled / maxScroll : 0
      const stop = 50 + ratio * 35  // 50% at top → 85% at bottom
      document.documentElement.style.setProperty('--diag-stop', `${stop}%`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const tick = () => {
      setPhase('out')
      setTimeout(() => {
        setWordIndex(prev => (prev + 1) % words.length)
        setPhase('in')
      }, 350)
    }
    const id = setInterval(tick, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">OwnYourDay</div>
        <div className="nav-actions">
          <a href="#login"  className="btn-login">Log in</a>
          <a href="#signup" className="btn-signup">Sign up</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <h1 className="hero-heading">
          Own{' '}
          <span className="your-wrap">
            <span className="hero-badge">Your goals. Your pace.</span>
            Your
          </span>
          {' '}<span className="word-slot">
            <span className={`word-anim ${phase}`}>{words[wordIndex]}</span>
          </span>
        </h1>

        <p className="hero-sub">
          Track your goals. Understand why you drift.<br />
          Build the life you actually mean to live.
        </p>
        <div className="hero-actions">
          <a href="#signup" className="btn-primary">Start your trial</a>
          <a href="#how"    className="btn-ghost">See how it works</a>
        </div>
      </section>

      <div className="section-divider" />

      {/* Features */}
      <section className="features-section" id="features">
        <p className="section-label">What OwnYourDay does</p>
        <h2 className="section-title">Built around you, not a system</h2>
        <div className="cards">
          <div className="card">
            <div className="card-icon">🌸</div>
            <h3>Track what matters</h3>
            <p>Set goals across your day, month, year — or life. No rigid templates, just your priorities.</p>
          </div>
          <div className="card">
            <div className="card-icon">🌱</div>
            <h3>Understand the why</h3>
            <p>When a goal slips, we gently ask why. Over time, patterns emerge — and so does clarity.</p>
          </div>
          <div className="card">
            <div className="card-icon">✨</div>
            <h3>Grow with compassion</h3>
            <p>No streaks to break. No shame. Just honest reflection and a path forward that's yours.</p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* How it works */}
      <section className="how-section" id="how">
        <p className="section-label">Simple by design</p>
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Set your goals</h3>
            <p>Add what you want to work towards — big or small, long or short.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <div className="step-num">02</div>
            <h3>Check in daily</h3>
            <p>A gentle nudge at your own pace. Mark what you did, note what you didn't.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <div className="step-num">03</div>
            <h3>Reflect and grow</h3>
            <p>See your patterns, understand your blocks, and keep moving — kindly.</p>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* CTA */}
      <section className="cta-section" id="cta">
        <h2>Ready to own your life?</h2>
<a href="#signup" className="btn-primary btn-large">Create free account</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-logo">OwnYourDay</span>
        <span className="footer-copy">Made with care © 2025</span>
      </footer>

    </div>
  )
}

export default App
