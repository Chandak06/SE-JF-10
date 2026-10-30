import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import QuizResultPage from './QuizResultPage'
import type { AttemptResult } from '../services/attemptService'

const quizId = '507f1f77bcf86cd799439011'
const attemptId = '507f1f77bcf86cd799439099'
const result: AttemptResult = {
  attemptId,
  quizId,
  score: 7,
  total: 10,
  percentage: 70,
  correct: 7,
  incorrect: 2,
  unanswered: 1
}

function displayResult(state?: unknown, path = `/quizzes/${quizId}/results/${attemptId}`) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/quizzes/:id/results/:attemptId" element={<QuizResultPage />} />
      </Routes>
    </MemoryRouter>
  )
}

afterEach(() => cleanup())

describe('CSMQ-42: Quiz Result screen', () => {
  it('shows submitted-SAD answer feedback only in a matching successful result', () => {
    displayResult({ result: { ...result, resultId: attemptId, correctAnswers: [{ questionId: '507f1f77bcf86cd799439001', correctOptionId: 'B' }] } })
    expect(screen.getByRole('region', { name: 'Submitted quiz answer feedback' })).toBeTruthy()
    expect(screen.getByText('Correct option: B')).toBeTruthy()
  })
  it('renders trusted submission metrics and navigation', () => {
    displayResult({ result, title: 'Computer Science Practice Quiz' })

    expect(screen.getByRole('heading', { name: 'Quiz results' })).toBeTruthy()
    expect(screen.getByText('Computer Science Practice Quiz')).toBeTruthy()
    expect(screen.getByText('70%')).toBeTruthy()
    expect(screen.getByText('7 / 10 points')).toBeTruthy()
    expect(screen.getByText(attemptId)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Dashboard/i }).getAttribute('href')).toBe('/dashboard')
    expect(screen.getByRole('link', { name: /Explore more quizzes/i }).getAttribute('href')).toBe('/quizzes')
  })

  it('never exposes question answer keys', () => {
    displayResult({ result, title: 'Quiz', correctAnswer: 'SECRET_ANSWER' })
    expect(screen.queryByText('SECRET_ANSWER')).toBeNull()
    expect(screen.getByLabelText('7 correct, 2 incorrect, 1 unanswered')).toBeTruthy()
  })

  it('shows a safe empty state when navigated to directly', () => {
    displayResult()
    expect(screen.getByRole('heading', { name: 'Result unavailable' })).toBeTruthy()
    expect(screen.queryByText('70%')).toBeNull()
    expect(screen.getByRole('link', { name: 'Browse quizzes' })).toBeTruthy()
  })

  it('rejects a result that does not match the URL', () => {
    displayResult({ result }, `/quizzes/${quizId}/results/507f1f77bcf86cd799439022`)
    expect(screen.getByRole('heading', { name: 'Result unavailable' })).toBeTruthy()
  })

  it('does not display malformed or inflated scores', () => {
    displayResult({ result: { ...result, percentage: 500 } })
    expect(screen.getByRole('heading', { name: 'Result unavailable' })).toBeTruthy()
  })
})
