import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface Training {
  id: string
  name: string
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function PlanForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState<Record<DayOfWeek, string[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  })
  const [trainings, setTrainings] = useState<Training[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/trainings')
      .then(res => res.json())
      .then(data => setTrainings(data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schedule })
      })
      if (response.ok) {
        navigate('/plans')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTraining = (day: DayOfWeek, trainingId: string) => {
    setSchedule(prev => {
      const dayTrainings = prev[day]
      if (dayTrainings.includes(trainingId)) {
        return { ...prev, [day]: dayTrainings.filter(id => id !== trainingId) }
      } else {
        return { ...prev, [day]: [...dayTrainings, trainingId] }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Link to="/plans" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
        <span>&larr;</span> Back to plans
      </Link>

      <h2 className="text-2xl font-bold text-slate-800">Create Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map(day => (
              <div key={day} className="flex flex-col gap-2">
                <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium text-center">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </div>
                <div className="space-y-2">
                  {trainings.map(training => (
                    <label key={training.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule[day].includes(training.id)}
                        onChange={() => toggleTraining(day, training.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {training.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Plan'}
        </button>
      </form>
    </div>
  )
}

export default PlanForm
