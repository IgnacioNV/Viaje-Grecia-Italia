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
    // v3: passports becomes array, migrate old passport fields
    this.version(3).stores({
      localDocuments:   '++id, ownerPersonId, type, createdAt',
      journalEntries:   '++id, authorId, date',
      personalProfiles: '++id, &personId',
    }).upgrade(tx => {
      return tx.table('personalProfiles').toCollection().modify((profile: any) => {
        if (!profile.passports) {
          profile.passports = []
          // migrate old single passport fields if present
          if (profile.passportFront || profile.passportBack) {
            profile.passports.push({
              id: crypto.randomUUID(),
              country: 'Argentina',
              photoFront: profile.passportFront,
              photoBack:  profile.passportBack,
            })
          }
          delete profile.passportFront
          delete profile.passportBack
        }
      })
    })
  }
}

export const db = new TripDatabase()
