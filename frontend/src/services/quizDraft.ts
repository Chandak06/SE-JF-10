type Question = { id: string; options: { id: string }[] }
export function readQuizDraft(storage: Pick<Storage, 'getItem'>, key: string, questions: Question[]): Record<string, string> {
  try {
    const raw: unknown = JSON.parse(storage.getItem(key) ?? '{}')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const saved = raw as Record<string, unknown>
    return Object.fromEntries(questions.flatMap(question => {
      const choice = saved[question.id]
      return typeof choice === 'string' && question.options.some(option => option.id === choice) ? [[question.id, choice]] : []
    }))
  } catch { return {} }
}
