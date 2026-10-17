import { describe, expect, it } from 'vitest'

import {
  evaluateQuiz,
  type EvaluationQuestion,
  type SubmittedResponse
} from '../../src/attempts/evaluate.js'

const questions: EvaluationQuestion[] = [
  { id: 'q1', correctOptionId: 'B' },
  { id: 'q2', correctOptionId: 'A' },
  { id: 'q3', correctOptionId: 'D' },
  { id: 'q4', correctOptionId: 'C' }
]

describe('evaluateQuiz', () => {
  it('returns full score when all answers are correct', () => {
    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: 'B' },
      { questionId: 'q2', selectedOptionId: 'A' },
      { questionId: 'q3', selectedOptionId: 'D' },
      { questionId: 'q4', selectedOptionId: 'C' }
    ]

    expect(evaluateQuiz(questions, responses)).toEqual({
      score: 4,
      total: 4,
      percentage: 100,
      correct: 4,
      incorrect: 0,
      unanswered: 0
    })
  })

  it('returns zero score when all answers are incorrect', () => {
    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: 'A' },
      { questionId: 'q2', selectedOptionId: 'B' },
      { questionId: 'q3', selectedOptionId: 'C' },
      { questionId: 'q4', selectedOptionId: 'D' }
    ]

    expect(evaluateQuiz(questions, responses)).toEqual({
      score: 0,
      total: 4,
      percentage: 0,
      correct: 0,
      incorrect: 4,
      unanswered: 0
    })
  })

  it('calculates the exact score for mixed answers', () => {
    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: 'B' },
      { questionId: 'q2', selectedOptionId: 'C' },
      { questionId: 'q3', selectedOptionId: 'D' },
      { questionId: 'q4', selectedOptionId: 'A' }
    ]

    expect(evaluateQuiz(questions, responses)).toEqual({
      score: 2,
      total: 4,
      percentage: 50,
      correct: 2,
      incorrect: 2,
      unanswered: 0
    })
  })

  it('handles unanswered questions without crashing', () => {
    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: 'B' },
      { questionId: 'q3', selectedOptionId: 'A' }
    ]

    expect(evaluateQuiz(questions, responses)).toEqual({
      score: 1,
      total: 4,
      percentage: 25,
      correct: 1,
      incorrect: 1,
      unanswered: 2
    })
  })

  it('treats an empty selected option as unanswered', () => {
    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: '' }
    ]

    expect(evaluateQuiz(questions, responses)).toEqual({
      score: 0,
      total: 4,
      percentage: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 4
    })
  })

  it('rounds percentage to two decimal places', () => {
    const threeQuestions: EvaluationQuestion[] = [
      { id: 'q1', correctOptionId: 'A' },
      { id: 'q2', correctOptionId: 'B' },
      { id: 'q3', correctOptionId: 'C' }
    ]

    const responses: SubmittedResponse[] = [
      { questionId: 'q1', selectedOptionId: 'A' }
    ]

    expect(evaluateQuiz(threeQuestions, responses).percentage).toBe(33.33)
  })

  it('handles an empty quiz safely', () => {
    expect(evaluateQuiz([], [])).toEqual({
      score: 0,
      total: 0,
      percentage: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0
    })
  })
})