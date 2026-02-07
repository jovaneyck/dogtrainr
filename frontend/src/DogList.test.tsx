import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DogList from './DogList'

describe('DogList', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows empty state when no dogs exist', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    } as Response)

    render(
      <BrowserRouter>
        <DogList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no dogs registered/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/register a dog/i)).toBeInTheDocument()
  })

  it('displays list of dogs', async () => {
    const dogs = [
      { id: '1', name: 'Buddy', picture: 'buddy.jpg' },
      { id: '2', name: 'Max', picture: 'max.jpg' }
    ]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

    render(
      <BrowserRouter>
        <DogList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('shows profile picture badges for dogs with pictures', async () => {
    const dogs = [
      { id: '1', name: 'Buddy', picture: 'buddy.jpg' },
      { id: '2', name: 'Max', picture: 'max.jpg' }
    ]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

    render(
      <BrowserRouter>
        <DogList />
      </BrowserRouter>
    )

    await waitFor(() => {
      const buddyImg = screen.getByAltText('Buddy')
      expect(buddyImg).toBeInTheDocument()
      expect(buddyImg).toHaveAttribute('src', '/uploads/dogs/buddy.jpg')

      const maxImg = screen.getByAltText('Max')
      expect(maxImg).toBeInTheDocument()
      expect(maxImg).toHaveAttribute('src', '/uploads/dogs/max.jpg')
    })
  })

  it('does not render image for dogs without a picture', async () => {
    const dogs = [
      { id: '1', name: 'Buddy', picture: '' },
      { id: '2', name: 'Max' }
    ]
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dogs)
    } as Response)

    render(
      <BrowserRouter>
        <DogList />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument()
    })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
