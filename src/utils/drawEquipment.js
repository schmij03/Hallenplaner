// Custom equipment shapes for the 2D canvas view.
// Context is already translated to item center and rotated before calling.
// All coordinates are in meters, relative to (0,0).

import { drawPerson } from './drawPerson.js'

function rr(ctx, x, y, w, h, r) {
  const cr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + cr, y)
  ctx.lineTo(x + w - cr, y)
  ctx.arcTo(x + w, y, x + w, y + cr, cr)
  ctx.lineTo(x + w, y + h - cr)
  ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr)
  ctx.lineTo(x + cr, y + h)
  ctx.arcTo(x, y + h, x, y + h - cr, cr)
  ctx.lineTo(x, y + cr)
  ctx.arcTo(x, y, x + cr, y, cr)
  ctx.closePath()
}

export function drawEquipmentShape(ctx, def, isSelected) {
  if (def.isPerson) return drawPerson(ctx, def, isSelected)
  const { type, w, d, color } = def
  const hw = w / 2
  const hd = d / 2
  switch (type) {
    case 'matte':         return drawMat(ctx, hw, hd, color, isSelected, 0.28)
    case 'dicke-matte':   return drawMat(ctx, hw, hd, color, isSelected, 0.22)
    case '16er-matte':    return drawMat(ctx, hw, hd, color, isSelected, 0.35)
    case 'kleine-matte':  return drawMat(ctx, hw, hd, color, isSelected, 0.18)
    case 'bank':          return drawBench(ctx, hw, hd, color, isSelected)
    case 'tisch':         return drawTable(ctx, hw, hd, color, isSelected)
    case 'tor':
    case 'kleines-tor':   return drawGoal(ctx, hw, hd, color, isSelected, true)
    case 'unihockeytor':  return drawGoal(ctx, hw, hd, color, isSelected, false)
    case 'basketball':    return drawHoop(ctx, hw, hd, color, isSelected)
    case 'barren':        return drawParallelBars(ctx, hw, hd, color, isSelected)
    case 'reck':          return drawHighBar(ctx, hw, hd, color, isSelected)
    case 'kasten':        return drawBox(ctx, hw, hd, color, isSelected)
    case 'schwedenkasten':      return drawSwedishBox(ctx, hw, hd, color, isSelected)
    case 'schwedenkasten-teil': return drawBoxPart(ctx, hw, hd, color, isSelected)
    case 'trampolin':     return drawTrampoline(ctx, hw, hd, color, isSelected)
    case 'pferd':         return drawHorse(ctx, hw, hd, color, isSelected)
    case 'schwebebalken': return drawBeam(ctx, hw, hd, color, isSelected)
    case 'ringe':         return drawRings(ctx, hw, hd, color, isSelected)
    case 'hochsprung':    return drawHighJump(ctx, hw, hd, color, isSelected)
    case 'huetchen':      return drawCone(ctx, hw, hd, color, isSelected)
    case 'huerde':        return drawHurdle(ctx, hw, hd, color, isSelected)
    case 'malstab':       return drawPost(ctx, hw, hd, color, isSelected)
    case 'toeggel':       return drawFoosball(ctx, hw, hd, color, isSelected)
    default:              return drawDefault(ctx, hw, hd, color, isSelected)
  }
}

function border(ctx, hw, hd, isSel) {
  ctx.strokeStyle = isSel ? '#ffffff' : 'rgba(0,0,0,0.55)'
  ctx.lineWidth = isSel ? 0.065 : 0.03
  ctx.strokeRect(-hw, -hd, hw * 2, hd * 2)
}

function drawDefault(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  border(ctx, hw, hd, isSel)
}

function drawMat(ctx, hw, hd, color, isSel, cell) {
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth = 0.012
  for (let x = -hw + cell; x < hw; x += cell) {
    ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, hd); ctx.stroke()
  }
  for (let y = -hd + cell; y < hd; y += cell) {
    ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke()
  }
  border(ctx, hw, hd, isSel)
}

