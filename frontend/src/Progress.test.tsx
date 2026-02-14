import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Progress from './Progress'

const DOG_ID = '123'
const DOG = { id: DOG_ID, name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-1' }
const TRAININGS = [
  { id: 't1', name: 'Sit' },
  { id: 't2', name: 'Stay' },
]

function renderProgress() {
  return render(
    <MemoryRouter initialEntries={[`/dogs/${DOG_ID}/progress`]}>
      <Routes>
        <Route path="/dogs/:id/progress" element={<Progress />} />
      </Routes>
    </MemoryRouter>
  )
}

function mockFetch(sessions: Record<string, unknown[]>) {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    const urlStr = String(url)
    if (urlStr === `/api/dogs/${DOG_ID}`) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(DOG) } as Response)
    }
    if (urlStr === '/api/trainings') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(TRAININGS) } as Response)
    }
    if (urlStr.includes(`/api/dogs/${DOG_ID}/sessions`)) {
      const parsed = new URL(urlStr, 'http://localhost')
      const from = parsed.searchParams.get('from')!
      const to = parsed.searchParams.get('to')!
      // Collect all sessions in the requested range
      const result: unknown[] = []
      for (const [date, items] of Object.entries(sessions)) {
        if (date >= from && date <= to) {
          result.push(...items)
        }
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(result) } as Response)
    }
    return Promise.reject(new Error(`Unmocked URL: ${urlStr}`))
  })
}

describe('Progress', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-02-14T12:00:00'))
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders week strip with 7 days', async () => {
    mockFetch({})
    renderProgress()

    await waitFor(() => {
      // Week of 2026-02-09 (Mon) to 2026-02-15 (Sun)
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Tue')).toBeInTheDocument()
      expect(screen.getByText('Wed')).toBeInTheDocument()
      expect(screen.getByText('Thu')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
      expect(screen.getByText('Sun')).toBeInTheDocument()
    })
  })

  it('shows today as selected by default', async () => {
    mockFetch({})
    renderProgress()

    // Feb 14 is Saturday. The selected day button should have a distinctive style.
    await waitFor(() => {
      const satButton = screen.getByRole('button', { name: /Sat 14/ })
      expect(satButton).toHaveClass('bg-blue-600')
    })
  })

  it('displays session cards for the selected day', async () => {
    mockFetch({
      '2026-02-14': [
        { dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'planned' },
        { id: 's2', dogId: DOG_ID, trainingId: 't2', date: '2026-02-14', status: 'completed', score: 8 },
      ],
    })
    renderProgress()

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
      expect(screen.getByText('Stay')).toBeInTheDocument()
    })
  })

  it('shows "Check off" button for planned sessions', async () => {
    mockFetch({
      '2026-02-14': [
        { dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'planned' },
      ],
    })
    renderProgress()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /check off/i })).toBeInTheDocument()
    })
  })

  it('shows score and checkmark for completed sessions', async () => {
    mockFetch({
      '2026-02-14': [
        { id: 's1', dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'completed', score: 4 },
      ],
    })
    renderProgress()

    await waitFor(() => {
      expect(screen.getByText('4/10')).toBeInTheDocument()
      expect(screen.getByText(/\u2713/)).toBeInTheDocument()
    })
  })

  it('clicking a different day shows that days sessions', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockFetch({
      '2026-02-14': [
        { dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'planned' },
      ],
      '2026-02-12': [
        { id: 's1', dogId: DOG_ID, trainingId: 't2', date: '2026-02-12', status: 'completed', score: 7 },
      ],
    })
    renderProgress()

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })

    // Click Thursday (Feb 12)
    await user.click(screen.getByRole('button', { name: /Thu 12/ }))

    await waitFor(() => {
      expect(screen.getByText('Stay')).toBeInTheDocument()
      expect(screen.getByText('7/10')).toBeInTheDocument()
    })
  })

  it('navigating weeks fetches new data and updates the strip', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockFetch({})
    renderProgress()

    await waitFor(() => {
      expect(screen.getByText('February 2026')).toBeInTheDocument()
    })

    // Click next week arrow
    await user.click(screen.getByRole('button', { name: /next week/i }))

    await waitFor(() => {
      // Feb 16 (Mon) to Feb 22 (Sun) — still February 2026
      expect(screen.getByText('16')).toBeInTheDocument()
      expect(screen.getByText('22')).toBeInTheDocument()
    })

    // Verify fetch was called again with new date range
    const fetchCalls = vi.mocked(global.fetch).mock.calls
    const sessionCalls = fetchCalls.filter(c => String(c[0]).includes('/sessions'))
    expect(sessionCalls.length).toBeGreaterThanOrEqual(2)
  })

  it('shows "No sessions scheduled" when no sessions for a day', async () => {
    mockFetch({})
    renderProgress()

    await waitFor(() => {
      expect(screen.getByText('No sessions scheduled')).toBeInTheDocument()
    })
  })

  it('shows dot markers under days with completed or skipped sessions', async () => {
    mockFetch({
      '2026-02-12': [
        { id: 's1', dogId: DOG_ID, trainingId: 't1', date: '2026-02-12', status: 'completed', score: 5 },
      ],
      '2026-02-13': [
        { id: 's2', dogId: DOG_ID, trainingId: 't2', date: '2026-02-13', status: 'skipped' },
      ],
      '2026-02-14': [
        { dogId: DOG_ID, trainingId: 't1', date: '2026-02-14', status: 'planned' },
      ],
    })
    renderProgress()

    await waitFor(() => {
      // Thu 12 has a completed session — should have a dot
      const thuButton = screen.getByRole('button', { name: /Thu 12/ })
      expect(thuButton.querySelector('.session-dot')).toBeInTheDocument()

      // Fri 13 has a skipped session — should have a dot
      const friButton = screen.getByRole('button', { name: /Fri 13/ })
      expect(friButton.querySelector('.session-dot')).toBeInTheDocument()

      // Sat 14 has only planned — should NOT have a dot
      const satButton = screen.getByRole('button', { name: /Sat 14/ })
      expect(satButton.querySelector('.session-dot')).not.toBeInTheDocument()
    })
  })
})
