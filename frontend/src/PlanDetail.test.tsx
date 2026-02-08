import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PlanDetail from './PlanDetail'

describe('PlanDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows not found for non-existent plan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Plan not found' })
    } as Response)

    render(
      <MemoryRouter initialEntries={['/plans/non-existent']}>
        <Routes>
          <Route path="/plans/:id" element={<PlanDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/plan not found/i)).toBeInTheDocument()
    })
  })

  it('displays plan name and navigation links', async () => {
    const plan = {
      id: '1',
      name: 'Puppy basics',
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(plan)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      } as Response)

    render(
      <MemoryRouter initialEntries={['/plans/1']}>
        <Routes>
          <Route path="/plans/:id" element={<PlanDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Puppy basics')).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /back to plans/i })).toHaveAttribute('href', '/plans')
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/plans/1/edit')
  })
})
