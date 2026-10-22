import { useCallback, useEffect, useRef, useState } from 'react'
import { searchMaterials, type StudyMaterial } from '../services/authService'

export function useMaterialLibrary() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const activeQuery = useRef('')
  const sequence = useRef(0)
  const controller = useRef<AbortController | null>(null)
  const failedRequest = useRef<{ query: string; cursor?: string } | null>(null)

  const load = useCallback((query: string, cursor?: string) => {
    const request = ++sequence.current
    controller.current?.abort()
    const currentController = new AbortController()
    controller.current = currentController
    return searchMaterials(query, cursor, currentController.signal).then(page => {
      if (request !== sequence.current) return
      setMaterials(previous => {
        if (!cursor) return page.materials
        const merged = new Map(previous.map(material => [material.id, material]))
        for (const material of page.materials) merged.set(material.id, material)
        return [...merged.values()]
      })
      setNextCursor(page.nextCursor)
      setLoadError('')
      failedRequest.current = null
    }).catch((error: unknown) => {
      if (request !== sequence.current || currentController.signal.aborted) return
      failedRequest.current = { query, cursor }
      setLoadError(error instanceof Error ? error.message : 'Unable to load materials.')
    }).finally(() => {
      if (request === sequence.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    })
  }, [])

  const cancel = useCallback(() => { ++sequence.current; controller.current?.abort() }, [])
  useEffect(() => {
    void load('')
    return cancel
  }, [load, cancel])

  function start(query: string, cursor?: string) {
    setLoadError('')
    setLoading(!cursor)
    setLoadingMore(Boolean(cursor))
    return load(query, cursor)
  }
  function search(query: string) {
    activeQuery.current = query.trim()
    return start(activeQuery.current)
  }
  function refresh() { return start(activeQuery.current) }
  function loadMore() {
    if (!nextCursor || loading || loadingMore) return
    return start(activeQuery.current, nextCursor)
  }
  function retry() {
    const failed = failedRequest.current
    return start(failed?.query ?? activeQuery.current, failed?.cursor)
  }
  return { materials, nextCursor, loading, loadingMore, loadError, search, refresh, loadMore, retry }
}
