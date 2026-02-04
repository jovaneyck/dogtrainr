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
})
