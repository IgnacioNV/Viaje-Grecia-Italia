export type Theme = 'greece' | 'puglia' | 'cruise'
export type Phase = 'individual' | 'group'
export type DocumentType = 'ticket' | 'passport' | 'reservation' | 'voucher' | 'other'
export type DocumentSource = 'seed' | 'local'

export interface Person {
  id: string
  name: string
  role: string
  passport?: { number: string; expiry: string; photoFile?: string }
  emergencyContact?: string
  insurance?: string
  flightOrigin?: string
}

export interface Activity {
  id: string
  dayId: string
  time: string
  title: string
  location?: string
  period: 'morning' | 'afternoon' | 'night'
  scope: 'group' | string[]
  documentRef?: string
}

export interface Day {
  id: string
  date: string
  destination: string
  country: string
  phase: Phase
  theme: Theme
  tagline?: string
  activities: Activity[]
}

export interface SeedDocument {
  id: string
  source: 'seed'
  type: DocumentType
  ownerPersonId: string | 'group'
  linkedActivityId?: string
  title: string
  file: string
  createdAt: string
}

// IndexedDB types (Dexie)
export interface LocalDocument {
  id?: number
  ownerPersonId: string
  title: string
  type: string
  fileBase64: string
  createdAt: string
}

export interface JournalEntry {
  id?: number
  authorId: string
  date: string
  text: string
  photoBase64?: string
  mood?: string
}

export interface PersonalProfile {
  id?: number
  personId: string
  phoneNumber?: string
  emergencyPhone?: string
  passportFront?: string  // base64
  passportBack?: string   // base64
  insuranceFile?: string  // base64
  updatedAt: string
}
