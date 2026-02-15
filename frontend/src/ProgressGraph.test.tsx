import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressGraph from './ProgressGraph'

const completedSessions = [
  { dogId: 'd1', trainingId: 't1', date: '2026-01-01', status: 'completed' as const, score: 5 },
  { dogId: 'd1', trainingId: 't1', date: '2026-01-03', status: 'completed' as const, score: 7 },
  { dogId: 'd1', trainingId: 't1', date: '2026-01-05', status: 'completed' as const, score: 9 }
]

const sessionsWithSkipped = [
  { dogId: 'd1', trainingId: 't1', date: '2026-01-01', status: 'completed' as const, score: 5 },
  { dogId: 'd1', trainingId: 't1', date: '2026-01-02', status: 'skipped' as const },
  { dogId: 'd1', trainingId: 't1', date: '2026-01-03', status: 'completed' as const, score: 8 }
]

describe('ProgressGraph', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ProgressGraph sessions={completedSessions} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders circles for completed sessions', () => {
    const { container } = render(<ProgressGraph sessions={completedSessions} />)
    const circles = container.querySelectorAll('circle.completed')
    expect(circles.length).toBe(3)
  })

  it('does not render circles for skipped sessions', () => {
    const { container } = render(<ProgressGraph sessions={sessionsWithSkipped} />)
    const circles = container.querySelectorAll('circle.completed')
    expect(circles.length).toBe(2)
  })

  it('renders a dashed line segment for skipped sessions', () => {
    const { container } = render(<ProgressGraph sessions={sessionsWithSkipped} />)
    const dashedPaths = container.querySelectorAll('line.skipped')
    expect(dashedPaths.length).toBeGreaterThan(0)
  })

  it('renders nothing useful with empty sessions', () => {
    const { container } = render(<ProgressGraph sessions={[]} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('circle.completed').length).toBe(0)
  })

  it('renders only a dashed segment when all completed points have skips between them', () => {
    const { container } = render(<ProgressGraph sessions={sessionsWithSkipped} />)
    const solidSegments = container.querySelectorAll('line.solid')
    const dashedSegments = container.querySelectorAll('line.skipped')
    expect(solidSegments.length).toBe(0)
    expect(dashedSegments.length).toBe(1)
  })

  it('renders solid and dashed segments for mixed case', () => {
    const mixedSessions = [
      { dogId: 'd1', trainingId: 't1', date: '2026-01-01', status: 'completed' as const, score: 5 },
      { dogId: 'd1', trainingId: 't1', date: '2026-01-02', status: 'completed' as const, score: 7 },
      { dogId: 'd1', trainingId: 't1', date: '2026-01-03', status: 'skipped' as const },
      { dogId: 'd1', trainingId: 't1', date: '2026-01-04', status: 'completed' as const, score: 9 }
    ]
    const { container } = render(<ProgressGraph sessions={mixedSessions} />)
    const solidSegments = container.querySelectorAll('line.solid')
    const dashedSegments = container.querySelectorAll('line.skipped')
    expect(solidSegments.length).toBe(1)
    expect(dashedSegments.length).toBe(1)
  })
})
