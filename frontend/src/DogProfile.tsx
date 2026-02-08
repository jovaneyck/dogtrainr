import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TrainingPlanSchedule from './TrainingPlanSchedule'

interface Dog {
  id: string
  name: string
  picture: string
  planId?: string
}

interface Plan {
  id: string
  name: string
  schedule: Record<string, string[]>
}

interface Training {
  id: string
  name: string
}

function DogProfile() {
  const { id } = useParams<{ id: string }>()
  const [dog, setDog] = useState<Dog | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [assignedPlan, setAssignedPlan] = useState<Plan | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/dogs/${id}`),
      fetch('/api/plans'),
      fetch('/api/trainings')
    ])
      .then(async ([dogRes, plansRes, trainingsRes]) => {
        if (!dogRes.ok) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const dogData = await dogRes.json()
        const plansData = await plansRes.json()
        const trainingsData = await trainingsRes.json()
        setDog(dogData)
        setPlans(plansData)
        setTrainings(trainingsData)

        if (dogData.planId) {
          const planRes = await fetch(`/api/plans/${dogData.planId}`)
          if (planRes.ok) {
            setAssignedPlan(await planRes.json())
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  const handleAssign = async () => {
    if (!selectedPlanId) return
    const res = await fetch(`/api/dogs/${id}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: selectedPlanId })
    })
    if (res.ok) {
      const updatedDog = await res.json()
      setDog(updatedDog)
      const planRes = await fetch(`/api/plans/${selectedPlanId}`)
      if (planRes.ok) {
        setAssignedPlan(await planRes.json())
      }
      setSelectedPlanId('')
    }
  }

  const handleUnassign = async () => {
    const res = await fetch(`/api/dogs/${id}/plan`, { method: 'DELETE' })
    if (res.ok) {
      const updatedDog = await res.json()
      setDog(updatedDog)
      setAssignedPlan(null)
    }
  }

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
          <span>←</span> <span>Back</span>
        </Link>
        <p className="text-slate-600">Dog not found</p>
      </div>
    )
  }

  if (!dog) return null

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
        <span>←</span> <span>Back</span>
      </Link>

      <h2 className="text-2xl font-bold text-slate-800">{dog.name}</h2>

      <img
        src={`/uploads/dogs/${dog.picture}`}
        alt={dog.name}
        className="rounded-2xl max-h-80 w-full object-cover"
      />

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">Training Plan</h3>
        {assignedPlan ? (
          <div className="space-y-4">
            <p className="text-base text-slate-800 font-medium">{assignedPlan.name}</p>
            <TrainingPlanSchedule schedule={assignedPlan.schedule} trainings={trainings} />
            <button
              onClick={handleUnassign}
              className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              Unassign
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a plan</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedPlanId}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DogProfile
