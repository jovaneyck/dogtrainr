import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

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
        <p>Dog not found</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  if (!dog) return null

  return (
    <div>
      <h2>{dog.name}</h2>
      <img src={`/uploads/dogs/${dog.picture}`} alt={dog.name} />

      <div>
        <h3>Training Plan</h3>
        {assignedPlan ? (
          <div>
            <p>{assignedPlan.name}</p>
            <ul>
              {Object.entries(assignedPlan.schedule).map(([day, trainings]) => (
                trainings.length > 0 && <li key={day}>{day}: {trainings.map(id => getTrainingName(id)).join(', ')}</li>
              ))}
            </ul>
            <button onClick={handleUnassign}>Unassign</button>
          </div>
        ) : (
          <div>
            <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
              <option value="">Select a plan</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
            <button onClick={handleAssign} disabled={!selectedPlanId}>Assign</button>
          </div>
        )}
      </div>

      <Link to="/">Back to home</Link>
    </div>
  )
}

export default DogProfile
