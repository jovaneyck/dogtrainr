import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TrainingPlanSchedule from './TrainingPlanSchedule'

describe('TrainingPlanSchedule', () => {
  const trainings = [
    { id: 't1', name: 'Sit' },
    { id: 't2', name: 'Down' }
  ]

  const schedule: Record<string, string[]> = {
    monday: ['t1', 't2'],
    tuesday: [],
    wednesday: ['t1'],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  }

  it('renders 7 capitalized day column headers', () => {
    render(
      <MemoryRouter>
        <TrainingPlanSchedule schedule={schedule} trainings={trainings} />
      </MemoryRouter>
    )

    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('Tuesday')).toBeInTheDocument()
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('Thursday')).toBeInTheDocument()
    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })

  it('renders training names in correct day columns', () => {
    render(
      <MemoryRouter>
        <TrainingPlanSchedule schedule={schedule} trainings={trainings} />
      </MemoryRouter>
    )

    const sitLink = screen.getAllByText('Sit')
    expect(sitLink).toHaveLength(2)
    expect(screen.getByText('Down')).toBeInTheDocument()
  })

  it('renders training names as links to /trainings/:id', () => {
    render(
      <MemoryRouter>
        <TrainingPlanSchedule schedule={schedule} trainings={trainings} />
      </MemoryRouter>
    )

    const sitLinks = screen.getAllByRole('link', { name: 'Sit' })
    expect(sitLinks).toHaveLength(2)
    expect(sitLinks[0]).toHaveAttribute('href', '/trainings/t1')

    const downLink = screen.getByRole('link', { name: 'Down' })
    expect(downLink).toHaveAttribute('href', '/trainings/t2')
  })

  it('falls back to raw ID when training not in list', () => {
    const scheduleWithUnknown: Record<string, string[]> = {
      monday: ['unknown-id'],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }

    render(
      <MemoryRouter>
        <TrainingPlanSchedule schedule={scheduleWithUnknown} trainings={trainings} />
      </MemoryRouter>
    )

    expect(screen.getByText('unknown-id')).toBeInTheDocument()
  })
})
