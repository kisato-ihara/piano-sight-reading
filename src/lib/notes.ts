import type { Note, NoteName, Accidental, Octave, GameMode, Clef } from '../types'

type ScaleNote = { name: NoteName; accidental: Accidental }

const NOTE_ORDER: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const SEMITONES: Record<NoteName, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

// --- スケール定義 ---

const SCALES: { id: string; label: string; vexKey: string; notes: ScaleNote[] }[] = [
  {
    id: 'c-major',
    label: 'ハ長調',
    vexKey: 'C',
    notes: [
      { name: 'C', accidental: '' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'g-major',
    label: 'ト長調',
    vexKey: 'G',
    notes: [
      { name: 'C', accidental: '' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '#' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'd-major',
    label: 'ニ長調',
    vexKey: 'D',
    notes: [
      { name: 'C', accidental: '#' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '#' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'a-major',
    label: 'イ長調',
    vexKey: 'A',
    notes: [
      { name: 'C', accidental: '#' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '#' },
      { name: 'G', accidental: '#' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'e-major',
    label: 'ホ長調',
    vexKey: 'E',
    notes: [
      { name: 'C', accidental: '#' },
      { name: 'D', accidental: '#' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '#' },
      { name: 'G', accidental: '#' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'b-major',
    label: 'ロ長調',
    vexKey: 'B',
    notes: [
      { name: 'C', accidental: '#' },
      { name: 'D', accidental: '#' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '#' },
      { name: 'G', accidental: '#' },
      { name: 'A', accidental: '#' },
      { name: 'B', accidental: '' },
    ],
  },
  {
    id: 'f-major',
    label: 'ヘ長調',
    vexKey: 'F',
    notes: [
      { name: 'C', accidental: '' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: '' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: '' },
      { name: 'B', accidental: 'b' },
    ],
  },
  {
    id: 'bb-major',
    label: '変ロ長調',
    vexKey: 'Bb',
    notes: [
      { name: 'B', accidental: 'b' },
      { name: 'C', accidental: '' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: 'b' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: '' },
    ],
  },
  {
    id: 'eb-major',
    label: '変ホ長調',
    vexKey: 'Eb',
    notes: [
      { name: 'B', accidental: 'b' },
      { name: 'C', accidental: '' },
      { name: 'D', accidental: '' },
      { name: 'E', accidental: 'b' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: '' },
      { name: 'A', accidental: 'b' },
    ],
  },
  {
    id: 'ab-major',
    label: '変イ長調',
    vexKey: 'Ab',
    notes: [
      { name: 'A', accidental: 'b' },
      { name: 'B', accidental: 'b' },
      { name: 'C', accidental: '' },
      { name: 'D', accidental: 'b' },
      { name: 'E', accidental: 'b' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: '' },
    ],
  },
  {
    id: 'db-major',
    label: '変ニ長調',
    vexKey: 'Db',
    notes: [
      { name: 'A', accidental: 'b' },
      { name: 'B', accidental: 'b' },
      { name: 'C', accidental: '' },
      { name: 'D', accidental: 'b' },
      { name: 'E', accidental: 'b' },
      { name: 'F', accidental: '' },
      { name: 'G', accidental: 'b' },
    ],
  },
]

// --- 音符生成 ---

function notesInRange(
  scaleNotes: ScaleNote[],
  low: { name: NoteName; octave: number },
  high: { name: NoteName; octave: number },
): Note[] {
  const all: Note[] = []
  for (let oct = low.octave; oct <= high.octave; oct++) {
    for (const sn of scaleNotes) {
      const idx = NOTE_ORDER.indexOf(sn.name)
      if (oct === low.octave && idx < NOTE_ORDER.indexOf(low.name)) continue
      if (oct === high.octave && idx > NOTE_ORDER.indexOf(high.name)) continue
      all.push({ name: sn.name, accidental: sn.accidental, octave: oct as Octave })
    }
  }
  return all
}

// --- モード生成 ---

function buildModes(): GameMode[] {
  const modes: GameMode[] = []

  for (const scale of SCALES) {
    const isCMajor = scale.id === 'c-major'

    // ト音記号
    if (isCMajor) {
      modes.push({
        id: `treble-${scale.id}-full`,
        label: `${scale.label} 全音域`,
        clef: 'treble',
        notes: notesInRange(scale.notes, { name: 'G', octave: 3 }, { name: 'E', octave: 6 }),
      })
      modes.push({
        id: `treble-${scale.id}-low`,
        label: `${scale.label} 低音域`,
        clef: 'treble',
        notes: notesInRange(scale.notes, { name: 'G', octave: 3 }, { name: 'C', octave: 5 }),
      })
      modes.push({
        id: `treble-${scale.id}-high`,
        label: `${scale.label} 高音域`,
        clef: 'treble',
        notes: notesInRange(scale.notes, { name: 'C', octave: 5 }, { name: 'E', octave: 6 }),
      })
    } else {
      modes.push({
        id: `treble-${scale.id}`,
        label: scale.label,
        clef: 'treble',
        notes: notesInRange(scale.notes, { name: 'G', octave: 3 }, { name: 'E', octave: 6 }),
      })
    }

    // ヘ音記号（ト音記号の2オクターブ下）
    if (isCMajor) {
      modes.push({
        id: `bass-${scale.id}-full`,
        label: `${scale.label} 全音域`,
        clef: 'bass',
        notes: notesInRange(scale.notes, { name: 'G', octave: 1 }, { name: 'E', octave: 4 }),
      })
      modes.push({
        id: `bass-${scale.id}-low`,
        label: `${scale.label} 低音域`,
        clef: 'bass',
        notes: notesInRange(scale.notes, { name: 'G', octave: 1 }, { name: 'C', octave: 3 }),
      })
      modes.push({
        id: `bass-${scale.id}-high`,
        label: `${scale.label} 高音域`,
        clef: 'bass',
        notes: notesInRange(scale.notes, { name: 'C', octave: 3 }, { name: 'E', octave: 4 }),
      })
    } else {
      modes.push({
        id: `bass-${scale.id}`,
        label: scale.label,
        clef: 'bass',
        notes: notesInRange(scale.notes, { name: 'G', octave: 1 }, { name: 'E', octave: 4 }),
      })
    }
  }

  return modes
}

export const GAME_MODES = buildModes()

export function getModesForClef(clef: Clef): GameMode[] {
  return GAME_MODES.filter((m) => m.clef === clef)
}

// --- 調号情報 ---

export function getVexKeySignature(keyId: string): string {
  const baseKey = keyId.replace(/-full|-low|-high/, '')
  const scale = SCALES.find((s) => s.id === baseKey)
  return scale?.vexKey ?? 'C'
}

/** 調号に含まれる臨時記号のセットを返す（例: G major → { F: '#' }） */
export function getKeyAccidentals(keyId: string): Map<NoteName, Accidental> {
  const baseKey = keyId.replace(/-full|-low|-high/, '')
  const scale = SCALES.find((s) => s.id === baseKey)
  const map = new Map<NoteName, Accidental>()
  if (scale) {
    for (const sn of scale.notes) {
      if (sn.accidental !== '') {
        map.set(sn.name, sn.accidental)
      }
    }
  }
  return map
}

/** 臨時記号練習用: 一定確率で調号と異なる臨時記号を付ける */
export function applyRandomAccidental(note: Note, keyId: string): Note {
  if (Math.random() > 0.25) return note // 75%はそのまま

  const keyAccidentals = getKeyAccidentals(keyId)
  const keyAcc = keyAccidentals.get(note.name) ?? ''

  if (keyAcc === '') {
    // 調号でナチュラルな音 → #かbを付ける
    // E#, B#, Fb, Cb は避ける
    const canSharp = note.name !== 'E' && note.name !== 'B'
    const canFlat = note.name !== 'F' && note.name !== 'C'
    if (canSharp && canFlat) {
      return { ...note, accidental: Math.random() < 0.5 ? '#' : 'b' }
    } else if (canSharp) {
      return { ...note, accidental: '#' }
    } else if (canFlat) {
      return { ...note, accidental: 'b' }
    }
  } else {
    // 調号で#やbが付いている音 → ナチュラルにする
    return { ...note, accidental: '' }
  }

  return note
}

// --- ピッチ比較（異名同音対応） ---

export function noteToSemitone(note: Note): number {
  let s = SEMITONES[note.name] + note.octave * 12
  if (note.accidental === '#') s += 1
  if (note.accidental === 'b') s -= 1
  return s
}

export function isSamePitch(a: Note, b: Note): boolean {
  return noteToSemitone(a) === noteToSemitone(b)
}

// --- ユーティリティ ---

export function noteToString(note: Note): string {
  return `${note.name}${note.accidental}${note.octave}`
}

export function pickRandomNote(notes: Note[]): Note {
  return notes[Math.floor(Math.random() * notes.length)]
}

/** VexFlow key format: e.g. "c/4", "f#/5" */
export function noteToVexKey(note: Note): string {
  return `${note.name.toLowerCase()}${note.accidental}/${note.octave}`
}

const NOTE_JA: Record<string, string> = {
  C: 'ド', D: 'レ', E: 'ミ', F: 'ファ', G: 'ソ', A: 'ラ', B: 'シ',
}

export function noteDisplayName(note: string): string {
  const match = note.match(/^([A-G])(#|b)?(\d)$/)
  if (!match) return note
  const [, name, acc, octave] = match
  const ja = NOTE_JA[name] ?? ''
  const accStr = acc === '#' ? '#' : acc === 'b' ? 'b' : ''
  return `${name}${accStr}${octave}(${ja})`
}

/** Tone.js format: e.g. "C4", "F#5" */
export function noteToToneFormat(note: Note): string {
  const acc = note.accidental === '#' ? '#' : note.accidental === 'b' ? 'b' : ''
  return `${note.name}${acc}${note.octave}`
}
