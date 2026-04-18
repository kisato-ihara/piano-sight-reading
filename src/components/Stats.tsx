import { useEffect, useState } from 'react'
import { getStatsPerNote, type NoteStats } from '../lib/weaknessTracker'
import { noteDisplayName } from '../lib/notes'

interface Props {
  refreshKey: number
  onBack: () => void
}

type SortKey = 'errorRate' | 'avgTime'
type ClefTab = 'treble' | 'bass'

export default function Stats({ refreshKey, onBack }: Props) {
  const [stats, setStats] = useState<Map<string, NoteStats>>(new Map())
  const [sortKey, setSortKey] = useState<SortKey>('errorRate')
  const [clefTab, setClefTab] = useState<ClefTab>('treble')

  useEffect(() => {
    getStatsPerNote(clefTab).then(setStats)
  }, [refreshKey, clefTab])

  const sorted = [...stats.entries()].sort((a, b) => {
    if (sortKey === 'errorRate') {
      return b[1].mistakes / b[1].total - a[1].mistakes / a[1].total
    }
    return b[1].avgResponseMs - a[1].avgResponseMs
  })

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: '8px 12px',
    cursor: 'pointer',
    color: sortKey === key ? '#3b82f6' : undefined,
    fontWeight: sortKey === key ? 'bold' : 'normal',
    textAlign: 'left',
  })

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    fontSize: 15,
    borderRadius: 6,
    border: active ? '2px solid #3b82f6' : '1px solid #ccc',
    background: active ? '#dbeafe' : '#fff',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
  })

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 12,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 20px',
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          もどる
        </button>
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>統計（直近200回）</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setClefTab('treble')} style={tabStyle(clefTab === 'treble')}>
            ト音
          </button>
          <button onClick={() => setClefTab('bass')} style={tabStyle(clefTab === 'bass')}>
            ヘ音
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 32 }}>
          データがありません
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', fontSize: 15, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>音</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>回数</th>
                <th style={{ ...thStyle('errorRate'), textAlign: 'right' }} onClick={() => setSortKey('errorRate')}>
                  ミス率 {sortKey === 'errorRate' ? '▼' : ''}
                </th>
                <th style={{ ...thStyle('avgTime'), textAlign: 'right' }} onClick={() => setSortKey('avgTime')}>
                  平均(秒) {sortKey === 'avgTime' ? '▼' : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([note, s]) => {
                const errorRate = Math.round((s.mistakes / s.total) * 100)
                return (
                  <tr key={note} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>{noteDisplayName(note)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>{s.total}</td>
                    <td
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        color: errorRate >= 30 ? '#dc2626' : errorRate >= 10 ? '#d97706' : '#16a34a',
                      }}
                    >
                      {errorRate}%
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>{(s.avgResponseMs / 1000).toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
