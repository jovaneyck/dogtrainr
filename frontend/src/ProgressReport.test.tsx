import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProgressReport from './ProgressReport'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/progress" element={<ProgressReport />} />
      </Routes>
    </MemoryRouter>
  )
}

const dogs = [
  { id: 'dog-1', name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' },
  { id: 'dog-2', name: 'Max', picture: 'max.jpg', planId: 'plan-2' }
]

const trainings = [
  { id: 'tr-1', name: 'Sit' },
  { id: 'tr-2', name: 'Stay' },
  { id: 'tr-3', name: 'Heel' }
]

const sessions = [
  { dogId: 'dog-1', trainingId: 'tr-1', date: '2026-01-10', status: 'completed', score: 8 },
  { dogId: 'dog-1', trainingId: 'tr-2', date: '2026-01-11', status: 'skipped' },
  { dogId: 'dog-1', trainingId: 'tr-3', date: '2026-01-12', status: 'planned' }
]

function mockFetchDogsOnly() {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    const urlStr = String(url)
    if (urlStr === '/api/dogs') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(dogs) } as Response)
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
  })
}

function mockFetchAll() {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    const urlStr = String(url)
    if (urlStr === '/api/dogs') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(dogs) } as Response)
    }
    if (urlStr === '/api/trainings') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(trainings) } as Response)
    }
    if (urlStr.includes('/api/dogs/dog-1/sessions')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(sessions) } as Response)
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
  })
}

describe('ProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the heading when navigating to /progress', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    renderAt('/progress')
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('fetches and renders dog list', async () => {
    mockFetchDogsOnly()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/dogs')
  })

  it('clicking a dog selects it', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))

    expect(screen.getByText(/Buddy/)).toBeInTheDocument()
    expect(screen.queryByText('Max')).not.toBeInTheDocument()
  })

  it('can deselect and go back to dog list', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))
    expect(screen.queryByText('Max')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change dog/i }))

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('after selecting a dog, shows trainings with completed/skipped sessions', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
      expect(screen.getByText('Stay')).toBeInTheDocument()
    })
  })

  it('does not show trainings with only planned sessions', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    expect(screen.queryByText('Heel')).not.toBeInTheDocument()
  })

  it('clicking a training selects it', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sit'))

    expect(screen.getByRole('button', { name: /change training/i })).toBeInTheDocument()
  })

  it('can go back from training selection to training list', async () => {
    const user = userEvent.setup()
    mockFetchAll()

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Buddy'))

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sit'))

    await user.click(screen.getByRole('button', { name: /change training/i }))

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
      expect(screen.getByText('Stay')).toBeInTheDocument()
    })
  })
})
