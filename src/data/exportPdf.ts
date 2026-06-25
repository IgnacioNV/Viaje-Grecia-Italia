import { jsPDF } from 'jspdf'
import type { JournalEntry } from '../types'
import itinerary from './itinerary.json'
import type { Day } from '../types'

const DAYS = itinerary as Day[]

function getDayDestination(date: string): string {
  const day = DAYS.find(d => d.date === date.split('T')[0])
  return day ? `${day.destination} · ${day.country}` : ''
}

export async function exportJournalToPDF(entries: JournalEntry[], personName: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20

  // ── Cover page ──────────────────────────────────────────
  doc.setFillColor(27, 63, 166)
  doc.rect(0, 0, W, 80, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('Mi Diario de Viaje', margin, 38)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`${personName}`, margin, 52)

  doc.setFontSize(11)
  doc.setTextColor(200, 210, 240)
  doc.text('Bari · Crucero · Grecia · Julio 2026', margin, 64)

  doc.setTextColor(27, 63, 166)
  doc.setFontSize(11)
  doc.text(`${entries.length} entrada${entries.length !== 1 ? 's' : ''}`, margin, 95)
  doc.text(`Exportado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 103)

  // ── Entries ──────────────────────────────────────────────
  for (const entry of entries) {
    doc.addPage()

    const date = new Date(entry.date)
    const destination = getDayDestination(entry.date)

    // Header bar
    doc.setFillColor(239, 242, 247)
    doc.rect(0, 0, W, 28, 'F')
    doc.setFillColor(27, 63, 166)
    doc.rect(0, 0, 4, 28, 'F')

    doc.setTextColor(27, 63, 166)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), 12, 12)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 120, 160)
    if (destination) doc.text(destination, 12, 21)

    // Mood
    let yPos = 40
    if (entry.mood) {
      doc.setFillColor(232, 184, 74)
      doc.roundedRect(margin, yPos - 5, 60, 8, 2, 2, 'F')
      doc.setTextColor(80, 60, 20)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(entry.mood, margin + 3, yPos)
      yPos += 14
    }

    // Text
    doc.setTextColor(13, 23, 51)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(entry.text, W - margin * 2)
    doc.text(lines, margin, yPos)
    yPos += lines.length * 6 + 10

    // Photo
    if (entry.photoBase64 && yPos < 220) {
      try {
        const imgType = entry.photoBase64.includes('jpeg') ? 'JPEG' : 'PNG'
        const maxH = 80
        doc.addImage(entry.photoBase64, imgType, margin, yPos, W - margin * 2, maxH)
        yPos += maxH + 8
      } catch { /* skip if image fails */ }
    }

    // Footer line
    doc.setDrawColor(200, 210, 230)
    doc.line(margin, 280, W - margin, 280)
    doc.setFontSize(8)
    doc.setTextColor(180, 190, 210)
    doc.text('Viaje Europa 2026', margin, 286)
    doc.text(personName, W - margin, 286, { align: 'right' })
  }

  doc.save(`diario-${personName.toLowerCase().replace(/\s/g, '-')}-europa-2026.pdf`)
}
