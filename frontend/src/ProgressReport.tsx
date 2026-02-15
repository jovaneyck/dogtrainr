import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProgressGraph from './ProgressGraph'
import DogTile from './DogTile'

type TimeRange = 'all' | 'year' | 'month' | 'week'

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'All', value: 'all' },
  { label: 'Year', value: 'year' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
]

function getCutoffDate(range: TimeRange): string | null {
  if (range === 'all') return null
  const now = new Date()
  const days = range === 'year' ? 365 : range === 'month' ? 30 : 7
  now.setDate(now.getDate() - days)
  return now.toISOString().slice(0, 10)
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedDogId = searchParams.get('dog')
  const selectedTrainingId = searchParams.get('training')

  const [dogs, setDogs] = useState<Dog[]>([])
  const [error, setError] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [trainings, setTrainings] = useState<Training[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then(setDogs)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!selectedDogId) {
      setTrainings([])
      setSessions([])
      setTimeRange('all')
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

  function selectDog(dogId: string) {
    setSearchParams({ dog: dogId })
  }

  function deselectDog() {
    setSearchParams({})
  }

  function selectTraining(trainingId: string) {
    setSearchParams({ dog: selectedDogId!, training: trainingId })
  }

  function deselectTraining() {
    setSearchParams({ dog: selectedDogId! })
    setTimeRange('all')
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Progress</h2>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <p className="text-red-500 text-lg">Something went wrong. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Progress</h2>
      {selectedDog ? (
        <div className="mt-4">
          <p className="text-lg font-semibold">{selectedDog.name}</p>
          <button
            onClick={deselectDog}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Change dog
          </button>

          {selectedTraining ? (
            <div className="mt-4">
              <p className="font-medium">{selectedTraining.name}</p>
              <button
                onClick={deselectTraining}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Change training
              </button>
              <div className="mt-3 flex gap-2">
                {TIME_RANGE_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setTimeRange(value)}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      timeRange === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ProgressGraph
                sessions={sessions
                  .filter(s => {
                    if (s.trainingId !== selectedTrainingId) return false
                    if (s.status !== 'completed' && s.status !== 'skipped') return false
                    const cutoff = getCutoffDate(timeRange)
                    if (cutoff && s.date < cutoff) return false
                    return true
                  })
                  .sort((a, b) => a.date.localeCompare(b.date))}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {relevantTrainings.map(training => (
                <button
                  key={training.id}
                  onClick={() => selectTraining(training.id)}
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
            <DogTile key={dog.id} dog={dog} onClick={() => selectDog(dog.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressReport
