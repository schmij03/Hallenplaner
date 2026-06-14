import React from 'react'
import useStore from '../store.js'
import { EQUIPMENT_TYPES } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'
import { exportPNG, exportPDF } from '../utils/exportUtils.js'

const DRAW_COLORS = [
  { c: '#ef4444', label: 'Rot' },
  { c: '#3b82f6', label: 'Blau' },
  { c: '#22c55e', label: 'Grün' },
  { c: '#facc15', label: 'Gelb' },
  { c: '#f97316', label: 'Orange' },
  { c: '#a855f7', label: 'Violett' },
  { c: '#000000', label: 'Schwarz' },
  { c: '#ffffff', label: 'Weiss' },
]

const LINE_SIZES = [
  { w: 0.06, label: 'Dünn' },
  { w: 0.12, label: 'Mittel' },
  { w: 0.22, label: 'Dick' },
]

export default function Sidebar({ canvasRef, threeRef }) {
  const {
    view, setView,
    selectedTool, setSelectedTool,
    sportLines, toggleSportLine,
    clearAll,
    drawColor, setDrawColor,
    drawLineWidth, setDrawLineWidth,
    undoLastDrawing, clearDrawings,
    drawings,
  } = useStore()

  const handleExportPNG = async () => {
    if (view === '2d') {
      await exportPNG(canvasRef.current)
    } else {
      const gl = threeRef.current
      if (gl) await exportPNG(gl.domElement)
    }
  }

  const handleExportPDF = async () => {
    if (view === '2d') {
      await exportPDF(canvasRef.current)
    } else {
      const gl = threeRef.current
      if (gl) await exportPDF(gl.domElement)
    }
  }

  const handleSave = () => {
    const btn = document.getElementById('save-btn')
    if (btn) {
      const orig = btn.textContent
      btn.textContent = 'Gespeichert ✓'
      setTimeout(() => { btn.textContent = orig }, 1400)
    }
  }

  // Group equipment by category
  const categories = {}
  EQUIPMENT_TYPES.forEach((eq) => {
    if (!categories[eq.category]) categories[eq.category] = []
    categories[eq.category].push(eq)
  })

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1>Hallenplaner</h1>
        <div className="view-toggle">
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>2D</button>
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D</button>
        </div>
      </div>

      {/* Select tool */}
      <div className="sidebar-section">
        <h2>Werkzeuge</h2>
        <button
          className={`tool-btn${selectedTool === 'select' ? ' active' : ''}`}
          onClick={() => setSelectedTool('select')}
        >
          <span>▶</span> Auswählen / Verschieben
        </button>
      </div>

      {/* Equipment */}
      <div className="sidebar-section">
        <h2>Geräte</h2>
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat}>
            <div className="category-label">{cat}</div>
            {items.map((eq) => (
              <button
                key={eq.type}
                className={`tool-btn${selectedTool === eq.type ? ' active' : ''}`}
                onClick={() => setSelectedTool(eq.type)}
              >
                <span className="color-dot" style={{ background: eq.color }} />
                {eq.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Sport lines */}
      <div className="sidebar-section">
        <h2>Sportfeld-Linien</h2>
        {Object.entries(SPORT_LINES).map(([key, sport]) => (
          <div key={key} className="sport-line-item" onClick={() => toggleSportLine(key)}>
            <input
              type="checkbox"
              checked={sportLines[key] || false}
              onChange={() => toggleSportLine(key)}
              onClick={(e) => e.stopPropagation()}
            />
            <label style={{ color: sport.color }}>{sport.label}</label>
          </div>
        ))}
      </div>

      {/* Drawing tools (2D only) */}
      {view === '2d' && (
        <div className="sidebar-section">
          <h2>Einzeichnen</h2>

          <div className="draw-tool-row">
            {[
              { id: 'draw-free', icon: '✏️', label: 'Freihand' },
              { id: 'draw-line', icon: '╱', label: 'Linie' },
              { id: 'draw-arrow', icon: '→', label: 'Pfeil' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`tool-btn draw-mode-btn${selectedTool === id ? ' active' : ''}`}
                onClick={() => setSelectedTool(id)}
                title={label}
              >
                <span className="draw-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="draw-color-grid">
            {DRAW_COLORS.map(({ c, label }) => (
              <button
                key={c}
                className={`color-btn${drawColor === c ? ' active' : ''}`}
                style={{ background: c, border: drawColor === c ? '2px solid #4af' : '2px solid transparent' }}
                title={label}
                onClick={() => setDrawColor(c)}
              />
            ))}
          </div>

          <div className="draw-size-row">
            {LINE_SIZES.map(({ w, label }) => (
              <button
                key={w}
                className={`size-btn${drawLineWidth === w ? ' active' : ''}`}
                onClick={() => setDrawLineWidth(w)}
              >
                <span className="size-preview" style={{ height: `${Math.max(2, w * 14)}px` }} />
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
            <button className="export-btn" style={{ flex: 1 }} onClick={undoLastDrawing} disabled={!drawings?.length}>
              ↩ Rückgängig
            </button>
            <button className="export-btn danger" style={{ flex: 1 }} onClick={() => drawings?.length && clearDrawings()}>
              Löschen
            </button>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="sidebar-section">
        <h2>Export &amp; Speichern</h2>
        <button className="export-btn" onClick={handleExportPNG}>PNG exportieren</button>
        <button className="export-btn" onClick={handleExportPDF}>PDF exportieren</button>
        <button className="export-btn save" id="save-btn" onClick={handleSave}>Speichern</button>
        <button className="export-btn danger" onClick={() => confirm('Alle Geräte löschen?') && clearAll()}>
          Alles löschen
        </button>
      </div>
    </div>
  )
}
