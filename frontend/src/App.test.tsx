import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the title', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ message: 'Hello from DogTrainr API!' })
    } as Response)

    render(<App />)
    expect(screen.getByText('DogTrainr')).toBeInTheDocument()
  })

  it('displays message from API', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ message: 'Hello from DogTrainr API!' })
    } as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('api-message')).toHaveTextContent('Hello from DogTrainr API!')
    })
  })
})
