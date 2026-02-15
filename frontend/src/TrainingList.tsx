import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Training {
  id: string
  name: string
  procedure: string
  tips: string
}

function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/trainings')
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then(data => {
        setTrainings(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-red-500 text-lg">Something went wrong. Please try again later.</p>
      </div>
    )
  }

  if (trainings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-slate-500 text-lg">No trainings yet.</p>
        <Link
          to="/trainings/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Create a training
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Trainings</h2>
        <Link
          to="/trainings/new"
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-700 transition-colors"
          aria-label="Add training"
        >
          +
        </Link>
      </div>
      <div className="space-y-3">
        {trainings.map(training => (
          <Link
            key={training.id}
            to={`/trainings/${training.id}`}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <span className="text-base text-slate-800 font-medium">{training.name}</span>
            <span className="text-slate-400">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TrainingList
