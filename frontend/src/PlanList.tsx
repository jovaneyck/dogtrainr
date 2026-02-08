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
    return <p className="text-slate-500">Loading...</p>
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-slate-500 text-lg">No plans yet.</p>
        <Link
          to="/plans/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Create a plan
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Training Plans</h2>
        <Link
          to="/plans/new"
          className="bg-blue-600 text-white w-10 h-10 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center text-xl"
        >
          +
        </Link>
      </div>
      <div className="space-y-3">
        {plans.map(plan => (
          <Link
            key={plan.id}
            to={`/plans/${plan.id}`}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <span className="text-slate-800 font-medium">{plan.name}</span>
            <span className="text-slate-400">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PlanList
