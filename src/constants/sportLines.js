const CX = 20
const CY = 10

export const SPORT_LINES = {
  volleyball: {
    label: 'Volleyball',
    color: '#ffffff',
    lines: [
      // Boundary 18x9 centered
      { x1: 11, y1: 5.5, x2: 29, y2: 5.5 },
      { x1: 29, y1: 5.5, x2: 29, y2: 14.5 },
      { x1: 29, y1: 14.5, x2: 11, y2: 14.5 },
      { x1: 11, y1: 14.5, x2: 11, y2: 5.5 },
      // Net at x=20
      { x1: 20, y1: 5.5, x2: 20, y2: 14.5 },
      // Attack lines
      { x1: 17, y1: 5.5, x2: 17, y2: 14.5 },
      { x1: 23, y1: 5.5, x2: 23, y2: 14.5 },
    ],
  },

  basketball: {
    label: 'Basketball',
    color: '#ff8c00',
    lines: (() => {
      const segs = []
      // Boundary 28x15 centered: x from 6 to 34, y from 2.5 to 17.5
      segs.push({ x1: 6, y1: 2.5, x2: 34, y2: 2.5 })
      segs.push({ x1: 34, y1: 2.5, x2: 34, y2: 17.5 })
      segs.push({ x1: 34, y1: 17.5, x2: 6, y2: 17.5 })
      segs.push({ x1: 6, y1: 17.5, x2: 6, y2: 2.5 })
      // Half-court line
      segs.push({ x1: 20, y1: 2.5, x2: 20, y2: 17.5 })

      // Center circle r=1.8 (approximated as polygon)
      const ccR = 1.8
      const ccSegs = 32
      for (let i = 0; i < ccSegs; i++) {
        const a1 = (i / ccSegs) * Math.PI * 2
        const a2 = ((i + 1) / ccSegs) * Math.PI * 2
        segs.push({
          x1: CX + Math.cos(a1) * ccR,
          y1: CY + Math.sin(a1) * ccR,
          x2: CX + Math.cos(a2) * ccR,
          y2: CY + Math.sin(a2) * ccR,
        })
      }

      // Left key: 5.8m from baseline, 4.9m wide centered
      // Basket at x=7.575, y=10
      const lbx = 6 // baseline
      const lkeyW = 5.8
      const lkeyH = 4.9
      segs.push({ x1: lbx, y1: CY - lkeyH / 2, x2: lbx + lkeyW, y2: CY - lkeyH / 2 })
      segs.push({ x1: lbx + lkeyW, y1: CY - lkeyH / 2, x2: lbx + lkeyW, y2: CY + lkeyH / 2 })
      segs.push({ x1: lbx + lkeyW, y1: CY + lkeyH / 2, x2: lbx, y2: CY + lkeyH / 2 })

      // Right key mirrored: baseline at x=34
      const rbx = 34
      segs.push({ x1: rbx, y1: CY - lkeyH / 2, x2: rbx - lkeyW, y2: CY - lkeyH / 2 })
      segs.push({ x1: rbx - lkeyW, y1: CY - lkeyH / 2, x2: rbx - lkeyW, y2: CY + lkeyH / 2 })
      segs.push({ x1: rbx - lkeyW, y1: CY + lkeyH / 2, x2: rbx, y2: CY + lkeyH / 2 })

      // Free throw circles r=1.8 at key top
      const ftR = 1.8
      const ftSegs = 32
      const lftx = lbx + lkeyW // left free throw line center x
      const rftx = rbx - lkeyW
      for (let i = 0; i < ftSegs; i++) {
        const a1 = (i / ftSegs) * Math.PI * 2
        const a2 = ((i + 1) / ftSegs) * Math.PI * 2
        segs.push({
          x1: lftx + Math.cos(a1) * ftR,
          y1: CY + Math.sin(a1) * ftR,
          x2: lftx + Math.cos(a2) * ftR,
          y2: CY + Math.sin(a2) * ftR,
        })
        segs.push({
          x1: rftx + Math.cos(a1) * ftR,
          y1: CY + Math.sin(a1) * ftR,
          x2: rftx + Math.cos(a2) * ftR,
          y2: CY + Math.sin(a2) * ftR,
        })
      }

      // 3-point lines: arc r=6.75 from baskets, with straight corner portions
      const r3 = 6.75
      const lBasketX = 7.575
      const rBasketX = 32.425
      const cornerY1 = 3.4
      const cornerY2 = 16.6

      // Left 3pt: straight corner portions
      segs.push({ x1: lbx, y1: cornerY1, x2: lbx + Math.sqrt(r3 * r3 - (CY - cornerY1) ** 2), y2: cornerY1 })
      segs.push({ x1: lbx, y1: cornerY2, x2: lbx + Math.sqrt(r3 * r3 - (CY - cornerY2) ** 2), y2: cornerY2 })

      // Left 3pt arc (only the part that is inside the court)
      const arcSegs = 48
      for (let i = 0; i <= arcSegs; i++) {
        const a = -Math.PI / 2 + (i / arcSegs) * Math.PI
        const px = lBasketX + Math.cos(a) * r3
        const py = CY + Math.sin(a) * r3
        if (py < cornerY1 || py > cornerY2) continue
        if (i > 0) {
          const prevA = -Math.PI / 2 + ((i - 1) / arcSegs) * Math.PI
          const prevPx = lBasketX + Math.cos(prevA) * r3
          const prevPy = CY + Math.sin(prevA) * r3
          if (prevPy >= cornerY1 && prevPy <= cornerY2) {
            segs.push({ x1: prevPx, y1: prevPy, x2: px, y2: py })
          }
        }
      }

      // Right 3pt straight corners
      segs.push({ x1: rbx, y1: cornerY1, x2: rbx - Math.sqrt(r3 * r3 - (CY - cornerY1) ** 2), y2: cornerY1 })
      segs.push({ x1: rbx, y1: cornerY2, x2: rbx - Math.sqrt(r3 * r3 - (CY - cornerY2) ** 2), y2: cornerY2 })

      // Right 3pt arc
      for (let i = 0; i <= arcSegs; i++) {
        const a = Math.PI / 2 + (i / arcSegs) * Math.PI
        const px = rBasketX + Math.cos(a) * r3
        const py = CY + Math.sin(a) * r3
        if (py < cornerY1 || py > cornerY2) continue
        if (i > 0) {
          const prevA = Math.PI / 2 + ((i - 1) / arcSegs) * Math.PI
          const prevPx = rBasketX + Math.cos(prevA) * r3
          const prevPy = CY + Math.sin(prevA) * r3
          if (prevPy >= cornerY1 && prevPy <= cornerY2) {
            segs.push({ x1: prevPx, y1: prevPy, x2: px, y2: py })
          }
        }
      }

      return segs
    })(),
  },

  handball: {
    label: 'Handball',
    color: '#87ceeb',
    lines: (() => {
      const segs = []
      // Boundary
      segs.push({ x1: 0, y1: 0, x2: 40, y2: 0 })
      segs.push({ x1: 40, y1: 0, x2: 40, y2: 20 })
      segs.push({ x1: 40, y1: 20, x2: 0, y2: 20 })
      segs.push({ x1: 0, y1: 20, x2: 0, y2: 0 })
      // Center line
      segs.push({ x1: 20, y1: 0, x2: 20, y2: 20 })

      // Center circle r=3
      const ccR = 3
      const ccSegs = 48
      for (let i = 0; i < ccSegs; i++) {
        const a1 = (i / ccSegs) * Math.PI * 2
        const a2 = ((i + 1) / ccSegs) * Math.PI * 2
        segs.push({
          x1: CX + Math.cos(a1) * ccR,
          y1: CY + Math.sin(a1) * ccR,
          x2: CX + Math.cos(a2) * ccR,
          y2: CY + Math.sin(a2) * ccR,
        })
      }

      // Goals: left x=-1 to 0, y=8.5 to 11.5; right x=40 to 41, y=8.5 to 11.5
      segs.push({ x1: 0, y1: 8.5, x2: -1, y2: 8.5 })
      segs.push({ x1: -1, y1: 8.5, x2: -1, y2: 11.5 })
      segs.push({ x1: -1, y1: 11.5, x2: 0, y2: 11.5 })
      segs.push({ x1: 40, y1: 8.5, x2: 41, y2: 8.5 })
      segs.push({ x1: 41, y1: 8.5, x2: 41, y2: 11.5 })
      segs.push({ x1: 41, y1: 11.5, x2: 40, y2: 11.5 })

      // Goal areas (6m line): quarter arcs r=6 from posts at (0,8.5) and (0,11.5)
      const goalR = 6
      const arcN = 32
      // Left side: arc from post at (0,8.5), quarter arc going right
      for (let i = 0; i <= arcN; i++) {
        const a1 = (i / arcN) * (Math.PI / 2) // 0 to 90deg
        const a2 = ((i + 1) / arcN) * (Math.PI / 2)
        if (i < arcN) {
          segs.push({
            x1: 0 + Math.cos(a1) * goalR,
            y1: 8.5 - Math.sin(a1) * goalR,
            x2: 0 + Math.cos(a2) * goalR,
            y2: 8.5 - Math.sin(a2) * goalR,
          })
        }
      }
      for (let i = 0; i <= arcN; i++) {
        const a1 = (i / arcN) * (Math.PI / 2)
        const a2 = ((i + 1) / arcN) * (Math.PI / 2)
        if (i < arcN) {
          segs.push({
            x1: 0 + Math.cos(a1) * goalR,
            y1: 11.5 + Math.sin(a1) * goalR,
            x2: 0 + Math.cos(a2) * goalR,
            y2: 11.5 + Math.sin(a2) * goalR,
          })
        }
      }
      // Connect arcs with straight line at x=6
      segs.push({ x1: goalR, y1: 8.5, x2: goalR, y2: 11.5 })

      // 9m dashed line (simplified as solid): arcs r=9
      const nineR = 9
      const nineN = 48
      for (let i = 0; i <= nineN; i++) {
        const a1 = (i / nineN) * (Math.PI / 2)
        const a2 = ((i + 1) / nineN) * (Math.PI / 2)
        if (i < nineN && i % 4 < 2) { // dashed effect
          segs.push({
            x1: 0 + Math.cos(a1) * nineR,
            y1: 8.5 - Math.sin(a1) * nineR,
            x2: 0 + Math.cos(a2) * nineR,
            y2: 8.5 - Math.sin(a2) * nineR,
          })
          segs.push({
            x1: 0 + Math.cos(a1) * nineR,
            y1: 11.5 + Math.sin(a1) * nineR,
            x2: 0 + Math.cos(a2) * nineR,
            y2: 11.5 + Math.sin(a2) * nineR,
          })
        }
      }
      segs.push({ x1: nineR, y1: 8.5, x2: nineR, y2: 11.5 })

      // Left penalty mark at x=7, y=10 (small cross)
      segs.push({ x1: 6.8, y1: 10, x2: 7.2, y2: 10 })

      // Right side mirror (at x=40)
      for (let i = 0; i <= arcN; i++) {
        const a1 = (i / arcN) * (Math.PI / 2)
        const a2 = ((i + 1) / arcN) * (Math.PI / 2)
        if (i < arcN) {
          segs.push({
            x1: 40 - Math.cos(a1) * goalR,
            y1: 8.5 - Math.sin(a1) * goalR,
            x2: 40 - Math.cos(a2) * goalR,
            y2: 8.5 - Math.sin(a2) * goalR,
          })
          segs.push({
            x1: 40 - Math.cos(a1) * goalR,
            y1: 11.5 + Math.sin(a1) * goalR,
            x2: 40 - Math.cos(a2) * goalR,
            y2: 11.5 + Math.sin(a2) * goalR,
          })
        }
      }
      segs.push({ x1: 40 - goalR, y1: 8.5, x2: 40 - goalR, y2: 11.5 })

      for (let i = 0; i <= nineN; i++) {
        const a1 = (i / nineN) * (Math.PI / 2)
        const a2 = ((i + 1) / nineN) * (Math.PI / 2)
        if (i < nineN && i % 4 < 2) {
          segs.push({
            x1: 40 - Math.cos(a1) * nineR,
            y1: 8.5 - Math.sin(a1) * nineR,
            x2: 40 - Math.cos(a2) * nineR,
            y2: 8.5 - Math.sin(a2) * nineR,
          })
          segs.push({
            x1: 40 - Math.cos(a1) * nineR,
            y1: 11.5 + Math.sin(a1) * nineR,
            x2: 40 - Math.cos(a2) * nineR,
            y2: 11.5 + Math.sin(a2) * nineR,
          })
        }
      }
      segs.push({ x1: 40 - nineR, y1: 8.5, x2: 40 - nineR, y2: 11.5 })
      // Right penalty mark
      segs.push({ x1: 33.2, y1: 10, x2: 32.8, y2: 10 })

      return segs
    })(),
  },

  badminton: {
    label: 'Badminton',
    color: '#00ff00',
    lines: (() => {
      const segs = []
      // 3 courts arranged along y axis
      // Court dims: 13.4m long (x), 6.1m wide (y)
      // Centered in 40m: from x=13.3 to x=26.7
      const cx1 = 13.3
      const cx2 = 26.7
      const courtLen = cx2 - cx1 // 13.4m
      const courtW = 6.1
      const netX = (cx1 + cx2) / 2 // x=20

      // Short service line: 1.98m from net
      const sslDist = 1.98
      // Long service line (doubles): 0.76m from baseline
      const lslDist = 0.76
      // Singles sideline: 0.46m in from doubles sideline

      // 3 courts: y positions
      const courts = [
        { y1: 0.85, y2: 6.95 },
        { y1: 6.95, y2: 13.05 },
        { y1: 13.05, y2: 19.15 },
      ]

      courts.forEach(({ y1, y2 }) => {
        const singleY1 = y1 + 0.46
        const singleY2 = y2 - 0.46
        // Outer doubles boundary
        segs.push({ x1: cx1, y1, x2: cx2, y2: y1 })
        segs.push({ x1: cx2, y1, x2: cx2, y2: y2 })
        segs.push({ x1: cx2, y1: y2, x2: cx1, y2: y2 })
        segs.push({ x1: cx1, y1: y2, x2: cx1, y2: y1 })
        // Singles sidelines
        segs.push({ x1: cx1, y1: singleY1, x2: cx2, y2: singleY1 })
        segs.push({ x1: cx1, y1: singleY2, x2: cx2, y2: singleY2 })
        // Net line
        segs.push({ x1: netX, y1, x2: netX, y2: y2 })
        // Short service lines
        segs.push({ x1: netX - sslDist, y1, x2: netX - sslDist, y2: y2 })
        segs.push({ x1: netX + sslDist, y1, x2: netX + sslDist, y2: y2 })
        // Long service lines (doubles rear boundary inside)
        segs.push({ x1: cx1 + lslDist, y1, x2: cx1 + lslDist, y2: y2 })
        segs.push({ x1: cx2 - lslDist, y1, x2: cx2 - lslDist, y2: y2 })
        // Center service line (perpendicular, splits court width)
        const yMid = (y1 + y2) / 2
        segs.push({ x1: cx1, y1: yMid, x2: cx2, y2: yMid })
      })

      return segs
    })(),
  },

  football: {
    label: 'Fussball',
    color: '#ffff00',
    lines: (() => {
      const segs = []
      // Futsal/small football 40x20
      segs.push({ x1: 0, y1: 0, x2: 40, y2: 0 })
      segs.push({ x1: 40, y1: 0, x2: 40, y2: 20 })
      segs.push({ x1: 40, y1: 20, x2: 0, y2: 20 })
      segs.push({ x1: 0, y1: 20, x2: 0, y2: 0 })
      // Center line
      segs.push({ x1: 20, y1: 0, x2: 20, y2: 20 })
      // Center circle r=3
      const ccR = 3
      const ccSegs = 48
      for (let i = 0; i < ccSegs; i++) {
        const a1 = (i / ccSegs) * Math.PI * 2
        const a2 = ((i + 1) / ccSegs) * Math.PI * 2
        segs.push({
          x1: CX + Math.cos(a1) * ccR,
          y1: CY + Math.sin(a1) * ccR,
          x2: CX + Math.cos(a2) * ccR,
          y2: CY + Math.sin(a2) * ccR,
        })
      }
      // Left penalty area: rect(0, 2, 6, 16)
      segs.push({ x1: 0, y1: 2, x2: 6, y2: 2 })
      segs.push({ x1: 6, y1: 2, x2: 6, y2: 18 })
      segs.push({ x1: 6, y1: 18, x2: 0, y2: 18 })
      // Left goal area: rect(0, 6, 3, 8)
      segs.push({ x1: 0, y1: 6, x2: 3, y2: 6 })
      segs.push({ x1: 3, y1: 6, x2: 3, y2: 14 })
      segs.push({ x1: 3, y1: 14, x2: 0, y2: 14 })
      // Left goal
      segs.push({ x1: 0, y1: 8.5, x2: -0.8, y2: 8.5 })
      segs.push({ x1: -0.8, y1: 8.5, x2: -0.8, y2: 11.5 })
      segs.push({ x1: -0.8, y1: 11.5, x2: 0, y2: 11.5 })
      // Left penalty spot
      segs.push({ x1: 5.8, y1: 9.9, x2: 6.2, y2: 10.1 })
      segs.push({ x1: 5.8, y1: 10.1, x2: 6.2, y2: 9.9 })

      // Right side mirror
      segs.push({ x1: 40, y1: 2, x2: 34, y2: 2 })
      segs.push({ x1: 34, y1: 2, x2: 34, y2: 18 })
      segs.push({ x1: 34, y1: 18, x2: 40, y2: 18 })
      segs.push({ x1: 40, y1: 6, x2: 37, y2: 6 })
      segs.push({ x1: 37, y1: 6, x2: 37, y2: 14 })
      segs.push({ x1: 37, y1: 14, x2: 40, y2: 14 })
      segs.push({ x1: 40, y1: 8.5, x2: 40.8, y2: 8.5 })
      segs.push({ x1: 40.8, y1: 8.5, x2: 40.8, y2: 11.5 })
      segs.push({ x1: 40.8, y1: 11.5, x2: 40, y2: 11.5 })
      segs.push({ x1: 34.2, y1: 9.9, x2: 33.8, y2: 10.1 })
      segs.push({ x1: 34.2, y1: 10.1, x2: 33.8, y2: 9.9 })

      return segs
    })(),
  },
}
