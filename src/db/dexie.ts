import Dexie, { type Table } from 'dexie'
import type { LocalDocument, JournalEntry, PersonalProfile } from '../types'

class TripDatabase extends Dexie {
  localDocuments!: Table<LocalDocument>
  journalEntries!: Table<JournalEntry>
  personalProfiles!: Table<PersonalProfile>

  constructor() {
    super('ViajeEuropaDB')
    this.version(2).stores({
      localDocuments:   '++id, ownerPersonId, type, createdAt',
      journalEntries:   '++id, authorId, date',
      personalProfiles: '++id, &personId',
    })
  }
}

export const db = new TripDatabase()
