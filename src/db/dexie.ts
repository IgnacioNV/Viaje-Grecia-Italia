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
    this.version(3).stores({
      localDocuments:   '++id, ownerPersonId, type, createdAt',
      journalEntries:   '++id, authorId, date',
      personalProfiles: '++id, &personId',
    }).upgrade(tx => {
      return tx.table('personalProfiles').toCollection().modify((profile: any) => {
        if (!profile.passports) {
          profile.passports = []
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
    // v4: moods array + facePhoto in personalProfiles
    this.version(4).stores({
      localDocuments:   '++id, ownerPersonId, type, createdAt',
      journalEntries:   '++id, authorId, date',
      personalProfiles: '++id, &personId',
    }).upgrade(tx => {
      // migrate mood (string) → moods (string[])
      return tx.table('journalEntries').toCollection().modify((entry: any) => {
        if (entry.mood && !entry.moods) {
          entry.moods = [entry.mood]
          delete entry.mood
        } else if (!entry.moods) {
          entry.moods = []
        }
      })
    })
  }
}

export const db = new TripDatabase()
