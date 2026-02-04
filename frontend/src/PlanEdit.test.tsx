import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PlanEdit from './PlanEdit'

describe('PlanEdit', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads and displays existing plan data', async () => {
    const plan = {
      id: '1',
      name: 'Puppy basics',
      schedule: {
        monday: ['t1'],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
    const trainings = [
      { id: 't1', name: 'Sit', procedure: '', tips: '' }
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
      <MemoryRouter initialEntries={['/plans/1/edit']}>
        <Routes>
          <Route path="/plans/:id/edit" element={<PlanEdit />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Puppy basics')
    })
  })

  it('submits updated plan', async () => {
    const user = userEvent.setup()
    const plan = {
      id: '1',
      name: 'Old name',
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
    const trainings = [
      { id: 't1', name: 'Sit', procedure: '', tips: '' }
    ]
    const mockFetch = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(plan)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(trainings)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...plan, name: 'New name' })
      } as Response)

    render(
      <MemoryRouter initialEntries={['/plans/1/edit']}>
        <Routes>
          <Route path="/plans/:id/edit" element={<PlanEdit />} />
          <Route path="/plans/:id" element={<div>Plan detail</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Old name')
    })

    const nameInput = screen.getByLabelText(/name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'New name')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/plans/1', expect.objectContaining({
        method: 'PUT'
      }))
    })
  })
})
