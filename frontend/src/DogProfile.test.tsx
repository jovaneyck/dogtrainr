import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DogProfile from './DogProfile'

describe('DogProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays dog details', async () => {
    const dog = { id: '123', name: 'Buddy', picture: 'buddy.jpg' }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dog)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/dogs/123']}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/uploads/dogs/buddy.jpg')
  })

  it('shows not found for non-existent dog', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Dog not found' })
    } as Response)

    render(
      <MemoryRouter initialEntries={['/dogs/nonexistent']}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
  })
})
