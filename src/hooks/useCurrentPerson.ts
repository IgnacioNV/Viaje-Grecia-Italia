import { useState, useCallback } from 'react'
import type { Person } from '../types'
import people from '../data/people.json'

const STORAGE_KEY = 'trip_current_person_id'

export function useCurrentPerson() {
  const [personId, setPersonId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  )

  const currentPerson = (people as Person[]).find(p => p.id === personId) ?? null

  const selectPerson = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setPersonId(id)
  }, [])

  const clearPerson = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPersonId(null)
  }, [])

  return { personId, currentPerson, selectPerson, clearPerson }
}
