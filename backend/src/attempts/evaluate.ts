export interface EvaluationQuestion {
  id: string
  correctOptionId: string
}

export interface SubmittedResponse {
  questionId: string
  selectedOptionId: string
}

export interface EvaluationResult {
  score: number
  total: number
  percentage: number
  correct: number
  incorrect: number
  unanswered: number
}

export function evaluateQuiz(
  questions: EvaluationQuestion[],
  responses: SubmittedResponse[]
): EvaluationResult {
  const responseMap = new Map(
    responses.map(response => [
      response.questionId,
      response.selectedOptionId
    ])
  )

  let correct = 0
  let incorrect = 0
  let unanswered = 0

  for (const question of questions) {
    const selectedOption = responseMap.get(question.id)

    if (selectedOption === undefined || selectedOption === '') {
      unanswered += 1
      continue
    }

    if (selectedOption === question.correctOptionId) {
      correct += 1
    } else {
      incorrect += 1
    }
  }

  const total = questions.length
  const score = correct

  const percentage =
    total === 0
      ? 0
      : Number(((score / total) * 100).toFixed(2))

  return {
    score,
    total,
    percentage,
    correct,
    incorrect,
    unanswered
  }
}