import { useEffect, useState } from 'react'
import ProgressGraph from './ProgressGraph'

interface Dog {
  id: string
  name: string
  picture: string
  planId?: string
}

interface Training {
  id: string
  name: string
}

interface Session {
  id?: string
  dogId: string
  trainingId: string
  planId?: string
  date: string
  status: 'planned' | 'completed' | 'skipped'
  score?: number
  notes?: string
}

function ProgressReport() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => res.json())
      .then(setDogs)
  }, [])

  useEffect(() => {
    if (!selectedDogId) {
      setTrainings([])
      setSessions([])
      setSelectedTrainingId(null)
      return
    }

    Promise.all([
      fetch(`/api/dogs/${selectedDogId}/sessions?from=2000-01-01&to=2099-12-31`).then(r => r.json()),
      fetch('/api/trainings').then(r => r.json())
    ]).then(([fetchedSessions, fetchedTrainings]) => {
      setSessions(fetchedSessions)
      setTrainings(fetchedTrainings)
    })
  }, [selectedDogId])

  const selectedDog = dogs.find(d => d.id === selectedDogId)

  const relevantSessions = sessions.filter(s => s.status === 'completed' || s.status === 'skipped')
  const relevantTrainingIds = [...new Set(relevantSessions.map(s => s.trainingId))]
  const relevantTrainings = trainings.filter(t => relevantTrainingIds.includes(t.id))

  const selectedTraining = trainings.find(t => t.id === selectedTrainingId)

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Progress</h2>
      {selectedDog ? (
        <div className="mt-4">
          <p className="text-lg font-semibold">{selectedDog.name}</p>
          <button
            onClick={() => setSelectedDogId(null)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Change dog
          </button>

          {selectedTraining ? (
            <div className="mt-4">
              <p className="font-medium">{selectedTraining.name}</p>
              <button
                onClick={() => setSelectedTrainingId(null)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Change training
              </button>
              <ProgressGraph
                sessions={sessions
                  .filter(s => s.trainingId === selectedTrainingId && (s.status === 'completed' || s.status === 'skipped'))
                  .sort((a, b) => a.date.localeCompare(b.date))}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {relevantTrainings.map(training => (
                <button
                  key={training.id}
                  onClick={() => setSelectedTrainingId(training.id)}
                  className="rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50"
                >
                  {training.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {dogs.map(dog => (
            <button
              key={dog.id}
              onClick={() => setSelectedDogId(dog.id)}
              className="rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50"
            >
              {dog.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressReport
