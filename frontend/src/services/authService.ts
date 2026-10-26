export type AuthenticatedUser = { id: string; name: string; email: string; role: string }
type AuthResponse = { authenticatedUser: AuthenticatedUser; token?: string; expiresAt?: string }
const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000').replace(/\/$/, '')
let sessionToken: string | null = null
let sessionUser: AuthenticatedUser | null = null
const sessionKey = 'study-commons-session-token'
let sessionVersion = 0
let restoring: Promise<void> | null = null
function storedToken() {
  try { return sessionStorage.getItem(sessionKey) } catch { return null }
}
function saveToken(token: string | null) {
  try { if (token) sessionStorage.setItem(sessionKey, token); else sessionStorage.removeItem(sessionKey) } catch { /* Login still works in memory if storage is disabled. */ }
}
function clearSession() { sessionVersion++; sessionToken = null; sessionUser = null; saveToken(null) }
export const hasStoredSession = () => !!storedToken()
export function restoreSession(): Promise<void> {
  if (sessionToken && sessionUser) return Promise.resolve()
  if (restoring) return restoring
  const token = storedToken()
  if (!token) return Promise.resolve()
  const version = sessionVersion
  restoring = (async () => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000)
      })
      const result = await response.json() as AuthResponse
      const user = result.authenticatedUser
      if (!response.ok || !user || !['student', 'admin'].includes(user.role)
        || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') throw new Error('Invalid session')
      // Role comes from the current server account; never restore a browser-stored role.
      if (version === sessionVersion) { sessionToken = token; sessionUser = user }
    } catch { if (version === sessionVersion) clearSession() }
  })().finally(() => { restoring = null })
  return restoring
}
export const getSessionToken = () => sessionToken
export const getSessionUser = () => sessionUser
async function request(path: string, body: unknown): Promise<AuthResponse> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch { throw new Error('Unable to reach the server. Check your connection and try again.') }
  const result = await response.json().catch(() => ({})) as { authenticatedUser?: AuthenticatedUser; error?: { message?: string }; message?: string }
  if (!response.ok) {
    const message = response.status === 409 ? 'An account with this email already exists.' : result.error?.message ?? result.message ?? 'Something went wrong. Please try again.'
    throw new Error(message)
  }
  if (!result.authenticatedUser) throw new Error('The server returned an unexpected response.')
  return result as AuthResponse
}
export const register = (input: { name: string; email: string; password: string }) => request('register', input)
export async function login(input: { email: string; password: string }) {
  const result = await request('login', input)
  if (!result.token) throw new Error('The server returned an unexpected response.')
  sessionToken = result.token
  sessionUser = result.authenticatedUser
  sessionVersion++
  saveToken(result.token)
  return result
}
export async function logout() {
  const token = sessionToken ?? storedToken()
  if (!token) { clearSession(); return }
  const response = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok && response.status !== 401) throw new Error('Unable to log out. Try again.')
  clearSession()
}
export async function uploadMaterial(input: { title: string; subject: string; description: string; file: File }) {
  if (!sessionToken) throw new Error('Please log in before uploading.')
  const body = new FormData()
  body.set('title', input.title); body.set('subject', input.subject); body.set('description', input.description); body.set('file', input.file)
  const response = await fetch(`${baseUrl}/api/materials`, { method: 'POST', headers: { Authorization: `Bearer ${sessionToken}` }, body })
  const result = await response.json().catch(() => ({})) as { material?: { id: string }; error?: { message?: string } }
  if (response.status === 401) clearSession()
  if (!response.ok) throw new Error(result.error?.message ?? 'Upload failed. Please try again.')
  if (!result.material?.id) throw new Error('The server returned an unexpected response.')
  return result.material
}

export type StudyMaterial = { id: string; title: string; subject: string; description: string; size: number; createdAt: string }
export async function listMaterials(): Promise<StudyMaterial[]> {
  if (!sessionToken) throw new Error('Please log in to view materials.')
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/materials`, { headers: { Authorization: `Bearer ${sessionToken}` } })
  } catch { throw new Error('Unable to reach the server. Check your connection and try again.') }
  const result = await response.json().catch(() => ({})) as { materials?: StudyMaterial[]; error?: { message?: string } }
  if (response.status === 401) clearSession()
  if (!response.ok) throw new Error(result.error?.message ?? 'Unable to load materials. Please try again.')
  if (!Array.isArray(result.materials)) throw new Error('The server returned an unexpected response.')
  return result.materials
}
