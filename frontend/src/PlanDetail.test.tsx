import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PlanDetail from './PlanDetail'

describe('PlanDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays plan details with weekly schedule', async () => {
    const plan = {
      id: '1',
      name: 'Puppy basics',
      schedule: {
        monday: ['t1', 't2'],
        tuesday: [],
        wednesday: ['t1'],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
    const trainings = [
      { id: 't1', name: 'Sit', procedure: '', tips: '' },
      { id: 't2', name: 'Down', procedure: '', tips: '' }
    ]
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(plan)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(trainings)
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
    expect(screen.getByText(/monday/i)).toBeInTheDocument()
  })

  it('renders training names as links to their detail pages', async () => {
    const plan = {
      id: '1',
      name: 'Puppy basics',
      schedule: {
        monday: ['t1', 't2'],
        tuesday: [],
        wednesday: ['t1'],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
    const trainings = [
      { id: 't1', name: 'Sit', procedure: '', tips: '' },
      { id: 't2', name: 'Down', procedure: '', tips: '' }
    ]
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(plan)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(trainings)
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

    const sitLinks = screen.getAllByRole('link', { name: 'Sit' })
    expect(sitLinks).toHaveLength(2)
    expect(sitLinks[0]).toHaveAttribute('href', '/trainings/t1')

    const downLink = screen.getByRole('link', { name: 'Down' })
    expect(downLink).toHaveAttribute('href', '/trainings/t2')
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
})
