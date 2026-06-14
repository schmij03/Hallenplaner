const CX = 20
const CY = 10

function arc(cx, cy, r, a1, a2, n = 32) {
  const segs = []
  for (let i = 0; i < n; i++) {
    const t1 = a1 + (i / n) * (a2 - a1)
    const t2 = a1 + ((i + 1) / n) * (a2 - a1)
    segs.push({
      x1: cx + Math.cos(t1) * r, y1: cy + Math.sin(t1) * r,
      x2: cx + Math.cos(t2) * r, y2: cy + Math.sin(t2) * r,
    })
  }
  return segs
}

const TAU = Math.PI * 2

export const SPORT_LINES = {
  volleyball: {
    label: 'Volleyball',
    color: '#ffffff',
    lines: [
      // Field 18×9 centered
      { x1: 11, y1: 5.5, x2: 29, y2: 5.5 },
      { x1: 29, y1: 5.5, x2: 29, y2: 14.5 },
      { x1: 29, y1: 14.5, x2: 11, y2: 14.5 },
      { x1: 11, y1: 14.5, x2: 11, y2: 5.5 },
      // Net
      { x1: 20, y1: 5.5, x2: 20, y2: 14.5 },
      // Attack lines 3 m from net
      { x1: 17, y1: 5.5, x2: 17, y2: 14.5 },
      { x1: 23, y1: 5.5, x2: 23, y2: 14.5 },
    ],
  },

  basketball: {
    label: 'Basketball',
    color: '#ff8c00',
    lines: (() => {
      const segs = []
      // Field 28×15 centered: x 6–34, y 2.5–17.5
      segs.push({ x1: 6, y1: 2.5, x2: 34, y2: 2.5 })
      segs.push({ x1: 34, y1: 2.5, x2: 34, y2: 17.5 })
      segs.push({ x1: 34, y1: 17.5, x2: 6, y2: 17.5 })
      segs.push({ x1: 6, y1: 17.5, x2: 6, y2: 2.5 })
      segs.push({ x1: 20, y1: 2.5, x2: 20, y2: 17.5 })

      // Center circle r=1.8
      segs.push(...arc(CX, CY, 1.8, 0, TAU, 32))

      // Keys (lane): 5.8 m long, 4.9 m wide
      const kw = 5.8, kh = 4.9
      segs.push({ x1: 6, y1: CY - kh / 2, x2: 6 + kw, y2: CY - kh / 2 })
      segs.push({ x1: 6 + kw, y1: CY - kh / 2, x2: 6 + kw, y2: CY + kh / 2 })
      segs.push({ x1: 6 + kw, y1: CY + kh / 2, x2: 6, y2: CY + kh / 2 })
      segs.push({ x1: 34, y1: CY - kh / 2, x2: 34 - kw, y2: CY - kh / 2 })
      segs.push({ x1: 34 - kw, y1: CY - kh / 2, x2: 34 - kw, y2: CY + kh / 2 })
      segs.push({ x1: 34 - kw, y1: CY + kh / 2, x2: 34, y2: CY + kh / 2 })

      // Free-throw circles r=1.8
      segs.push(...arc(6 + kw, CY, 1.8, 0, TAU, 32))
      segs.push(...arc(34 - kw, CY, 1.8, 0, TAU, 32))

      // 3-point lines: arc r=6.75, basket 1.575 m from baseline
      // Corner portions at y=CY±6.6 (0.9 m from sideline), straight to baseline
      const r3 = 6.75
      const lbx = 7.575   // left basket x
      const rbx = 32.425  // right basket x
      const dy = 6.6      // |basket.y - corner.y|
      const dx = Math.sqrt(r3 * r3 - dy * dy)  // ≈ 1.415
      const cy1 = CY - dy  // 3.4
      const cy2 = CY + dy  // 16.6

      // Left straight corners
      segs.push({ x1: 6, y1: cy1, x2: lbx + dx, y2: cy1 })
      segs.push({ x1: 6, y1: cy2, x2: lbx + dx, y2: cy2 })
      // Left arc from cy1 to cy2 around the basket (right-hand side)
      const aTop = Math.atan2(cy1 - CY, dx)   // ≈ −1.36 rad
      const aBot = Math.atan2(cy2 - CY, dx)   // ≈ +1.36 rad
      segs.push(...arc(lbx, CY, r3, aTop, aBot, 32))

      // Right straight corners
      segs.push({ x1: 34, y1: cy1, x2: rbx - dx, y2: cy1 })
      segs.push({ x1: 34, y1: cy2, x2: rbx - dx, y2: cy2 })
      // Right arc (left-hand side of right basket)
      const aTopR = Math.PI - aBot   // ≈ 1.78 rad
      const aBotR = Math.PI - aTop   // ≈ 4.50 rad
      segs.push(...arc(rbx, CY, r3, aTopR, aBotR, 32))

      return segs
    })(),
  },

  handball: {
    label: 'Handball',
    color: '#87ceeb',
    lines: (() => {
      const segs = []
      // Full court boundary
      segs.push({ x1: 0, y1: 0, x2: 40, y2: 0 })
      segs.push({ x1: 40, y1: 0, x2: 40, y2: 20 })
      segs.push({ x1: 40, y1: 20, x2: 0, y2: 20 })
      segs.push({ x1: 0, y1: 20, x2: 0, y2: 0 })
      segs.push({ x1: 20, y1: 0, x2: 20, y2: 20 })
      segs.push(...arc(CX, CY, 3, 0, TAU, 48))

      // Goals 3 m wide, posts at y=8.5 and y=11.5
      ;[{ ox: 0, dir: -1 }, { ox: 40, dir: 1 }].forEach(({ ox, dir }) => {
        const gx = ox + dir * 1.0
        segs.push({ x1: ox, y1: 8.5, x2: gx, y2: 8.5 })
        segs.push({ x1: gx, y1: 8.5, x2: gx, y2: 11.5 })
        segs.push({ x1: gx, y1: 11.5, x2: ox, y2: 11.5 })

        // 6 m goal area: quarter arcs from each post + straight connector
        segs.push(...arc(ox, 8.5, 6, -Math.PI / 2 * dir, 0, 20))
        segs.push(...arc(ox, 11.5, 6, 0, Math.PI / 2 * dir, 20))
        segs.push({ x1: ox + dir * 6, y1: 8.5, x2: ox + dir * 6, y2: 11.5 })

        // 9 m dashed line (drawn as dashes via every-other segment)
        const n9 = 48
        for (let i = 0; i < n9; i++) {
          if (i % 4 >= 2) continue  // dash pattern
          const a1 = (i / n9) * (Math.PI / 2)
          const a2 = ((i + 1) / n9) * (Math.PI / 2)
          segs.push({
            x1: ox + Math.cos(a1 * dir) * 9, y1: 8.5 - Math.sin(a1) * 9,
            x2: ox + Math.cos(a2 * dir) * 9, y2: 8.5 - Math.sin(a2) * 9,
          })
          segs.push({
            x1: ox + Math.cos(a1 * dir) * 9, y1: 11.5 + Math.sin(a1) * 9,
            x2: ox + Math.cos(a2 * dir) * 9, y2: 11.5 + Math.sin(a2) * 9,
          })
        }
        segs.push({ x1: ox + dir * 9, y1: 8.5, x2: ox + dir * 9, y2: 11.5 })

        // 7 m penalty mark
        const pm = ox + dir * 7
        segs.push({ x1: pm - 0.2, y1: CY, x2: pm + 0.2, y2: CY })
      })

      return segs
    })(),
  },

  badminton: {
    label: 'Badminton',
    color: '#00e676',
    lines: (() => {
      const segs = []
      // 3 courts across the hall width (y direction).
      // Court: 13.4 m long (y), 6.1 m wide (x).
      // 3 × 6.1 m = 18.3 m → starts at x = (40−18.3)/2 = 10.85 m
      // Court y-extent: (20−13.4)/2 = 3.3 to 16.7 m
      const courtLen = 13.4
      const courtWid = 6.1
      const x0 = (40 - 3 * courtWid) / 2   // 10.85
      const y1 = (20 - courtLen) / 2         // 3.3
      const y2 = y1 + courtLen               // 16.7
      const netY = CY                         // 10.0
      const sslY1 = netY - 1.98              // 8.02  short service line
      const sslY2 = netY + 1.98              // 11.98
      const lslY1 = y1 + 0.76               // 4.06  long service line (doubles)
      const lslY2 = y2 - 0.76               // 15.94
      const singOff = 0.46                   // singles sideline inset

      for (let i = 0; i < 3; i++) {
        const cx1 = x0 + i * courtWid
        const cx2 = cx1 + courtWid
        const scx1 = cx1 + singOff          // singles inner left
        const scx2 = cx2 - singOff          // singles inner right
        const xMid = (cx1 + cx2) / 2

        // Outer doubles boundary
        segs.push({ x1: cx1, y1, x2: cx2, y2: y1 })
        segs.push({ x1: cx2, y1, x2: cx2, y2: y2 })
        segs.push({ x1: cx2, y1: y2, x2: cx1, y2: y2 })
        segs.push({ x1: cx1, y1: y2, x2: cx1, y2: y1 })

        // Singles sidelines (inner vertical lines)
        segs.push({ x1: scx1, y1, x2: scx1, y2: y2 })
        segs.push({ x1: scx2, y1, x2: scx2, y2: y2 })

        // Net (horizontal)
        segs.push({ x1: cx1, y1: netY, x2: cx2, y2: netY })

        // Short service lines (horizontal, full court width)
        segs.push({ x1: cx1, y1: sslY1, x2: cx2, y2: sslY1 })
        segs.push({ x1: cx1, y1: sslY2, x2: cx2, y2: sslY2 })

        // Long service lines for doubles (horizontal)
        segs.push({ x1: cx1, y1: lslY1, x2: cx2, y2: lslY1 })
        segs.push({ x1: cx1, y1: lslY2, x2: cx2, y2: lslY2 })

        // Center service line (vertical, full court length)
        segs.push({ x1: xMid, y1, x2: xMid, y2: y2 })
      }
      return segs
    })(),
  },

  football: {
    label: 'Fussball',
    color: '#ffff00',
    lines: (() => {
      const segs = []
      // Futsal 40×20
      segs.push({ x1: 0, y1: 0, x2: 40, y2: 0 })
      segs.push({ x1: 40, y1: 0, x2: 40, y2: 20 })
      segs.push({ x1: 40, y1: 20, x2: 0, y2: 20 })
      segs.push({ x1: 0, y1: 20, x2: 0, y2: 0 })
      segs.push({ x1: 20, y1: 0, x2: 20, y2: 20 })
      segs.push(...arc(CX, CY, 3, 0, TAU, 48))

      ;[{ ox: 0, dir: 1 }, { ox: 40, dir: -1 }].forEach(({ ox, dir }) => {
        const pa = ox + dir * 6  // penalty area depth
        segs.push({ x1: ox, y1: 2, x2: pa, y2: 2 })
        segs.push({ x1: pa, y1: 2, x2: pa, y2: 18 })
        segs.push({ x1: pa, y1: 18, x2: ox, y2: 18 })

        const ga = ox + dir * 3  // goal area depth
        segs.push({ x1: ox, y1: 6, x2: ga, y2: 6 })
        segs.push({ x1: ga, y1: 6, x2: ga, y2: 14 })
        segs.push({ x1: ga, y1: 14, x2: ox, y2: 14 })

        // Goal 3 m wide
        const gp = ox + dir * 0.8
        segs.push({ x1: ox, y1: 8.5, x2: gp, y2: 8.5 })
        segs.push({ x1: gp, y1: 8.5, x2: gp, y2: 11.5 })
        segs.push({ x1: gp, y1: 11.5, x2: ox, y2: 11.5 })

        // Penalty spot cross
        const ps = ox + dir * 6
        segs.push({ x1: ps - 0.2, y1: CY, x2: ps + 0.2, y2: CY })
        segs.push({ x1: ps, y1: CY - 0.2, x2: ps, y2: CY + 0.2 })
      })

      return segs
    })(),
  },
}
