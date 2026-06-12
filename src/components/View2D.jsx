import React, { useRef, useEffect, useCallback } from 'react'
import useStore from '../store.js'
import { getEquipmentDef } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'

const HALL_W = 40
const HALL_H = 20
const BASE_PPM = 20 // pixels per meter at scale=1

export default function View2D({ canvasRef }) {
  const internalRef = useRef(null)
  const resolvedRef = canvasRef || internalRef

  const vpRef = useRef({ x: 40, y: 20, scale: 1 })
  const dragRef = useRef(null) // {type:'pan'|'move', startMx, startMy, startVpX, startVpY, itemId, itemOrigX, itemOrigY}
  const animRef = useRef(null)

  const {
    selectedTool,
    equipment,
    selectedId,
    sportLines,
    addEquipment,
    updateEquipment,
    removeEquipment,
    setSelectedId,
  } = useStore()

  const stateRef = useRef({})
  stateRef.current = { selectedTool, equipment, selectedId, sportLines }

  const getPPM = () => BASE_PPM * vpRef.current.scale

  const getMousePos = (e) => {
    const canvas = resolvedRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      mx: e.clientX - rect.left,
      my: e.clientY - rect.top,
    }
  }

  const canvasToWorld = (mx, my) => {
    const vp = vpRef.current
    const ppm = getPPM()
    return {
      wx: (mx - vp.x) / ppm,
      wy: (my - vp.y) / ppm,
    }
  }

  const hitTest = (wx, wy, items) => {
    // Test in reverse order (last = top)
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      const def = getEquipmentDef(item.type)
      if (!def) continue
      const cx = item.x + def.w / 2
      const cy = item.y + def.d / 2
      const dx = wx - cx
      const dy = wy - cy
      const rad = (item.rotation || 0) * (Math.PI / 180)
      // Rotate mouse position into item local space
      const lx = dx * Math.cos(-rad) - dy * Math.sin(-rad)
      const ly = dx * Math.sin(-rad) + dy * Math.cos(-rad)
      if (Math.abs(lx) <= def.w / 2 && Math.abs(ly) <= def.d / 2) {
        return item
      }
    }
    return null
  }

  const draw = useCallback(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const vp = vpRef.current
    const ppm = getPPM()
    const { equipment, selectedId, sportLines } = stateRef.current

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(vp.x, vp.y)
    ctx.scale(ppm, ppm)

    // Hall floor
    ctx.fillStyle = '#d4a96a'
    ctx.fillRect(0, 0, HALL_W, HALL_H)

    // Floor planks
    ctx.strokeStyle = 'rgba(120, 80, 30, 0.25)'
    ctx.lineWidth = 1 / ppm
    for (let x = 0.2; x < HALL_W; x += 0.2) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, HALL_H)
      ctx.stroke()
    }

    // Hall border
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 0.15
    ctx.strokeRect(0, 0, HALL_W, HALL_H)

    // Sport lines
    Object.entries(sportLines).forEach(([key, visible]) => {
      if (!visible) return
      const sport = SPORT_LINES[key]
      if (!sport) return
      ctx.strokeStyle = sport.color
      ctx.lineWidth = 0.08
      sport.lines.forEach((seg) => {
        ctx.beginPath()
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.stroke()
      })
    })

    // Equipment
    equipment.forEach((item) => {
      const def = getEquipmentDef(item.type)
      if (!def) return
      const cx = item.x + def.w / 2
      const cy = item.y + def.d / 2
      const rad = (item.rotation || 0) * (Math.PI / 180)

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rad)

      const isSelected = item.id === selectedId
      ctx.fillStyle = def.color + (isSelected ? 'ff' : 'cc')
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(0,0,0,0.4)'
      ctx.lineWidth = isSelected ? 0.06 : 0.03

      ctx.fillRect(-def.w / 2, -def.d / 2, def.w, def.d)
      ctx.strokeRect(-def.w / 2, -def.d / 2, def.w, def.d)

      // Label
      ctx.fillStyle = '#fff'
      const fontSize = Math.max(0.15, Math.min(0.3, def.w * 0.18))
      ctx.font = `${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(def.label, 0, 0)

      ctx.restore()
    })

    ctx.restore()

    // Zoom indicator
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(W - 80, H - 28, 75, 22)
    ctx.fillStyle = '#999'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Zoom: ${(vp.scale * 100).toFixed(0)}%`, W - 8, H - 17)
  }, [resolvedRef])

  const scheduleRedraw = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(draw)
  }, [draw])

  // Resize observer
  useEffect(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      scheduleRedraw()
    })
    observer.observe(canvas.parentElement)
    const parent = canvas.parentElement
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
    scheduleRedraw()
    return () => observer.disconnect()
  }, [scheduleRedraw])

  // Redraw on state changes
  useEffect(() => {
    scheduleRedraw()
  })

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = resolvedRef.current
    if (!canvas) return
    const onWheel = (e) => {
      e.preventDefault()
      const { mx, my } = getMousePos(e)
      const vp = vpRef.current
      const ppm = getPPM()
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      const newScale = Math.max(0.2, Math.min(10, vp.scale * factor))
      const newPpm = BASE_PPM * newScale
      // Keep world point under cursor fixed
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

  // Keyboard events
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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeEquipment, updateEquipment])

  const onMouseDown = useCallback(
    (e) => {
      const canvas = resolvedRef.current
      if (!canvas) return
      const { mx, my } = getMousePos(e)
      const { wx, wy } = canvasToWorld(mx, my)
      const { selectedTool, equipment } = stateRef.current

      if (e.button === 2) {
        // Right click = pan
        dragRef.current = {
          type: 'pan',
          startMx: mx,
          startMy: my,
          startVpX: vpRef.current.x,
          startVpY: vpRef.current.y,
        }
        return
      }

      if (e.button === 0) {
        if (selectedTool === 'select') {
          const hit = hitTest(wx, wy, equipment)
          if (hit) {
            setSelectedId(hit.id)
            dragRef.current = {
              type: 'move',
              startMx: mx,
              startMy: my,
              itemId: hit.id,
              itemOrigX: hit.x,
              itemOrigY: hit.y,
            }
          } else {
            setSelectedId(null)
          }
        } else {
          // Place equipment
          const def = getEquipmentDef(selectedTool)
          if (def) {
            const placeX = Math.max(0, Math.min(HALL_W - def.w, wx - def.w / 2))
            const placeY = Math.max(0, Math.min(HALL_H - def.d, wy - def.d / 2))
            addEquipment(selectedTool, placeX, placeY)
          }
        }
      }
    },
    [addEquipment, setSelectedId]
  )

  const onMouseMove = useCallback(
    (e) => {
      if (!dragRef.current) return
      const { mx, my } = getMousePos(e)
      const drag = dragRef.current

      if (drag.type === 'pan') {
        vpRef.current = {
          ...vpRef.current,
          x: drag.startVpX + (mx - drag.startMx),
          y: drag.startVpY + (my - drag.startMy),
        }
        scheduleRedraw()
      } else if (drag.type === 'move') {
        const ppm = getPPM()
        const dx = (mx - drag.startMx) / ppm
        const dy = (my - drag.startMy) / ppm
        const { equipment } = stateRef.current
        const item = equipment.find((i) => i.id === drag.itemId)
        if (!item) return
        const def = getEquipmentDef(item.type)
        const newX = Math.max(0, Math.min(HALL_W - def.w, drag.itemOrigX + dx))
        const newY = Math.max(0, Math.min(HALL_H - def.d, drag.itemOrigY + dy))
        updateEquipment(drag.itemId, { x: newX, y: newY })
      }
    },
    [scheduleRedraw, updateEquipment]
  )

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const onContextMenu = useCallback((e) => e.preventDefault(), [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={resolvedRef}
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={onContextMenu}
      />
      <div className="hint-info">
        Rechtsklick: Verschieben | Scroll: Zoom | R: Drehen | Del: Löschen
      </div>
    </div>
  )
}
