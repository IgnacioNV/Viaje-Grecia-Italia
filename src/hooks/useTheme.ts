import { useEffect, useCallback } from 'react'
import type { Theme } from '../types'
import itinerary from '../data/itinerary.json'
import type { Day } from '../types'

function getTodayTheme(): Theme {
  const today = new Date().toISOString().split('T')[0]
  const days = itinerary as Day[]
  const todayDay = days.find(d => d.date === today)
  // Default to first day's theme if today is not in the trip
  return todayDay?.theme ?? days[0]?.theme ?? 'greece'
}

export function useTheme(overrideTheme?: Theme) {
  const theme = overrideTheme ?? getTodayTheme()

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  useEffect(() => {
    applyTheme(theme)
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme, applyTheme])

  return { theme, applyTheme }
}

export function getThemeForDay(dayId: string): Theme {
  const days = itinerary as Day[]
  return days.find(d => d.id === dayId)?.theme ?? 'greece'
}

export { getTodayTheme }
