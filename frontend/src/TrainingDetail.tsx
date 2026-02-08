import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'

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
    return <p>Loading...</p>
  }

  if (notFound) {
    return (
      <div>
        <p>Training not found.</p>
        <Link to="/trainings">Back to trainings</Link>
      </div>
    )
  }

  if (!training) {
    return null
  }

  return (
    <div>
      <h2>{training.name}</h2>
      <h3>Procedure</h3>
      <MDEditor.Markdown source={training.procedure} components={{
        a: ({ href, children, ...props }) => {
          const url = href && !/^https?:\/\//.test(href) ? `https://${href}` : href
          return <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
        }
      }} />
      <h3>Tips</h3>
      <MDEditor.Markdown source={training.tips} components={{
        a: ({ href, children, ...props }) => {
          const url = href && !/^https?:\/\//.test(href) ? `https://${href}` : href
          return <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
        }
      }} />
      <Link to="/trainings">Back to trainings</Link>
      <Link to={`/trainings/${training.id}/edit`}>Edit</Link>
    </div>
  )
}

export default TrainingDetail
