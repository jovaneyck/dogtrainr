import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

export interface Session {
  dogId: string
  trainingId: string
  date: string
  status: 'planned' | 'completed' | 'skipped'
  score?: number
}

interface ProgressGraphProps {
  sessions: Session[]
}

function ProgressGraph({ sessions }: ProgressGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ''

    const margin = { top: 20, right: 20, bottom: 40, left: 45 }
    const width = container.clientWidth || 400
    const height = 300

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    if (sessions.length === 0) return

    const parseDate = d3.timeParse('%Y-%m-%d')

    const dataPoints = sessions.map(s => ({
      date: parseDate(s.date)!,
      score: s.score ?? null,
      status: s.status
    }))

    const completedPoints = dataPoints.filter(d => d.status === 'completed' && d.score !== null)

    const xExtent = d3.extent(dataPoints, d => d.date) as [Date, Date]
    const x = d3.scaleTime()
      .domain(xExtent)
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([1, 10])
      .range([height - margin.bottom, margin.top])

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d') as any))

    // Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(10))

    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 10)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Score')

    // X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Date')

    // Draw solid line through completed points
    if (completedPoints.length > 1) {
      const line = d3.line<typeof completedPoints[0]>()
        .x(d => x(d.date))
        .y(d => y(d.score!))
        .curve(d3.curveMonotoneX)

      // Build segments, breaking at skipped sessions
      // Find consecutive completed runs, and draw dashed lines across skipped gaps
      const completedIndices = dataPoints
        .map((d, i) => ({ ...d, index: i }))
        .filter(d => d.status === 'completed')

      svg.append('path')
        .datum(completedPoints)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('d', line)
    }

    // Draw dashed lines for skipped gaps
    for (let i = 0; i < dataPoints.length; i++) {
      if (dataPoints[i].status === 'skipped') {
        // Find preceding completed
        let prev = null
        for (let j = i - 1; j >= 0; j--) {
          if (dataPoints[j].status === 'completed' && dataPoints[j].score !== null) {
            prev = dataPoints[j]
            break
          }
        }
        // Find following completed
        let next = null
        for (let j = i + 1; j < dataPoints.length; j++) {
          if (dataPoints[j].status === 'completed' && dataPoints[j].score !== null) {
            next = dataPoints[j]
            break
          }
        }
        if (prev && next) {
          svg.append('line')
            .attr('class', 'skipped')
            .attr('x1', x(prev.date))
            .attr('y1', y(prev.score!))
            .attr('x2', x(next.date))
            .attr('y2', y(next.score!))
            .attr('stroke', 'gray')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
        }
      }
    }

    // Draw dots for completed sessions
    svg.selectAll('circle.completed')
      .data(completedPoints)
      .enter()
      .append('circle')
      .attr('class', 'completed')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.score!))
      .attr('r', 5)
      .attr('fill', 'black')

  }, [sessions])

  return <div ref={containerRef} data-testid="progress-graph" />
}

export default ProgressGraph
