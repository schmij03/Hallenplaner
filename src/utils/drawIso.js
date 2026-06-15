// Thumbnail renderer for the sidebar equipment palette.
// Draws a top-down (bird's-eye) 2D view of each item, scaled to fit.

export function drawIsoThumbnail(ctx, def, W, H) {
  ctx.clearRect(0, 0, W, H)
  // Subtle background so light-coloured items are always visible
  ctx.fillStyle = '#f0f4f8'
  ctx.fillRect(0, 0, W, H)

  if (def.isPerson) return drawPersonThumb(ctx, def, W, H)
  drawTopDown(ctx, def, W, H)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

function lighten({ r, g, b }, p) {
  const f = p / 100
  const c = (v) => Math.round(Math.min(255, v + 255 * f))
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

function darken({ r, g, b }, p) {
  const f = p / 100
  const c = (v) => Math.round(Math.max(0, v - 255 * f))
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

// Scale w×d to fit inside the thumbnail with padding, return {k, ox, oy}
function fitScale(w, d, W, H, pad = 10) {
  const k = Math.min((W - pad * 2) / w, (H - pad * 2) / d)
  const ox = (W - w * k) / 2
  const oy = (H - d * k) / 2
  return { k, ox, oy }
}

// Filled rounded rect helper (ctx already translated)
function rrect(ctx, x, y, w, h, r = 3) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// ── Top-down renderer ─────────────────────────────────────────────────────────

function drawTopDown(ctx, def, W, H) {
  const { type, w, d, color } = def
  const base = hexToRgb(color)
  const fill = `rgb(${base.r},${base.g},${base.b})`
  const fillDim = darken(base, 8)
  const stroke = darken(base, 35)
  const { k, ox, oy } = fitScale(w, d, W, H)

  ctx.save()
  ctx.translate(ox, oy)

  switch (type) {
    // ── Matten ──────────────────────────────────────────────────────────
    case 'matte':
    case 'dicke-matte':
    case '16er-matte':
    case 'kleine-matte':
    case 'weichbodenmatte': {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, w * k, d * k)
      // Grid seams
      ctx.strokeStyle = darken(base, 20)
      ctx.lineWidth = 0.7
      const cell = type === 'weichbodenmatte' ? 0.4 : 0.28
      for (let x = cell * k; x < w * k; x += cell * k) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, d * k); ctx.stroke()
      }
      for (let y = cell * k; y < d * k; y += cell * k) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w * k, y); ctx.stroke()
      }
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Bank ────────────────────────────────────────────────────────────
    case 'bank': {
      // Two legs + plank top-down
      const lw = Math.max(4, 0.08 * k)
      ctx.fillStyle = darken(base, 25)
      ctx.fillRect(0, 0, lw, d * k)
      ctx.fillRect(w * k - lw, 0, lw, d * k)
      ctx.fillStyle = fill
      ctx.fillRect(lw, 0, w * k - lw * 2, d * k)
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Tisch ────────────────────────────────────────────────────────────
    case 'tisch': {
      const leg = Math.max(4, 0.09 * k)
      ctx.fillStyle = lighten(base, 10)
      ctx.fillRect(0, 0, w * k, d * k)
      ctx.fillStyle = darken(base, 25)
      ;[[0, 0], [w * k - leg, 0], [0, d * k - leg], [w * k - leg, d * k - leg]].forEach(([x, y]) => {
        ctx.fillRect(x, y, leg, leg)
      })
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Tore ─────────────────────────────────────────────────────────────
    case 'tor':
    case 'kleines-tor':
    case 'unihockeytor': {
      const bar = Math.max(3, 0.08 * k)
      ctx.fillStyle = fill + '33'
      ctx.fillRect(0, 0, w * k, d * k)
      ctx.strokeStyle = fill; ctx.lineWidth = bar; ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(0, d * k); ctx.lineTo(0, 0); ctx.lineTo(w * k, 0); ctx.lineTo(w * k, d * k)
      ctx.stroke()
      break
    }

    // ── Basketballkorb ───────────────────────────────────────────────────
    case 'basketball': {
      const r = Math.min(w * k, d * k) / 2
      ctx.strokeStyle = fill; ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(r, r, r * 0.8, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(r, r, 2, 0, Math.PI * 2)
      ctx.fillStyle = fill; ctx.fill()
      break
    }

    // ── Volleyball/Badminton Netz ─────────────────────────────────────────
    case 'volleyball-netz':
    case 'badminton-netz': {
      const netW = w * k
      const netH = Math.max(6, d * k)
      const postW = Math.max(4, netW * 0.03)
      ctx.fillStyle = '#9aa3ad'
      ctx.fillRect(0, 0, postW, netH)
      ctx.fillRect(netW - postW, 0, postW, netH)
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.6
      const sp = Math.max(4, netW / 14)
      for (let x = postW + sp; x < netW - postW; x += sp) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, netH); ctx.stroke()
      }
      const spY = Math.max(3, netH / 3)
      for (let y = spY; y < netH; y += spY) {
        ctx.beginPath(); ctx.moveTo(postW, y); ctx.lineTo(netW - postW, y); ctx.stroke()
      }
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, netW, netH)
      break
    }

    // ── Barren ────────────────────────────────────────────────────────────
    case 'barren': {
      const barH = Math.max(3, 0.045 * k)
      const gap = d * k * 0.5
      ctx.fillStyle = '#888'
      ctx.fillRect(0, 0, w * k, d * k)
      ctx.fillStyle = fill
      ctx.fillRect(0, gap / 2 - barH, w * k, barH * 2)
      ctx.fillRect(0, d * k - gap / 2 - barH, w * k, barH * 2)
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Reck ─────────────────────────────────────────────────────────────
    case 'reck': {
      const standW = Math.max(4, 0.07 * k)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, w * k, d * k)
      ctx.fillStyle = '#777'
      ctx.fillRect(0, 0, standW, d * k)
      ctx.fillRect(w * k - standW, 0, standW, d * k)
      // Horizontal bar across centre
      const cy2 = d * k / 2
      const barH2 = Math.max(2, 0.04 * k)
      ctx.fillStyle = fill
      ctx.fillRect(standW, cy2 - barH2, w * k - standW * 2, barH2 * 2)
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Kasten / Schwedenkasten ───────────────────────────────────────────
    case 'kasten':
    case 'schwedenkasten':
    case 'schwedenkasten-teil': {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, w * k, d * k)
      // Cross on top
      ctx.strokeStyle = darken(base, 20); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * k, d * k); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(w * k, 0); ctx.lineTo(0, d * k); ctx.stroke()
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Sprungbock ───────────────────────────────────────────────────────
    case 'sprungbock': {
      ctx.fillStyle = fill
      rrect(ctx, 0, 0, w * k, d * k, 5)
      ctx.fill()
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
      ctx.stroke()
      // Handle grips
      const gW = Math.max(3, w * k * 0.25)
      const gH = Math.max(2, d * k * 0.08)
      ctx.fillStyle = darken(base, 25)
      ctx.fillRect(w * k / 2 - gW / 2, d * k * 0.3, gW, gH)
      ctx.fillRect(w * k / 2 - gW / 2, d * k * 0.62, gW, gH)
      break
    }

    // ── Pferd ─────────────────────────────────────────────────────────────
    case 'pferd': {
      ctx.fillStyle = fill
      rrect(ctx, 0, 0, w * k, d * k, 8)
      ctx.fill()
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
      ctx.stroke()
      // Pommel handles
      const ph = Math.max(3, Math.min(d * k * 0.18, 6))
      const pw = ph * 0.8
      ctx.fillStyle = darken(base, 30)
      ctx.fillRect(w * k * 0.3 - pw / 2, d * k / 2 - ph / 2, pw, ph)
      ctx.fillRect(w * k * 0.7 - pw / 2, d * k / 2 - ph / 2, pw, ph)
      break
    }

    // ── Trampolin ─────────────────────────────────────────────────────────
    case 'trampolin': {
      ctx.fillStyle = '#222'
      ctx.fillRect(0, 0, w * k, d * k)
      const m = Math.max(4, k * 0.12)
      ctx.fillStyle = fill + 'cc'
      ctx.fillRect(m, m, w * k - m * 2, d * k - m * 2)
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Schwebebalken ─────────────────────────────────────────────────────
    case 'schwebebalken': {
      const bh = Math.max(3, d * k)
      ctx.fillStyle = '#777'
      ctx.fillRect(0, d * k / 2 - bh / 4, w * k, bh / 2)
      ctx.fillStyle = fill
      ctx.fillRect(0, d * k / 4, w * k, d * k / 2)
      ctx.strokeStyle = stroke; ctx.lineWidth = 1
      ctx.strokeRect(0, d * k / 4, w * k, d * k / 2)
      break
    }

    // ── Ringe ─────────────────────────────────────────────────────────────
    case 'ringe': {
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0, 0, w * k, d * k)
      const r2 = Math.min(w * k * 0.22, d * k * 0.38)
      ;[w * k * 0.28, w * k * 0.72].forEach((rx) => {
        ctx.beginPath(); ctx.arc(rx, d * k / 2, r2, 0, Math.PI * 2)
        ctx.strokeStyle = fill; ctx.lineWidth = Math.max(2, r2 * 0.22); ctx.stroke()
      })
      break
    }

    // ── Hochsprung ────────────────────────────────────────────────────────
    case 'hochsprung': {
      const mw = w * k * 0.9, mh = d * k * 0.72
      ctx.fillStyle = fill
      ctx.fillRect((w * k - mw) / 2, 0, mw, mh)
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = Math.max(2, k * 0.03)
      ctx.beginPath()
      ctx.moveTo(0, mh * 0.4); ctx.lineTo(w * k, mh * 0.4); ctx.stroke()
      ctx.fillStyle = '#666'
      const sw = Math.max(3, k * 0.05)
      ctx.fillRect(0, 0, sw, d * k)
      ctx.fillRect(w * k - sw, 0, sw, d * k)
      break
    }

    // ── Hütchen ───────────────────────────────────────────────────────────
    case 'huetchen': {
      const r3 = Math.min(w * k, d * k) / 2
      ctx.beginPath()
      ctx.moveTo(r3, 0); ctx.lineTo(r3 * 2, r3 * 2); ctx.lineTo(0, r3 * 2); ctx.closePath()
      ctx.fillStyle = fill; ctx.fill()
      ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke()
      break
    }

    // ── Hürde ────────────────────────────────────────────────────────────
    case 'huerde': {
      const fw = Math.max(3, w * k * 0.1)
      ctx.fillStyle = '#666'
      ctx.fillRect(0, 0, fw, d * k)
      ctx.fillRect(w * k - fw, 0, fw, d * k)
      const bh = Math.max(3, d * k * 0.25)
      ctx.fillStyle = fill
      ctx.fillRect(fw, d * k / 2 - bh / 2, w * k - fw * 2, bh)
      break
    }

    // ── Reifen ─────────────────────────────────────────────────────────────
    case 'reifen': {
      const r4 = Math.min(w * k, d * k) / 2 * 0.88
      const tube = Math.max(2.5, r4 * 0.12)
      ctx.beginPath(); ctx.arc(w * k / 2, d * k / 2, r4, 0, Math.PI * 2)
      ctx.strokeStyle = fill; ctx.lineWidth = tube; ctx.stroke()
      ctx.strokeStyle = darken(base, 20); ctx.lineWidth = tube * 0.3; ctx.stroke()
      break
    }

    // ── Malstab ──────────────────────────────────────────────────────────
    case 'malstab': {
      const r5 = Math.min(w * k, d * k) / 2 * 0.85
      ctx.beginPath(); ctx.arc(w * k / 2, d * k / 2, r5, 0, Math.PI * 2)
      ctx.fillStyle = fill; ctx.fill()
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke()
      break
    }

    // ── Töggel ───────────────────────────────────────────────────────────
    case 'toeggel': {
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, w * k, d * k)
      const gh = d * k * 0.22
      ctx.fillStyle = '#333'
      ctx.fillRect(0, 0, w * k, gh)
      ctx.fillRect(0, d * k - gh, w * k, gh)
      ctx.fillStyle = fill + 'cc'
      ctx.fillRect(2, gh, w * k - 4, d * k - gh * 2)
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, w * k, d * k)
      break
    }

    // ── Default ─────────────────────────────────────────────────────────
    default: {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, w * k, d * k)
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
      ctx.strokeRect(0, 0, w * k, d * k)
    }
  }

  ctx.restore()
}

