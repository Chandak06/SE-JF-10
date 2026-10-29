const storagePrefix = 'study-commons-recent-materials:'
const maximumRecentMaterials = 5

export type RecentMaterial = { id: string; openedAt: number }

export function getRecentMaterials(userId: string): RecentMaterial[] {
  if (!userId) return []
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storagePrefix + encodeURIComponent(userId)) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item): item is RecentMaterial => Boolean(item)
      && typeof item === 'object'
      && typeof (item as RecentMaterial).id === 'string'
      && typeof (item as RecentMaterial).openedAt === 'number'
      && Number.isFinite((item as RecentMaterial).openedAt)
      && (item as RecentMaterial).openedAt >= 0
      && Number.isFinite(new Date((item as RecentMaterial).openedAt).getTime()))
      .slice(0, maximumRecentMaterials)
  } catch { return [] }
}

export function recordRecentMaterial(id: string, userId: string) {
  if (!id || !userId) return
  const recent = getRecentMaterials(userId).filter(item => item.id !== id)
  recent.unshift({ id, openedAt: Date.now() })
  try { localStorage.setItem(storagePrefix + encodeURIComponent(userId), JSON.stringify(recent.slice(0, maximumRecentMaterials))) } catch { /* Recent history is optional when storage is unavailable. */ }
}
