import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

interface Session {
  id?: string
  dogId: string
  trainingId: string
  planId?: string
  date: string
  status: 'planned' | 'completed' | 'skipped'
  score?: number
  notes?: string
}

interface Training {
  id: string
  name: string
}

interface Dog {
  id: string
  name: string
  picture: string
  planId?: string
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatAgendaHeader(date: Date): string {
  const dayName = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]
  const dayNum = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  const year = date.getFullYear()
  return `${dayName} ${dayNum} ${month} ${year}`
}

function Progress() {
  const { id: dogId } = useParams<{ id: string }>()
  const [dog, setDog] = useState<Dog | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  const weekDays = getWeekDays(weekStart)

  const fetchSessions = useCallback(async (monday: Date) => {
    const from = formatDate(monday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const to = formatDate(sunday)
    const res = await fetch(`/api/dogs/${dogId}/sessions?from=${from}&to=${to}`)
    if (res.ok) {
      setSessions(await res.json())
    }
  }, [dogId])

  useEffect(() => {
    Promise.all([
      fetch(`/api/dogs/${dogId}`),
      fetch('/api/trainings'),
    ]).then(async ([dogRes, trainingsRes]) => {
      if (dogRes.ok) setDog(await dogRes.json())
      if (trainingsRes.ok) setTrainings(await trainingsRes.json())
      setLoading(false)
    })
  }, [dogId])

  useEffect(() => {
    fetchSessions(weekStart)
  }, [weekStart, fetchSessions])

  const handleRemove = async (sessionId: string) => {
    const res = await fetch(`/api/dogs/${dogId}/sessions/${sessionId}`, { method: 'DELETE' })
    if (res.ok) {
      setExpandedSessionId(null)
      await fetchSessions(weekStart)
    }
  }

  const navigateWeek = (direction: number) => {
    setWeekStart(prev => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + direction * 7)
      return next
    })
  }

  const selectedDateStr = formatDate(selectedDate)
  const daySessions = sessions.filter(s => s.date === selectedDateStr)

  const trainingMap = new Map(trainings.map(t => [t.id, t.name]))

  const headerMonth = MONTH_NAMES[weekStart.getMonth()]
  const headerYear = weekStart.getFullYear()

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {dog && <h2 className="text-2xl font-bold text-slate-800">{dog.name}</h2>}

      {/* Week strip */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        {/* Month header with nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            aria-label="previous week"
            className="p-2 text-slate-600 hover:text-slate-800"
          >
            &lt;
          </button>
          <span className="font-semibold text-slate-800">{headerMonth} {headerYear}</span>
          <button
            onClick={() => navigateWeek(1)}
            aria-label="next week"
            className="p-2 text-slate-600 hover:text-slate-800"
          >
            &gt;
          </button>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day, i) => {
            const dateStr = formatDate(day)
            const isSelected = dateStr === selectedDateStr
            const hasCompletedOrSkipped = sessions.some(
              s => s.date === dateStr && (s.status === 'completed' || s.status === 'skipped')
            )

            return (
              <button
                key={i}
                aria-label={`${DAY_LABELS[i]} ${day.getDate()}`}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs">{DAY_LABELS[i]}</span>
                <span className="text-lg font-semibold">{day.getDate()}</span>
                {hasCompletedOrSkipped && (
                  <span className="session-dot w-1.5 h-1.5 rounded-full bg-current mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Agenda */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700">
          {formatAgendaHeader(selectedDate)}
        </h3>

        {daySessions.length === 0 ? (
          <p className="text-slate-500">No sessions scheduled</p>
        ) : (
          <div className="space-y-2">
            {daySessions.map((session, i) => {
              const isExpandable = session.status === 'completed' || session.status === 'skipped'
              const isExpanded = isExpandable && expandedSessionId === session.id
              const trainingName = trainingMap.get(session.trainingId) ?? session.trainingId

              return (
                <div
                  key={session.id ?? `planned-${i}`}
                  className="bg-white rounded-xl shadow-sm p-4"
                  onClick={isExpandable ? () => setExpandedSessionId(isExpanded ? null : session.id!) : undefined}
                  style={isExpandable ? { cursor: 'pointer' } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{trainingName}</span>
                    <div className="flex items-center gap-2">
                      {session.status === 'completed' && !isExpanded && (
                        <>
                          {session.score != null && (
                            <span className="text-slate-600">{session.score}/10</span>
                          )}
                          <span className="text-green-600 font-bold">{'\u2713'}</span>
                        </>
                      )}
                      {session.status === 'skipped' && !isExpanded && (
                        <span className="text-slate-400 text-sm">Skipped</span>
                      )}
                      {session.status === 'planned' && (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          Check off
                        </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <p className="text-sm text-slate-600">
                        {session.status === 'completed' ? 'Completed' : 'Skipped'}
                      </p>
                      {session.status === 'completed' && session.score != null && (
                        <p className="text-sm text-slate-600">Score: {session.score}/10</p>
                      )}
                      {session.notes && (
                        <p className="text-sm text-slate-600">{session.notes}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          className="text-sm text-blue-600 font-medium"
                          onClick={(e) => { e.stopPropagation() }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm text-red-600 font-medium"
                          onClick={(e) => { e.stopPropagation(); handleRemove(session.id!) }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress
