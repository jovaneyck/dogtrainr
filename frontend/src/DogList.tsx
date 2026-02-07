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
    return <p>Loading...</p>
  }

  if (dogs.length === 0) {
    return (
      <div>
        <p>No dogs registered yet.</p>
        <Link to="/dogs/new">Register a dog</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Your Dogs</h2>
      <ul>
        {dogs.map(dog => (
          <li key={dog.id}>
            <Link to={`/dogs/${dog.id}`}>
              {dog.picture && (
                <img
                  src={`/uploads/dogs/${dog.picture}`}
                  alt={dog.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }}
                />
              )}
              {dog.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/dogs/new">Register a dog</Link>
    </div>
  )
}

export default DogList
