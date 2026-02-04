import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TrainingForm from './TrainingForm'

describe('TrainingForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the form', () => {
    render(
      <MemoryRouter>
        <TrainingForm />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByText(/procedure/i)).toBeInTheDocument()
    expect(screen.getByText(/tips/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('submits the form with name, procedure, and tips', async () => {
    const user = userEvent.setup()

    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '123', name: 'Sit', procedure: '# Steps', tips: '- Tips' })
    } as Response)

    render(
      <MemoryRouter>
        <TrainingForm />
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'Sit')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trainings', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }))
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body.name).toBe('Sit')
  })
})
