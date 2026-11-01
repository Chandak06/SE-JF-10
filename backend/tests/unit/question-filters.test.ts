import { describe, expect, it } from 'vitest';
import { buildQuestionFilter } from '../../src/questions/filters.js';

describe('Question filter logic (CSMQ-25 / UT-M2-04)', () => {
  it('UT-M2-04: returns empty filter object when no parameters are passed', () => {
    expect(buildQuestionFilter()).toEqual({});
    expect(buildQuestionFilter({})).toEqual({});
  });

  it('UT-M2-04: ignores empty, whitespace-only, or non-string parameters', () => {
    expect(
      buildQuestionFilter({
        subject: '   ',
        topic: '',
        difficulty: null
      })
    ).toEqual({});
  });

  it('UT-M2-04: builds filter by subject correctly', () => {
    const filter = buildQuestionFilter({ subject: '  Computer Networks  ' });
    expect(filter).toEqual({ subject: /Computer Networks/i });
  });

  it('UT-M2-04: builds filter by topic correctly', () => {
    const filter = buildQuestionFilter({ topic: 'Transport Layer' });
    expect(filter).toEqual({ topic: /Transport Layer/i });
  });

  it('matches partial text without treating user input as a regular expression', () => {
    const filter = buildQuestionFilter({ subject: ' C++ ' });
    expect(filter.subject).toEqual(/C\+\+/i);
    expect(filter.subject?.test('Advanced C++')).toBe(true);
    expect(filter.subject?.test('C language')).toBe(false);
  });

  it('UT-M2-04: builds filter by difficulty correctly', () => {
    expect(buildQuestionFilter({ difficulty: 'Easy' })).toEqual({
      difficulty: 'Easy'
    });
    expect(buildQuestionFilter({ difficulty: 'Medium' })).toEqual({
      difficulty: 'Medium'
    });
    expect(buildQuestionFilter({ difficulty: 'Hard' })).toEqual({
      difficulty: 'Hard'
    });
  });

  it('UT-M2-04: ignores invalid difficulty values', () => {
    expect(buildQuestionFilter({ difficulty: 'Extreme' })).toEqual({});
    expect(buildQuestionFilter({ difficulty: 'invalid' })).toEqual({});
  });

  it('UT-M2-04: builds combined filter with subject and topic', () => {
    const filter = buildQuestionFilter({
      subject: 'Algorithms',
      topic: 'Sorting'
    });
    expect(filter).toEqual({
      subject: /Algorithms/i,
      topic: /Sorting/i
    });
  });

  it('UT-M2-04: builds combined filter with subject, topic, and difficulty', () => {
    const filter = buildQuestionFilter({
      subject: 'Operating Systems',
      topic: 'Concurrency',
      difficulty: 'Hard'
    });
    expect(filter).toEqual({
      subject: /Operating Systems/i,
      topic: /Concurrency/i,
      difficulty: 'Hard'
    });
  });
});
