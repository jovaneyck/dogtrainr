import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface Dog {
  id: string
  name: string
  picture: string
}

function DogProfile() {
  const { id } = useParams<{ id: string }>()
  const [dog, setDog] = useState<Dog | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/dogs/${id}`)
      .then(res => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setDog(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p>Loading...</p>
  }

  if (notFound) {
    return (
      <div>
        <p>Dog not found</p>
        <Link to="/">Back to home</Link>
      </div>
    )
  }

  if (!dog) return null

  return (
    <div>
      <h2>{dog.name}</h2>
      <img src={`/uploads/dogs/${dog.picture}`} alt={dog.name} />
      <Link to="/">Back to home</Link>
    </div>
  )
}

export default DogProfile
