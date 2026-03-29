import { useMemo } from 'react'
import type { Note, NoteName, Octave, Clef } from '../types'
import { isSamePitch } from '../lib/notes'

interface Props {
  onKeyPress: (note: Note) => void
  highlightNote?: Note | null
  highlightColor?: string
  showLabels?: boolean
  clef?: Clef
}

const NOTE_NAMES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const HAS_BLACK_KEY: NoteName[] = ['C', 'D', 'F', 'G', 'A']

// ト音記号: G3〜E6、ヘ音記号: G1〜E4
const KEY_RANGES: Record<Clef, { octave: number; start: NoteName; end: NoteName }[]> = {
  treble: [
    { octave: 3, start: 'G', end: 'B' },
    { octave: 4, start: 'C', end: 'B' },
    { octave: 5, start: 'C', end: 'B' },
    { octave: 6, start: 'C', end: 'E' },
  ],
  bass: [
    { octave: 1, start: 'G', end: 'B' },
    { octave: 2, start: 'C', end: 'B' },
    { octave: 3, start: 'C', end: 'B' },
    { octave: 4, start: 'C', end: 'E' },
  ],
}

interface BlackKey {
  whiteIndex: number
  note: Note
  label: string
}

function buildKeys(clef: Clef) {
  const whiteKeys: { note: Note }[] = []
  for (const r of KEY_RANGES[clef]) {
    const si = NOTE_NAMES.indexOf(r.start)
    const ei = NOTE_NAMES.indexOf(r.end)
    for (let i = si; i <= ei; i++) {
      whiteKeys.push({
        note: { name: NOTE_NAMES[i], accidental: '', octave: r.octave as Octave },
      })
    }
  }

  const blackKeys: BlackKey[] = whiteKeys.flatMap((wk, i) => {
    if (!HAS_BLACK_KEY.includes(wk.note.name)) return []
    return [{
      whiteIndex: i,
      note: { name: wk.note.name, accidental: '#' as const, octave: wk.note.octave },
      label: `${wk.note.name}#`,
    }]
  })

  return { whiteKeys, blackKeys }
}

export default function PianoKeyboard({ onKeyPress, highlightNote, highlightColor, showLabels = false, clef = 'treble' }: Props) {
  const { whiteKeys, blackKeys } = useMemo(() => buildKeys(clef), [clef])
  const totalWhite = whiteKeys.length
  const whiteKeyWidth = `${100 / totalWhite}%`
  const blackWidth = 100 / totalWhite * 0.6

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '40vh',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* 白鍵 */}
      <div style={{ display: 'flex', height: '100%' }}>
        {whiteKeys.map((k, i) => {
          const highlighted = highlightNote && isSamePitch(highlightNote, k.note)
          const bg = highlighted ? (highlightColor ?? '#4ade80') : '#fff'
          const isC = k.note.name === 'C'
          return (
            <div
              key={`${k.note.name}${k.note.octave}`}
              onClick={() => onKeyPress(k.note)}
              style={{
                width: whiteKeyWidth,
                height: '100%',
                background: bg,
                borderTop: '1px solid #999',
                borderBottom: '1px solid #999',
                borderLeft: i === 0 ? '1px solid #999' : 'none',
                borderRight: '1px solid #999',
                borderRadius: '0 0 5px 5px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 6,
                fontSize: 11,
                fontWeight: isC ? 'bold' : 'normal',
                color: highlighted ? '#fff' : isC ? '#333' : '#aaa',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              {showLabels ? (isC ? `C${k.note.octave}` : k.note.name) : null}
            </div>
          )
        })}
      </div>

      {/* 黒鍵 */}
      {blackKeys.map((bk) => {
        const highlighted = highlightNote && isSamePitch(highlightNote, bk.note)
        const bg = highlighted ? (highlightColor ?? '#4ade80') : '#333'
        const borderCenter = ((bk.whiteIndex + 1) / totalWhite) * 100
        const leftPercent = borderCenter - blackWidth / 2
        return (
          <div
            key={`black-${bk.note.name}${bk.note.octave}`}
            onClick={() => onKeyPress(bk.note)}
            style={{
              position: 'absolute',
              top: 0,
              left: `${leftPercent}%`,
              width: `${blackWidth}%`,
              height: '58%',
              background: bg,
              borderRadius: '0 0 3px 3px',
              zIndex: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 4,
              fontSize: 9,
              color: highlighted ? '#fff' : '#888',
            }}
          >
            {showLabels ? bk.label : null}
          </div>
        )
      })}
    </div>
  )
}
