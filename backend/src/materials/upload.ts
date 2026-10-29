import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { Router } from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import { Schema, Types, mongo, type Connection, type Model } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { getUserModel } from '../models/user.js';
import { objectId, type ModerationResource } from '../admin/moderation.js';

export interface StoredMaterial {
  title: string;
  subject: string;
  description: string;
  uploadedBy: Types.ObjectId;
  fileId: Types.ObjectId;
  size: number;
  createdAt: Date;
  removedAt: Date | null;
  removedBy?: Types.ObjectId;
}
const plainText = (maximum: number) => z.string().trim().min(1).max(maximum).regex(/^[^<>\x00-\x1f\x7f]+$/);
export const materialMetadataSchema = z.strictObject({
  title: plainText(150), subject: plainText(100), description: plainText(1000)
});

export function createMaterialUpload(connection: Connection, maxBytes: number) {
  if (!connection.db) throw new Error('MongoDB must be connected before creating upload storage.');
  const bucket = new mongo.GridFSBucket(connection.db, { bucketName: 'materialFiles' });
  const schema = new Schema<StoredMaterial>({
    title: { type: String, required: true, maxlength: 150 },
    subject: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    fileId: { type: Schema.Types.ObjectId, required: true, unique: true },
    size: { type: Number, required: true, min: 1 },
    removedAt: { type: Date, default: null, index: true },
    removedBy: { type: Schema.Types.ObjectId, ref: 'User', select: false }
  }, { timestamps: true, versionKey: false, strict: 'throw' });
  const Material = (connection.models.Material as Model<StoredMaterial> | undefined)
    ?? connection.model<StoredMaterial>('Material', schema);
  const User = getUserModel(connection);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1, fields: 3, parts: 5, fieldSize: 4096 },
    fileFilter(_req, file, done) {
      if (file.mimetype !== 'application/pdf' || !/\.pdf$/i.test(file.originalname)) {
        return done(new AppError(400, 'INVALID_FILE_TYPE', 'Only PDF files are accepted.'));
      }
      done(null, true);
    }
  }).single('file');
  const router = Router();
  router.get('/', async (req, res) => {
    const parsed = z.strictObject({
      q: plainText(100).optional(), subject: plainText(100).optional(),
      limit: z.coerce.number().int().min(1).max(50).default(25), cursor: objectId.optional()
    }).safeParse(req.query);
    if (!parsed.success) throw new AppError(400, 'INVALID_QUERY', 'Invalid material search fields.');
    const { q, subject, limit, cursor } = parsed.data;
    const escaped = q?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keyword = escaped ? { $regex: escaped, $options: 'i' } : undefined;
    const escapedSubject = subject?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const items = await Material.find({ removedAt: null,
      ...(escapedSubject ? { subject: { $regex: '^' + escapedSubject + '$', $options: 'i' } } : {}),
      ...(keyword ? { $or: [{ title: keyword }, { subject: keyword }, { description: keyword }] } : {}),
      ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {})
    }).sort({ _id: -1 }).limit(limit).select('title subject description size createdAt uploadedBy').lean();
    res.json({ materials: items.map(item => ({ id: item._id.toString(), title: item.title, subject: item.subject,
      description: item.description, size: item.size, createdAt: item.createdAt, uploadedBy: item.uploadedBy.toString() })),
      nextCursor: items.length === limit ? items[items.length - 1]!._id.toString() : null });
  });
  router.get('/subjects', async (_req, res) => {
    const subjects = await Material.distinct('subject', { removedAt: null });
    res.json({ subjects: subjects.filter((value): value is string => typeof value === 'string').sort((a, b) => a.localeCompare(b)) });
  });
  router.get('/:id', async (req, res) => {
    const id = objectId.safeParse(req.params.id);
    if (!id.success) throw new AppError(400, 'INVALID_ID', 'Invalid material identifier.');
    const material = await Material.findOne({ _id: id.data, removedAt: null })
      .select('title subject description uploadedBy createdAt').lean();
    if (!material) throw new AppError(404, 'NOT_FOUND', 'Material is unavailable.');
    const uploader = await User.findById(material.uploadedBy).select('name').lean();
    res.json({ material: { id: material._id.toString(), title: material.title, subject: material.subject,
      description: material.description, uploadedBy: material.uploadedBy.toString(), uploadedByName: uploader?.name ?? 'Unknown user',
      createdAt: material.createdAt.toISOString() } });
  });
  router.get('/:id/file', async (req, res) => {
    const id = objectId.safeParse(req.params.id);
    const query = z.strictObject({ disposition: z.enum(['inline', 'attachment']).default('attachment') }).safeParse(req.query);
    if (!id.success || !query.success) throw new AppError(400, 'INVALID_REQUEST', 'Invalid material identifier or download option.');
    const material = await Material.findOne({ _id: id.data, removedAt: null });
    if (!material || !await bucket.find({ _id: material.fileId }).hasNext()) throw new AppError(404, 'NOT_FOUND', 'Material is unavailable.');
    const filename = material.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+|[.-]+$/g, '') || 'study-material';
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': query.data.disposition + '; filename="' + filename + '.pdf"',
      'Content-Security-Policy': "default-src 'none'; sandbox", 'Content-Length': String(material.size) });
    await pipeline(bucket.openDownloadStream(material.fileId), res);
  });
  router.post('/', requireRole('student'), (req, res, next) => {
    upload(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        return next(new AppError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400,
          error.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'INVALID_MULTIPART',
          error.code === 'LIMIT_FILE_SIZE' ? 'PDF exceeds the configured size limit.' : 'Invalid upload fields or file count.'));
      }
      next(error);
    });
  }, validateBody(materialMetadataSchema), async (req, res) => {
    const file = req.file;
    if (!file) throw new AppError(400, 'FILE_REQUIRED', 'A PDF file is required.');
    try {
      const document = await PDFDocument.load(file.buffer, { updateMetadata: false, throwOnInvalidObject: true });
      if (!document.getPageCount()) throw new Error('Empty PDF');
    } catch {
      throw new AppError(400, 'INVALID_PDF', 'Upload a valid, unencrypted PDF containing at least one page.');
    }
    const fileId = new Types.ObjectId();
    try {
      await pipeline(Readable.from(file.buffer), bucket.openUploadStreamWithId(fileId, fileId.toString() + '.pdf', {
        metadata: { contentType: 'application/pdf' }
      }));
      const material = await Material.create({
        title: req.body.title, subject: req.body.subject, description: req.body.description,
        uploadedBy: new Types.ObjectId(req.user!.id), fileId, size: file.size
      });
      res.status(201).json({ material: {
        id: material._id.toString(), title: material.title, subject: material.subject,
        description: material.description, uploadedBy: material.uploadedBy.toString(),
        size: material.size, createdAt: material.createdAt.toISOString()
      } });
    } catch (error) {
      // A metadata failure must not leave an accessible orphan PDF.
      await bucket.delete(fileId).catch(() => {});
      throw error;
    }
  });
  const moderation: ModerationResource = {
    async list(limit) {
      const items = await Material.find({ removedAt: null }).sort({ _id: -1 }).limit(limit).select('title').lean();
      return items.map(item => ({ id: item._id.toString(), title: item.title }));
    },
    async remove(id, administratorId) {
      // Atomic tombstone closes search/download access, retaining bytes for recoverable moderation.
      const result = await Material.updateOne({ _id: id, removedAt: null }, { $set: {
        removedAt: new Date(), removedBy: new Types.ObjectId(administratorId)
      } });
      return result.modifiedCount === 1;
    }
  };
  return { router, Material, bucket, moderation, async initialize() { await Material.init(); } };
}
