import { beforeEach, afterEach, expect, it, vi } from 'vitest'
let auth: typeof import('./authService')
const fetchMock = vi.fn()
const student = { id: 'user-1', name: 'Student', email: 'student@example.com', role: 'student' }
const file = new File(['PDF bytes'], 'notes.pdf', { type: 'application/pdf' })
const input = { title: 'Notes', subject: 'SE', description: 'Sprint notes', file }
const reply = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
beforeEach(async () => { sessionStorage.clear(); vi.resetModules(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); auth = await import('./authService') })
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
it('restores only a token after refresh and obtains the current role from the server', async () => {
  await signIn()
  expect(sessionStorage.getItem('study-commons-session-token')).toBe('test-token')
  vi.resetModules()
  const restored = await import('./authService')
  fetchMock.mockResolvedValueOnce(reply({ authenticatedUser: { ...student, role: 'admin' } }))
  await restored.restoreSession()
  expect(restored.getSessionUser()?.role).toBe('admin')
  expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/auth\/me$/)
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token')
  expect([...Array(sessionStorage.length)].map((_, i) => sessionStorage.key(i))).toEqual(['study-commons-session-token'])
})
it.each([401, 503])('fails closed on rejected restoration and clears stored credentials (%s)', async status => {
  sessionStorage.setItem('study-commons-session-token', 'expired-token')
  fetchMock.mockResolvedValueOnce(reply({}, status))
  await auth.restoreSession()
  expect(auth.getSessionToken()).toBeNull()
  expect(auth.getSessionUser()).toBeNull()
  expect(auth.hasStoredSession()).toBe(false)
})
it('fails closed on offline restoration', async () => {
  sessionStorage.setItem('study-commons-session-token', 'saved-token')
  fetchMock.mockRejectedValueOnce(new Error('offline'))
  await auth.restoreSession()
  expect(auth.getSessionToken()).toBeNull()
  expect(auth.hasStoredSession()).toBe(false)
})
it('deduplicates restoration and does not resurrect a session after logout during restoration', async () => {
  sessionStorage.setItem('study-commons-session-token', 'saved-token')
  let resolve!: (value: ReturnType<typeof reply>) => void
  fetchMock.mockReturnValueOnce(new Promise(done => { resolve = done }))
  const first = auth.restoreSession(); const second = auth.restoreSession()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  fetchMock.mockResolvedValueOnce(reply(null, 204))
  await auth.logout()
  resolve(reply({ authenticatedUser: student }))
  await Promise.all([first, second])
  expect(auth.getSessionToken()).toBeNull()
  expect(auth.hasStoredSession()).toBe(false)
})
it('retains in-memory login if browser session storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  await signIn()
  expect(auth.getSessionUser()?.role).toBe('student')
  expect(auth.getSessionToken()).toBe('test-token')
  vi.restoreAllMocks()
})

it('preserves pagination metadata and sends the search, cursor and abort signal', async () => {
  await signIn()
  const cursor = '000000000000000000000019'
  const nextCursor = '000000000000000000000001'
  const page = { materials: [{ id: 'material-26', title: 'Notes' }], nextCursor }
  fetchMock.mockResolvedValueOnce(reply(page))
  const controller = new AbortController()
  await expect(auth.searchMaterials('  A & B  ', cursor, controller.signal)).resolves.toEqual(page)
  const [url, options] = fetchMock.mock.calls[1]
  expect(new URL(url).searchParams.get('q')).toBe('A & B')
  expect(new URL(url).searchParams.get('cursor')).toBe(cursor)
  expect(options.signal).toBe(controller.signal)
  expect(options.headers.Authorization).toBe('Bearer test-token')
})

it('rejects malformed pagination responses instead of silently losing the cursor', async () => {
  await signIn()
  for (const body of [{ materials: [], nextCursor: 'invalid' }, { materials: null, nextCursor: null }]) {
    fetchMock.mockResolvedValueOnce(reply(body))
    await expect(auth.searchMaterials('')).rejects.toThrow('unexpected response')
  }
  fetchMock.mockResolvedValueOnce(reply({ materials: [], nextCursor: null }))
  await expect(auth.searchMaterials('')).resolves.toEqual({ materials: [], nextCursor: null })
})

it('loads validated available material subjects using the authenticated endpoint', async () => {
  await signIn()
  fetchMock.mockResolvedValueOnce(reply({ subjects: ['Computer Science', 'Mathematics'] }))
  await expect(auth.getMaterialSubjects()).resolves.toEqual(['Computer Science', 'Mathematics'])
  expect(fetchMock.mock.calls[1][0]).toContain('/api/materials/subjects')
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token')
  fetchMock.mockResolvedValueOnce(reply({ subjects: ['CS', 42] }))
  await expect(auth.getMaterialSubjects()).rejects.toThrow('unexpected subject list')
})

it('requests inline and attachment PDFs through the authenticated material endpoint', async () => {
  await signIn()
  const pdf = new Blob(['PDF bytes'], { type: 'application/pdf' })
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => pdf })
  await expect(auth.materialFile('material-1', 'inline')).resolves.toBe(pdf)
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, blob: async () => pdf })
  await expect(auth.materialFile('material-1')).resolves.toBe(pdf)
  expect(fetchMock.mock.calls[1][0]).toContain('/api/materials/material-1/file?disposition=inline')
  expect(fetchMock.mock.calls[2][0]).toContain('/api/materials/material-1/file?disposition=attachment')
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token')
  expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer test-token')
})
