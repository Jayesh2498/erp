import { useState, useCallback, useEffect } from 'react'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface UseLocalStoreReturn<T extends { id: string }> {
  items: T[]
  getById: (id: string) => T | undefined
  create: (item: Omit<T, 'id'>) => T
  update: (id: string, updates: Partial<T>) => T | undefined
  remove: (id: string) => void
  refresh: () => void
  setItems: (items: T[]) => void
}

/**
 * Generic hook for CRUD operations against localStorage.
 * Seeds with initialData on first use (if key not yet present).
 */
export function useLocalStore<T extends { id: string }>(
  key: string,
  initialData: T[],
): UseLocalStoreReturn<T> {
  const load = useCallback((): T[] => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw) as T[]
    } catch {
      // ignore parse errors
    }
    // Seed initial data
    localStorage.setItem(key, JSON.stringify(initialData))
    return initialData
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const [items, setItemsState] = useState<T[]>(() => load())

  const persist = useCallback((data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data))
    setItemsState(data)
  }, [key])

  const refresh = useCallback(() => {
    setItemsState(load())
  }, [load])

  const setItems = useCallback((data: T[]) => {
    persist(data)
  }, [persist])

  const getById = useCallback((id: string) => {
    return items.find(i => i.id === id)
  }, [items])

  const create = useCallback((item: Omit<T, 'id'>): T => {
    const newItem = { ...item, id: generateId() } as T
    const updated = [...items, newItem]
    persist(updated)
    return newItem
  }, [items, persist])

  const update = useCallback((id: string, updates: Partial<T>): T | undefined => {
    let found: T | undefined
    const updated = items.map(i => {
      if (i.id === id) {
        found = { ...i, ...updates }
        return found
      }
      return i
    })
    if (found) persist(updated)
    return found
  }, [items, persist])

  const remove = useCallback((id: string) => {
    const updated = items.filter(i => i.id !== id)
    persist(updated)
  }, [items, persist])

  // Re-sync if another tab changes localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) refresh()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, refresh])

  return { items, getById, create, update, remove, refresh, setItems }
}
