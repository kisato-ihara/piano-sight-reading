import { useState, useCallback, useRef } from 'react'
import SheetMusic from './components/SheetMusic'
import PianoKeyboard from './components/PianoKeyboard'
import ModeSelector from './components/ModeSelector'
import Stats from './components/Stats'
import { GAME_MODES, pickRandomNote, noteToString, noteToToneFormat, isSamePitch, getVexKeySignature, applyRandomAccidental } from './lib/notes'
import { initSound, playNote } from './lib/sound'
import { getWeightedNotes } from './lib/weaknessTracker'
import { db, getBestTime, saveBestTime } from './lib/db'
import type { Note, Clef, GameState } from './types'

const TOTAL_QUESTIONS = 32

export default function App() {
  const [clef, setClef] = useState<Clef>('treble')
  const [selectedKey, setSelectedKey] = useState('c-major-full')
  const [weaknessEnabled, setWeaknessEnabled] = useState(false)
  const [accidentalEnabled, setAccidentalEnabled] = useState(false)
  const [noteQueue, setNoteQueue] = useState<Note[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [highlightNote, setHighlightNote] = useState<Note | null>(null)
  const [highlightColor, setHighlightColor] = useState<string>('#4ade80')
  const [message, setMessage] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [statsRefresh, setStatsRefresh] = useState(0)
  const startTimeRef = useRef(0)
  const setStartTimeRef = useRef(0)
  const [clearTimeMs, setClearTimeMs] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const modeId = `${clef}-${selectedKey}`
  const currentMode = GAME_MODES.find((m) => m.id === modeId)
  const currentNote = noteQueue[currentIndex] ?? null

  const startQuiz = useCallback(async () => {
    if (!currentMode) return
    await initSound()
    let pool = currentMode.notes
    if (weaknessEnabled) {
      pool = await getWeightedNotes(currentMode.notes, modeId)
    }
    const queue = Array.from({ length: TOTAL_QUESTIONS }, () => {
      const note = pickRandomNote(pool)
      return accidentalEnabled ? applyRandomAccidental(note, selectedKey) : note
    })
    setNoteQueue(queue)
    setCurrentIndex(0)
    setGameState('playing')
    setHighlightNote(null)
    setMessage('')
    setScore({ correct: 0, total: 0 })
    setClearTimeMs(0)
    setIsNewRecord(false)
    const best = await getBestTime(modeId, accidentalEnabled)
    setBestTime(best)
    const now = performance.now()
    startTimeRef.current = now
    setStartTimeRef.current = now
  }, [currentMode, modeId, weaknessEnabled, accidentalEnabled, selectedKey])

  const handleAnswer = useCallback(
    async (answer: Note) => {
      if (gameState !== 'playing' || !currentNote) return

      const responseTimeMs = Math.round(performance.now() - startTimeRef.current)
      const correct = isSamePitch(answer, currentNote)

      await db.answers.add({
        note: noteToString(currentNote),
        correct,
        responseTimeMs,
        mode: modeId,
        timestamp: Date.now(),
      })

      if (correct) {
        setHighlightNote(answer)
        setHighlightColor('#4ade80')
        playNote(noteToToneFormat(currentNote))
        setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }))
        setStatsRefresh((n) => n + 1)

        const nextIndex = currentIndex + 1
        if (nextIndex >= TOTAL_QUESTIONS) {
          const totalTime = Math.round(performance.now() - setStartTimeRef.current)
          setClearTimeMs(totalTime)
          const newRecord = await saveBestTime(modeId, accidentalEnabled, totalTime)
          setIsNewRecord(newRecord)
          if (newRecord) setBestTime(totalTime)
          setGameState('finished')
        } else {
          setCurrentIndex(nextIndex)
          startTimeRef.current = performance.now()
          setTimeout(() => setHighlightNote(null), 300)
        }
      } else {
        setHighlightNote(answer)
        setHighlightColor('#f87171')
        setMessage('ちがう!')
        setTimeout(() => {
          setHighlightNote(null)
          setMessage('')
        }, 500)
      }
    },
    [gameState, currentNote, currentIndex, modeId, accidentalEnabled],
  )

  const handleStop = useCallback(() => {
    clearTimeout(timerRef.current)
    setGameState('idle')
    setNoteQueue([])
    setCurrentIndex(0)
    setHighlightNote(null)
    setMessage('')
    setScore({ correct: 0, total: 0 })
  }, [])

  const isPlaying = gameState === 'playing' || gameState === 'feedback'

  // 統計画面
  if (gameState === 'stats') {
    return <Stats mode={modeId} refreshKey={statsRefresh} onBack={() => setGameState('idle')} />
  }

  // ready画面: 鍵盤+音名を表示
  if (gameState === 'ready') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 16px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 16, color: '#666' }}>鍵盤の位置を確認してください</div>
            <button
              onClick={startQuiz}
              style={{
                padding: '12px 32px',
                fontSize: 18,
                borderRadius: 8,
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              スタート
            </button>
            <button
              onClick={handleStop}
              style={{
                padding: '4px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #ccc',
                background: '#f5f5f5',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              もどる
            </button>
          </div>
        </div>
        <PianoKeyboard onKeyPress={() => {}} showLabels clef={clef} />
      </div>
    )
  }

  // プレイ中
  if (isPlaying && currentMode) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 16px', minHeight: 0 }}>
          <SheetMusic notes={noteQueue} currentIndex={currentIndex} clef={currentMode.clef} keySignature={getVexKeySignature(selectedKey)} selectedKey={selectedKey} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 120 }}>
            <div style={{ fontSize: 14, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
              {score.correct} / {score.total} (残り {TOTAL_QUESTIONS - currentIndex})
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                minHeight: 28,
                color: highlightColor === '#4ade80' ? '#16a34a' : '#dc2626',
              }}
            >
              {message}
            </div>
            <button
              onClick={handleStop}
              style={{
                padding: '4px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #ccc',
                background: '#f5f5f5',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              やめる
            </button>
          </div>
        </div>

        <PianoKeyboard
          onKeyPress={handleAnswer}
          highlightNote={highlightNote}
          highlightColor={highlightColor}
          clef={clef}
        />
      </div>
    )
  }

  // 待機・終了画面
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 16,
      }}
    >
      {gameState === 'finished' ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>
            {isNewRecord ? '新記録!' : 'セット完了!'}
          </div>
          <div style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>
            {(clearTimeMs / 1000).toFixed(1)}秒
          </div>
          <div style={{ fontSize: 16, color: '#666' }}>
            {score.correct} / {score.total} 正解
            ({Math.round((score.correct / score.total) * 100)}%)
          </div>
          <div style={{ fontSize: 14, color: '#999' }}>
            ベスト: {bestTime != null ? `${(bestTime / 1000).toFixed(1)}秒` : '---'}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={startQuiz}
              style={{
                padding: '12px 32px',
                fontSize: 18,
                borderRadius: 8,
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              もう1回
            </button>
            <button
              onClick={handleStop}
              style={{
                padding: '12px 32px',
                fontSize: 18,
                borderRadius: 8,
                border: '1px solid #ccc',
                background: '#f5f5f5',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              終わる
            </button>
          </div>
        </div>
      ) : (
        <ModeSelector
          selectedClef={clef}
          onSelectClef={setClef}
          selectedKey={selectedKey}
          onSelectKey={setSelectedKey}
          weaknessEnabled={weaknessEnabled}
          onToggleWeakness={() => setWeaknessEnabled(!weaknessEnabled)}
          accidentalEnabled={accidentalEnabled}
          onToggleAccidental={() => setAccidentalEnabled(!accidentalEnabled)}
          onStart={() => setGameState('ready')}
        />
      )}

      <button
        onClick={() => setGameState('stats')}
        style={{
          padding: '8px 20px',
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #ccc',
          background: '#f5f5f5',
          cursor: 'pointer',
        }}
      >
        統計
      </button>
    </div>
  )
}
