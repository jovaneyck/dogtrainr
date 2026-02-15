import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PlanList from './PlanList'

describe('PlanList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows empty state when no plans exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(
      <BrowserRouter>
        <PlanList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no plans yet/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/create a plan/i)).toBeInTheDocument()
  })

  it('displays list of plans', async () => {
    const plans = [
      { id: '1', name: 'Puppy basics', schedule: {} },
      { id: '2', name: 'Advanced', schedule: {} }
    ]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(plans)
    } as Response)

    render(
      <BrowserRouter>
        <PlanList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Puppy basics')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch returns non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' })
    } as Response)

    render(
      <BrowserRouter>
        <PlanList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/no plans yet/i)).not.toBeInTheDocument()
  })

  it('shows error message when fetch rejects with network error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    render(
      <BrowserRouter>
        <PlanList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/no plans yet/i)).not.toBeInTheDocument()
  })
})
