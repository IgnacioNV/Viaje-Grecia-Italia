import Dexie, { type Table } from 'dexie'
import type { LocalDocument, JournalEntry } from '../types'

class TripDatabase extends Dexie {
  localDocuments!: Table<LocalDocument>
  journalEntries!: Table<JournalEntry>

  constructor() {
    super('ViajeEuropaDB')
    this.version(1).stores({
      localDocuments: '++id, ownerPersonId, type, createdAt',
      journalEntries: '++id, authorId, date'
    })
  }
}

export const db = new TripDatabase()
