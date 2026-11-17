'use client'

import { useState } from 'react'
import { ROOM_TYPES, STYLES, money, roomTypeLabel } from '@/lib/design'
import type { FurnitureRow } from '@/lib/types'
import { FurnitureArt } from './furniture-art'
import { Icon } from './icons'

export type AiPlanClient = {
  headline: string
  summary: string
  themeId: string
  themeName: string
  palette: { name: string; hex: string; note: string }[]
  picks: (FurnitureRow & { role: string })[]
  total: number
  budget: number
  tips: string[]
}

const MOODS = [
  { id: 'soft', label: 'Soft' },
  { id: 'warm', label: 'Warm' },
  { id: 'fresh', label: 'Fresh' },
  { id: 'calm', label: 'Calm' },
]

export function AiStylist({
  roomType: initialRoomType = 'living',
  style: initialStyle = 'scandinavian',
  budget: initialBudget = 8000,
  compact = false,
  onApplyPalette,
  onAddPicks,
}: {
  roomType?: string
  style?: string
  budget?: number
  compact?: boolean
  onApplyPalette?: (plan: AiPlanClient) => void
  onAddPicks?: (plan: AiPlanClient) => void
}) {
  const [roomType, setRoomType] = useState(initialRoomType)
  const [style, setStyle] = useState(initialStyle)
  const [budget, setBudget] = useState(initialBudget)
  const [mood, setMood] = useState('soft')
  const [plan, setPlan] = useState<AiPlanClient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ask() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType, style, budget, mood, seed: Date.now() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'The stylist is quiet right now.')
      setPlan(data.plan)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-card">
      <div className="row" style={{ gap: 8 }}>
        <Icon name="sparkles" className="icon" />
        <strong style={{ fontSize: '0.95rem' }}>Design assistant</strong>
      </div>
      <p className="tiny" style={{ color: 'var(--ink-soft)', marginTop: -6 }}>
        Palette, furniture and budget suggestions for this room.
      </p>

      {!compact ? (
        <div className="form-grid form-grid-2">
          <div className="field">
            <label htmlFor="ai-room">Room type</label>
            <select id="ai-room" className="select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              {ROOM_TYPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ai-style">Style</label>
            <select id="ai-style" className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className="ai-chips">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`chip ${mood === m.id ? 'is-active' : ''}`}
            onClick={() => setMood(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!compact ? (
        <div className="field">
          <label htmlFor="ai-budget">Budget — {money(budget)}</label>
          <input
            id="ai-budget"
            type="range"
            min={1500}
            max={40000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="range"
          />
        </div>
      ) : null}

      <button type="button" className="btn btn-primary btn-sm" onClick={ask} disabled={loading}>
        <Icon name="sparkles" className="icon icon-sm" />
        {loading ? 'Thinking…' : plan ? 'Suggest another scheme' : 'Style this room'}
      </button>

      {error ? <div className="form-error">{error}</div> : null}

      {plan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{plan.headline}</h4>
            <p className="tiny" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
              {roomTypeLabel(roomType)} · {plan.themeName}
            </p>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>{plan.summary}</p>

          <div className="ai-palette">
            {plan.palette.map((c) => (
              <div
                key={`${c.hex}${c.name}`}
                className="ai-swatch"
                style={{ background: c.hex, color: '#2b2333' }}
                title={c.note}
              >
                {c.name}
                <small style={{ fontWeight: 500, opacity: 0.65 }}>{c.hex}</small>
              </div>
            ))}
          </div>

          <div className="ai-suggestion">
            <h4>Furniture picks · {money(plan.total)} of {money(plan.budget)}</h4>
            <div className="ai-picks">
              {plan.picks.map((p) => (
                <div key={p.id} className="ai-pick">
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <FurnitureArt category={p.category} color={p.color} className="thumb" />
                    {p.name}
                  </span>
                  <strong>{money(p.price)}</strong>
                </div>
              ))}
            </div>
            {onAddPicks ? (
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => onAddPicks(plan)}>
                <Icon name="plus" className="icon icon-sm" /> Add these to the room
              </button>
            ) : null}
          </div>

          {onApplyPalette ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onApplyPalette(plan)}>
              <Icon name="palette" className="icon icon-sm" /> Apply this palette
            </button>
          ) : null}

          <div className="ai-suggestion">
            <h4>Stylist notes</h4>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.79rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              {plan.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
