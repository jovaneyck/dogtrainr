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

  useEffect(() => {
    fetch('/api/trainings')
      .then(res => res.json())
      .then(data => {
        setTrainings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (trainings.length === 0) {
    return (
      <div>
        <p>No trainings yet.</p>
        <Link to="/trainings/new">Create a training</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Trainings</h2>
      <ul>
        {trainings.map(training => (
          <li key={training.id}>
            <Link to={`/trainings/${training.id}`}>{training.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/trainings/new">Create a training</Link>
    </div>
  )
}

export default TrainingList
