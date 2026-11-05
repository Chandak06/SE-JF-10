import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import QuizAttemptPage from './QuizAttemptPage'
import { getSessionToken, getSessionUser, login, logout } from '../services/authService'

const fetchMock = vi.fn()
const quizId = '507f1f77bcf86cd799439011'
const questionId = '507f191e810c19729de860ea'
const owner = '507f1f77bcf86cd799439001'
const draft = `study-commons-quiz-responses:${owner}:${quizId}`
beforeEach(async () => {
  sessionStorage.clear()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ token: 'fixture-token', authenticatedUser: {
    id: owner, name: 'Session fixture', email: 'fixture@example.test', role: 'student'
  } }) })
  await login({ email: 'fixture@example.test', password: 'Disposable test password!' })
})
afterEach(async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, status: 204 })
  await logout()
  vi.unstubAllGlobals()
})
it('keeps the quiz and original user draft available when submission expires the session', async () => {
  render(<QuizAttemptPage quizId={quizId} questions={[{
    id: questionId, questionText: 'Which protocol is reliable?', options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }]
  }]} />)
  fireEvent.click(screen.getByRole('radio', { name: /TCP/ }))
  fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { message: 'Expired' } }) })
  fireEvent.click(screen.getByRole('button', { name: 'Submit quiz' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('session has expired')
  expect(getSessionToken()).toBeNull()
  expect(getSessionUser()).toBeNull()
  expect(screen.getByRole('radio', { name: /TCP/ })).toHaveAttribute('aria-checked', 'true')
  expect(JSON.parse(sessionStorage.getItem(draft)!)).toEqual({ [questionId]: 'B' })
  const calls = fetchMock.mock.calls.length
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('session')
  expect(fetchMock).toHaveBeenCalledTimes(calls)
})
it('does not submit or reassign a draft after a different account logs in', async () => {
  render(<QuizAttemptPage quizId={quizId} questions={[{
    id: questionId, questionText: 'Which protocol is reliable?', options: [{ id: 'A', text: 'UDP' }, { id: 'B', text: 'TCP' }]
  }]} />)
  fireEvent.click(screen.getByRole('radio', { name: /TCP/ }))
  const other = '507f1f77bcf86cd799439002'
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ token: 'other-fixture-token', authenticatedUser: {
    id: other, name: 'Other fixture', email: 'other@example.test', role: 'student'
  } }) })
  await login({ email: 'other@example.test', password: 'Disposable test password!' })
  const calls = fetchMock.mock.calls.length
  fireEvent.click(screen.getByRole('button', { name: 'Submit quiz' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit quiz' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('session has changed')
  expect(fetchMock).toHaveBeenCalledTimes(calls)
  expect(JSON.parse(sessionStorage.getItem(draft)!)).toEqual({ [questionId]: 'B' })
  expect(sessionStorage.getItem(`study-commons-quiz-responses:${other}:${quizId}`)).toBeNull()
})