function drawBench(ctx, hw, hd, color, isSel) {
  const lw = Math.min(0.12, hw * 0.18)
  const lh = Math.min(0.13, hd * 0.9)
  ctx.fillStyle = '#3b1f08'
  ctx.fillRect(-hw + 0.04, -lh / 2, lw, lh)
  ctx.fillRect(hw - 0.04 - lw, -lh / 2, lw, lh)

  ctx.fillStyle = isSel ? color : color + 'ee'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 0.01
  for (let x = -hw + 0.22; x < hw; x += 0.22) {
    ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, hd); ctx.stroke()
  }
  border(ctx, hw, hd, isSel)
}

function drawTable(ctx, hw, hd, color, isSel) {
  const lw = Math.min(0.07, hw * 0.14)
  const lh = Math.min(0.07, hd * 0.3)
  const off = 0.07
  ctx.fillStyle = '#3b1f08'
  ;[[-hw + off, -hd + off], [hw - off - lw, -hd + off],
    [-hw + off, hd - off - lh], [hw - off - lw, hd - off - lh]].forEach(([x, y]) => {
    ctx.fillRect(x, y, lw, lh)
  })
  ctx.fillStyle = isSel ? color : color + 'ee'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(-hw, -hd, hw * 2, 0.04)
  ctx.fillRect(-hw, -hd, 0.04, hd * 2)
  border(ctx, hw, hd, isSel)
}

function drawGoal(ctx, hw, hd, color, isSel, withNet) {
  ctx.fillStyle = isSel ? color + '44' : color + '28'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  if (withNet) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.lineWidth = 0.02
    const sp = Math.min(0.2, hw * 0.35)
    for (let x = -hw + sp; x < hw; x += sp) {
      ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, hd); ctx.stroke()
    }
    for (let y = -hd + sp; y < hd; y += sp) {
      ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke()
    }
  }

  // 3 sides: open at +y (front of goal)
  ctx.strokeStyle = isSel ? '#fff' : color
  ctx.lineWidth = Math.max(0.07, Math.min(hw, hd) * 0.12)
  ctx.lineCap = 'square'
  ctx.beginPath()
  ctx.moveTo(-hw, hd)
  ctx.lineTo(-hw, -hd)
  ctx.lineTo(hw, -hd)
  ctx.lineTo(hw, hd)
  ctx.stroke()
  ctx.lineCap = 'butt'
}

function drawHoop(ctx, hw, hd, color, isSel) {
  const bbW = hw * 1.3
  const bbH = 0.06
  ctx.fillStyle = '#e0e0e0'
  ctx.fillRect(-bbW, -hd, bbW * 2, bbH)
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 0.02
  ctx.strokeRect(-bbW, -hd, bbW * 2, bbH)

  ctx.strokeStyle = '#777'
  ctx.lineWidth = 0.025
  ctx.beginPath()
  ctx.moveTo(0, -hd + bbH)
  ctx.lineTo(0, 0)
  ctx.stroke()

  const r = Math.min(hw, hd) * 0.85
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.strokeStyle = isSel ? '#fff' : color
  ctx.lineWidth = 0.055
  ctx.stroke()
}

function drawParallelBars(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  const supW = 0.07
  const barGap = hd * 0.5
  ctx.fillStyle = '#888'
  ;[-hw * 0.6, hw * 0.6].forEach((sx) => {
    ctx.fillRect(sx - supW / 2, -barGap, supW, barGap * 2)
    ctx.fillRect(sx - hw * 0.3, -supW / 4, hw * 0.6, supW / 2)
  })

  const barH = 0.045
  ctx.fillStyle = isSel ? color : color + 'ee'
  ctx.fillRect(-hw, barGap - barH / 2, hw * 2, barH)
  ctx.fillRect(-hw, -barGap - barH / 2, hw * 2, barH)
  ctx.strokeStyle = isSel ? '#fff' : color
  ctx.lineWidth = 0.02
  ctx.strokeRect(-hw, barGap - barH / 2, hw * 2, barH)
  ctx.strokeRect(-hw, -barGap - barH / 2, hw * 2, barH)

  if (isSel) {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 0.04
    ctx.strokeRect(-hw, -hd, hw * 2, hd * 2)
  }
}

