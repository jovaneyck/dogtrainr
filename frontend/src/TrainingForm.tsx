import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'

function TrainingForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [procedure, setProcedure] = useState('')
  const [tips, setTips] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, procedure, tips })
      })
      if (response.ok) {
        navigate('/trainings')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Training</h2>
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

export default TrainingForm
