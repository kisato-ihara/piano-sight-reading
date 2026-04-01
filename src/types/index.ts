export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = '#' | 'b' | ''
export type Octave = 1 | 2 | 3 | 4 | 5 | 6
export type Clef = 'treble' | 'bass'

export interface Note {
  name: NoteName
  accidental: Accidental
  octave: Octave
}

export interface AnswerRecord {
  id?: number
  note: string // e.g. "C4", "F#3"
  correct: boolean
  responseTimeMs: number
  mode: string
  timestamp: number
}

export interface GameMode {
  id: string
  label: string
  clef: Clef
  notes: Note[]
}

export interface BestTimeRecord {
  id?: number
  mode: string       // e.g. "treble-c-major-full"
  accidental: boolean
  timeMs: number
  timestamp: number
}

export interface BestScoreRecord {
  id?: number
  mode: string
  accidental: boolean
  score: number
  timestamp: number
}

export type GameState = 'idle' | 'ready' | 'playing' | 'feedback' | 'finished' | 'stats'
