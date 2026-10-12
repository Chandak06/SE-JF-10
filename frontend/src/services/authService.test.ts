import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let auth: typeof import('./authService')
const fetchMock = vi.fn()
const student = { id: 'user-1', name: 'Student', email: 'student@example.com', role: 'student' }
const file = new File(['PDF bytes'], 'notes.pdf', { type: 'application/pdf' })
const input = { title: 'Notes', subject: 'SE', description: 'Sprint notes', file }
const reply = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
beforeEach(async () => { vi.resetModules(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); auth = await import('./authService') })
afterEach(() => vi.unstubAllGlobals())
async function signIn() {
  fetchMock.mockResolvedValueOnce(reply({ authenticatedUser: student, token: 'test-token' }))
  await auth.login({ email: student.email, password: 'ExamplePassword123!' })
}
it('registers without creating a client session', async () => {
  fetchMock.mockResolvedValueOnce(reply({ authenticatedUser: student }, 201))
  await auth.register({ name: student.name, email: student.email, password: 'ExamplePassword123!' })
  expect(auth.getSessionToken()).toBeNull()
})
it('sends the session in a header and multipart data without setting a false content type', async () => {
  await signIn(); fetchMock.mockResolvedValueOnce(reply({ material: { id: 'material-1' } }, 201))
  await expect(auth.uploadMaterial(input)).resolves.toEqual({ id: 'material-1' })
  const [, options] = fetchMock.mock.calls[1]
  expect(options.headers).toEqual({ Authorization: 'Bearer test-token' })
  expect(options.body.get('file')).toBe(file)
  expect(options.body.get('title')).toBe('Notes')
})
it('invalidates locally after server logout and refuses further upload', async () => {
  await signIn(); fetchMock.mockResolvedValueOnce(reply(null, 204)); await auth.logout()
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token')
  expect(auth.getSessionToken()).toBeNull()
  await expect(auth.uploadMaterial(input)).rejects.toThrow('Please log in')
  expect(fetchMock).toHaveBeenCalledTimes(2)
})
it('clears expired authentication on protected-route rejection', async () => {
  await signIn(); fetchMock.mockResolvedValueOnce(reply({ error: { message: 'Authentication required.' } }, 401))
  await expect(auth.uploadMaterial(input)).rejects.toThrow('Authentication required.')
  expect(auth.getSessionToken()).toBeNull()
})
it('keeps the session when the logout request fails so revocation can be retried', async () => {
  await signIn(); fetchMock.mockResolvedValueOnce(reply({}, 500))
  await expect(auth.logout()).rejects.toThrow('Unable to log out')
  expect(auth.getSessionToken()).toBe('test-token')
})
it('rejects an incomplete login response and shows controlled login errors', async () => {
  fetchMock.mockResolvedValueOnce(reply({ authenticatedUser: student }))
  await expect(auth.login({ email: student.email, password: 'ExamplePassword123!' })).rejects.toThrow('unexpected response')
  expect(auth.getSessionToken()).toBeNull()
  fetchMock.mockResolvedValueOnce(reply({ error: { message: 'Invalid email or password.' } }, 401))
  await expect(auth.login({ email: student.email, password: 'ExamplePassword123!' })).rejects.toThrow('Invalid email or password.')
})
