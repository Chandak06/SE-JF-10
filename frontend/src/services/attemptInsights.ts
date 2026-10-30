import type { HistoryAttempt } from './attemptHistoryService'

export interface SubjectInsight {
  subject: string
  attempts: number
  averagePercentage: number
  bestPercentage: number
}

export interface TrendPoint {
  id: string
  percentage: number
  label: string
}

export interface AttemptInsights {
  count: number
  averagePercentage: number
  bestPercentage: number
  latestPercentage: number | null
  subjects: SubjectInsight[]
  trend: TrendPoint[]
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10
}

function timestamp(item: HistoryAttempt): number {
  const time = item.submittedAt ? Date.parse(item.submittedAt) : NaN
  return Number.isFinite(time) ? time : 0
}

function percentage(item: HistoryAttempt): number {
  return Math.max(0, Math.min(100, item.percentage))
}

/** Calculates insights only from the attempts supplied by the caller. */
export function calculateAttemptInsights(
  attempts: readonly HistoryAttempt[]
): AttemptInsights {
  if (attempts.length === 0) {
    return {
      count: 0,
      averagePercentage: 0,
      bestPercentage: 0,
      latestPercentage: null,
      subjects: [],
      trend: []
    }
  }

  const newestFirst = [...attempts].sort((a, b) => timestamp(b) - timestamp(a))
  const total = attempts.reduce((sum, attempt) => sum + percentage(attempt), 0)
  const bySubject = new Map<string, number[]>()

  for (const attempt of attempts) {
    const subject = attempt.subject?.trim() || 'General'
    const values = bySubject.get(subject) ?? []
    values.push(percentage(attempt))
    bySubject.set(subject, values)
  }

  const subjects: SubjectInsight[] = [...bySubject.entries()]
    .map(([subject, values]) => ({
      subject,
      attempts: values.length,
      averagePercentage: rounded(values.reduce((sum, n) => sum + n, 0) / values.length),
      bestPercentage: Math.max(...values)
    }))
    .sort((a, b) => b.attempts - a.attempts || a.subject.localeCompare(b.subject))

  const trend: TrendPoint[] = newestFirst
    .filter(item => timestamp(item) > 0)
    .slice(0, 12)
    .reverse()
    .map((item, index) => ({
      id: item.attemptId,
      percentage: percentage(item),
      label: `${index + 1}`
    }))

  return {
    count: attempts.length,
    averagePercentage: rounded(total / attempts.length),
    bestPercentage: Math.max(...attempts.map(percentage)),
    latestPercentage: percentage(newestFirst[0]),
    subjects,
    trend
  }
}
