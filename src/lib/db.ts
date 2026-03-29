import Dexie, { type EntityTable } from 'dexie'
import type { AnswerRecord } from '../types'

const db = new Dexie('PianoSightReading') as Dexie & {
  answers: EntityTable<AnswerRecord, 'id'>
}

db.version(1).stores({
  answers: '++id, note, correct, mode, timestamp',
})

export { db }