function drawHighBar(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  const sw = 0.07
  const sh = hd * 0.85
  ctx.fillStyle = '#777'
  ;[[-hw + 0.1, -sh / 2, sw, sh], [hw - 0.1 - sw, -sh / 2, sw, sh]].forEach((a) => ctx.fillRect(...a))

  ctx.strokeStyle = '#999'
  ctx.lineWidth = 0.025
  ;[[-hw + 0.1, -sh / 4, -hw + 0.4, sh / 4], [hw - 0.1, -sh / 4, hw - 0.4, sh / 4]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  })

  ctx.strokeStyle = isSel ? '#fff' : color
  ctx.lineWidth = 0.06
  ctx.beginPath()
  ctx.moveTo(-hw + 0.1 + sw, 0)
  ctx.lineTo(hw - 0.1 - sw, 0)
  ctx.stroke()
}

function drawBox(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 0.04
  ctx.beginPath(); ctx.moveTo(-hw, -hd); ctx.lineTo(hw, hd); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(hw, -hd); ctx.lineTo(-hw, hd); ctx.stroke()
  border(ctx, hw, hd, isSel)
}

function drawSwedishBox(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 0.03
  for (let i = 1; i <= 3; i++) {
    const y = -hd + (i / 4) * hd * 2
    ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke()
  }
  border(ctx, hw, hd, isSel)
}

function drawBoxPart(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 0.025
  const y = 0
  ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke()
  border(ctx, hw, hd, isSel)
}

function drawTrampoline(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = '#2b2b2b'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 0.07
  ctx.strokeRect(-hw, -hd, hw * 2, hd * 2)

  const sr = 0.05
  const nx = Math.max(3, Math.round(hw * 2 / 0.28))
  const ny = Math.max(2, Math.round(hd * 2 / 0.28))
  ctx.fillStyle = '#aaa'
  for (let i = 0; i <= nx; i++) {
    const sx = -hw + (i / nx) * hw * 2
    ctx.beginPath(); ctx.arc(sx, -hd, sr, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(sx, hd, sr, 0, Math.PI * 2); ctx.fill()
  }
  for (let i = 1; i < ny; i++) {
    const sy = -hd + (i / ny) * hd * 2
    ctx.beginPath(); ctx.arc(-hw, sy, sr, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(hw, sy, sr, 0, Math.PI * 2); ctx.fill()
  }

  const m = 0.13
  const mhw = hw - m
  const mhd = hd - m
  ctx.fillStyle = isSel ? color + 'bb' : color + '88'
  ctx.fillRect(-mhw, -mhd, mhw * 2, mhd * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 0.018
  for (let x = -mhw + 0.3; x < mhw; x += 0.3) {
    ctx.beginPath(); ctx.moveTo(x, -mhd); ctx.lineTo(x, mhd); ctx.stroke()
  }
  for (let y = -mhd + 0.3; y < mhd; y += 0.3) {
    ctx.beginPath(); ctx.moveTo(-mhw, y); ctx.lineTo(mhw, y); ctx.stroke()
  }
}

function drawHorse(ctx, hw, hd, color, isSel) {
  rr(ctx, -hw, -hd, hw * 2, hd * 2, Math.min(hw, hd) * 0.35)
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fill()

  const pmW = 0.07
  const pmH = hd * 0.45
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(-pmW, -pmH / 2, pmW * 2, pmH)

  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.5)'
  ctx.lineWidth = isSel ? 0.06 : 0.035
  rr(ctx, -hw, -hd, hw * 2, hd * 2, Math.min(hw, hd) * 0.35)
  ctx.stroke()
}

function drawBeam(ctx, hw, hd, color, isSel) {
  const sw = 0.09
  const sh = Math.min(hd * 2 * 0.9, 0.25)
  ctx.fillStyle = '#777'
  ctx.fillRect(-hw, -sh / 2, sw, sh)
  ctx.fillRect(hw - sw, -sh / 2, sw, sh)

  ctx.fillStyle = isSel ? color : color + 'ee'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 0.01
  for (let x = -hw + 0.3; x < hw; x += 0.3) {
    ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, hd); ctx.stroke()
  }
  border(ctx, hw, hd, isSel)
}

function drawRings(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  const r = Math.min(hw * 0.75, hd * 0.4, 0.13)
  ;[-hw * 0.5, hw * 0.5].forEach((rx) => {
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 0.02
    ctx.beginPath(); ctx.moveTo(rx, -hd); ctx.lineTo(rx, -r); ctx.stroke()
    ctx.beginPath()
    ctx.arc(rx, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = isSel ? '#fff' : color
    ctx.lineWidth = 0.045
    ctx.stroke()
  })
}

function drawHighJump(ctx, hw, hd, color, isSel) {
  const mw = hw * 0.88
  const mh = hd * 0.72
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fillRect(-mw, -hd, mw * 2, mh * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 0.025
  for (let x = -mw + 0.3; x < mw; x += 0.3) {
    ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, -hd + mh * 2); ctx.stroke()
  }

  const sw = 0.05
  const sh = hd * 0.55
  ctx.fillStyle = '#666'
  ctx.fillRect(-hw, -sh / 2, sw, sh)
  ctx.fillRect(hw - sw, -sh / 2, sw, sh)

  ctx.strokeStyle = isSel ? '#fff' : '#ddd'
  ctx.lineWidth = 0.045
  ctx.beginPath()
  ctx.moveTo(-hw + sw, 0)
  ctx.lineTo(hw - sw, 0)
  ctx.stroke()

  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.4)'
  ctx.lineWidth = isSel ? 0.055 : 0.03
  ctx.strokeRect(-mw, -hd, mw * 2, mh * 2)
}

function drawCone(ctx, hw, hd, color, isSel) {
  ctx.beginPath()
  ctx.moveTo(0, -hd)
  ctx.lineTo(hw, 0)
  ctx.lineTo(0, hd)
  ctx.lineTo(-hw, 0)
  ctx.closePath()
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fill()
  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 0.03
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, Math.min(hw, hd) * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fill()
}

function drawHurdle(ctx, hw, hd, color, isSel) {
  const fw = Math.min(0.13, hw * 0.2)
  const fh = hd * 0.85
  ctx.fillStyle = '#666'
  ctx.fillRect(-hw, -fh / 2, fw, fh)
  ctx.fillRect(hw - fw, -fh / 2, fw, fh)

  const bh = Math.max(0.06, hd * 0.25)
  ctx.fillStyle = isSel ? color : color + 'ee'
  ctx.fillRect(-hw, -bh / 2, hw * 2, bh)
  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.4)'
  ctx.lineWidth = isSel ? 0.05 : 0.02
  ctx.strokeRect(-hw, -bh / 2, hw * 2, bh)
}

