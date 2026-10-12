import { test, expect } from '@playwright/test'
import type { Server } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Connection } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { PDFDocument } from 'pdf-lib'
import { createServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { connectDatabase } from '../../backend/src/db.js'
import { loadConfig } from '../../backend/src/config.js'
import { createRuntime } from '../../backend/src/runtime.js'

let mongo: MongoMemoryServer
let connection: Connection
let backend: Server
let frontend: ViteDevServer
let url: string
let runtime: Awaited<ReturnType<typeof createRuntime>>
test.beforeAll(async () => {
  test.setTimeout(180000)
  mongo = await MongoMemoryServer.create({ binary: { downloadDir: process.env.MONGOMS_DOWNLOAD_DIR ?? fileURLToPath(new URL('../../node_modules/.cache/mongodb-memory-server', import.meta.url)) }, instance: { launchTimeout: 60000 } })
  connection = await connectDatabase(mongo.getUri())
  runtime = await createRuntime(connection, loadConfig({ NODE_ENV: 'test', MONGODB_URI: mongo.getUri(), BCRYPT_ROUNDS: '10' }), { authLimit: 500 })
  backend = runtime.app.listen(0, '127.0.0.1')
  await new Promise<void>(resolve => backend.once('listening', resolve))
  const address = backend.address()
  if (!address || typeof address === 'string') throw new Error('Listener unavailable')
  frontend = await createServer({ configFile: false, root: fileURLToPath(new URL('../', import.meta.url)), plugins: [react()],
    define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') },
    server: { host: '127.0.0.1', port: 0, proxy: { '/api': { target: 'http://127.0.0.1:' + address.port, changeOrigin: true } } } })
  await frontend.listen()
  const web = frontend.httpServer?.address()
  if (!web || typeof web === 'string') throw new Error('Frontend unavailable')
  url = 'http://127.0.0.1:' + web.port
})
test.afterAll(async () => {
  await frontend?.close()
  if (backend) await new Promise<void>(resolve => backend.close(() => resolve()))
  await connection?.close(); await mongo?.stop()
})
test('student uploads, administrator confirms removal and removed content cannot be downloaded', async ({ page }) => {
  await page.goto(url + '/register')
  await page.getByLabel('Name', { exact: true }).fill('Browser Student')
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Browser test password!')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Account created')
  await page.getByRole('link', { name: 'Log in', exact: true }).last().click()
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Browser test password!')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('You’re signed in')
  await page.getByRole('link', { name: 'Share a PDF or log out' }).click()
  await page.getByLabel('Title', { exact: true }).fill('Browser notes')
  await page.getByLabel('Subject', { exact: true }).fill('SE')
  await page.getByLabel('Description', { exact: true }).fill('Browser regression')
  const document = await PDFDocument.create(); document.addPage()
  await page.getByLabel('PDF file').setInputFiles({ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await document.save()) })
  await page.getByRole('button', { name: 'Upload PDF' }).click()
  await expect(page.getByRole('status')).toContainText('Your PDF has been uploaded.')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download Browser notes' }).click()
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.pdf$/)
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  // Promotion applies only to this isolated test database, never the user's Atlas account.
  await runtime.accounts.User.updateOne({ email: 'browser@example.com' }, { role: 'admin' })
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Browser test password!')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('You’re signed in')
  await page.getByRole('link', { name: 'Content moderation' }).click()
  await page.getByRole('button', { name: 'Remove Browser notes' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Remove Browser notes' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove Browser notes' }).click()
  await page.getByRole('button', { name: 'Confirm removal' }).click()
  await expect(page.getByRole('status')).toContainText('Resource removed.')
  await page.getByRole('link', { name: 'Study materials' }).click()
  await expect(page.getByText('No study materials found.')).toBeVisible()
})
