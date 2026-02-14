import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TrainingDetail from './TrainingDetail'

describe('TrainingDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays training details', async () => {
    const training = {
      id: '1',
      name: 'Sit',
      procedure: '# Steps\n\n1. Hold treat',
      tips: '- Be patient'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })
  })

  it('renders external links in markdown with target="_blank" and rel="noopener noreferrer"', async () => {
    const training = {
      id: '1',
      name: 'Sit',
      procedure: 'Watch [this video](https://www.youtube.com/watch?v=123)',
      tips: 'See https://example.com for more'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    const videoLink = screen.getByRole('link', { name: 'this video' })
    expect(videoLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=123')
    expect(videoLink).toHaveAttribute('target', '_blank')
    expect(videoLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('prepends https:// to links missing a protocol', async () => {
    const training = {
      id: '1',
      name: 'Sit',
      procedure: 'Watch [youtube](www.youtube.com)',
      tips: ''
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: 'youtube' })
    expect(link).toHaveAttribute('href', 'https://www.youtube.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('sanitizes HTML in markdown to prevent XSS', async () => {
    const training = {
      id: '1',
      name: 'Malicious',
      procedure: '<img src=x onerror="alert(1)">',
      tips: '<script>alert("xss")</script>'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    const { container } = render(
      <MemoryRouter initialEntries={['/trainings/1']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Malicious')).toBeInTheDocument()
    })

    // Verify dangerous HTML is sanitized
    expect(container.querySelector('img[onerror]')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
  })

  it('shows not found for non-existent training', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Training not found' })
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/non-existent']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/training not found/i)).toBeInTheDocument()
    })
  })
})
