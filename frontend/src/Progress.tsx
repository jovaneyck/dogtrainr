import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProgressView from './ProgressView'

interface Training {
  id: string
  name: string
}

interface Dog {
  id: string
  name: string
  picture: string
  planId?: string
}

function Progress() {
  const { id: dogId } = useParams<{ id: string }>()
  const [dog, setDog] = useState<Dog | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/dogs/${dogId}`),
      fetch('/api/trainings'),
    ]).then(async ([dogRes, trainingsRes]) => {
      if (dogRes.ok) setDog(await dogRes.json())
      if (trainingsRes.ok) setTrainings(await trainingsRes.json())
      setLoading(false)
    })
  }, [dogId])

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {dog && <h2 className="text-2xl font-bold text-slate-800">{dog.name}</h2>}
      <ProgressView dogId={dogId!} trainings={trainings} />
    </div>
  )
}

export default Progress
