import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'

interface Training {
  id: string
  name: string
  procedure: string
  tips: string
}

function TrainingEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [procedure, setProcedure] = useState('')
  const [tips, setTips] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/trainings/${id}`)
      .then(res => res.json())
      .then((data: Training) => {
        setName(data.name)
        setProcedure(data.procedure)
        setTips(data.tips)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/trainings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, procedure, tips })
      })
      if (response.ok) {
        navigate(`/trainings/${id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Training</h2>
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
        <label>Procedure</label>
        <MDEditor
          value={procedure}
          onChange={val => setProcedure(val || '')}
        />
      </div>
      <div>
        <label>Tips</label>
        <MDEditor
          value={tips}
          onChange={val => setTips(val || '')}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Training'}
      </button>
    </form>
  )
}

export default TrainingEdit
