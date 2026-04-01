import { useEffect, useRef, useState } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'
import { getVexKeySignature, GAME_MODES, noteToVexKey } from '../lib/notes'
import { getBestTime, getBestScore } from '../lib/db'
import type { Clef } from '../types'

interface Props {
  selectedClef: Clef
  onSelectClef: (clef: Clef) => void
  selectedKey: string
  onSelectKey: (key: string) => void
  weaknessEnabled: boolean
  onToggleWeakness: () => void
  accidentalEnabled: boolean
  onToggleAccidental: () => void
  onStart: () => void
}

const CLEF_OPTIONS: { id: Clef; label: string }[] = [
  { id: 'treble', label: 'ト音記号' },
  { id: 'bass', label: 'ヘ音記号' },
]

const C_MAJOR_RANGES = [
  { suffix: 'full', label: 'ハ長調 全音域' },
  { suffix: 'low', label: 'ハ長調 低音域' },
  { suffix: 'high', label: 'ハ長調 高音域' },
]

const SHARP_KEYS = [
  { id: 'g-major', label: 'ト長調' },
  { id: 'd-major', label: 'ニ長調' },
  { id: 'a-major', label: 'イ長調' },
  { id: 'e-major', label: 'ホ長調' },
  { id: 'b-major', label: 'ロ長調' },
]

const FLAT_KEYS = [
  { id: 'f-major', label: 'ヘ長調' },
  { id: 'bb-major', label: '変ロ長調' },
  { id: 'eb-major', label: '変ホ長調' },
  { id: 'ab-major', label: '変イ長調' },
  { id: 'db-major', label: '変ニ長調' },
]

function KeySignatureDisplay({ clef, keyId, modeId }: { clef: Clef; keyId: string; modeId: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const vexKey = getVexKeySignature(keyId)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''

    const mode = GAME_MODES.find((m) => m.id === modeId)
    const notes = mode?.notes ?? []
    const lowNote = notes[0]
    const highNote = notes[notes.length - 1]

    const hasRange = lowNote && highNote
    const width = hasRange ? 200 : 140
    const height = 130
    const renderer = new Renderer(ref.current, Renderer.Backends.SVG)
    renderer.resize(width, height)
    const context = renderer.getContext()

    const stave = new Stave(0, 5, width)
    stave.addClef(clef)
    if (vexKey !== 'C') {
      stave.addKeySignature(vexKey)
    }
    stave.setContext(context).draw()

    if (hasRange) {
      const staveNotes = [lowNote, highNote].map((n) => {
        const sn = new StaveNote({
          keys: [noteToVexKey(n)],
          duration: 'h',
          clef,
          autoStem: true,
        })
        sn.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#3b82f6' })
        return sn
      })
      const voice = new Voice({ numBeats: 4, beatValue: 4 })
      voice.addTickables(staveNotes)
      new Formatter().joinVoices([voice]).format([voice], width - 120)
      voice.draw(context, stave)
    }
  }, [clef, vexKey, modeId])

  return <div ref={ref} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }} />
}

const btnBase: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  fontSize: 16,
  cursor: 'pointer',
  textAlign: 'center',
}

function btn(selected: boolean): React.CSSProperties {
  return {
    ...btnBase,
    border: selected ? '2px solid #3b82f6' : '1px solid #ccc',
    background: selected ? '#dbeafe' : '#fff',
    fontWeight: selected ? 'bold' : 'normal',
  }
}

export default function ModeSelector({
  selectedClef,
  onSelectClef,
  selectedKey,
  onSelectKey,
  weaknessEnabled,
  onToggleWeakness,
  accidentalEnabled,
  onToggleAccidental,
  onStart,
}: Props) {
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const modeId = `${selectedClef}-${selectedKey}`

  useEffect(() => {
    getBestTime(modeId, accidentalEnabled).then(setBestTime)
    getBestScore(modeId, accidentalEnabled).then(setBestScore)
  }, [modeId, accidentalEnabled])

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Column 1: 調号表示 + スタート */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 140 }}>
        <KeySignatureDisplay clef={selectedClef} keyId={selectedKey} modeId={modeId} />
        <button
          onClick={onStart}
          style={{
            padding: '14px 28px',
            fontSize: 20,
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          スタート
        </button>
        <div style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>
          <div>{bestScore != null ? `${bestScore}点` : '---'} / {bestTime != null ? `${(bestTime / 1000).toFixed(1)}秒` : '---'}</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
          <input type="checkbox" checked={weaknessEnabled} onChange={onToggleWeakness} style={{ width: 18, height: 18 }} />
          苦手克服
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
          <input type="checkbox" checked={accidentalEnabled} onChange={onToggleAccidental} style={{ width: 18, height: 18 }} />
          臨時記号
        </label>
      </div>

      {/* Column 2: 音部記号 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CLEF_OPTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectClef(c.id)}
            style={btn(selectedClef === c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Column 3: ハ長調 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {C_MAJOR_RANGES.map((r) => {
          const key = `c-major-${r.suffix}`
          return (
            <button
              key={r.suffix}
              onClick={() => onSelectKey(key)}
              style={btn(selectedKey === key)}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Column 4: #系 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SHARP_KEYS.map((k) => (
          <button
            key={k.id}
            onClick={() => onSelectKey(k.id)}
            style={btn(selectedKey === k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Column 5: ♭系 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FLAT_KEYS.map((k) => (
          <button
            key={k.id}
            onClick={() => onSelectKey(k.id)}
            style={btn(selectedKey === k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  )
}
