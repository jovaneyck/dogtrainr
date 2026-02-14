import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

interface Training {
  id: string
  name: string
  procedure: string
  tips: string
}

function TrainingDetail() {
  const { id } = useParams<{ id: string }>()
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/trainings/${id}`)
      .then(res => {
        if (!res.ok) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) setTraining(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="text-slate-500 text-center py-12">Loading...</p>
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-lg text-slate-500">Training not found.</p>
        <Link to="/trainings" className="text-blue-600 hover:text-blue-700 font-medium">Back to trainings</Link>
      </div>
    )
  }

  if (!training) {
    return null
  }

  return (
    <div className="space-y-6">
      <Link to="/trainings" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
        <span className="mr-1">&larr;</span> Back
      </Link>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{training.name}</h2>
        <Link
          to={`/trainings/${training.id}/edit`}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Edit
        </Link>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-700">Procedure</h3>
        <MDEditor.Markdown source={training.procedure} rehypePlugins={[rehypeSanitize]} components={{
          a: ({ href, children, ...props }) => {
            const url = href && !/^https?:\/\//.test(href) ? `https://${href}` : href
            return <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
          }
        }} />
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-2">
        <h3 className="text-lg font-semibold text-slate-700">Tips</h3>
        <MDEditor.Markdown source={training.tips} rehypePlugins={[rehypeSanitize]} components={{
          a: ({ href, children, ...props }) => {
            const url = href && !/^https?:\/\//.test(href) ? `https://${href}` : href
            return <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
          }
        }} />
      </div>
    </div>
  )
}

export default TrainingDetail
