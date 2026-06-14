import React, { useRef, useEffect, useCallback } from 'react'
import useStore from '../store.js'
import { getEquipmentDef } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'
import { drawEquipmentShape } from '../utils/drawEquipment.js'

const HALL_W = 40
const HALL_H = 20
const BASE_PPM = 20

const DRAW_TOOLS = new Set(['draw-free', 'draw-line', 'draw-arrow'])

export default function View2D({ canvasRef }) {
  const internalRef = useRef(null)
  const resolvedRef = canvasRef || internalRef

  const vpRef = useRef({ x: 40, y: 20, scale: 1 })
  const dragRef = useRef(null)
  const drawingRef = useRef(null)  // in-progress drawing
  const animRef = useRef(null)

  const store = useStore()
  const stateRef = useRef({})
  stateRef.current = store

  const {
    selectedTool, equipment, selectedId, sportLines,
    addEquipment, updateEquipment, removeEquipment, setSelectedId,
    addDrawing,
  } = store

  const getPPM = () => BASE_PPM * vpRef.current.scale

  const getMousePos = (e) => {
    const rect = resolvedRef.current.getBoundingClientRect()
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top }
  }

  const canvasToWorld = (mx, my) => {
    const vp = vpRef.current
    const ppm = getPPM()
    return { wx: (mx - vp.x) / ppm, wy: (my - vp.y) / ppm }
  }

  const hitTest = (wx, wy, items) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      const def = getEquipmentDef(item.type)
      if (!def) continue
      const cx = item.x + def.w / 2
      const cy = item.y + def.d / 2
      const rad = (item.rotation || 0) * (Math.PI / 180)
      const lx = (wx - cx) * Math.cos(-rad) - (wy - cy) * Math.sin(-rad)
      const ly = (wx - cx) * Math.sin(-rad) + (wy - cy) * Math.cos(-rad)
      if (Math.abs(lx) <= def.w / 2 && Math.abs(ly) <= def.d / 2) return item
    }
    return null
  }

  const renderDrawing = (ctx, d) => {
    ctx.strokeStyle = d.color
    ctx.lineWidth = d.lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (d.type === 'freehand') {
      if (!d.points || d.points.length < 2) return
      ctx.beginPath()
      ctx.moveTo(d.points[0].x, d.points[0].y)
      for (let i = 1; i < d.points.length; i++) ctx.lineTo(d.points[i].x, d.points[i].y)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(d.x1, d.y1)
      ctx.lineTo(d.x2, d.y2)
      ctx.stroke()
      if (d.type === 'arrow') {
        const angle = Math.atan2(d.y2 - d.y1, d.x2 - d.x1)
        const al = d.lineWidth * 5
        ctx.beginPath()
        ctx.moveTo(d.x2, d.y2)
        ctx.lineTo(d.x2 - Math.cos(angle - 0.42) * al, d.y2 - Math.sin(angle - 0.42) * al)
        ctx.moveTo(d.x2, d.y2)
        ctx.lineTo(d.x2 - Math.cos(angle + 0.42) * al, d.y2 - Math.sin(angle + 0.42) * al)
        ctx.stroke()
      }
    }
    ctx.lineCap = 'butt'
  }

  const draw = useCallback(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const vp = vpRef.current
    const ppm = getPPM()
    const { equipment, selectedId, sportLines, drawings } = stateRef.current

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#e9edf2'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(vp.x, vp.y)
    ctx.scale(ppm, ppm)

    // Hall floor
    ctx.fillStyle = '#d4a96a'
    ctx.fillRect(0, 0, HALL_W, HALL_H)

    // Floor planks
    ctx.strokeStyle = 'rgba(120,80,30,0.22)'
    ctx.lineWidth = 0.5 / ppm
    for (let x = 0.2; x < HALL_W; x += 0.2) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HALL_H); ctx.stroke()
    }

    // Hall border
    ctx.strokeStyle = '#4a4a4a'
    ctx.lineWidth = 0.15
    ctx.strokeRect(0, 0, HALL_W, HALL_H)

    // Sport lines
    Object.entries(sportLines).forEach(([key, visible]) => {
      if (!visible) return
      const sport = SPORT_LINES[key]
      if (!sport) return
      ctx.strokeStyle = sport.color
      ctx.lineWidth = 0.08
      ctx.lineCap = 'square'
      sport.lines.forEach((seg) => {
        ctx.beginPath()
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.stroke()
      })
      ctx.lineCap = 'butt'
    })

    // Saved drawings
    ;(drawings || []).forEach((d) => renderDrawing(ctx, d))

    // In-progress drawing
    if (drawingRef.current) renderDrawing(ctx, drawingRef.current)

    // Equipment
    equipment.forEach((item) => {
      const def = getEquipmentDef(item.type)
      if (!def) return
      const cx = item.x + def.w / 2
      const cy = item.y + def.d / 2
      const rad = (item.rotation || 0) * (Math.PI / 180)
      const isSel = item.id === selectedId

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rad)

      drawEquipmentShape(ctx, def, isSel)

      // Label (skip for people — the figure is self-explanatory)
      if (!def.isPerson) {
        ctx.fillStyle = '#fff'
        ctx.shadowColor = 'rgba(0,0,0,0.9)'
        ctx.shadowBlur = 2 / ppm
        const fs = Math.max(0.13, Math.min(0.28, Math.min(def.w, def.d) * 0.32))
        ctx.font = `bold ${fs}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(def.label, 0, 0)
        ctx.shadowColor = 'transparent'
      }

      // Selection corners
      if (isSel) {
        const cs = 0.12
        const hw = def.w / 2 + 0.04
        const hd = def.d / 2 + 0.04
        ctx.strokeStyle = '#4af'
        ctx.lineWidth = 0.04
        ;[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([cx, cy]) => {
          ctx.beginPath()
          ctx.moveTo(cx + Math.sign(cx) * cs, cy)
          ctx.lineTo(cx, cy)
          ctx.lineTo(cx, cy + Math.sign(cy) * cs)
          ctx.stroke()
        })
      }

      ctx.restore()
    })

    ctx.restore()

    // Zoom indicator
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(W - 82, H - 26, 77, 20)
    ctx.fillStyle = '#999'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Zoom: ${(vp.scale * 100).toFixed(0)}%`, W - 7, H - 16)
  }, [resolvedRef])

  const scheduleRedraw = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(draw)
  }, [draw])

  useEffect(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => {
      const p = canvas.parentElement
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
      scheduleRedraw()
    })
    obs.observe(canvas.parentElement)
    const p = canvas.parentElement
    canvas.width = p.clientWidth
    canvas.height = p.clientHeight
    scheduleRedraw()
    return () => obs.disconnect()
  }, [scheduleRedraw])

  useEffect(() => { scheduleRedraw() })

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const onWheel = (e) => {
      e.preventDefault()
      const { mx, my } = getMousePos(e)
      const vp = vpRef.current
      const ppm = getPPM()
      const factor = e.deltaY < 0 ? 1.12 : 0.89
      const newScale = Math.max(0.15, Math.min(12, vp.scale * factor))
      const newPpm = BASE_PPM * newScale
      vpRef.current = {
        x: mx - (mx - vp.x) * (newPpm / ppm),
        y: my - (my - vp.y) * (newPpm / ppm),
        scale: newScale,
      }
      scheduleRedraw()
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [scheduleRedraw])

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const { selectedId, equipment } = stateRef.current
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) removeEquipment(selectedId)
      }
      if (e.key === 'r' || e.key === 'R') {
        if (selectedId) {
          const item = equipment.find((i) => i.id === selectedId)
          if (item) updateEquipment(selectedId, { rotation: ((item.rotation || 0) + 45) % 360 })
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        stateRef.current.undoLastDrawing?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeEquipment, updateEquipment])

  const onMouseDown = useCallback((e) => {
    if (!resolvedRef.current) return
    const { mx, my } = getMousePos(e)
    const { wx, wy } = canvasToWorld(mx, my)
    const { selectedTool, equipment, drawColor, drawLineWidth } = stateRef.current

    if (e.button === 2) {
      dragRef.current = { type: 'pan', startMx: mx, startMy: my, startVpX: vpRef.current.x, startVpY: vpRef.current.y }
      return
    }

    if (e.button !== 0) return

    // Drawing tools
    if (DRAW_TOOLS.has(selectedTool)) {
      const color = drawColor || '#ef4444'
      const lw = drawLineWidth || 0.12
      if (selectedTool === 'draw-free') {
        drawingRef.current = { type: 'freehand', points: [{ x: wx, y: wy }], color, lineWidth: lw }
      } else {
        const type = selectedTool === 'draw-arrow' ? 'arrow' : 'line'
        drawingRef.current = { type, x1: wx, y1: wy, x2: wx, y2: wy, color, lineWidth: lw }
      }
      return
    }

    if (selectedTool === 'select') {
      const hit = hitTest(wx, wy, equipment)
      if (hit) {
        setSelectedId(hit.id)
        dragRef.current = { type: 'move', startMx: mx, startMy: my, itemId: hit.id, itemOrigX: hit.x, itemOrigY: hit.y }
      } else {
        setSelectedId(null)
      }
    } else {
      const def = getEquipmentDef(selectedTool)
      if (def) {
        const px = Math.max(0, Math.min(HALL_W - def.w, wx - def.w / 2))
        const py = Math.max(0, Math.min(HALL_H - def.d, wy - def.d / 2))
        addEquipment(selectedTool, px, py)
      }
    }
  }, [addEquipment, setSelectedId])

  const onMouseMove = useCallback((e) => {
    const { mx, my } = getMousePos(e)

    if (drawingRef.current) {
      const { wx, wy } = canvasToWorld(mx, my)
      const d = drawingRef.current
      if (d.type === 'freehand') {
        d.points.push({ x: wx, y: wy })
      } else {
        d.x2 = wx; d.y2 = wy
      }
      scheduleRedraw()
      return
    }

    if (!dragRef.current) return
    const drag = dragRef.current

    if (drag.type === 'pan') {
      vpRef.current = { ...vpRef.current, x: drag.startVpX + (mx - drag.startMx), y: drag.startVpY + (my - drag.startMy) }
      scheduleRedraw()
    } else if (drag.type === 'move') {
      const ppm = getPPM()
      const dx = (mx - drag.startMx) / ppm
      const dy = (my - drag.startMy) / ppm
      const { equipment } = stateRef.current
      const item = equipment.find((i) => i.id === drag.itemId)
      if (!item) return
      const def = getEquipmentDef(item.type)
      const nx = Math.max(0, Math.min(HALL_W - def.w, drag.itemOrigX + dx))
      const ny = Math.max(0, Math.min(HALL_H - def.d, drag.itemOrigY + dy))
      updateEquipment(drag.itemId, { x: nx, y: ny })
    }
  }, [scheduleRedraw, updateEquipment])

  const onMouseUp = useCallback(() => {
    if (drawingRef.current) {
      const d = drawingRef.current
      const valid = d.type === 'freehand' ? d.points.length > 2 : (d.x1 !== d.x2 || d.y1 !== d.y2)
      if (valid) addDrawing(d)
      drawingRef.current = null
      scheduleRedraw()
    }
    dragRef.current = null
  }, [addDrawing, scheduleRedraw])

  const getCursor = () => {
    if (DRAW_TOOLS.has(selectedTool)) return 'crosshair'
    if (selectedTool === 'select') return 'default'
    return 'copy'
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={resolvedRef}
        style={{ width: '100%', height: '100%', cursor: getCursor() }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="hint-info">
        Rechtsklick: Pan · Scroll: Zoom · R: Drehen · Entf: Löschen · Ctrl+Z: Zeichnung rückgängig
      </div>
    </div>
  )
}
