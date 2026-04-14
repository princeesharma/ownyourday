import React, { useState, useEffect } from 'react'
import './App.css'

const words = ['Day', 'Month', 'Year', 'Life']

const features = [
  { icon: '🌸', title: 'Track what matters', desc: 'Set goals across your day, month, year — or life. No rigid templates, just your priorities.' },
  { icon: '🌱', title: 'Understand the why', desc: 'When a goal slips, we gently ask why. Over time, patterns emerge — and so does clarity.' },
  { icon: '✨', title: 'Grow with compassion', desc: "No streaks to break. No shame. Just honest reflection and a path forward that's yours." },
]

const steps = [
  { num: '01', title: 'Set your goals', desc: 'Add what you want to work towards — big or small, long or short.' },
  { num: '02', title: 'Check in daily', desc: "A gentle nudge at your own pace. Mark what you did, note what you didn't." },
  { num: '03', title: 'Reflect and grow', desc: 'See your patterns, understand your blocks, and keep moving — kindly.' },
]

const Divider = () => (
  <div
    className="w-full h-px"
    style={{ background: 'linear-gradient(to right, transparent 0%, #F5CFDC 30%, #BEE8D2 70%, transparent 100%)' }}
  />
)

function App() {
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase]         = useState('in')

  // Scroll fade-in
  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')),
      { threshold: 0.15 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const scrolled   = window.scrollY
      const maxScroll  = document.body.scrollHeight - window.innerHeight
      const ratio      = maxScroll > 0 ? scrolled / maxScroll : 0
      const stop       = 50 + ratio * 35
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
    <div className="min-h-screen flex flex-col items-center bg-transparent">

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-[18px] px-[60px] sticky top-0 z-[100] bg-transparent max-md:py-[14px] max-md:px-5">
        <div className="[font-family:'Lora',serif] text-xl font-semibold text-[#2B1D25] max-md:text-[17px]">
          OwnYourDay
        </div>
        <div className="flex gap-[10px] items-center">
          <a href="#login" className="text-[#7A687A] py-2 px-5 rounded-full text-sm font-medium no-underline bg-white/60 backdrop-blur-[16px] border-[1.5px] border-[#F5CFDC] transition-colors hover:border-[#F9A8C0] hover:text-[#B8446A] max-md:py-[7px] max-md:px-[14px] max-md:text-[13px]">
            Log in
          </a>
          <a href="#signup" className="bg-[#98D4B0] text-[#2E7A50] py-2 px-[22px] rounded-full text-sm font-semibold no-underline transition-all hover:bg-[#82C89E] hover:-translate-y-px max-md:py-[7px] max-md:px-4 max-md:text-[13px]">
            Sign up
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="w-full max-w-[800px] px-6 pt-[110px] pb-[100px] text-center flex flex-col items-center max-md:px-5 max-md:pt-[88px] max-md:pb-16">
        <h1 className="hero-heading [font-family:'Lora',serif] text-[84px] font-semibold leading-[1.08] tracking-[-2.5px] text-[#2B1D25] mb-7 whitespace-nowrap">
          Own{' '}
          <span className="your-wrap">
            <span className="hero-badge">Your goals. Your pace.</span>
            Your
          </span>
          {' '}
          <span className="word-slot">
            <span className={`word-anim ${phase}`}>{words[wordIndex]}</span>
          </span>
        </h1>

        <p className="text-lg text-[#7A687A] leading-[1.8] mb-11 font-light max-w-[460px] max-md:text-[15px]">
          Track your goals. Understand why you drift.<br />
          Build the life you actually mean to live.
        </p>

        <div className="flex gap-3 flex-wrap justify-center max-md:flex-col max-md:items-center max-md:w-full">
          <a href="#signup" className="bg-[#F9A8C0] text-[#B8446A] py-[13px] px-8 rounded-full text-[15px] font-semibold no-underline cursor-pointer transition-all hover:bg-[#F094AE] hover:-translate-y-px max-md:w-full max-md:max-w-[300px] max-md:text-center">
            Start your trial
          </a>
          <a href="#how" className="bg-white/60 backdrop-blur-[16px] text-[#7A687A] py-[13px] px-8 rounded-full text-[15px] font-medium no-underline border-[1.5px] border-[#F5CFDC] transition-colors hover:border-[#F9A8C0] hover:text-[#B8446A] max-md:w-full max-md:max-w-[300px] max-md:text-center">
            See how it works
          </a>
        </div>
      </section>

      <Divider />

      {/* Features */}
      <section className="w-full px-[60px] py-[88px] text-center max-md:px-5 max-md:py-14" id="features">
        <p data-animate className="text-[11px] font-semibold tracking-[1.4px] uppercase mb-3 text-[#2E7A50]">
          What OwnYourDay does
        </p>
        <h2 data-animate className="[font-family:'Lora',serif] text-[40px] font-semibold tracking-[-1px] text-[#2B1D25] mb-14 max-md:text-[30px]">
          Built around you, not a system
        </h2>
        <div className="grid grid-cols-3 gap-5 max-w-[1060px] mx-auto max-md:grid-cols-1 max-md:gap-[14px]">
          {features.map(({ icon, title, desc }, i) => (
            <div key={title} data-animate style={{ transitionDelay: `${i * 100}ms` }} className="bg-white/60 backdrop-blur-[16px] border border-white/75 rounded-[20px] p-9 text-left shadow-[0_2px_20px_rgba(43,29,37,0.06)]">
              <div className="text-[28px] mb-4">{icon}</div>
              <h3 className="[font-family:'Lora',serif] text-[19px] font-semibold text-[#2B1D25] mb-[10px]">{title}</h3>
              <p className="text-[15px] text-[#7A687A] leading-[1.7] font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* How it works */}
      <section className="w-full px-[60px] py-[88px] text-center max-md:px-5 max-md:py-14" id="how">
        <p data-animate className="text-[11px] font-semibold tracking-[1.4px] uppercase mb-3 text-[#B8446A]">
          Simple by design
        </p>
        <h2 data-animate className="[font-family:'Lora',serif] text-[40px] font-semibold tracking-[-1px] text-[#2B1D25] mb-14 max-md:text-[30px]">
          How it works
        </h2>
        <div className="flex items-start justify-center max-w-[900px] mx-auto max-md:flex-col max-md:items-center max-md:gap-6">
          {steps.map(({ num, title, desc }, i) => (
            <React.Fragment key={num}>
              <div data-animate style={{ transitionDelay: `${i * 120}ms` }} className="flex-1 px-8 text-center max-md:px-2">
                <div className="[font-family:'Lora',serif] text-[48px] font-semibold text-[#F9A8C0] mb-[14px] leading-none">{num}</div>
                <h3 className="[font-family:'Lora',serif] text-[19px] font-semibold text-[#2B1D25] mb-[10px]">{title}</h3>
                <p className="text-[15px] text-[#7A687A] leading-[1.7] font-light">{desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-px h-16 shrink-0 mt-6 max-md:w-10 max-md:h-px max-md:m-0"
                  style={{ background: 'linear-gradient(to bottom, #F5CFDC, #BEE8D2)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      <Divider />

      {/* CTA */}
      <section className="w-full px-6 py-[100px] text-center flex flex-col items-center max-md:py-16 max-md:px-5" id="cta">
        <h2 data-animate className="[font-family:'Lora',serif] text-[42px] font-semibold tracking-[-1px] text-[#2B1D25] mb-[14px] max-md:text-[30px]">
          Ready to own your life?
        </h2>
        <a data-animate style={{ transitionDelay: '100ms' }} href="#signup" className="bg-[#F9A8C0] text-[#B8446A] py-4 px-12 rounded-full text-base font-semibold no-underline cursor-pointer transition-all hover:bg-[#F094AE] hover:-translate-y-px max-md:py-[14px] max-md:px-9 max-md:text-[15px]">
          Create free account
        </a>
      </section>

      {/* Footer */}
      <footer className="w-full py-[26px] px-[60px] flex justify-between items-center bg-white/60 backdrop-blur-[16px] border-t border-white/75 max-md:flex-col max-md:gap-[6px] max-md:p-5 max-md:text-center">
        <span className="[font-family:'Lora',serif] text-[15px] font-semibold text-[#2B1D25]">OwnYourDay</span>
        <span className="text-[13px] text-[#C0AABA]">Made with care © 2025</span>
      </footer>

    </div>
  )
}

export default App
