import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DogTile from './DogTile'

interface Dog {
  id: string
  name: string
  picture: string
}

function DogList() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => res.json())
      .then(data => {
        setDogs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
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
          <DogTile key={dog.id} dog={dog} to={`/dogs/${dog.id}`} />
        ))}
      </div>
    </div>
  )
}

export default DogList
