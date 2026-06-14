// Isometric thumbnail renderer for the sidebar equipment palette.
// Draws each item as a shaded 2.5D box (top + two side faces),
// or a small front-view cartoon figure for people.

const COS30 = Math.cos(Math.PI / 6) // 0.866
const SIN30 = 0.5

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

function shade({ r, g, b }, percent) {
  const f = percent / 100
  const c = (v) => Math.round(Math.min(255, Math.max(0, v + 255 * f)))
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

// Project a 3D point (meters) to 2D iso screen coords with scale k.
function project(x, y, z, k) {
  return [(x - y) * COS30 * k, (x + y) * SIN30 * k - z * k]
}

export function drawIsoThumbnail(ctx, def, W, H) {
  ctx.clearRect(0, 0, W, H)
  if (def.isPerson) return drawIsoPerson(ctx, def, W, H)
  drawIsoBox(ctx, def, W, H)
}

function drawIsoBox(ctx, def, W, H) {
  // Clamp aspect so thin/huge items still look sensible in the thumbnail.
  const w = Math.max(0.25, Math.min(def.w, 3.2))
  const d = Math.max(0.25, Math.min(def.d, 2.2))
  const h = Math.max(0.18, Math.min(def.h, 2.6))

  // Fit: project unit-scale bbox, then compute k to fit padded thumbnail.
  const corners = [
    [0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0],
    [0, 0, h], [w, 0, h], [w, d, h], [0, d, h],
  ]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  corners.forEach(([x, y, z]) => {
    const [sx, sy] = project(x, y, z, 1)
    minX = Math.min(minX, sx); maxX = Math.max(maxX, sx)
    minY = Math.min(minY, sy); maxY = Math.max(maxY, sy)
  })
  const pad = 10
  const k = Math.min((W - pad) / (maxX - minX), (H - pad) / (maxY - minY))
  // Center offset
  const cx = W / 2 - ((minX + maxX) / 2) * k
  const cy = H / 2 - ((minY + maxY) / 2) * k
  const P = (x, y, z) => {
    const [sx, sy] = project(x, y, z, k)
    return [cx + sx, cy + sy]
  }

  const base = hexToRgb(def.color)
  const topCol = shade(base, 22)
  const leftCol = shade(base, -4)   // y=d face
  const rightCol = shade(base, -22) // x=w face
  const edge = shade(base, -38)

  const face = (pts, fill) => {
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = edge
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Left face (y = d)
  face([P(0, d, 0), P(w, d, 0), P(w, d, h), P(0, d, h)], leftCol)
  // Right face (x = w)
  face([P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)], rightCol)
  // Top face (z = h)
  face([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)], topCol)
}

function drawIsoPerson(ctx, def, W, H) {
  // Simple front-view cartoon figure centered in the thumbnail.
  const cx = W / 2
  const s = (H - 12) / 1.6 // px per "unit" so figure fits height
  const top = 8
  const { shirt, pants, skin, hair, pose } = def

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(cx, top + 1.5 * s, 0.34 * s, 0.1 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  const sitting = pose === 'sit'
  const legTop = sitting ? top + 1.0 * s : top + 0.95 * s
  const legLen = sitting ? 0.35 * s : 0.5 * s

  // legs
  ctx.fillStyle = pants
  rr(ctx, cx - 0.18 * s, legTop, 0.15 * s, legLen, 3)
  rr(ctx, cx + 0.03 * s, legTop, 0.15 * s, legLen, 3)

  // torso
  ctx.fillStyle = shirt
  rr(ctx, cx - 0.26 * s, top + 0.5 * s, 0.52 * s, 0.5 * s, 5)

  // arms
  ctx.fillStyle = shirt
  rr(ctx, cx - 0.36 * s, top + 0.52 * s, 0.12 * s, 0.34 * s, 4)
  rr(ctx, cx + 0.24 * s, top + 0.52 * s, 0.12 * s, 0.34 * s, 4)
  ctx.fillStyle = skin
  rr(ctx, cx - 0.35 * s, top + 0.82 * s, 0.1 * s, 0.12 * s, 3)
  rr(ctx, cx + 0.25 * s, top + 0.82 * s, 0.1 * s, 0.12 * s, 3)

  // head
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(cx, top + 0.3 * s, 0.22 * s, 0, Math.PI * 2)
  ctx.fill()
  // hair
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.arc(cx, top + 0.27 * s, 0.225 * s, Math.PI, Math.PI * 2)
  ctx.fill()
  // eyes
  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.arc(cx - 0.08 * s, top + 0.32 * s, 0.03 * s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 0.08 * s, top + 0.32 * s, 0.03 * s, 0, Math.PI * 2); ctx.fill()

  if (pose === 'teacher') {
    ctx.fillStyle = '#ffca28'
    ctx.beginPath(); ctx.arc(cx, top + 0.92 * s, 0.05 * s, 0, Math.PI * 2); ctx.fill()
  }
}

function rr(ctx, x, y, w, h, r) {
  const cr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + cr, y)
  ctx.arcTo(x + w, y, x + w, y + h, cr)
  ctx.arcTo(x + w, y + h, x, y + h, cr)
  ctx.arcTo(x, y + h, x, y, cr)
  ctx.arcTo(x, y, x + w, y, cr)
  ctx.closePath()
  ctx.fill()
}
