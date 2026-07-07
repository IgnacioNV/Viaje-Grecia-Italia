import { db } from '../db/dexie'
import seedProfiles from '../data/profiles.seed.json'
import type { PersonalProfile } from '../types'

const SEED_VERSION = 'profiles_seeded_v2'

export async function seedDatabase() {
  if (localStorage.getItem(SEED_VERSION)) return

  for (const seed of seedProfiles as Partial<PersonalProfile>[]) {
    if (!seed.personId) continue
    const existing = await db.personalProfiles.where('personId').equals(seed.personId).first()
    const profile: PersonalProfile = {
      personId: seed.personId,
      birthDate: seed.birthDate,
      phoneNumber: seed.phoneNumber,
      emergencyPhone: seed.emergencyPhone,
      passports: seed.passports ?? [],
      insuranceFile: seed.insuranceFile,
      facePhoto: seed.facePhoto,
      updatedAt: new Date().toISOString(),
    }
    if (existing) {
      await db.personalProfiles.put({ ...profile, id: existing.id })
    } else {
      await db.personalProfiles.add(profile)
    }
  }

  localStorage.setItem(SEED_VERSION, '1')
}
