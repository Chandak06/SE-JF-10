import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizAttemptPage, { type QuizQuestion } from '../src/pages/QuizAttemptPage'
import { toStudentSafeQuizPayload } from '../../backend/src/questions/serializer'
import { evaluateQuiz } from '../../backend/src/attempts/evaluate'

const studentId = 'prototype-integration-student'
vi.mock('../src/services/authService', () => ({ getSessionUser: () => ({ id: 'prototype-integration-student', role: 'student' }) }))
const storedQuestions = [
  { id: '507f1f77bcf86cd799439011', questionText: 'Which protocol is reliable?', correctAnswer: 'B', options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }] },
  { id: '507f1f77bcf86cd799439012', questionText: 'Which structure is FIFO?', correctAnswer: 'A', options: [{ id: 'A', text: 'Queue' }, { id: 'B', text: 'Stack' }] },
  { id: '507f1f77bcf86cd799439013', questionText: 'Which method retrieves a resource?', correctAnswer: 'A', options: [{ id: 'A', text: 'GET' }, { id: 'B', text: 'POST' }] },
].map(question => ({ ...question, difficulty: 'Easy' as const, marks: 1, subject: 'CS', topic: 'Basics' }))

beforeEach(() => sessionStorage.clear())

it.each([
  { title: 'mixed correct, incorrect and unanswered selections', choices: ['TCP', 'Stack'], expected: { score: 1, total: 3, percentage: 33.33, correct: 1, incorrect: 1, unanswered: 1 } },
  { title: 'all correct selections', choices: ['TCP', 'Queue', 'GET'], expected: { score: 3, total: 3, percentage: 100, correct: 3, incorrect: 0, unanswered: 0 } },
])('IT-M3-02/03: renders Member 2 payload and evaluates $title from the actual UI', async ({ choices, expected }) => {
  const user = userEvent.setup()
  const payload = toStudentSafeQuizPayload(storedQuestions)
  expect(JSON.stringify(payload)).not.toContain('correctAnswer')
  // These fixtures provide every classification field; pass the serializer output unchanged.
  render(<QuizAttemptPage questions={payload.questions as QuizQuestion[]} />)
  expect(screen.getByRole('heading', { name: storedQuestions[0].questionText })).toBeInTheDocument()
  for (const [index, choice] of choices.entries()) {
    if (index) await user.click(screen.getByRole('button', { name: /Next/ }))
    await user.click(screen.getByRole('radio', { name: new RegExp(choice) }))
  }
  const selected = JSON.parse(sessionStorage.getItem('study-commons-quiz-responses:' + studentId)!) as Record<string, string>
  const responses = Object.entries(selected).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }))
  expect(responses).toHaveLength(choices.length)
  expect(responses.map(response => response.questionId)).toEqual(storedQuestions.slice(0, choices.length).map(question => question.id))
  const trustedAnswers = storedQuestions.map(question => ({ id: question.id, correctOptionId: question.correctAnswer }))
  expect(evaluateQuiz(trustedAnswers, responses)).toEqual(expected)
  await user.click(screen.getByRole('button', { name: 'Submit quiz', exact: true }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz', exact: true }))
  expect(screen.getByRole('button', { name: 'Quiz submitted' })).toBeDisabled()
  expect(sessionStorage.getItem('study-commons-quiz-responses:' + studentId)).toBeNull()
})
