// Draws a cartoon person token for the top-down 2D canvas.
// Context is already translated to the item center and rotated.
// Figure faces -y (toward top of screen) before rotation. Units = meters.

function roundedRect(ctx, x, y, w, h, r) {
  const cr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + cr, y)
  ctx.arcTo(x + w, y, x + w, y + h, cr)
  ctx.arcTo(x + w, y + h, x, y + h, cr)
  ctx.arcTo(x, y + h, x, y, cr)
  ctx.arcTo(x, y, x + w, y, cr)
  ctx.closePath()
}

export function drawPerson(ctx, def, isSelected) {
  const { pose = 'stand' } = def

  // Soft floor shadow
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(0, 0.18, 0.3, 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (isSelected) {
    ctx.save()
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 0.05
    ctx.setLineDash([0.1, 0.07])
    ctx.beginPath()
    ctx.arc(0, -0.05, 0.42, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  if (pose === 'sit') return drawSitting(ctx, def)
  return drawStanding(ctx, def, pose === 'teacher')
}

function drawStanding(ctx, def, isTeacher) {
  const { shirt, pants, skin, hair } = def

  // Legs (shorts + lower legs), seen from front-top
  ctx.fillStyle = pants
  roundedRect(ctx, -0.13, 0.0, 0.11, 0.22, 0.04); ctx.fill()
  roundedRect(ctx, 0.02, 0.0, 0.11, 0.22, 0.04); ctx.fill()
  ctx.fillStyle = skin
  roundedRect(ctx, -0.12, 0.18, 0.09, 0.12, 0.03); ctx.fill()
  roundedRect(ctx, 0.03, 0.18, 0.09, 0.12, 0.03); ctx.fill()
  // Shoes
  ctx.fillStyle = '#ffffff'
  roundedRect(ctx, -0.13, 0.28, 0.1, 0.06, 0.03); ctx.fill()
  roundedRect(ctx, 0.03, 0.28, 0.1, 0.06, 0.03); ctx.fill()

  // Arms (skin) behind torso
  ctx.fillStyle = shirt
  roundedRect(ctx, -0.26, -0.2, 0.1, 0.26, 0.05); ctx.fill()
  roundedRect(ctx, 0.16, -0.2, 0.1, 0.26, 0.05); ctx.fill()
  ctx.fillStyle = skin
  roundedRect(ctx, -0.25, 0.0, 0.08, 0.12, 0.04); ctx.fill()
  roundedRect(ctx, 0.17, 0.0, 0.08, 0.12, 0.04); ctx.fill()

  // Torso (shirt) with subtle highlight
  const grad = ctx.createLinearGradient(-0.2, 0, 0.2, 0)
  grad.addColorStop(0, shade(shirt, -12))
  grad.addColorStop(0.5, shirt)
  grad.addColorStop(1, shade(shirt, 12))
  ctx.fillStyle = grad
  roundedRect(ctx, -0.2, -0.22, 0.4, 0.34, 0.1); ctx.fill()
  ctx.strokeStyle = shade(shirt, -25)
  ctx.lineWidth = 0.015
  roundedRect(ctx, -0.2, -0.22, 0.4, 0.34, 0.1); ctx.stroke()

  // Neck
  ctx.fillStyle = skin
  roundedRect(ctx, -0.05, -0.3, 0.1, 0.1, 0.03); ctx.fill()

  // Head
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(0, -0.4, 0.16, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = shade(skin, -22)
  ctx.lineWidth = 0.012
  ctx.stroke()

  // Hair (cap over upper head)
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.arc(0, -0.4, 0.165, Math.PI * 1.05, Math.PI * 1.95)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, -0.42, 0.16, Math.PI, Math.PI * 2)
  ctx.fill()

  // Face dots (eyes)
  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.arc(-0.06, -0.38, 0.022, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(0.06, -0.38, 0.022, 0, Math.PI * 2); ctx.fill()
  // Smile
  ctx.strokeStyle = '#7a4b2b'
  ctx.lineWidth = 0.02
  ctx.beginPath()
  ctx.arc(0, -0.36, 0.06, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()

  if (isTeacher) {
    // Whistle on a string
    ctx.strokeStyle = '#9e9e9e'
    ctx.lineWidth = 0.012
    ctx.beginPath()
    ctx.moveTo(-0.08, -0.28)
    ctx.lineTo(0.0, -0.08)
    ctx.lineTo(0.08, -0.28)
    ctx.stroke()
    ctx.fillStyle = '#ffca28'
    ctx.beginPath(); ctx.arc(0, -0.06, 0.035, 0, Math.PI * 2); ctx.fill()
  }
}

function drawSitting(ctx, def) {
  const { shirt, pants, skin, hair } = def

  // Legs folded forward
  ctx.fillStyle = pants
  roundedRect(ctx, -0.22, 0.02, 0.18, 0.13, 0.06); ctx.fill()
  roundedRect(ctx, 0.04, 0.02, 0.18, 0.13, 0.06); ctx.fill()
  ctx.fillStyle = skin
  ctx.beginPath(); ctx.arc(-0.22, 0.09, 0.06, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(0.22, 0.09, 0.06, 0, Math.PI * 2); ctx.fill()

  // Torso
  ctx.fillStyle = shirt
  roundedRect(ctx, -0.2, -0.18, 0.4, 0.28, 0.1); ctx.fill()
  ctx.strokeStyle = shade(shirt, -25)
  ctx.lineWidth = 0.015
  roundedRect(ctx, -0.2, -0.18, 0.4, 0.28, 0.1); ctx.stroke()

  // Arms
  ctx.fillStyle = skin
  roundedRect(ctx, -0.26, -0.05, 0.08, 0.16, 0.04); ctx.fill()
  roundedRect(ctx, 0.18, -0.05, 0.08, 0.16, 0.04); ctx.fill()

  // Head
  ctx.fillStyle = skin
  ctx.beginPath(); ctx.arc(0, -0.3, 0.15, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = hair
  ctx.beginPath(); ctx.arc(0, -0.32, 0.155, Math.PI, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.arc(-0.055, -0.29, 0.02, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(0.055, -0.29, 0.02, 0, Math.PI * 2); ctx.fill()
}

function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 0xff
  let g = (n >> 8) & 0xff
  let b = n & 0xff
  const f = percent / 100
  r = Math.round(Math.min(255, Math.max(0, r + 255 * f)))
  g = Math.round(Math.min(255, Math.max(0, g + 255 * f)))
  b = Math.round(Math.min(255, Math.max(0, b + 255 * f)))
  return `rgb(${r},${g},${b})`
}
