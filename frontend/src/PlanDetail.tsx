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
    return <p className="text-slate-500">Loading...</p>
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-lg text-slate-500">Plan not found.</p>
        <Link to="/plans" className="text-blue-600 hover:text-blue-700 transition-colors">Back to plans</Link>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="space-y-6">
      <Link to="/plans" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
        <span>&larr;</span> Back to plans
      </Link>

      <h2 className="text-2xl font-bold text-slate-800">{plan.name}</h2>

      <TrainingPlanSchedule schedule={plan.schedule} trainings={trainings} />

      <div className="flex items-center gap-4">
        <Link
          to={`/plans/${plan.id}/edit`}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}

export default PlanDetail
