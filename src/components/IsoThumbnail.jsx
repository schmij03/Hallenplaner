import React, { useRef, useEffect } from 'react'
import { drawIsoThumbnail } from '../utils/drawIso.js'

const W = 60
const H = 48

export default function IsoThumbnail({ def }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawIsoThumbnail(ctx, def, W, H)
  }, [def])
  return <canvas ref={ref} style={{ width: W, height: H }} />
}
