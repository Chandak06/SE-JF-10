import type { HistoryAttempt } from './attemptHistoryService'

const header = [
  'Quiz title', 'Subject', 'Score', 'Percentage',
  'Answers submitted', 'Completed at (UTC)', 'Attempt ID', 'Quiz ID'
]

function safeCell(value: string | number | null): string {
  // Quoting alone does not prevent spreadsheet formula execution.
  // Prefix potentially executable cells before CSV escaping.
  const input = String(value ?? '')
  const firstSignificant = Array.from(input).find(char => char.charCodeAt(0) > 32) ?? ''
  const guarded = ['=', '+', '-', '@'].includes(firstSignificant) ? `'${input}` : input
  return `"${guarded.replace(/"/g, '""')}"`
}

export function createAttemptHistoryCsv(attempts: readonly HistoryAttempt[]): string {
  const rows = attempts.map(item => [
    item.quizTitle,
    item.subject ?? 'General',
    item.score,
    item.percentage,
    item.answersSubmitted,
    item.submittedAt ?? '',
    item.attemptId,
    item.quizId
  ])

  return `\uFEFF${[header, ...rows].map(row => row.map(safeCell).join(',')).join('\r\n')}\r\n`
}

export function downloadAttemptHistoryCsv(attempts: readonly HistoryAttempt[]): void {
  if (!attempts.length) return
  const blob = new Blob([createAttemptHistoryCsv(attempts)], {
    type: 'text/csv;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'quiz-attempt-insights.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
