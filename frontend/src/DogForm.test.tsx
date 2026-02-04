import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DogForm from './DogForm'

describe('DogForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the form', () => {
    render(
      <MemoryRouter>
        <DogForm />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/picture/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('submits the form with name and picture', async () => {
    const user = userEvent.setup()

    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '123', name: 'Buddy', picture: 'buddy.jpg' })
    } as Response)

    render(
      <MemoryRouter>
        <DogForm />
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'Buddy')

    const file = new File(['test'], 'buddy.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/picture/i)
    await user.upload(fileInput, file)

    const submitButton = screen.getByRole('button', { name: /register/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/dogs', expect.objectContaining({
        method: 'POST'
      }))
    })

    // Verify the formData contains name and picture
    const callArgs = mockFetch.mock.calls[0]
    const formData = callArgs[1]?.body as FormData
    expect(formData.get('name')).toBe('Buddy')
    expect(formData.get('picture')).toBeInstanceOf(File)
  })
})
