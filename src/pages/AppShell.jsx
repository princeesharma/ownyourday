okimport { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/api'
import '../App.css'

const todayStr = () => new Date().toISOString().split('T')[0]

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
}

function dateStr(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getDaysInMonth(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const startPad = (firstDay + 6) % 7
  const days = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return days
}

function getDotType(dot) {
  return dot || null
}

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

export default function AppShell() {
  const navigate = useNavigate()
  const [user, setUser]                 = useState(null)
  const [targetDate, setTargetDate]     = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [goals, setGoals]               = useState([])
  const [logs, setLogs]                 = useState({})
  const [monthLogs, setMonthLogs]       = useState({})
  const [viewYear, setViewYear]         = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth]       = useState(new Date().getMonth() + 1)
  const [loading, setLoading]           = useState(true)
  const [isDaySkipped, setIsDaySkipped] = useState(false)
  const [modal, setModal]               = useState(null)
  const [pendingGoal, setPendingGoal]   = useState(null)
  const [reason, setReason]             = useState('')
  const [newTitle, setNewTitle]         = useState('')
  const [newType, setNewType]           = useState('goal')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return navigate('/login')
      setUser(data.session.user)
      init()
    })
  }, [navigate])

  async function init() {
    setLoading(true)
    const now = new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth() + 1)
    const { date } = await apiFetch('/days/target')
    setTargetDate(date)
    setSelectedDate(date)
    await Promise.all([
      loadGoalsAndLogs(date),
      fetchMonthLogs(now.getFullYear(), now.getMonth() + 1)
    ])
    setLoading(false)
  }

  async function loadGoalsAndLogs(date) {
    const data = await apiFetch(`/days/${date}`)
    setGoals(data.goals)
    setIsDaySkipped(data.is_day_skipped)
    const map = {}
    ;(data.logs || []).forEach(l => { map[l.goal_id] = l })
    setLogs(map)
  }

  async function fetchMonthLogs(year, month) {
    const data = await apiFetch(`/calendar/${year}/${month}`)
    setMonthLogs(data)
  }

  async function changeMonth(dir) {
    let m = viewMonth + dir, y = viewYear
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setViewMonth(m); setViewYear(y)
    fetchMonthLogs(y, m)
  }

  async function selectDate(date) {
    setSelectedDate(date)
    await loadGoalsAndLogs(date)
  }

  async function upsertLog(goalId, status, reasonText = null) {
    await apiFetch('/logs', {
      method: 'POST',
      body: JSON.stringify({ goal_id: goalId, date: selectedDate, status, reason: reasonText }),
    })
    await Promise.all([
      loadGoalsAndLogs(selectedDate),
      fetchMonthLogs(viewYear, viewMonth)
    ])
  }

  async function undoLog(goalId) {
    await apiFetch(`/logs/${goalId}/${selectedDate}`, { method: 'DELETE' })
    await Promise.all([
      loadGoalsAndLogs(selectedDate),
      fetchMonthLogs(viewYear, viewMonth)
    ])
  }

  async function submitReason() {
    if (!reason.trim() || !pendingGoal) return
    await upsertLog(pendingGoal.id, 'not_completed', reason.trim())
    closeModal()
  }

  async function skipDay() {
    await apiFetch(`/days/${selectedDate}/skip`, { method: 'POST', body: JSON.stringify({}) })
    const { date: newTarget } = await apiFetch('/days/target')
    setTargetDate(newTarget)
    setSelectedDate(newTarget)
    await Promise.all([
      loadGoalsAndLogs(newTarget),
      fetchMonthLogs(viewYear, viewMonth)
    ])
  }

  async function addGoal() {
    if (!newTitle.trim()) return
    await apiFetch('/goals', {
      method: 'POST',
      body: JSON.stringify({ title: newTitle.trim(), type: newType, date: newType === 'goal' ? selectedDate : null }),
    })
    closeModal()
    await loadGoalsAndLogs(selectedDate)
  }

  function openReasonModal(goal) {
    setPendingGoal(goal); setReason(''); setModal('reason')
  }

  function closeModal() {
    setModal(null); setPendingGoal(null)
    setReason(''); setNewTitle(''); setNewType('goal')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#7A687A] text-sm">Loading...</p>
    </div>
  )

  const today = todayStr()
  const isSelectedToday  = selectedDate === today
  const isFuture         = selectedDate > today
  const isUnresolved     = selectedDate === targetDate && !isSelectedToday
  const completedCount   = goals.filter(g => logs[g.id]?.status === 'completed').length
  const missedCount      = goals.filter(g => logs[g.id]?.status === 'not_completed').length
  const totalCount       = goals.length
  const progressPct      = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const calDays          = getDaysInMonth(viewYear, viewMonth)

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="w-full flex justify-between items-center py-4 px-8 sticky top-0 z-[100] bg-white/70 backdrop-blur-[16px] border-b border-[#F5CFDC] max-md:px-5">
        <span className="[font-family:'Lora',serif] text-xl font-semibold text-[#2B1D25]">OwnYourDay</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#7A687A] max-sm:hidden">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#7A687A] py-1.5 px-4 rounded-full bg-white/60 border-[1.5px] border-[#F5CFDC] hover:border-[#F9A8C0] hover:text-[#B8446A] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex gap-6 items-start max-md:flex-col max-md:px-4 max-md:py-5">

        {/* ── LEFT: Calendar ── */}
        <div className="w-[268px] shrink-0 max-md:w-full">
          <div className="bg-white/70 backdrop-blur-[20px] border border-white/75 rounded-3xl p-5 shadow-[0_2px_20px_rgba(43,29,37,0.06)]">

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-lg text-[#7A687A] hover:bg-[#FFF0F4] hover:text-[#B8446A] transition"
              >
                ‹
              </button>
              <span className="[font-family:'Lora',serif] text-sm font-semibold text-[#2B1D25]">
                {MONTHS[viewMonth - 1]} {viewYear}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-lg text-[#7A687A] hover:bg-[#FFF0F4] hover:text-[#B8446A] transition"
              >
                ›
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-[#C4A8B4] py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />
                const ds       = dateStr(viewYear, viewMonth, day)
                const isToday  = ds === today
                const isSelec  = ds === selectedDate
                const isTarg   = ds === targetDate && ds !== today
                const isFut    = ds > today
                const dotType  = getDotType(monthLogs[ds])

                return (
                  <button
                    key={i}
                    onClick={() => !isFut && selectDate(ds)}
                    disabled={isFut}
                    className={`
                      relative flex flex-col items-center justify-center w-9 h-9 mx-auto rounded-xl text-xs font-medium transition-all
                      ${isFut    ? 'text-[#DDD] cursor-default' : 'cursor-pointer'}
                      ${isSelec  ? 'bg-[#F9A8C0] text-[#B8446A] shadow-sm' : ''}
                      ${isToday  && !isSelec ? 'ring-2 ring-[#F9A8C0] text-[#2B1D25]' : ''}
                      ${isTarg   && !isSelec ? 'bg-[#FFF0F4] text-[#B8446A]' : ''}
                      ${!isSelec && !isToday && !isTarg && !isFut ? 'text-[#2B1D25] hover:bg-[#FFF5F8]' : ''}
                    `}
                  >
                    <span className="leading-none">{day}</span>
                    {dotType && (
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${
                        dotType === 'completed' ? 'bg-[#2E7A50]' :
                        dotType === 'missed'    ? 'bg-[#B8446A]' :
                        dotType === 'mixed'     ? 'bg-[#F59E0B]' :
                                                  'bg-[#C4A8B4]'
                      }`} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-[#F5CFDC]/60 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {[
                { color: 'bg-[#2E7A50]', label: 'All done' },
                { color: 'bg-[#B8446A]', label: 'Missed' },
                { color: 'bg-[#F59E0B]', label: 'Mixed' },
                { color: 'bg-[#C4A8B4]', label: 'Skipped' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                  <span className="text-[10px] text-[#7A687A]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Goals panel ── */}
        <div className="flex-1 min-w-0">

          {/* Date heading */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-[11px] font-semibold tracking-[1.4px] uppercase text-[#B8446A]">
                {isSelectedToday ? 'Today' : isFuture ? 'Future' : isUnresolved ? 'Needs attention' : 'Past day'}
              </p>
              {isUnresolved && (
                <span className="text-[10px] bg-[#FFF0F4] border border-[#F5CFDC] text-[#B8446A] px-2 py-0.5 rounded-full font-medium">
                  Resolve to continue →
                </span>
              )}
            </div>
            <h1 className="[font-family:'Lora',serif] text-[28px] font-semibold tracking-[-0.5px] text-[#2B1D25] leading-tight">
              {formatDate(selectedDate)}
            </h1>

            {/* Progress bar */}
            {totalCount > 0 && !isFuture && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#7A687A]">
                    {completedCount} of {totalCount} completed
                    {missedCount > 0 && <span className="text-[#B8446A]"> · {missedCount} missed</span>}
                  </span>
                  <span className={`text-xs font-semibold ${progressPct === 100 ? 'text-[#2E7A50]' : 'text-[#7A687A]'}`}>
                    {progressPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#F5CFDC] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background: progressPct === 100 ? '#98D4B0' : '#F9A8C0'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Goals list */}
          <div className="flex flex-col gap-2.5 mb-5">
            {isFuture ? (
              <div className="bg-white/60 border border-white/75 rounded-2xl p-8 text-center">
                <p className="text-[#7A687A] text-sm">This day hasn't arrived yet.</p>
              </div>
            ) : isDaySkipped ? (
              <div className="bg-[#FFF5F8] border border-[#F5CFDC] rounded-2xl p-6 text-center">
                <p className="text-sm text-[#B8446A] font-medium">This day was skipped</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="bg-white/60 border border-white/75 rounded-2xl p-8 text-center">
                <p className="text-[#7A687A] text-sm">No goals for this day.</p>
                {isSelectedToday && <p className="text-xs text-[#C4A8B4] mt-1">Add one below to get started.</p>}
              </div>
            ) : (
              goals.map(goal => {
                const log    = logs[goal.id]
                const done   = log?.status === 'completed'
                const missed = log?.status === 'not_completed'
                const canAct = isSelectedToday || isUnresolved

                return (
                  <div
                    key={goal.id}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                      done   ? 'border-[#BEE8D2] bg-[#F0FAF5]' :
                      missed ? 'border-[#F5CFDC] bg-[#FFF0F4]' :
                               'bg-white/70 backdrop-blur-[16px] border-white/75 shadow-[0_2px_12px_rgba(43,29,37,0.06)]'
                    }`}
                  >
                    {/* Circle indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[1.5px] transition-all ${
                      done   ? 'bg-[#98D4B0] border-[#98D4B0]' :
                      missed ? 'bg-[#F5CFDC] border-[#F5CFDC]' :
                               'border-[#F5CFDC] bg-transparent'
                    }`}>
                      {done   && <span className="text-[11px] text-[#2E7A50] font-bold">✓</span>}
                      {missed && <span className="text-[11px] text-[#B8446A] font-bold">✕</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium leading-snug ${
                          done   ? 'line-through text-[#9ABFAE]' :
                          missed ? 'text-[#C4A8B4]' :
                                   'text-[#2B1D25]'
                        }`}>
                          {goal.title}
                        </p>
                        {goal.type === 'habit' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#BEE8D2] text-[#2E7A50] uppercase tracking-wider font-semibold shrink-0">
                            habit
                          </span>
                        )}
                      </div>
                      {missed && log.reason && (
                        <p className="text-xs text-[#B8446A] mt-0.5 italic">"{log.reason}"</p>
                      )}
                    </div>

                    {/* Actions — only on today or unresolved gate date */}
                    {canAct && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!done && !missed && (
                          <>
                            <button
                              onClick={() => upsertLog(goal.id, 'completed')}
                              className="text-xs px-3 py-1 rounded-full bg-[#98D4B0] text-[#2E7A50] font-medium hover:bg-[#82C89E] transition"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => openReasonModal(goal)}
                              className="text-xs px-3 py-1 rounded-full bg-[#F5CFDC] text-[#B8446A] font-medium hover:bg-[#F9A8C0] transition"
                            >
                              Missed
                            </button>
                          </>
                        )}
                        {done && (
                          <button onClick={() => undoLog(goal.id)} className="text-xs text-[#9ABFAE] hover:text-[#2E7A50] transition">
                            undo
                          </button>
                        )}
                        {missed && (
                          <>
                            <button
                              onClick={() => upsertLog(goal.id, 'completed')}
                              className="text-xs px-3 py-1 rounded-full bg-[#98D4B0] text-[#2E7A50] font-medium hover:bg-[#82C89E] transition"
                            >
                              Done
                            </button>
                            <button onClick={() => undoLog(goal.id)} className="text-xs text-[#C4A8B4] hover:text-[#B8446A] transition ml-1">
                              undo
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom actions */}
          {(isSelectedToday || isUnresolved) && !isDaySkipped && (
            <div className="flex gap-3">
              {isSelectedToday && (
                <button
                  onClick={() => setModal('addGoal')}
                  className="flex-1 py-2.5 rounded-full bg-[#F9A8C0] text-[#B8446A] text-sm font-semibold hover:bg-[#F094AE] hover:-translate-y-px transition-all shadow-sm"
                >
                  + Add goal
                </button>
              )}
              <button
                onClick={skipDay}
                className="flex-1 py-2.5 rounded-full bg-white/60 backdrop-blur-[16px] border-[1.5px] border-[#F5CFDC] text-sm text-[#7A687A] hover:border-[#F9A8C0] hover:text-[#B8446A] transition-colors"
              >
                Skip day
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Reason Modal ── */}
      {modal === 'reason' && pendingGoal && (
        <div className="fixed inset-0 bg-[#2B1D25]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-[20px] border border-[#F5CFDC] rounded-3xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="[font-family:'Lora',serif] text-lg font-semibold text-[#2B1D25] mb-1">
              Why did you miss it?
            </h3>
            <p className="text-sm text-[#B8446A] italic mb-4">"{pendingGoal.title}"</p>
            <textarea
              autoFocus
              value={reason}
              onChange={e => setReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitReason()}
              placeholder="What happened?"
              className="w-full bg-white/80 border border-[#F5CFDC] rounded-xl px-4 py-3 text-sm text-[#2B1D25] placeholder-[#C4A8B4] resize-none outline-none focus:border-[#F9A8C0] focus:ring-2 focus:ring-[#F9A8C0]/20 mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#F5CFDC] text-sm text-[#7A687A] hover:border-[#F9A8C0] hover:text-[#B8446A] transition-colors">
                Cancel
              </button>
              <button onClick={submitReason} disabled={!reason.trim()} className="flex-1 py-2.5 rounded-full bg-[#F9A8C0] text-[#B8446A] text-sm font-semibold hover:bg-[#F094AE] transition disabled:opacity-40">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Goal Modal ── */}
      {modal === 'addGoal' && (
        <div className="fixed inset-0 bg-[#2B1D25]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-[20px] border border-[#F5CFDC] rounded-3xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="[font-family:'Lora',serif] text-lg font-semibold text-[#2B1D25] mb-4">
              New goal
            </h3>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="What do you want to do?"
              className="w-full bg-white/80 border border-[#F5CFDC] rounded-xl px-4 py-2.5 text-sm text-[#2B1D25] placeholder-[#C4A8B4] outline-none focus:border-[#F9A8C0] focus:ring-2 focus:ring-[#F9A8C0]/20 mb-3"
            />
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setNewType('goal')}
                className={`flex-1 py-2 rounded-full text-xs font-medium border-[1.5px] transition ${
                  newType === 'goal'
                    ? 'border-[#F9A8C0] text-[#B8446A] bg-[#FFF0F4]'
                    : 'border-[#F5CFDC] text-[#7A687A]'
                }`}
              >
                One-time goal
              </button>
              <button
                onClick={() => setNewType('habit')}
                className={`flex-1 py-2 rounded-full text-xs font-medium border-[1.5px] transition ${
                  newType === 'habit'
                    ? 'border-[#98D4B0] text-[#2E7A50] bg-[#F0FAF5]'
                    : 'border-[#F5CFDC] text-[#7A687A]'
                }`}
              >
                Daily habit
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#F5CFDC] text-sm text-[#7A687A] hover:border-[#F9A8C0] hover:text-[#B8446A] transition-colors">
                Cancel
              </button>
              <button onClick={addGoal} disabled={!newTitle.trim()} className="flex-1 py-2.5 rounded-full bg-[#F9A8C0] text-[#B8446A] text-sm font-semibold hover:bg-[#F094AE] transition disabled:opacity-40">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
