import { describe, expect, it } from 'vitest'
import { calculateAttemptInsights } from './attemptInsights'
import { createAttemptHistoryCsv } from './attemptHistoryCsv'
import type { HistoryAttempt } from './attemptHistoryService'

function attempt(
  id: number, subject: string | null, percentage: number, date: string
): HistoryAttempt {
  return {
    attemptId: String(id).padStart(24, '0'),
    quizId: '507f1f77bcf86cd799439011',
    quizTitle: 'Practice Quiz',
    subject,
    score: percentage,
    percentage,
    answersSubmitted: 10,
    submittedAt: date
  }
}

describe('CSMQ-45 / performance acceptance and export safety', () => {
  it('groups only provided student attempts by subject with correct averages', () => {
    const result = calculateAttemptInsights([
      attempt(1, 'DBMS', 40, '2026-10-01T10:00:00Z'),
      attempt(2, 'Networks', 80, '2026-10-02T10:00:00Z'),
      attempt(3, 'DBMS', 100, '2026-10-03T10:00:00Z')
    ])

    expect(result.count).toBe(3)
    expect(result.averagePercentage).toBe(73.3)
    expect(result.bestPercentage).toBe(100)
    expect(result.latestPercentage).toBe(100)
    expect(result.subjects).toEqual([
      { subject: 'DBMS', attempts: 2, averagePercentage: 70, bestPercentage: 100 },
      { subject: 'Networks', attempts: 1, averagePercentage: 80, bestPercentage: 80 }
    ])
    expect(result.trend.map(point => point.percentage)).toEqual([40, 80, 100])
  })

  it('does not mix attempts from different accounts when analyzing their separate API responses', () => {
    const firstStudent = calculateAttemptInsights([
      attempt(1, 'DBMS', 90, '2026-10-01T10:00:00Z')
    ])
    const secondStudent = calculateAttemptInsights([
      attempt(2, 'Networks', 20, '2026-10-02T10:00:00Z')
    ])
    expect(firstStudent.subjects.map(s => s.subject)).toEqual(['DBMS'])
    expect(secondStudent.subjects.map(s => s.subject)).toEqual(['Networks'])
    expect(secondStudent.averagePercentage).toBe(20)
  })

  it('handles empty performance and unknown subjects without fabricated scores', () => {
    expect(calculateAttemptInsights([])).toMatchObject({
      count: 0, bestPercentage: 0, latestPercentage: null, trend: [], subjects: []
    })
    expect(calculateAttemptInsights([
      attempt(1, null, 75, '2026-10-01T10:00:00Z')
    ]).subjects[0]?.subject).toBe('General')
  })

  it('protects exported CSV fields against spreadsheet formula execution', () => {
    const dangerous = {
      ...attempt(4, '=HYPERLINK("https://example.test")', 70, '2026-10-04T10:00:00Z'),
      quizTitle: '\t+SUM(1,1)'
    }
    const csv = createAttemptHistoryCsv([dangerous])
    expect(csv).toContain("'=HYPERLINK")
    expect(csv).toContain("'\t+SUM")
    expect(csv).not.toContain('"=HYPERLINK')
  })
})
