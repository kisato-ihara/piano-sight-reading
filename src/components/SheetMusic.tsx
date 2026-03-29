import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow'
import type { Note, Clef } from '../types'
import { noteToVexKey } from '../lib/notes'

interface Props {
  notes: Note[]
  clef: Clef
}

const VISIBLE_COUNT = 8

export default function SheetMusic({ notes, clef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return

    const div = containerRef.current
    div.innerHTML = ''

    const visibleCount = Math.min(notes.length, VISIBLE_COUNT)
    const noteSpacing = 50
    const clefWidth = 60
    const width = clefWidth + visibleCount * noteSpacing + 20
    const height = 150

    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(width, height)
    const context = renderer.getContext()

    const stave = new Stave(0, 10, width)
    stave.addClef(clef)
    stave.setContext(context).draw()

    const staveNotes = notes.slice(0, visibleCount).map((note, i) => {
      const vexKey = noteToVexKey(note)
      const sn = new StaveNote({
        keys: [vexKey],
        duration: 'q',
        clef,
      })
      if (i === 0) {
        sn.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#3b82f6' })
      } else {
        sn.setStyle({ fillStyle: '#999', strokeStyle: '#999' })
      }
      if (note.accidental === '#') sn.addModifier(new Accidental('#'))
      else if (note.accidental === 'b') sn.addModifier(new Accidental('b'))
      return sn
    })

    const voice = new Voice({ numBeats: visibleCount, beatValue: 4 })
    voice.addTickables(staveNotes)
    new Formatter().joinVoices([voice]).format([voice], width - clefWidth - 30)
    voice.draw(context, stave)
  }, [notes, clef])

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