function drawPost(ctx, hw, hd, color, isSel) {
  const r = Math.min(hw, hd) * 0.85
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = isSel ? color : color + 'dd'
  ctx.fill()
  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 0.03
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fill()
}

function drawFoosball(ctx, hw, hd, color, isSel) {
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(-hw, -hd, hw * 2, hd * 2)

  const goalH = hd * 0.28
  ctx.fillStyle = '#333'
  ctx.fillRect(-hw, -hd, hw * 2, goalH)
  ctx.fillRect(-hw, hd - goalH, hw * 2, goalH)

  ctx.fillStyle = isSel ? color : color + 'bb'
  ctx.fillRect(-hw + 0.04, -hd + goalH, hw * 2 - 0.08, hd * 2 - goalH * 2)

  const rods = [
    { x: -hw * 0.6, n: 1, col: '#1565c0' },
    { x: -hw * 0.2, n: 2, col: '#c62828' },
    { x: hw * 0.2, n: 3, col: '#1565c0' },
    { x: hw * 0.6, n: 2, col: '#c62828' },
  ]
  rods.forEach(({ x, n, col }) => {
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 0.025
    ctx.beginPath(); ctx.moveTo(x, -hd); ctx.lineTo(x, hd); ctx.stroke()
    for (let i = 0; i < n; i++) {
      const py = -hd + ((i + 1) / (n + 1)) * hd * 2
      ctx.beginPath(); ctx.arc(x, py, 0.05, 0, Math.PI * 2)
      ctx.fillStyle = col; ctx.fill()
    }
  })

  ctx.strokeStyle = isSel ? '#fff' : 'rgba(0,0,0,0.55)'
  ctx.lineWidth = isSel ? 0.065 : 0.04
  ctx.strokeRect(-hw, -hd, hw * 2, hd * 2)
}
