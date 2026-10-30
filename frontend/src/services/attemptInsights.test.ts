import { describe, expect, it } from 'vitest'
import { calculateAttemptInsights } from './attemptInsights'
import type { HistoryAttempt } from './attemptHistoryService'

const make = (percentage: number, subject: string, day: number): HistoryAttempt => ({
  attemptId: String(day).padStart(24, '0'),
  quizId: '507f1f77bcf86cd799439011',
  quizTitle: 'Sample quiz',
  subject,
  score: percentage,
  percentage,
  answersSubmitted: 10,
  submittedAt: `2026-10-${String(day).padStart(2, '0')}T10:00:00.000Z`
})

describe('calculateAttemptInsights', () => {
  it('returns a useful empty state', () => {
    expect(calculateAttemptInsights([])).toEqual({
      count: 0, averagePercentage: 0, bestPercentage: 0,
      latestPercentage: null, subjects: [], trend: []
    })
  })

  it('computes average, best, latest and subject summaries', () => {
    const result = calculateAttemptInsights([
      make(50, 'DBMS', 10), make(90, 'DBMS', 12), make(70, 'Networks', 11)
    ])
    expect(result.count).toBe(3)
    expect(result.averagePercentage).toBe(70)
    expect(result.bestPercentage).toBe(90)
    expect(result.latestPercentage).toBe(90)
    expect(result.subjects[0]).toEqual({
      subject: 'DBMS', attempts: 2, averagePercentage: 70, bestPercentage: 90
    })
  })

  it('shows the trend in chronological order', () => {
    const result = calculateAttemptInsights([make(90, 'DBMS', 12), make(40, 'DBMS', 10)])
    expect(result.trend.map(point => point.percentage)).toEqual([40, 90])
  })

  it('limits the displayed chart to 12 most recent dated attempts', () => {
    const attempts = Array.from({ length: 15 }, (_, i) => make(i + 10, 'DBMS', i + 1))
    expect(calculateAttemptInsights(attempts).trend).toHaveLength(12)
    expect(calculateAttemptInsights(attempts).trend[0]?.percentage).toBe(13)
  })

  it('groups missing subject under General', () => {
    const item = { ...make(85, 'DBMS', 10), subject: null }
    expect(calculateAttemptInsights([item]).subjects[0]?.subject).toBe('General')
  })
})
