import { expect, it } from 'vitest'
import { readQuizDraft } from './quizDraft'
const questions = [{ id: 'q1', options: [{ id: 'A' }, { id: 'B' }] }]
it.each(['null', '[]', '42', '"text"', '{broken'])('ignores malformed draft %s', raw => {
  expect(readQuizDraft({ getItem: () => raw }, 'student-1', questions)).toEqual({})
})
it('retains only valid options for known questions', () => {
  expect(readQuizDraft({ getItem: () => '{"q1":"B","q999":"A"}' }, 'student-1', questions)).toEqual({ q1: 'B' })
  expect(readQuizDraft({ getItem: () => '{"q1":"invalid"}' }, 'student-1', questions)).toEqual({})
})
it('survives disabled browser storage', () => {
  expect(readQuizDraft({ getItem: () => { throw new Error('Storage disabled') } }, 'student-1', questions)).toEqual({})
})
