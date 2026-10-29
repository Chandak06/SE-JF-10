import { describe, expect, it } from 'vitest';
import { buildQuizFilter, escapeRegex } from '../../src/quizzes/filters.js';

describe('Quiz Filter Unit Tests (CSMQ-50)', () => {
  it('returns default active filter when empty params provided', () => {
    const filter = buildQuizFilter({});
    expect(filter).toEqual({ removedAt: null });
  });

  it('filters by search keyword matching title case-insensitively', () => {
    const filter = buildQuizFilter({ search: 'Networks' });
    expect(filter.removedAt).toBeNull();
    expect(filter.title).toEqual({
      $regex: 'Networks',
      $options: 'i'
    });
  });

  it('accepts keyword parameter as alias for search', () => {
    const filter = buildQuizFilter({ keyword: 'Operating Systems' });
    expect(filter.removedAt).toBeNull();
    expect(filter.title).toEqual({
      $regex: 'Operating\\ Systems',
      $options: 'i'
    });
  });

  it('filters by subject case-insensitively', () => {
    const filter = buildQuizFilter({ subject: 'Computer Networks' });
    expect(filter.removedAt).toBeNull();
    expect(filter.subject).toEqual({
      $regex: 'Computer\\ Networks',
      $options: 'i'
    });
  });

  it('combines keyword search and subject filter', () => {
    const filter = buildQuizFilter({
      search: 'Midterm',
      subject: 'Computer Networks'
    });
    expect(filter.removedAt).toBeNull();
    expect(filter.title).toEqual({
      $regex: 'Midterm',
      $options: 'i'
    });
    expect(filter.subject).toEqual({
      $regex: 'Computer\\ Networks',
      $options: 'i'
    });
  });

  it('escapes regex metacharacters properly to prevent injection / regex errors', () => {
    const escaped = escapeRegex('C++ (Advanced) [v1.0] *test*?');
    expect(escaped).toBe('C\\+\\+\\ \\(Advanced\\)\\ \\[v1\\.0\\]\\ \\*test\\*\\?');

    const filter = buildQuizFilter({ search: 'quiz (part 1) [draft]' });
    expect(filter.title?.$regex).toBe('quiz\\ \\(part\\ 1\\)\\ \\[draft\\]');
  });

  it('ignores empty strings and whitespace-only parameters', () => {
    const filter = buildQuizFilter({
      search: '   ',
      subject: '   ',
      keyword: ''
    });
    expect(filter).toEqual({ removedAt: null });
  });

  it('ignores invalid types for search and subject', () => {
    const filter = buildQuizFilter({
      search: 123 as unknown as string,
      subject: null as unknown as string
    });
    expect(filter).toEqual({ removedAt: null });
  });
});
