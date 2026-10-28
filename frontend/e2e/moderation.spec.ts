import { test, expect } from '@playwright/test'
import type { Server } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Connection } from 'mongoose'
import { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { PDFDocument } from 'pdf-lib'
import { createServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { connectDatabase } from '../../backend/src/db.js'
import { loadConfig } from '../../backend/src/config.js'
import { createRuntime } from '../../backend/src/runtime.js'
import { provisionAdmin } from '../../backend/src/security/provision-admin.js'

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
  // Registration and login share field labels; wait for the new form before filling.
  await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Browser test password!')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('browser@example.com')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(url + '/materials')
  await page.getByRole('button', { name: 'Upload a material' }).click()
  await page.getByLabel('Material title', { exact: true }).fill('Browser notes')
  await page.getByLabel('Subject', { exact: true }).fill('SE')
  await page.getByLabel('Description', { exact: true }).fill('Browser regression')
  const document = await PDFDocument.create(); document.addPage()
  await page.getByLabel('PDF file').setInputFiles({ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await document.save()) })
  await page.getByRole('button', { name: 'Upload material' }).click()
  await expect(page.getByRole('status')).toContainText('Your material has been uploaded.')
  await page.getByRole('button', { name: 'Close upload form' }).click()
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download Browser notes' }).click()
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.pdf$/)
  await page.getByRole('button', { name: 'Open profile menu' }).click()
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible()
  // Provision only in disposable test MongoDB, using the real trusted helper.
  await provisionAdmin(connection, { name: 'Browser Admin', email: 'browser-admin@example.com', password: 'Browser test password!' }, 10)
  await page.getByLabel('Email', { exact: true }).fill('browser-admin@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Browser test password!')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(url + '/admin')
  await page.getByRole('link', { name: 'Moderate materials' }).click()
  await page.getByRole('button', { name: 'Remove Browser notes' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Remove Browser notes' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove Browser notes' }).click()
  await page.getByRole('button', { name: 'Confirm removal' }).click()
  await expect(page.getByRole('status')).toContainText('Resource removed.')
  await page.getByRole('link', { name: 'Study materials' }).click()
  await expect(page.getByText('Nothing exists yet')).toBeVisible()
})

