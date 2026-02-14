import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DogProfile from './DogProfile'

const DOG_ID = '123'

function mockSessionsEndpoint(sessions: Record<string, unknown[]> = {}) {
  return (url: string) => {
    const parsed = new URL(url, 'http://localhost')
    const from = parsed.searchParams.get('from')!
    const to = parsed.searchParams.get('to')!
    const result: unknown[] = []
    for (const [date, items] of Object.entries(sessions)) {
      if (date >= from && date <= to) {
        result.push(...items)
      }
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(result) } as Response)
  }
}

describe('DogProfile', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-14T12:00:00'))
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays dog details', async () => {
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg' }
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === `/api/dogs/${DOG_ID}`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
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
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
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

  it('shows inline progress view when dog has a plan', async () => {
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: ['t1'], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
    const handleSessions = mockSessionsEndpoint({
      '2026-02-14': [
        { dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'planned' },
      ],
    })

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = String(url)
      if (urlStr === `/api/dogs/${DOG_ID}`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (urlStr === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([plan]) } as Response)
      }
      if (urlStr === `/api/plans/plan-1`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (urlStr === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 't1', name: 'Sit' }]) } as Response)
      }
      if (urlStr.includes(`/api/dogs/${DOG_ID}/sessions`)) {
        return handleSessions(urlStr)
      }
      return Promise.reject(new Error(`Unknown URL: ${urlStr}`))
    })

    render(
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    // Progress view should be inlined - week strip with day names
    await waitFor(() => {
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
    })

    // Session from the progress view should appear
    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })
  })

  it('shows View Plan link and Unassign button at the bottom when plan is assigned', async () => {
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
    const handleSessions = mockSessionsEndpoint({})

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = String(url)
      if (urlStr === `/api/dogs/${DOG_ID}`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (urlStr === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([plan]) } as Response)
      }
      if (urlStr === `/api/plans/plan-1`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (urlStr === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      if (urlStr.includes(`/api/dogs/${DOG_ID}/sessions`)) {
        return handleSessions(urlStr)
      }
      return Promise.reject(new Error(`Unknown URL: ${urlStr}`))
    })

    render(
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    // View Plan link should point to the plan page
    const viewPlanLink = screen.getByRole('link', { name: /view plan/i })
    expect(viewPlanLink).toHaveAttribute('href', '/plans/plan-1')

    // Unassign button should be present
    expect(screen.getByRole('button', { name: /unassign/i })).toBeInTheDocument()
  })

  it('allows assigning a training plan', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg' }
    const plans = [plan]
    const handleSessions = mockSessionsEndpoint({})

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      const urlStr = String(url)
      if (urlStr === `/api/dogs/${DOG_ID}` && !options) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (urlStr === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (urlStr === `/api/dogs/${DOG_ID}/plan` && options?.method === 'PUT') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...dog, planId: 'plan-1' }) } as Response)
      }
      if (urlStr === `/api/plans/plan-1`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (urlStr === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      if (urlStr.includes(`/api/dogs/${DOG_ID}/sessions`)) {
        return handleSessions(urlStr)
      }
      return Promise.reject(new Error(`Unknown URL: ${urlStr}`))
    })

    render(
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
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

    // After assigning, progress view should appear (week strip)
    await waitFor(() => {
      expect(screen.getByText('Mon')).toBeInTheDocument()
    })
  })

  it('allows unassigning a training plan', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const plan = {
      id: 'plan-1',
      name: 'Puppy Basics',
      schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
    const plans = [plan]
    const handleSessions = mockSessionsEndpoint({})

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      const urlStr = String(url)
      if (urlStr === `/api/dogs/${DOG_ID}` && !options) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
      }
      if (urlStr === '/api/plans') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plans) } as Response)
      }
      if (urlStr === `/api/plans/plan-1`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(plan) } as Response)
      }
      if (urlStr === `/api/dogs/${DOG_ID}/plan` && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...dog, planId: undefined }) } as Response)
      }
      if (urlStr === '/api/trainings') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response)
      }
      if (urlStr.includes(`/api/dogs/${DOG_ID}/sessions`)) {
        return handleSessions(urlStr)
      }
      return Promise.reject(new Error(`Unknown URL: ${urlStr}`))
    })

    render(
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
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
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument()
  })

  it('does not show progress view or plan actions when dog has no plan', async () => {
    const dog = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg' }

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === `/api/dogs/${DOG_ID}`) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(dog) } as Response)
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
      <MemoryRouter initialEntries={[`/dogs/${DOG_ID}`]}>
        <Routes>
          <Route path="/dogs/:id" element={<DogProfile />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })

    expect(screen.queryByRole('link', { name: /view plan/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /unassign/i })).not.toBeInTheDocument()
  })
})