// ── Person thumbnail ─────────────────────────────────────────────────────────

function drawPersonThumb(ctx, def, W, H) {
  const cx = W / 2
  const s = (H - 12) / 1.6
  const top = 8
  const { shirt, pants, skin, hair, pose } = def

  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.beginPath()
  ctx.ellipse(cx, top + 1.5 * s, 0.34 * s, 0.1 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  const sitting = pose === 'sit'
  const legTop = sitting ? top + 1.0 * s : top + 0.95 * s
  const legLen = sitting ? 0.35 * s : 0.5 * s

  ctx.fillStyle = pants
  rr2(ctx, cx - 0.18 * s, legTop, 0.15 * s, legLen, 3)
  rr2(ctx, cx + 0.03 * s, legTop, 0.15 * s, legLen, 3)

  ctx.fillStyle = shirt
  rr2(ctx, cx - 0.26 * s, top + 0.5 * s, 0.52 * s, 0.5 * s, 5)
  rr2(ctx, cx - 0.36 * s, top + 0.52 * s, 0.12 * s, 0.34 * s, 4)
  rr2(ctx, cx + 0.24 * s, top + 0.52 * s, 0.12 * s, 0.34 * s, 4)
  ctx.fillStyle = skin
  rr2(ctx, cx - 0.35 * s, top + 0.82 * s, 0.1 * s, 0.12 * s, 3)
  rr2(ctx, cx + 0.25 * s, top + 0.82 * s, 0.1 * s, 0.12 * s, 3)

  ctx.fillStyle = skin
  ctx.beginPath(); ctx.arc(cx, top + 0.3 * s, 0.22 * s, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = hair
  ctx.beginPath(); ctx.arc(cx, top + 0.27 * s, 0.225 * s, Math.PI, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.arc(cx - 0.08 * s, top + 0.32 * s, 0.03 * s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 0.08 * s, top + 0.32 * s, 0.03 * s, 0, Math.PI * 2); ctx.fill()

  if (pose === 'teacher') {
    ctx.fillStyle = '#ffca28'
    ctx.beginPath(); ctx.arc(cx, top + 0.92 * s, 0.05 * s, 0, Math.PI * 2); ctx.fill()
  }
}

function rr2(ctx, x, y, w, h, r) {
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
