import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

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
    <form onSubmit={handleSubmit}>
      <h2>Create Plan</h2>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <table>
        <thead>
          <tr>
            {DAYS.map(day => (
              <th key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {DAYS.map(day => (
              <td key={day}>
                {trainings.map(training => (
                  <div key={training.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={schedule[day].includes(training.id)}
                        onChange={() => toggleTraining(day, training.id)}
                      />
                      {training.name}
                    </label>
                  </div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Plan'}
      </button>
    </form>
  )
}

export default PlanForm
