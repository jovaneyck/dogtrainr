import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the title', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('DogTrainr')).toBeInTheDocument()
    })
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

  it('logo links to homepage', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)
    await waitFor(() => {
      const logoLink = screen.getByRole('link', { name: /dogtrainr/i })
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  it('renders plans navigation link', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /plans/i })).toBeInTheDocument()
    })
  })
})
