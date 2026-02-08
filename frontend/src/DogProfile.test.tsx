import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DogProfile from './DogProfile'

describe('DogProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays dog details', async () => {
    const dog = { id: '123', name: 'Buddy', picture: 'buddy.jpg' }
    const plans: unknown[] = []
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/dogs/123') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (url === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (url === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

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
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (String(url).includes('/api/dogs/')) {
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ error: 'Dog not found' }) } as Response)
      }
      if (url === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      if (url === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

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

  it('shows assigned training plan details', async () => {
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: {
        monday: ['training-1'],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
    const dog = { id: '123', name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
    const plans = [plan]

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/dogs/123') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (url === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (url === '/api/plans/plan-1') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (url === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(
      <MemoryRouter initialEntries={['/dogs/123']}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Puppy Basics')).toBeInTheDocument()
    })
  })

  it('allows assigning a training plan', async () => {
    const user = userEvent.setup()
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: '123', name: 'Buddy', picture: 'buddy.jpg' }
    const plans = [plan]

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url === '/api/dogs/123' && !options) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (url === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (url === '/api/dogs/123/plan' && options?.method === 'PUT') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...dog, planId: 'plan-1' }) } as Response)
      }
      if (url === '/api/plans/plan-1') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (url === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

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

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'plan-1')
    await user.click(screen.getByRole('button', { name: /assign/i }))

    await waitFor(() => {
      expect(screen.getByText('Puppy Basics')).toBeInTheDocument()
    })
  })

  it('allows unassigning a training plan', async () => {
    const user = userEvent.setup()
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: '123', name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
    const plans = [plan]

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url === '/api/dogs/123' && !options) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (url === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (url === '/api/plans/plan-1') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (url === '/api/dogs/123/plan' && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...dog, planId: undefined }) } as Response)
      }
      if (url === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(
      <MemoryRouter initialEntries={['/dogs/123']}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unassign/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /unassign/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /unassign/i })).not.toBeInTheDocument()
    })
    // Assign button should now be visible (plan selector mode)
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument()
  })
})
