import { describe, expect, it } from 'vitest'
import { createAttemptHistoryCsv } from './attemptHistoryCsv'
import type { HistoryAttempt } from './attemptHistoryService'

const sample: HistoryAttempt = {
  attemptId: '507f1f77bcf86cd799439021',
  quizId: '507f1f77bcf86cd799439011',
  quizTitle: 'Networks, "Advanced"',
  subject: 'Computer Science',
  score: 8,
  percentage: 80,
  answersSubmitted: 10,
  submittedAt: '2026-10-30T10:00:00.000Z'
}

describe('createAttemptHistoryCsv', () => {
  it('includes column headers and the actual saved scores', () => {
    const csv = createAttemptHistoryCsv([sample])
    expect(csv).toContain('"Percentage"')
    expect(csv).toContain('"80"')
    expect(csv).toContain('"2026-10-30T10:00:00.000Z"')
  })

  it('escapes comma and double quotes', () => {
    expect(createAttemptHistoryCsv([sample])).toContain('"Networks, ""Advanced"""')
  })

  it('prevents spreadsheet formulas from executing on import', () => {
    const csv = createAttemptHistoryCsv([{ ...sample, quizTitle: '=1+2', subject: '  +cmd' }])
    expect(csv).toContain('"\'=1+2"')
    expect(csv).toContain('"\'  +cmd"')
  })

  it('includes headers even with no attempts', () => {
    const csv = createAttemptHistoryCsv([])
    expect(csv).toContain('"Attempt ID"')
    expect(csv.trim().split('\r\n')).toHaveLength(1)
  })
})
