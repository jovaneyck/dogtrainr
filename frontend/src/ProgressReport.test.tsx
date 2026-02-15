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
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

    renderAt('/progress')

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/dogs')
  })

  it('clicking a dog selects it', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

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
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

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
})
