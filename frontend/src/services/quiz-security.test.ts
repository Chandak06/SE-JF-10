import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetchMock = vi.fn()
let auth: typeof import('./authService')
let quizzes: typeof import('./quizService')
const reply = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
async function login(token: string) {
  fetchMock.mockResolvedValueOnce(reply({ token, authenticatedUser: { id: token, name: 'Student', email: 'student@example.test', role: 'student' } }))
  await auth.login({ email: 'student@example.test', password: 'Disposable test password!' })
}
beforeEach(async () => {
  sessionStorage.clear(); vi.resetModules(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock)
  auth = await import('./authService'); quizzes = await import('./quizService')
})
afterEach(() => vi.unstubAllGlobals())
it('clears the expired session consistently when Quiz discovery returns 401', async () => {
  await login('old-token')
  fetchMock.mockResolvedValueOnce(reply({ error: { message: 'Authentication required.' } }, 401))
  await expect(quizzes.searchQuizzes()).rejects.toThrow('Authentication required.')
  expect(auth.getSessionToken()).toBeNull()
})
it('does not clear a newer login when an older Quiz request is rejected', async () => {
  await login('old-token')
  let rejectOld!: (value: unknown) => void
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { rejectOld = resolve }))
  const pending = quizzes.searchQuizzes()
  await login('new-token')
  rejectOld(reply({ error: { message: 'Authentication required.' } }, 401))
  await expect(pending).rejects.toThrow('Authentication required.')
  expect(auth.getSessionToken()).toBe('new-token')
})
