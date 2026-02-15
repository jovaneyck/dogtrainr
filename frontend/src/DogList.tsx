import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Dog {
  id: string
  name: string
  picture: string
}

function DogList() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then(data => {
        setDogs(data)
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

  if (dogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-slate-500 text-lg">No dogs registered yet.</p>
        <Link
          to="/dogs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Register a dog
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Your Dogs</h2>
        <Link
          to="/dogs/new"
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-700 transition-colors"
          aria-label="Register a dog"
        >
          +
        </Link>
      </div>
      <div className="space-y-3">
        {dogs.map(dog => (
          <Link
            key={dog.id}
            to={`/dogs/${dog.id}`}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {dog.picture && (
                <img
                  src={`/uploads/dogs/${dog.picture}`}
                  alt={dog.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <span className="text-base text-slate-800 font-medium">{dog.name}</span>
            </div>
            <span className="text-slate-400 text-lg">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DogList
