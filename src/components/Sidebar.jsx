import React from 'react'
import useStore from '../store.js'
import { EQUIPMENT_TYPES } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'
import { exportPNG, exportPDF } from '../utils/exportUtils.js'

export default function Sidebar({ canvasRef, threeRef }) {
  const {
    view,
    setView,
    selectedTool,
    setSelectedTool,
    sportLines,
    toggleSportLine,
    clearAll,
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
    // zustand persist handles localStorage automatically; just show feedback
    const key = 'Hallenplaner gespeichert'
    const btn = document.getElementById('save-btn')
    if (btn) {
      const orig = btn.textContent
      btn.textContent = 'Gespeichert!'
      setTimeout(() => { btn.textContent = orig }, 1200)
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
          <button
            className={view === '2d' ? 'active' : ''}
            onClick={() => setView('2d')}
          >
            2D-Ansicht
          </button>
          <button
            className={view === '3d' ? 'active' : ''}
            onClick={() => setView('3d')}
          >
            3D-Ansicht
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="sidebar-section">
        <h2>Werkzeuge</h2>
        <button
          className={`tool-btn${selectedTool === 'select' ? ' active' : ''}`}
          onClick={() => setSelectedTool('select')}
        >
          <span>&#9654;</span> Auswählen
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
                <span
                  className="color-dot"
                  style={{ background: eq.color }}
                />
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

      {/* Export */}
      <div className="sidebar-section">
        <h2>Export &amp; Speichern</h2>
        <button className="export-btn" onClick={handleExportPNG}>
          PNG exportieren
        </button>
        <button className="export-btn" onClick={handleExportPDF}>
          PDF exportieren
        </button>
        <button className="export-btn save" id="save-btn" onClick={handleSave}>
          Speichern
        </button>
        <button
          className="export-btn danger"
          onClick={() => {
            if (confirm('Alle Geräte löschen?')) clearAll()
          }}
        >
          Alles löschen
        </button>
      </div>
    </div>
  )
}
