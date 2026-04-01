import Dexie, { type EntityTable } from 'dexie'
import type { AnswerRecord, BestTimeRecord, BestScoreRecord } from '../types'

const db = new Dexie('PianoSightReading') as Dexie & {
  answers: EntityTable<AnswerRecord, 'id'>
  bestTimes: EntityTable<BestTimeRecord, 'id'>
  bestScores: EntityTable<BestScoreRecord, 'id'>
}

db.version(1).stores({
  answers: '++id, note, correct, mode, timestamp',
})

db.version(2).stores({
  answers: '++id, note, correct, mode, timestamp',
  bestTimes: '++id, [mode+accidental], timestamp',
})

db.version(3).stores({
  answers: '++id, note, correct, mode, timestamp',
  bestTimes: '++id, [mode+accidental], timestamp',
  bestScores: '++id, [mode+accidental], timestamp',
})

export { db }

export async function getBestTime(mode: string, accidental: boolean): Promise<number | null> {
  const record = await db.bestTimes
    .where({ mode, accidental: accidental ? 1 : 0 })
    .first()
  return record?.timeMs ?? null
}

export async function saveBestTime(mode: string, accidental: boolean, timeMs: number): Promise<boolean> {
  const existing = await db.bestTimes
    .where({ mode, accidental: accidental ? 1 : 0 })
    .first()

  if (!existing || timeMs < existing.timeMs) {
    if (existing?.id) {
      await db.bestTimes.update(existing.id, { timeMs, timestamp: Date.now() })
    } else {
      await db.bestTimes.add({
        mode,
        accidental: accidental ? 1 : 0,
        timeMs,
        timestamp: Date.now(),
      } as unknown as BestTimeRecord)
    }
    return true
  }
  return false
}

export async function getBestScore(mode: string, accidental: boolean): Promise<number | null> {
  const record = await db.bestScores
    .where({ mode, accidental: accidental ? 1 : 0 })
    .first()
  return record?.score ?? null
}

export async function saveBestScore(mode: string, accidental: boolean, score: number): Promise<boolean> {
  const existing = await db.bestScores
    .where({ mode, accidental: accidental ? 1 : 0 })
    .first()

  if (!existing || score > existing.score) {
    if (existing?.id) {
      await db.bestScores.update(existing.id, { score, timestamp: Date.now() })
    } else {
      await db.bestScores.add({
        mode,
        accidental: accidental ? 1 : 0,
        score,
        timestamp: Date.now(),
      } as unknown as BestScoreRecord)
    }
    return true
  }
  return false
}
