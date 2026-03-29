import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Barline } from 'vexflow'
import type { Note, NoteName, Accidental as AccType, Clef } from '../types'
import { noteToVexKey, getKeyAccidentals } from '../lib/notes'

interface Props {
  notes: Note[]
  currentIndex: number
  clef: Clef
  keySignature?: string // VexFlow key name e.g. 'G', 'D', 'F'
  selectedKey?: string  // mode key id e.g. 'g-major', 'c-major-full'
}

const NOTES_PER_ROW = 16
const BEATS_PER_MEASURE = 4
const MEASURES_PER_ROW = NOTES_PER_ROW / BEATS_PER_MEASURE

export default function SheetMusic({ notes, currentIndex, clef, keySignature = 'C', selectedKey = 'c-major-full' }: Props) {
  const keyAccidentals = getKeyAccidentals(selectedKey)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return

    const div = containerRef.current
    div.innerHTML = ''

    const row1Notes = notes.slice(0, NOTES_PER_ROW)
    const row2Notes = notes.slice(NOTES_PER_ROW, NOTES_PER_ROW * 2)

    const clefWidth = 50
    const measureWidth = 160
    const totalWidth = clefWidth + MEASURES_PER_ROW * measureWidth
    const rowHeight = 110
    const height = row2Notes.length > 0 ? rowHeight * 2 + 10 : rowHeight + 10

    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(totalWidth, height)
    const context = renderer.getContext()

    drawRow(context, row1Notes, clef, 0, 0, clefWidth, measureWidth, currentIndex, 0, keySignature, keyAccidentals)
    if (row2Notes.length > 0) {
      drawRow(context, row2Notes, clef, 0, rowHeight, clefWidth, measureWidth, currentIndex, NOTES_PER_ROW, keySignature, keyAccidentals)
    }
  }, [notes, currentIndex, clef])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    />
  )
}

function drawRow(
  context: ReturnType<InstanceType<typeof Renderer>['getContext']>,
  rowNotes: Note[],
  clef: Clef,
  x: number,
  y: number,
  clefWidth: number,
  measureWidth: number,
  currentIndex: number,
  rowOffset: number,
  keySignature: string,
  keyAccidentals: Map<NoteName, AccType>,
) {
  for (let m = 0; m < MEASURES_PER_ROW; m++) {
    const isFirst = m === 0
    const isLast = m === MEASURES_PER_ROW - 1
    const staveX = x + (isFirst ? 0 : clefWidth + m * measureWidth)
    const staveW = isFirst ? clefWidth + measureWidth : measureWidth

    const stave = new Stave(staveX, y, staveW)
    if (isFirst) {
      stave.addClef(clef)
      if (keySignature !== 'C') {
        stave.addKeySignature(keySignature)
      }
    }
    if (isLast) {
      stave.setEndBarType(Barline.type.DOUBLE)
    }
    stave.setContext(context).draw()

    const measureNotes = rowNotes.slice(m * BEATS_PER_MEASURE, (m + 1) * BEATS_PER_MEASURE)
    if (measureNotes.length === 0) continue

    const staveNotes: StaveNote[] = measureNotes.map((note, i) => {
      const absoluteIndex = rowOffset + m * BEATS_PER_MEASURE + i
      const vexKey = noteToVexKey(note)
      const sn = new StaveNote({
        keys: [vexKey],
        duration: 'q',
        clef,
      })
      if (absoluteIndex === currentIndex) {
        sn.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#3b82f6' })
      } else if (absoluteIndex < currentIndex) {
        sn.setStyle({ fillStyle: '#ccc', strokeStyle: '#ccc' })
      } else {
        sn.setStyle({ fillStyle: '#333', strokeStyle: '#333' })
      }
      // 調号に含まれない臨時記号のみ個別表示
      const keyAcc = keyAccidentals.get(note.name)
      if (note.accidental !== '' && note.accidental !== keyAcc) {
        sn.addModifier(new Accidental(note.accidental))
      }
      return sn
    })

    for (let i = staveNotes.length; i < BEATS_PER_MEASURE; i++) {
      const rest = new StaveNote({ keys: ['b/4'], duration: 'qr', clef })
      rest.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' })
      staveNotes.push(rest)
    }

    const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 })
    voice.addTickables(staveNotes)
    new Formatter().joinVoices([voice]).format([voice], staveW - (isFirst ? clefWidth + 10 : 20))
    voice.draw(context, stave)
  }
}
