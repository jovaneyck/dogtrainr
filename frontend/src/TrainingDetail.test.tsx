import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TrainingDetail from './TrainingDetail'

describe('TrainingDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays training details', async () => {
    const training = {
      id: '1',
      name: 'Sit',
      procedure: '# Steps\n\n1. Hold treat',
      tips: '- Be patient'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sit')).toBeInTheDocument()
    })
  })

  it('shows not found for non-existent training', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Training not found' })
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/non-existent']}>
        <Routes>
          <Route path="/trainings/:id" element={<TrainingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/training not found/i)).toBeInTheDocument()
    })
  })
})
