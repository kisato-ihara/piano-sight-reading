import { db } from './db'
import type { Note } from '../types'
import { noteToString } from './notes'

const RECENT_LIMIT = 200

export interface NoteStats {
  total: number
  mistakes: number
  avgResponseMs: number
}

export async function getStatsPerNote(): Promise<Map<string, NoteStats>> {
  const records = await db.answers
    .orderBy('timestamp')
    .reverse()
    .limit(RECENT_LIMIT)
    .toArray()

  const map = new Map<string, NoteStats>()

  for (const r of records) {
    const existing = map.get(r.note) ?? { total: 0, mistakes: 0, avgResponseMs: 0 }
    const newTotal = existing.total + 1
    const newMistakes = existing.mistakes + (r.correct ? 0 : 1)
    const newAvg = (existing.avgResponseMs * existing.total + r.responseTimeMs) / newTotal
    map.set(r.note, { total: newTotal, mistakes: newMistakes, avgResponseMs: newAvg })
  }

  return map
}

/** 苦手な音符を多く出題するための重み付き配列を返す */
export async function getWeightedNotes(notes: Note[]): Promise<Note[]> {
  const stats = await getStatsPerNote()
  const weighted: Note[] = []

  for (const note of notes) {
    const key = noteToString(note)
    const s = stats.get(key)
    if (!s || s.total < 3) {
      weighted.push(note, note)
    } else {
      const errorRate = s.mistakes / s.total
      const weight = Math.max(1, Math.round(1 + errorRate * 4))
      for (let i = 0; i < weight; i++) {
        weighted.push(note)
      }
    }
  }

  return weighted
}
