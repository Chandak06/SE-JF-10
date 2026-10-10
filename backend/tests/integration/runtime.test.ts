import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { createRuntime } from '../../src/runtime.js';
import { connectDatabase } from '../../src/db.js';
import { loadConfig } from '../../src/config.js';

let mongo: MongoMemoryServer;
let connection: Connection;
let runtime: Awaited<ReturnType<typeof createRuntime>>;
let pdf: Buffer;
const student = { name: 'Integration Student', email: 'student@example.com', password: 'Secure upload password!' };
const metadata = { title: 'Software Engineering', subject: 'SE', description: 'Sprint 1 notes' };
const auth = (token: string) => ({ Authorization: 'Bearer ' + token });
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { dbName: 'csmq_runtime_test', launchTimeout: 60000 } });
  connection = await connectDatabase(mongo.getUri());
  runtime = await createRuntime(connection, loadConfig({
    MONGODB_URI: mongo.getUri(), NODE_ENV: 'test', BCRYPT_ROUNDS: '10', MAX_UPLOAD_BYTES: '2048'
  }), { authLimit: 500 });
  const doc = await PDFDocument.create();
  doc.addPage();
  pdf = Buffer.from(await doc.save());
});
beforeEach(async () => {
  await runtime.accounts.User.deleteMany({});
  await runtime.materials.Material.deleteMany({});
  await connection.collection('authsessions').deleteMany({});
  await connection.collection('materialFiles.files').deleteMany({});
  await connection.collection('materialFiles.chunks').deleteMany({});
});
afterAll(async () => { await connection?.close(); await mongo?.stop(); });

async function login() {
  await request(runtime.app).post('/api/auth/register').send(student).expect(201);
  return (await request(runtime.app).post('/api/auth/login').send({
    email: student.email, password: student.password
  }).expect(200)).body.token as string;
}
function upload(token: string, data = pdf, name = 'notes.pdf', type = 'application/pdf') {
  return request(runtime.app).post('/api/materials').set(auth(token))
    .field(metadata).attach('file', data, { filename: name, contentType: type });
}
describe('CSMQ-5 production auth and PDF storage integration', () => {
  it('registers, logs in, persists a real PDF and metadata, then rejects upload after logout', async () => {
    const token = await login();
    const created = await upload(token).expect(201);
    const account = await runtime.accounts.User.findOne({ email: student.email }).lean();
    expect(account).not.toHaveProperty('passwordHash');
    const storedAccount = await runtime.accounts.accounts.findByEmail(student.email);
    expect(storedAccount!.passwordHash).not.toBe(student.password);
    expect(storedAccount!.role).toBe('student');
    const material = await runtime.materials.Material.findById(created.body.material.id).lean();
    expect(material!.uploadedBy.toString()).toBe(storedAccount!.id);
    const chunks: Buffer[] = [];
    for await (const chunk of runtime.materials.bucket.openDownloadStream(material!.fileId)) chunks.push(chunk);
    expect(Buffer.concat(chunks)).toEqual(pdf);
    await request(runtime.app).post('/api/auth/logout').set(auth(token)).expect(204);
    await upload(token).expect(401);
    expect(await runtime.materials.Material.countDocuments()).toBe(1);
    const reconnected = await connectDatabase(mongo.getUri());
    try {
      expect(await reconnected.collection('materials').countDocuments()).toBe(1);
      expect(await reconnected.collection('materialFiles.files').countDocuments()).toBe(1);
    } finally { await reconnected.close(); }
  });
  it('rejects unauthenticated upload before accepting file data', async () => {
    await request(runtime.app).post('/api/materials').field(metadata).attach('file', pdf, 'notes.pdf').expect(401);
    expect(await connection.collection('materialFiles.files').countDocuments()).toBe(0);
  });
  it('rejects non-PDFs, forged PDF contents, missing files, and oversized files', async () => {
    const token = await login();
    await upload(token, Buffer.from('plain text'), 'notes.txt', 'text/plain').expect(400);
    await upload(token, Buffer.from('not a PDF')).expect(400);
    await request(runtime.app).post('/api/materials').set(auth(token)).send(metadata).expect(400);
    await upload(token, Buffer.alloc(2049)).expect(413);
    expect(await runtime.materials.Material.countDocuments()).toBe(0);
    expect(await connection.collection('materialFiles.files').countDocuments()).toBe(0);
  });
  it('rejects unknown/malicious metadata, extra files, and oversized text fields', async () => {
    const token = await login();
    await request(runtime.app).post('/api/materials').set(auth(token)).field({ ...metadata, uploadedBy: 'attacker' }).attach('file', pdf, 'notes.pdf').expect(400);
    await request(runtime.app).post('/api/materials').set(auth(token)).field({ ...metadata, title: '<script>bad</script>' }).attach('file', pdf, 'notes.pdf').expect(400);
    await request(runtime.app).post('/api/materials').set(auth(token)).field(metadata).attach('file', pdf, 'a.pdf').attach('file', pdf, 'b.pdf').expect(400);
    await request(runtime.app).post('/api/materials').set(auth(token)).field({ ...metadata, description: 'x'.repeat(5000) }).attach('file', pdf, 'notes.pdf').expect(400);
    expect(await runtime.materials.Material.countDocuments()).toBe(0);
  });
  it('enforces the student upload role using the database role', async () => {
    const token = await login();
    await runtime.accounts.User.updateOne({ email: student.email }, { role: 'admin' });
    await upload(token).expect(403);
  });
  it('removes uploaded bytes if saving metadata fails and returns a safe error', async () => {
    const token = await login();
    const failed = vi.spyOn(runtime.materials.Material, 'create').mockRejectedValueOnce(new Error('private database failure'));
    try {
      const response = await upload(token).expect(500);
      expect(JSON.stringify(response.body)).not.toContain('private database');
      expect(await connection.collection('materialFiles.files').countDocuments()).toBe(0);
      expect(await connection.collection('materialFiles.chunks').countDocuments()).toBe(0);
    } finally { failed.mockRestore(); }
  });
  it('rejects a PDF with no pages', async () => {
    const token = await login();
    const empty = await PDFDocument.create();
    await upload(token, Buffer.from(await empty.save({ addDefaultPage: false }))).expect(400);
  });
  it('enforces account hash storage and handles missing or malformed identity lookups', async () => {
    await expect(runtime.accounts.User.create({ ...student, passwordHash: student.password })).rejects.toThrow();
    expect(await runtime.accounts.accounts.findById('invalid')).toBeNull();
    expect(await runtime.accounts.accounts.findById('000000000000000000000000')).toBeNull();
    expect(await runtime.accounts.accounts.findByEmail('absent@example.com')).toBeNull();
  });
});
