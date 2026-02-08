import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface Training {
  id: string
  name: string
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface Plan {
  id: string
  name: string
  schedule: Record<DayOfWeek, string[]>
}

function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(res => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setPlan(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch('/api/trainings')
      .then(res => res.json())
      .then(data => setTrainings(data))
      .catch(() => {})
  }, [id])

  const getTrainingName = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    return training?.name || trainingId
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (notFound) {
    return (
      <div>
        <p>Plan not found.</p>
        <Link to="/plans">Back to plans</Link>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div>
      <h2>{plan.name}</h2>
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
                {plan.schedule[day]?.map(trainingId => (
                  <div key={trainingId}>
                    <Link to={`/trainings/${trainingId}`}>{getTrainingName(trainingId)}</Link>
                  </div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <Link to="/plans">Back to plans</Link>
      <Link to={`/plans/${plan.id}/edit`}>Edit</Link>
    </div>
  )
}

export default PlanDetail
