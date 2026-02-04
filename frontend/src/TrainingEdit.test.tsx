import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TrainingEdit from './TrainingEdit'

describe('TrainingEdit', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads and displays existing training data', async () => {
    const training = {
      id: '1',
      name: 'Sit',
      procedure: '# Steps',
      tips: '- Tips'
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(training)
    } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1/edit']}>
        <Routes>
          <Route path="/trainings/:id/edit" element={<TrainingEdit />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Sit')
    })
  })

  it('submits updated training', async () => {
    const user = userEvent.setup()
    const training = {
      id: '1',
      name: 'Sit',
      procedure: '# Steps',
      tips: '- Tips'
    }

    const mockFetch = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(training)
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...training, name: 'Sit Updated' })
      } as Response)

    render(
      <MemoryRouter initialEntries={['/trainings/1/edit']}>
        <Routes>
          <Route path="/trainings/:id/edit" element={<TrainingEdit />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Sit')
    })

    const nameInput = screen.getByLabelText(/name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Sit Updated')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trainings/1', expect.objectContaining({
        method: 'PUT'
      }))
    })
  })
})
