import { useEffect, useState } from 'react'
import { getStatsPerNote, type NoteStats } from '../lib/weaknessTracker'

interface Props {
  mode: string
  refreshKey: number
}

export default function Stats({ mode, refreshKey }: Props) {
  const [stats, setStats] = useState<Map<string, NoteStats>>(new Map())
  const [show, setShow] = useState(false)

  useEffect(() => {
    getStatsPerNote(mode).then(setStats)
  }, [mode, refreshKey])

  if (stats.size === 0) return null

  const sorted = [...stats.entries()].sort((a, b) => {
    const rateA = a[1].mistakes / a[1].total
    const rateB = b[1].mistakes / b[1].total
    return rateB - rateA
  })

  return (
    <div style={{ padding: '0 8px' }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          background: 'none',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {show ? '統計を隠す' : '統計を表示'}
      </button>
      {show && (
        <table style={{ width: '100%', marginTop: 8, fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: 4 }}>音</th>
              <th style={{ padding: 4 }}>回数</th>
              <th style={{ padding: 4 }}>ミス率</th>
              <th style={{ padding: 4 }}>平均(ms)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([note, s]) => (
              <tr key={note} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 4 }}>{note}</td>
                <td style={{ padding: 4 }}>{s.total}</td>
                <td style={{ padding: 4 }}>{Math.round((s.mistakes / s.total) * 100)}%</td>
                <td style={{ padding: 4 }}>{Math.round(s.avgResponseMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
