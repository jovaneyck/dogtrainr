import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    <div className="space-y-6">
      <Link to="/trainings" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
        <span className="mr-1">&larr;</span> Back
      </Link>
      <h2 className="text-2xl font-bold text-slate-800">Create Training</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
        <div className="space-y-5">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Procedure</label>
            <MDEditor
              value={procedure}
              onChange={val => setProcedure(val || '')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tips</label>
            <MDEditor
              value={tips}
              onChange={val => setTips(val || '')}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Training'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TrainingForm
