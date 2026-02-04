import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PlanForm from './PlanForm'

describe('PlanForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the form with name input and day columns', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/monday/i)).toBeInTheDocument()
      expect(screen.getByText(/tuesday/i)).toBeInTheDocument()
      expect(screen.getByText(/sunday/i)).toBeInTheDocument()
    })
  })

  it('submits the form with name and schedule', async () => {
    const user = userEvent.setup()
    const trainings = [
      { id: 't1', name: 'Sit', procedure: '', tips: '' },
      { id: 't2', name: 'Down', procedure: '', tips: '' }
    ]

    const mockFetch = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(trainings)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '123', name: 'My Plan', schedule: {} })
      } as Response)

    render(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Sit').length).toBeGreaterThan(0)
    })

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'My Plan')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/plans', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }))
    })

    const postCall = mockFetch.mock.calls.find(call => call[0] === '/api/plans')
    const body = JSON.parse(postCall?.[1]?.body as string)
    expect(body.name).toBe('My Plan')
    expect(body.schedule).toBeDefined()
  })
})
