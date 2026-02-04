import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the title', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)
    expect(screen.getByText('DogTrainr')).toBeInTheDocument()
  })

  it('renders dog list on home route', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/no dogs registered/i)).toBeInTheDocument()
    })
  })

  it('renders plans navigation link', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)
    expect(screen.getByRole('link', { name: /plans/i })).toBeInTheDocument()
  })
})
