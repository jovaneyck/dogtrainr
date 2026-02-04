import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TrainingList from './TrainingList'

describe('TrainingList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows empty state when no trainings exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(
      <BrowserRouter>
        <TrainingList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no trainings yet/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/create a training/i)).toBeInTheDocument()
  })

  it('displays list of trainings', async () => {
    const trainings = [
      { id: '1', name: 'Sit', procedure: '# Sit', tips: '- Tip' },
      { id: '2', name: 'Down', procedure: '# Down', tips: '- Tip' }
    ]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(trainings)
    } as Response)

    render(
      <BrowserRouter>
        <TrainingList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
      expect(screen.getByText('Down')).toBeInTheDocument()
    })
  })
})
