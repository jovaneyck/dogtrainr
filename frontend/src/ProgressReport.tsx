import { useEffect, useState } from 'react'

interface Dog {
  id: string
  name: string
  picture: string
  planId?: string
}

function ProgressReport() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => res.json())
      .then(setDogs)
  }, [])

  const selectedDog = dogs.find(d => d.id === selectedDogId)

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