test('student loads the 26th search match and keeps the search after another upload', async ({ page }) => {
  const user = await runtime.auth.register({ name: 'Paging Student', email: 'paging@example.com', password: 'Paging test password!' })
  await runtime.materials.Material.insertMany(Array.from({ length: 26 }, (_, index) => ({
    title: 'Paging notes ' + (index + 1), subject: 'SE', description: 'Pagination metadata fixture',
    uploadedBy: new Types.ObjectId(user.id), fileId: new Types.ObjectId(), size: 100
  })))
  await page.goto(url + '/login')
  await page.getByLabel('Email', { exact: true }).fill('paging@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Paging test password!')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(url + '/materials')
  await page.getByLabel('Search material titles').fill('Paging')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(25)
  await page.getByRole('button', { name: 'Load more materials' }).click()
  await expect(page.getByRole('article')).toHaveCount(26)
  await expect(page.getByRole('button', { name: 'Load more materials' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Upload a material' }).click()
  await page.getByLabel('Material title', { exact: true }).fill('Unrelated upload')
  await page.getByLabel('Subject', { exact: true }).fill('SE')
  await page.getByLabel('Description', { exact: true }).fill('Outside the submitted search')
  const document = await PDFDocument.create(); document.addPage()
  await page.getByLabel('PDF file').setInputFiles({ name: 'unrelated.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await document.save()) })
  await page.getByRole('button', { name: 'Upload material', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Your material has been uploaded.')
  await expect(page.getByRole('button', { name: 'Upload material', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Close upload form' }).click()
  await expect(page.getByLabel('Search material titles')).toHaveValue('Paging')
  await expect(page.getByRole('heading', { name: 'Unrelated upload', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Load more materials' }).click()
  await expect(page.getByRole('article')).toHaveCount(26)
})

test('Admin dashboard integrates real Question Bank moderation, responsive navigation and Student denial', async ({ page }, info) => {
  const password = 'Dashboard browser password!'
  await provisionAdmin(connection, { name: 'Dashboard Admin', email: 'dashboard-admin@example.test', password }, 10)
  await runtime.auth.register({ name: 'Dashboard Student', email: 'dashboard-student@example.test', password })
  await page.goto(url + '/login')
  await page.getByLabel('Email', { exact: true }).fill('dashboard-admin@example.test')
  await page.getByLabel('Password', { exact: true }).fill(password)
  const start = Date.now()
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(url + '/admin')
  await expect(page.getByRole('link', { name: 'Moderate questions' })).toBeVisible()
  const elapsedMs = Date.now() - start
  await info.attach('dashboard-single-user-timing', { body: JSON.stringify({ elapsedMs, limitMs: 3000, conditions: 'local, single user, application already started; includes login and dashboard requests' }), contentType: 'application/json' })
  expect(elapsedMs).toBeLessThan(3000)
  await expect(page.getByText('Quiz module integration is pending.')).toBeVisible()
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const selectors = ['a[aria-label="Study Commons home"]', 'nav[aria-label="Main navigation"] a', 'button[aria-label="Open profile menu"]', '[role="switch"]']
    const boxes = (await Promise.all(selectors.map(selector => page.locator(selector).all()))).flat()
    const bounds = await Promise.all(boxes.map(locator => locator.boundingBox()))
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i]; const b = bounds[j]
      if (a && b) expect(a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y).toBe(false)
    }
    await page.screenshot({ path: info.outputPath('admin-dashboard-' + width + '.png'), fullPage: true })
  }
  await page.getByRole('link', { name: 'Open Question Bank' }).click()
  await page.getByRole('button', { name: '+ Add New MCQ' }).click()
  const form = page.getByRole('region', { name: 'Add MCQ Form' })
  await form.getByLabel(/Question Text/).fill('Sprint 2 moderation question')
  await form.getByPlaceholder('e.g. Computer Networks').fill('Security')
  await form.getByPlaceholder('e.g. Transport Layer').fill('Authorization')
  for (const [id, text] of Object.entries({ A: 'Valid answer', B: 'Other answer', C: 'Third answer', D: 'Fourth answer' })) await form.getByPlaceholder('Enter text for Option ' + id + '...').fill(text)
  await form.getByRole('button', { name: 'Add Question', exact: true }).click()
  await expect(page.getByText('MCQ question created successfully.', { exact: true })).toBeVisible()
  const saved = await runtime.questions.Question.findOne({ questionText: 'Sprint 2 moderation question' })
  expect(saved).not.toBeNull()
  const where = backend.address()
  if (!where || typeof where === 'string') throw new Error('Backend unavailable')
  const api = 'http://127.0.0.1:' + where.port
  const student = await runtime.auth.login('dashboard-student@example.test', password)
  const response = await fetch(api + '/api/quiz-questions', { headers: { Authorization: 'Bearer ' + student.token } })
  expect(response.status).toBe(200); expect(JSON.stringify(await response.json())).not.toContain('correctAnswer')
  await page.getByRole('link', { name: 'Admin Dashboard', exact: true }).click()
  await page.getByRole('link', { name: 'Moderate questions' }).click()
  await page.getByRole('button', { name: 'Remove Sprint 2 moderation question' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Remove Sprint 2 moderation question' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove Sprint 2 moderation question' }).click()
  await page.getByRole('button', { name: 'Confirm removal', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Resource removed.')
  expect((await runtime.questions.Question.findById(saved!.id))!.removedAt).toBeInstanceOf(Date)
  const removed = await fetch(api + '/api/quiz-questions', { headers: { Authorization: 'Bearer ' + student.token } })
  expect((await removed.json()).questions).toEqual([])
  await page.getByRole('button', { name: 'Open profile menu' }).click()
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await page.getByLabel('Email', { exact: true }).fill('dashboard-student@example.test')
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(url + '/materials')
  await page.goto(url + '/admin')
  await expect(page).toHaveURL(url + '/materials')
  await expect(page.getByRole('link', { name: 'Admin Dashboard' })).toHaveCount(0)
  expect((await fetch(api + '/api/admin/resources', { headers: { Authorization: 'Bearer ' + student.token } })).status).toBe(403)
})
