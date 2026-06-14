import React, { useState, useMemo } from 'react'
import useStore from '../store.js'
import { ALL_ITEMS } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'
import { exportPNG, exportPDF } from '../utils/exportUtils.js'
import IsoThumbnail from './IsoThumbnail.jsx'

const DRAW_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#facc15',
  '#f97316', '#a855f7', '#111827', '#ffffff',
]

const LINE_SIZES = [
  { w: 0.06, label: 'Dünn' },
  { w: 0.12, label: 'Mittel' },
  { w: 0.22, label: 'Dick' },
]

const CATEGORY_ORDER = ['Personen', 'Boden', 'Turnen', 'Ballsport', 'Leichtathletik', 'Sonstiges']

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

  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const map = {}
    ALL_ITEMS.forEach((item) => {
      if (q && !item.label.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    const cats = Object.keys(map).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a)
      const ib = CATEGORY_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
    return cats.map((c) => [c, map[c]])
  }, [search])

  const handleExportPNG = async () => {
    if (view === '2d') await exportPNG(canvasRef.current)
    else if (threeRef.current) await exportPNG(threeRef.current.domElement)
  }
  const handleExportPDF = async () => {
    if (view === '2d') await exportPDF(canvasRef.current)
    else if (threeRef.current) await exportPDF(threeRef.current.domElement)
  }
  const handleSave = () => {
    const btn = document.getElementById('save-btn')
    if (btn) {
      const orig = btn.textContent
      btn.textContent = 'Gespeichert ✓'
      setTimeout(() => { btn.textContent = orig }, 1400)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🏐 Hallenplaner</h1>
        <div className="view-toggle">
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>2D-Plan</button>
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D-Ansicht</button>
        </div>
      </div>

      <div className="sidebar-section">
        <button
          className={`tool-btn full${selectedTool === 'select' ? ' active' : ''}`}
          onClick={() => setSelectedTool('select')}
        >
          ↖ Auswählen / Verschieben
        </button>
      </div>

      {/* Equipment + people palette */}
      <div className="sidebar-section grow">
        <h2>Geräte &amp; Personen</h2>
        <input
          className="search-box"
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {grouped.length === 0 && <div className="empty-hint">Keine Treffer</div>}
        {grouped.map(([cat, items]) => (
          <div key={cat} className="palette-group">
            <div className="category-label">{cat}</div>
            <div className="palette-grid">
              {items.map((item) => (
                <button
                  key={item.type}
                  className={`palette-item${selectedTool === item.type ? ' active' : ''}`}
                  onClick={() => setSelectedTool(item.type)}
                  title={item.label}
                >
                  <IsoThumbnail def={item} />
                  <span className="palette-label">{item.label}</span>
                </button>
              ))}
            </div>
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
            <span className="line-swatch" style={{ background: sport.color }} />
            <label>{sport.label}</label>
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
              { id: 'draw-line', icon: '／', label: 'Linie' },
              { id: 'draw-arrow', icon: '➜', label: 'Pfeil' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`draw-mode-btn${selectedTool === id ? ' active' : ''}`}
                onClick={() => setSelectedTool(id)}
              >
                <span className="draw-icon">{icon}</span>{label}
              </button>
            ))}
          </div>
          <div className="draw-color-grid">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                className={`color-btn${drawColor === c ? ' active' : ''}`}
                style={{ background: c }}
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
                <span className="size-preview" style={{ height: `${Math.max(2, w * 14)}px` }} />{label}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button className="export-btn" onClick={undoLastDrawing} disabled={!drawings?.length}>↩ Rückgängig</button>
            <button className="export-btn danger" onClick={() => drawings?.length && clearDrawings()}>Löschen</button>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="sidebar-section">
        <h2>Export &amp; Speichern</h2>
        <div className="btn-row">
          <button className="export-btn" onClick={handleExportPNG}>🖼 PNG</button>
          <button className="export-btn" onClick={handleExportPDF}>📄 PDF</button>
        </div>
        <button className="export-btn save" id="save-btn" onClick={handleSave}>💾 Speichern</button>
        <button className="export-btn danger" onClick={() => confirm('Alle Geräte & Personen löschen?') && clearAll()}>
          🗑 Alles löschen
        </button>
      </div>
    </div>
  )
}
