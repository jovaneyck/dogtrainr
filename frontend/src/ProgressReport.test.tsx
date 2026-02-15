import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProgressReport from './ProgressReport'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/progress" element={<ProgressReport />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProgressReport', () => {
  it('renders the heading when navigating to /progress', () => {
    renderAt('/progress')
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
})
