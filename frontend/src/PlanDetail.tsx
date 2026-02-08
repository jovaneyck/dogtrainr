import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TrainingPlanSchedule from './TrainingPlanSchedule'

interface Training {
  id: string
  name: string
}

interface Plan {
  id: string
  name: string
  schedule: Record<string, string[]>
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
      <TrainingPlanSchedule schedule={plan.schedule} trainings={trainings} />
      <Link to="/plans">Back to plans</Link>
      <Link to={`/plans/${plan.id}/edit`}>Edit</Link>
    </div>
  )
}

export default PlanDetail
