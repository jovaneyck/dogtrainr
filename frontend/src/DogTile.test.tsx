import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import DogTile from './DogTile'

describe('DogTile', () => {
  const dog = { id: '1', name: 'Buddy', picture: 'buddy.jpg' }

  it('renders dog name', () => {
    render(
      <BrowserRouter>
        <DogTile dog={dog} to="/dogs/1" />
      </BrowserRouter>
    )
    expect(screen.getByText('Buddy')).toBeInTheDocument()
  })

  it('renders dog picture when present', () => {
    render(
      <BrowserRouter>
        <DogTile dog={dog} to="/dogs/1" />
      </BrowserRouter>
    )
    const img = screen.getByAltText('Buddy')
    expect(img).toHaveAttribute('src', '/uploads/dogs/buddy.jpg')
  })

  it('does not render image when picture is empty', () => {
    render(
      <BrowserRouter>
        <DogTile dog={{ id: '1', name: 'Buddy', picture: '' }} to="/dogs/1" />
      </BrowserRouter>
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders as a link when "to" is provided', () => {
    render(
      <BrowserRouter>
        <DogTile dog={dog} to="/dogs/1" />
      </BrowserRouter>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dogs/1')
  })

  it('renders as a button when "onClick" is provided', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <BrowserRouter>
        <DogTile dog={dog} onClick={handleClick} />
      </BrowserRouter>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders chevron', () => {
    render(
      <BrowserRouter>
        <DogTile dog={dog} to="/dogs/1" />
      </BrowserRouter>
    )
    expect(screen.getByText('›')).toBeInTheDocument()
  })
})
