'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LayoutItem } from '@/lib/types'
import { collidesWith, cornersOf } from '@/lib/layout'
import { FurnitureArt } from './furniture-art'
import { Icon } from './icons'

export type CanvasRoom = {
  width_cm: number
  length_cm: number
  floor_color: string
  wall_color: string
}

type Gesture =
  | { type: 'move'; id: string; startX: number; startY: number; origX: number; origY: number; before: LayoutItem[] }
  | { type: 'resize'; id: string; startX: number; startY: number; origW: number; origD: number; origX: number; origY: number; before: LayoutItem[] }
  | { type: 'rotate'; id: string; cx: number; cy: number; before: LayoutItem[] }
  | { type: 'pan'; startX: number; startY: number; panX: number; panY: number }

export function PlanCanvas({
  room,
  items,
  selectedId,
  onSelect,
  onLive,
  onCommit,
  onZoom,
  zoom,
  pan,
  onPan,
  onMessage,
}: {
  room: CanvasRoom
  items: LayoutItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onLive: (items: LayoutItem[]) => void
  onCommit: (next: LayoutItem[], before: LayoutItem[]) => void
  zoom: number
  onZoom: (z: number) => void
  pan: { x: number; y: number }
  onPan: (p: { x: number; y: number }) => void
  onMessage: (msg: string) => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items
  const [fit, setFit] = useState(0.7)
  const [panning, setPanning] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      const scale = Math.min((rect.width - 110) / room.width_cm, (rect.height - 130) / room.length_cm)
      setFit(Math.max(0.12, Math.min(1.6, scale)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [room.width_cm, room.length_cm])

  // native, non-passive wheel zoom
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      onZoom(Math.min(2.4, Math.max(0.35, zoom * factor)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoom, onZoom])

  const extents = useCallback(
    (it: LayoutItem) => {
      const rad = (it.rotation * Math.PI) / 180
      const c = Math.abs(Math.cos(rad))
      const s = Math.abs(Math.sin(rad))
      return { w: it.w * c + it.d * s, d: it.w * s + it.d * c }
    },
    [],
  )

  const clampToRoom = useCallback(
    (it: LayoutItem): LayoutItem => {
      const e = extents(it)
      const minX = e.w / 2
      const maxX = room.width_cm - e.w / 2
      const minY = e.d / 2
      const maxY = room.length_cm - e.d / 2
      return {
        ...it,
        x: Math.round(minX > maxX ? room.width_cm / 2 : Math.min(Math.max(it.x, minX), maxX)),
        y: Math.round(minY > maxY ? room.length_cm / 2 : Math.min(Math.max(it.y, minY), maxY)),
      }
    },
    [extents, room.width_cm, room.length_cm],
  )

  const finish = useCallback(
    (gesture: Gesture) => {
      if (gesture.type === 'pan') return
      const current = itemsRef.current
      const moved = current.find((it) => it.id === gesture.id)
      if (!moved) return
      const outside = cornersOf(moved).some(
        (p) => p.x < -0.6 || p.y < -0.6 || p.x > room.width_cm + 0.6 || p.y > room.length_cm + 0.6,
      )
      const collisions = collidesWith(moved, current)
      if (outside) {
        onCommit(gesture.before, gesture.before)
        onMessage('That piece would cross the wall — try again closer in.')
        return
      }
      if (collisions.length) {
        onCommit(gesture.before, gesture.before)
        onMessage('That spot is taken — move it clear of other furniture.')
        return
      }
      const beforeMap = new Map(gesture.before.map((it) => [it.id, it]))
      const changed = current.some((it) => {
        const b = beforeMap.get(it.id)
        return b && (b.x !== it.x || b.y !== it.y || b.w !== it.w || b.d !== it.d || b.rotation !== it.rotation)
      })
      onCommit(current, changed ? gesture.before : current)
    },
    [onCommit, onMessage, room.width_cm, room.length_cm],
  )

  const beginMove = (e: React.PointerEvent, item: LayoutItem) => {
    e.stopPropagation()
    onSelect(item.id)
    const before = itemsRef.current.map((it) => ({ ...it }))
    gestureRef.current = {
      type: 'move',
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      before,
    }
    setDragging(item.id)
    const scale = Math.max(0.0001, fit * zoom)
    const move = (ev: PointerEvent) => {
      const g = gestureRef.current
      if (!g || g.type !== 'move') return
      const dx = (ev.clientX - g.startX) / scale
      const dy = (ev.clientY - g.startY) / scale
      const snapshot = g.before.find((it) => it.id === g.id)
      if (!snapshot) return
      const next = clampToRoom({ ...snapshot, x: Math.round(g.origX + dx), y: Math.round(g.origY + dy) })
      onLive(itemsRef.current.map((it) => (it.id === g.id ? next : it)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setDragging(null)
      const g = gestureRef.current
      gestureRef.current = null
      if (g) finish(g)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const beginResize = (e: React.PointerEvent, item: LayoutItem) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(item.id)
    const before = itemsRef.current.map((it) => ({ ...it }))
    gestureRef.current = {
      type: 'resize',
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origW: item.w,
      origD: item.d,
      origX: item.x,
      origY: item.y,
      before,
    }
    const scale = Math.max(0.0001, fit * zoom)
    const move = (ev: PointerEvent) => {
      const g = gestureRef.current
      if (!g || g.type !== 'resize') return
      const dx = (ev.clientX - g.startX) / scale
      const dy = (ev.clientY - g.startY) / scale
      const w = Math.min(560, Math.max(24, Math.round(g.origW + dx)))
      const d = Math.min(560, Math.max(24, Math.round(g.origD + dy)))
      const next = clampToRoom({
        ...(g.before.find((it) => it.id === g.id) as LayoutItem),
        w,
        d,
        x: Math.round(g.origX + (w - g.origW) / 2),
        y: Math.round(g.origY + (d - g.origD) / 2),
      })
      onLive(itemsRef.current.map((it) => (it.id === g.id ? next : it)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      const g = gestureRef.current
      gestureRef.current = null
      if (g) finish(g)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const beginRotate = (e: React.PointerEvent, item: LayoutItem) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(item.id)
    const el = (e.currentTarget as HTMLElement).closest('.plan-item') as HTMLElement | null
    const rect = el?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : e.clientX
    const cy = rect ? rect.top + rect.height / 2 : e.clientY
    const before = itemsRef.current.map((it) => ({ ...it }))
    gestureRef.current = { type: 'rotate', id: item.id, cx, cy, before }
    const move = (ev: PointerEvent) => {
      const g = gestureRef.current
      if (!g || g.type !== 'rotate') return
      const angle = (Math.atan2(ev.clientY - g.cy, ev.clientX - g.cx) * 180) / Math.PI + 90
      const snapped = Math.round(angle / 5) * 5
      const normalized = ((snapped % 360) + 360) % 360
      onLive(
        itemsRef.current.map((it) =>
          it.id === g.id ? clampToRoom({ ...it, rotation: normalized }) : it,
        ),
      )
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      const g = gestureRef.current
      gestureRef.current = null
      if (g) finish(g)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const beginPan = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (e.target !== stageRef.current && !(e.target as HTMLElement).classList.contains('room-slab')) return
    onSelect('')
    setPanning(true)
    const startX = e.clientX
    const startY = e.clientY
    const base = { ...pan }
    const move = (ev: PointerEvent) => {
      onPan({ x: base.x + (ev.clientX - startX), y: base.y + (ev.clientY - startY) })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setPanning(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const fitScale = fit * zoom
  const selected = items.find((it) => it.id === selectedId) ?? null
  const invalidIds = new Set<string>()
  for (const it of items) {
    if (it.category === 'rug') continue
    if (collidesWith(it, items).length) invalidIds.add(it.id)
  }

  return (
    <div
      ref={stageRef}
      className={`stage-canvas ${panning ? 'is-panning' : ''}`}
      onPointerDown={beginPan}
    >
      <div
        className="stage-world"
        style={{
          width: room.width_cm * fit,
          height: room.length_cm * fit,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
        }}
      >
        <div
          className="room-slab"
          style={{
            inset: 0,
            background: room.floor_color,
          }}
        >
          {showGrid ? (
            <div
              className="room-grid-layer"
              style={{
                backgroundSize: `${50 * fit}px ${50 * fit}px`,
                backgroundImage: `linear-gradient(to right, rgba(43,35,51,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,35,51,0.07) 1px, transparent 1px)`,
              }}
            />
          ) : null}
        </div>

        {items
          .slice()
          .sort((a, b) => (a.category === 'rug' ? -1 : b.category === 'rug' ? 1 : 0))
          .map((it) => {
            const isSelected = it.id === selectedId
            return (
              <div
                key={it.id}
                className={`plan-item ${isSelected ? 'is-selected' : ''} ${
                  invalidIds.has(it.id) ? 'is-invalid' : ''
                } ${dragging === it.id ? 'is-dragging' : ''}`}
                style={{
                  left: (it.x - it.w / 2) * fit,
                  top: (it.y - it.d / 2) * fit,
                  width: it.w * fit,
                  height: it.d * fit,
                  transform: `rotate(${it.rotation}deg)`,
                  zIndex: isSelected ? 60 : it.category === 'rug' ? 2 : 5,
                }}
                onPointerDown={(e) => beginMove(e, it)}
                title={`${it.name} — ${it.w}×${it.d} cm`}
              >
                <FurnitureArt category={it.category} color={it.color} />
                {isSelected ? (
                  <>
                    <span
                      className="handle handle--rotate"
                      onPointerDown={(e) => beginRotate(e, it)}
                      title="Rotate"
                    />
                    <span
                      className="handle handle--resize"
                      onPointerDown={(e) => beginResize(e, it)}
                      title="Resize"
                    />
                  </>
                ) : null}
              </div>
            )
          })}
      </div>

      <div className="planner-hint">
        Drag to arrange · handles to rotate &amp; resize · scroll to zoom · walls stop furniture
      </div>

      <div className="zoom-badge">
        <button type="button" onClick={() => setShowGrid((v) => !v)} title="Toggle grid" aria-label="Toggle grid">
          <Icon name="grid" className="icon icon-sm" />
        </button>
        <button type="button" onClick={() => onZoom(Math.max(0.35, zoom - 0.15))} aria-label="Zoom out">
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => onZoom(Math.min(2.4, zoom + 0.15))} aria-label="Zoom in">
          +
        </button>
        <button
          type="button"
          onClick={() => {
            onZoom(1)
            onPan({ x: 0, y: 0 })
          }}
          title="Fit to screen"
          aria-label="Fit to screen"
        >
          <Icon name="maximize" className="icon icon-sm" />
        </button>
      </div>

      {selected ? null : null}
    </div>
  )
}
