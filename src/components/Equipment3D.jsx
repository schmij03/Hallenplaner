import React from 'react'
import * as THREE from 'three'

// Composite 3D models for equipment, built centered on X/Z with base at y=0.
// def.w = size along X, def.d = size along Z, def.h = height along Y.

function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16)
  const f = p / 100
  const c = (v) => Math.round(Math.min(255, Math.max(0, v + 255 * f)))
  return `rgb(${c((n >> 16) & 0xff)},${c((n >> 8) & 0xff)},${c(n & 0xff)})`
}

const WOOD = '#c79a5b'
const WOOD_DK = '#a87b3e'
const METAL = '#9aa3ad'
const DARK = '#3a3f45'

function Box({ args, position = [0, 0, 0], color, rough = 0.7, metal = 0, opacity = 1, emissive }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={rough}
        metalness={metal}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={emissive || '#000000'}
        emissiveIntensity={emissive ? 0.4 : 0}
      />
    </mesh>
  )
}

function Cyl({ args, position = [0, 0, 0], rotation = [0, 0, 0], color, rough = 0.6, metal = 0.3 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  )
}

export default function Equipment3D({ def, selected }) {
  const { w, d, h, color, type } = def
  const hl = selected ? color : null  // emissive when selected

  switch (type) {
    case 'matte':
    case 'dicke-matte':
    case '16er-matte':
    case 'kleine-matte':
    case 'weichbodenmatte': {
      const pad = Math.min(w, d) * 0.12
      return (
        <group>
          <Box args={[w, h, d]} position={[0, h / 2, 0]} color={color} rough={0.85} emissive={hl} />
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[pad, h * 1.05, pad]} position={[sx * (w / 2 - pad / 2), h * 0.55, sz * (d / 2 - pad / 2)]} color={WOOD} />
          ))}
        </group>
      )
    }

    case 'kasten':
    case 'schwedenkasten':
    case 'schwedenkasten-teil': {
      const segs = Math.max(1, Math.round(h / 0.2))
      const segH = h / segs
      return (
        <group>
          {Array.from({ length: segs }).map((_, i) => {
            const t = i / Math.max(1, segs - 1)        // 0 bottom .. 1 top
            const sw = w * (0.78 + 0.22 * (1 - t))     // wider at bottom
            const sd = d * (0.78 + 0.22 * (1 - t))
            const isTop = i === segs - 1
            return (
              <Box key={i} args={[sw, segH * 0.95, sd]} position={[0, segH * (i + 0.5), 0]}
                color={shade(color, isTop ? 14 : -18)} rough={0.75} emissive={isTop ? hl : null} />
            )
          })}
        </group>
      )
    }

    case 'bank': {
      const legH = h * 0.85
      return (
        <group>
          <Box args={[w, h * 0.18, d]} position={[0, h - h * 0.09, 0]} color={color} emissive={hl} />
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[0.08, legH, d * 0.9]} position={[s * (w / 2 - 0.12), legH / 2, 0]} color={WOOD_DK} />
          ))}
          <Box args={[w * 0.9, 0.05, 0.05]} position={[0, h * 0.3, 0]} color={WOOD_DK} />
        </group>
      )
    }

    case 'tisch': {
      const legH = h * 0.92
      return (
        <group>
          <Box args={[w, h * 0.08, d]} position={[0, h - h * 0.04, 0]} color={color} emissive={hl} />
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[0.07, legH, 0.07]} position={[sx * (w / 2 - 0.1), legH / 2, sz * (d / 2 - 0.1)]} color={WOOD_DK} />
          ))}
        </group>
      )
    }

    case 'schwebebalken': {
      const beamH = 0.12
      return (
        <group>
          <Box args={[w, beamH, d]} position={[0, h - beamH / 2, 0]} color={color} emissive={hl} />
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[0.08, h - beamH, 0.5]} position={[s * (w / 2 - 0.3), (h - beamH) / 2, 0]} color={METAL} />
          ))}
        </group>
      )
    }

    case 'barren': {
      const railH = 0.06
      return (
        <group>
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[w, railH, 0.06]} position={[0, h - railH / 2, s * (d / 2 - 0.05)]} color={color} emissive={hl} />
          ))}
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[0.06, h, 0.06]} position={[sx * (w / 2 - 0.15), h / 2, sz * (d / 2 - 0.05)]} color={METAL} />
          ))}
        </group>
      )
    }

    case 'reck': {
      return (
        <group>
          <Cyl args={[0.03, 0.03, w, 12]} position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} color={color} metal={0.3} />
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[0.06, h, 0.06]} position={[s * (w / 2 - 0.05), h / 2, 0]} color={METAL} />
          ))}
        </group>
      )
    }

    case 'volleyball-netz':
    case 'badminton-netz': {
      const bar = 0.06
      return (
        <group>
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[bar, h + 0.3, bar]} position={[s * (w / 2 - bar / 2), (h + 0.3) / 2, 0]} color={METAL} />
          ))}
          <mesh position={[0, h / 2, 0]}>
            <planeGeometry args={[w - bar, h]} />
            <meshStandardMaterial color="#e8e8e8" transparent opacity={0.55} wireframe />
          </mesh>
          <mesh position={[0, h / 2, 0]}>
            <planeGeometry args={[w - bar, h]} />
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )
    }

    case 'reifen': {
      const r = Math.min(w, d) / 2 * 0.88
      return (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[r, 0.03, 8, 32]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={hl || '#000'} emissiveIntensity={hl ? 0.4 : 0} />
        </mesh>
      )
    }

    case 'tor':
    case 'kleines-tor':
    case 'unihockeytor': {
      const bar = 0.08
      return (
        <group>
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[bar, h, bar]} position={[s * (w / 2 - bar / 2), h / 2, d / 2 - bar / 2]} color={color} emissive={hl} />
          ))}
          <Box args={[w, bar, bar]} position={[0, h - bar / 2, d / 2 - bar / 2]} color={color} emissive={hl} />
          {/* net */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w - bar, h - bar, d]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.12} />
          </mesh>
          <mesh position={[0, h / 2, -d / 2]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#dfe6ee" transparent opacity={0.35} wireframe />
          </mesh>
        </group>
      )
    }

    case 'basketball': {
      return (
        <group>
          <Cyl args={[0.05, 0.05, h, 12]} position={[0, h / 2, d / 2 - 0.05]} color={METAL} />
          <Box args={[1.2, 0.7, 0.05]} position={[0, h - 0.45, d / 2 - 0.12]} color="#ffffff" emissive={hl} />
          <mesh position={[0, h - 0.6, d / 2 - 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.025, 8, 20]} />
            <meshStandardMaterial color="#ff7043" metalness={0.4} />
          </mesh>
        </group>
      )
    }

    case 'trampolin': {
      const frameH = h * 0.7
      return (
        <group>
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Cyl key={i} args={[0.03, 0.03, frameH, 8]} position={[sx * (w / 2 - 0.15), frameH / 2, sz * (d / 2 - 0.15)]} color={METAL} />
          ))}
          <Box args={[w, 0.1, d]} position={[0, frameH, 0]} color={shade(color, -10)} emissive={hl} />
          <Box args={[w - 0.3, 0.04, d - 0.3]} position={[0, frameH + 0.04, 0]} color={shade(color, 20)} rough={0.5} />
        </group>
      )
    }

    case 'sprungbock': {
      const legH = h * 0.82
      return (
        <group>
          <mesh position={[0, h - h * 0.13, 0]} castShadow>
            <boxGeometry args={[w, h * 0.26, d]} />
            <meshStandardMaterial color={color} roughness={0.85} emissive={hl || '#000'} emissiveIntensity={hl ? 0.4 : 0} />
          </mesh>
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[0.04, legH, 0.04]} position={[sx * (w / 2 - 0.03), legH / 2, sz * (d / 2 - 0.05)]} color={METAL} />
          ))}
        </group>
      )
    }

    case 'pferd': {
      const legH = h * 0.75
      return (
        <group>
          <mesh position={[0, h - h * 0.15, 0]} castShadow>
            <boxGeometry args={[w, h * 0.3, d]} />
            <meshStandardMaterial color={color} roughness={0.6} emissive={hl || '#000'} emissiveIntensity={hl ? 0.4 : 0} />
          </mesh>
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[0.06, legH, 0.06]} position={[sx * (w / 2 - 0.1), legH / 2, sz * (d / 2 - 0.06)]} color={METAL} />
          ))}
          {[-1, 1].map((s, i) => (
            <mesh key={i} position={[s * 0.25, h + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.08, 0.02, 6, 12, Math.PI]} />
              <meshStandardMaterial color={DARK} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'ringe': {
      return (
        <group>
          {[-1, 1].map((s, i) => (
            <group key={i}>
              <Cyl args={[0.012, 0.012, h - 0.3, 6]} position={[s * 0.25, (h - 0.3) / 2 + 0.3, 0]} color="#8d6e63" />
              <mesh position={[s * 0.25, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.12, 0.022, 8, 16]} />
                <meshStandardMaterial color={color} emissive={hl || '#000'} emissiveIntensity={hl ? 0.4 : 0} />
              </mesh>
            </group>
          ))}
        </group>
      )
    }

    case 'hochsprung': {
      return (
        <group>
          <Box args={[w * 0.9, h * 0.35, d]} position={[0, h * 0.175, -d * 0.1]} color={color} rough={0.85} emissive={hl} />
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[0.05, h, 0.05]} position={[s * (w / 2 - 0.05), h / 2, d / 2]} color={METAL} />
          ))}
          <Cyl args={[0.02, 0.02, w, 8]} position={[0, h * 0.8, d / 2]} rotation={[0, 0, Math.PI / 2]} color="#f5f5f5" />
        </group>
      )
    }

    case 'huetchen': {
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <coneGeometry args={[Math.min(w, d) / 2, h, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} emissive={hl || '#000'} emissiveIntensity={hl ? 0.4 : 0} />
          </mesh>
          <Box args={[w, 0.02, d]} position={[0, 0.01, 0]} color={shade(color, -15)} />
        </group>
      )
    }

    case 'huerde': {
      return (
        <group>
          {[-1, 1].map((s, i) => (
            <Box key={i} args={[0.06, h, d]} position={[s * (w / 2 - 0.03), h / 2, 0]} color={METAL} />
          ))}
          <Box args={[w, 0.1, 0.04]} position={[0, h - 0.05, 0]} color={color} emissive={hl} />
          <Box args={[w, 0.1, 0.04]} position={[0, h - 0.25, 0]} color={shade(color, -10)} />
        </group>
      )
    }

    case 'malstab':
      return <Cyl args={[w / 2, w / 2, h, 10]} position={[0, h / 2, 0]} color={color} metal={0.1} />

    case 'toeggel': {
      const legH = h * 0.6
      return (
        <group>
          <Box args={[w, h * 0.4, d]} position={[0, h - h * 0.2, 0]} color={color} emissive={hl} />
          <Box args={[w * 0.9, h * 0.3, d * 0.85]} position={[0, h - h * 0.2, 0]} color="#2e7d32" />
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
            <Box key={i} args={[0.08, legH, 0.08]} position={[sx * (w / 2 - 0.1), legH / 2, sz * (d / 2 - 0.1)]} color={DARK} />
          ))}
        </group>
      )
    }

    default:
      return <Box args={[w, h, d]} position={[0, h / 2, 0]} color={color} emissive={hl} />
  }
}
