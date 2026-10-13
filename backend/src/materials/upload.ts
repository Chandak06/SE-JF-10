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

export interface StoredMaterial {
  title: string;
  subject: string;
  description: string;
  uploadedBy: Types.ObjectId;
  fileId: Types.ObjectId;
  size: number;
  createdAt: Date;
}
const plainText = (maximum: number) => z.string().trim().min(1).max(maximum).regex(/^[^<>\x00-\x1f\x7f]+$/);
const metadataSchema = z.strictObject({
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
    size: { type: Number, required: true, min: 1 }
  }, { timestamps: true, versionKey: false, strict: 'throw' });
  const Material = (connection.models.Material as Model<StoredMaterial> | undefined)
    ?? connection.model<StoredMaterial>('Material', schema);
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
  router.get('/', async (_req, res) => {
    const materials = await Material.find({}, {
      title: 1, subject: 1, description: 1, size: 1, createdAt: 1
    }).sort({ createdAt: -1 }).lean();
    res.json({ materials: materials.map((material) => ({
      id: material._id.toString(), title: material.title, subject: material.subject,
      description: material.description, size: material.size,
      createdAt: material.createdAt.toISOString()
    })) });
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
  }, validateBody(metadataSchema), async (req, res) => {
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
  return { router, Material, bucket, async initialize() { await Material.init(); } };
}
