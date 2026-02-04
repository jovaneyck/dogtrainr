import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Plan {
  id: string
  name: string
  schedule: Record<string, string[]>
}

function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (plans.length === 0) {
    return (
      <div>
        <p>No plans yet.</p>
        <Link to="/plans/new">Create a plan</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Training Plans</h2>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>
            <Link to={`/plans/${plan.id}`}>{plan.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/plans/new">Create a plan</Link>
    </div>
  )
}

export default PlanList
