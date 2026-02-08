import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'

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
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
        <span>←</span> <span>Register a Dog</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="picture" className="block text-sm font-medium text-slate-700 mb-1">Picture</label>
            <input
              id="picture"
              type="file"
              accept="image/*"
              onChange={e => setPicture(e.target.files?.[0] || null)}
              className="w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registering...' : 'Register Dog'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DogForm
