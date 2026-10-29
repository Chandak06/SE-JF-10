import { beforeEach, expect, it } from 'vitest'
import { getRecentMaterials, recordRecentMaterial } from './recentMaterials'
beforeEach(() => localStorage.clear())
it('ignores corrupted/out-of-range recent dates rather than crashing the dashboard', () => {
  localStorage.setItem('study-commons-recent-materials:user', '[{"id":"one","openedAt":1e999},{"id":"two","openedAt":-1},{"id":"three","openedAt":9999999999999999},{"id":"valid","openedAt":100}]')
  expect(getRecentMaterials('user')).toEqual([{ id: 'valid', openedAt: 100 }])
})
it('keeps recent materials scoped to the current user and deduplicates repeated opens', () => {
  recordRecentMaterial('one', 'user'); recordRecentMaterial('two', 'user'); recordRecentMaterial('one', 'user')
  expect(getRecentMaterials('user').map(item => item.id)).toEqual(['one', 'two'])
  expect(getRecentMaterials('another')).toEqual([])
})
