export type AuthenticatedUser = { id: string; name: string; email: string; role: string }
type AuthResponse = { authenticatedUser: AuthenticatedUser; token?: string; expiresAt?: string }
const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000').replace(/\/$/, '')
let sessionToken: string | null = null
export const getSessionToken = () => sessionToken
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
  sessionToken = result.token ?? null
  return result
}
