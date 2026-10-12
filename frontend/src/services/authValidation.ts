export type RegistrationErrors = { name?: string; email?: string; password?: string }
export function validateRegistration(name: string, email: string, password: string): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const cleanName = name.trim()
  if (!cleanName) errors.name = 'Enter your name.'
  // eslint-disable-next-line no-control-regex -- Mirrors the backend's rejected control-character range.
  else if (cleanName.length > 100 || /[<>\x00-\x1f\x7f]/.test(cleanName)) errors.name = 'Name must contain 1 to 100 characters and cannot contain angle brackets or control characters.'
  if (!email.trim()) errors.email = 'Enter your email address.'
  else if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Enter a password.'
  else if (password.length < 12 || new TextEncoder().encode(password).length > 72 || password.includes('\0')) errors.password = 'Use at least 12 characters and no more than 72 bytes in UTF 8.'
  return errors
}
export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {}
  if (!email.trim()) errors.email = 'Enter your email address.'
  else if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Enter your password.'
  else if (password.length < 12 || new TextEncoder().encode(password).length > 72 || password.includes('\0')) errors.password = 'Check your password; it must meet the account password requirements.'
  return errors
}
