import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function DogForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [picture, setPicture] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !picture) return

    setSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('picture', picture)

    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        navigate('/')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register a Dog</h2>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="picture">Picture</label>
        <input
          id="picture"
          type="file"
          accept="image/*"
          onChange={e => setPicture(e.target.files?.[0] || null)}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering...' : 'Register Dog'}
      </button>
    </form>
  )
}

export default DogForm
