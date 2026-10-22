// @vitest-environment node
import { beforeAll, afterAll, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Connection } from 'mongoose'
import { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { PDFDocument } from 'pdf-lib'
import { connectDatabase } from '../../backend/src/db.js'
import { loadConfig } from '../../backend/src/config.js'
import { createRuntime } from '../../backend/src/runtime.js'

let mongo: MongoMemoryServer
let connection: Connection
let server: Server
let url: string
let client: typeof import('../src/services/authService')
let runtime: Awaited<ReturnType<typeof createRuntime>>
const student = { name: 'Client Integration Student', email: 'client@example.com', password: 'Client integration password!' }

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    binary: { downloadDir: process.env.MONGOMS_DOWNLOAD_DIR ?? fileURLToPath(new URL('../../node_modules/.cache/mongodb-memory-server', import.meta.url)) },
    instance: { launchTimeout: 60000 }
  })
  connection = await connectDatabase(mongo.getUri())
  runtime = await createRuntime(connection, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri(), BCRYPT_ROUNDS: '10' }), { authLimit: 500 })
  server = runtime.app.listen(0, '127.0.0.1')
  await new Promise<void>(resolve => server.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test listener unavailable')
  url = 'http://127.0.0.1:' + address.port
  vi.stubEnv('VITE_API_BASE_URL', url)
  client = await import('../src/services/authService')
}, 180000)

afterAll(async () => {
  vi.unstubAllEnvs()
  if (server) await new Promise<void>(resolve => server.close(() => resolve()))
  await connection?.close(); await mongo?.stop()
})

it('connects the actual frontend client to registration, login, PDF storage and revoking logout', async () => {
  const registered = await client.register(student)
  expect(registered.authenticatedUser.email).toBe(student.email)
  expect(registered.authenticatedUser).not.toHaveProperty('passwordHash')
  await expect(client.login({ email: student.email, password: 'Incorrect password!' })).rejects.toThrow('Invalid email or password')
  await client.login({ email: student.email, password: student.password })
  const token = client.getSessionToken()
  const pdf = await PDFDocument.create(); pdf.addPage()
  const bytes = await pdf.save()
  const file = new File([new Uint8Array(bytes)], 'notes.pdf', { type: 'application/pdf' })
  const material = await client.uploadMaterial({ title: 'Notes', subject: 'SE', description: 'Integration notes', file })
  const saved = await runtime.materials.Material.findById(material.id)
  expect(saved?.uploadedBy.toString()).toBe(registered.authenticatedUser.id)
  expect(await connection.collection('materialFiles.files').countDocuments()).toBe(1)
  await client.logout()
  expect(client.getSessionToken()).toBeNull()
  expect((await fetch(url + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })).status).toBe(401)
  await expect(client.uploadMaterial({ title: 'Notes', subject: 'SE', description: 'Notes', file })).rejects.toThrow('Please log in')
}, 30000)

it('rejects an anonymous real multipart upload before storing bytes', async () => {
  const body = new FormData(); body.set('file', new File(['invalid'], 'notes.pdf', { type: 'application/pdf' }))
  const response = await fetch(url + '/api/materials', { method: 'POST', body })
  expect(response.status).toBe(401)
  expect(await connection.collection('materialFiles.files').countDocuments()).toBe(1)
})

it('retrieves all 26 matching materials through the real paginated client and backend', async () => {
  await client.login({ email: student.email, password: student.password })
  const user = await runtime.accounts.User.findOne({ email: student.email })
  await runtime.materials.Material.insertMany(Array.from({ length: 26 }, () => ({
    title: 'Pagination notes', subject: 'SE', description: 'Cursor integration',
    uploadedBy: user!._id, fileId: new Types.ObjectId(), size: 100
  })))
  const first = await client.searchMaterials('Pagination notes')
  expect(first.materials).toHaveLength(25)
  expect(first.nextCursor).toMatch(/^[a-f\d]{24}$/)
  const second = await client.searchMaterials('Pagination notes', first.nextCursor!)
  expect(second.materials).toHaveLength(1)
  expect(second.nextCursor).toBeNull()
  expect(new Set([...first.materials, ...second.materials].map(material => material.id)).size).toBe(26)
  await client.logout()
})
