import { describe, expect, it } from 'vitest';
import { materialMetadataSchema } from '../../src/materials/upload.js';

describe('study material upload metadata validation', () => {
  const valid = { title: 'Lecture notes', subject: 'Software Engineering', description: 'Week one' };

  it('accepts complete metadata and trims surrounding whitespace', () => {
    expect(materialMetadataSchema.parse({ title: ' Lecture notes ', subject: ' SE ', description: ' Week one ' }))
      .toEqual({ title: 'Lecture notes', subject: 'SE', description: 'Week one' });
  });

  it.each(['title', 'subject', 'description'] as const)('rejects missing %s', (field) => {
    const metadata = { ...valid };
    delete metadata[field];
    expect(materialMetadataSchema.safeParse(metadata).success).toBe(false);
  });

  it.each([
    { ...valid, title: '   ' },
    { ...valid, subject: '<script>' },
    { ...valid, description: 'x'.repeat(1001) },
    { ...valid, extra: 'untrusted' }
  ])('rejects invalid or unexpected metadata', (metadata) => {
    expect(materialMetadataSchema.safeParse(metadata).success).toBe(false);
  });
});
