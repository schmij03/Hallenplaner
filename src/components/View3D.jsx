import React, { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store.js'
import { getEquipmentDef } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'
import Equipment3D from './Equipment3D.jsx'

const HALL_W = 40
const HALL_D = 20

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function HallFloor({ onPointerDown, onPointerMove, onPointerUp }) {
  return (
    <group>
      {/* Interactive catcher plane (covers whole hall + margin) */}
      <mesh
        position={[HALL_W / 2, 0, HALL_D / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[HALL_W, HALL_D]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.88} />
      </mesh>
      {/* Surrounding area */}
      <mesh position={[HALL_W / 2, -0.01, HALL_D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL_W + 16, HALL_D + 16]} />
        <meshStandardMaterial color="#dde3ea" roughness={1} />
      </mesh>
      {/* Hall outline */}
      <lineSegments position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(HALL_W, HALL_D).translate(HALL_W / 2, HALL_D / 2, 0).rotateX(-Math.PI / 2)]} />
        <lineBasicMaterial color="#b8c2cc" />
      </lineSegments>
    </group>
  )
}

function SportLinesRenderer({ sportLines }) {
  return (
    <>
      {Object.entries(sportLines).map(([key, visible]) => {
        if (!visible) return null
        const sport = SPORT_LINES[key]
        if (!sport) return null
        const positions = []
        sport.lines.forEach((seg) => {
          positions.push(seg.x1, 0.02, seg.y1)
          positions.push(seg.x2, 0.02, seg.y2)
        })
        const geom = new THREE.BufferGeometry()
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        return (
          <lineSegments key={key} geometry={geom}>
            <lineBasicMaterial color={sport.color} />
          </lineSegments>
        )
      })}
    </>
  )
}

function Person3D({ def, selected }) {
  const h = def.h
  const emissive = selected ? def.shirt : '#000000'
  const ei = selected ? 0.4 : 0
  return (
    <group>
      <mesh position={[0, h * 0.2, 0]} castShadow>
        <cylinderGeometry args={[h * 0.11, h * 0.09, h * 0.4, 12]} />
        <meshStandardMaterial color={def.pants} roughness={0.85} />
      </mesh>
      <mesh position={[0, h * 0.55, 0]} castShadow>
        <cylinderGeometry args={[h * 0.15, h * 0.13, h * 0.4, 12]} />
        <meshStandardMaterial color={def.shirt} roughness={0.7} emissive={emissive} emissiveIntensity={ei} />
      </mesh>
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * h * 0.18, h * 0.55, 0]} rotation={[0, 0, s * 0.15]} castShadow>
          <cylinderGeometry args={[h * 0.04, h * 0.04, h * 0.38, 8]} />
          <meshStandardMaterial color={def.shirt} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, h * 0.88, 0]} castShadow>
        <sphereGeometry args={[h * 0.13, 16, 16]} />
        <meshStandardMaterial color={def.skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, h * 0.93, 0]}>
        <sphereGeometry args={[h * 0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={def.hair} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Items({ equipment, selectedId, onItemDown, onItemMove }) {
  return (
    <>
      {equipment.map((item) => {
        const def = getEquipmentDef(item.type)
        if (!def) return null
        const rotY = -((item.rotation || 0) * Math.PI) / 180
        const sel = item.id === selectedId
        return (
          <group
            key={item.id}
            position={[item.x + def.w / 2, def.isPerson ? 0 : 0, item.y + def.d / 2]}
            rotation={[0, rotY, 0]}
            onPointerDown={(e) => onItemDown(e, item.id)}
            onPointerMove={(e) => onItemMove(e)}
          >
            {def.isPerson ? <Person3D def={def} selected={sel} /> : <Equipment3D def={def} selected={sel} />}
          </group>
        )
      })}
    </>
  )
}

function SceneCapture({ threeRef }) {
  const { gl } = useThree()
  useEffect(() => { if (threeRef) threeRef.current = gl }, [gl, threeRef])
  return null
}

function Scene({ threeRef }) {
  const { equipment, sportLines, selectedTool, selectedId, addEquipment, updateEquipment, setSelectedId, setSelectedTool } = useStore()
  const controls = useRef()
  const dragId = useRef(null)

  const placeOrDeselect = (e) => {
    e.stopPropagation()
    if (selectedTool === 'select') { setSelectedId(null); return }
    const def = getEquipmentDef(selectedTool)
    if (!def) return
    const x = clamp(e.point.x - def.w / 2, 0, HALL_W - def.w)
    const y = clamp(e.point.z - def.d / 2, 0, HALL_D - def.d)
    addEquipment(selectedTool, x, y)
  }

  const onItemDown = (e, id) => {
    e.stopPropagation()
    setSelectedTool('select')
    setSelectedId(id)
    dragId.current = id
    if (controls.current) controls.current.enabled = false
  }

  const moveDrag = (e) => {
    if (!dragId.current) return
    const item = equipment.find((i) => i.id === dragId.current)
    if (!item) return
    const def = getEquipmentDef(item.type)
    if (!def) return
    const x = clamp(e.point.x - def.w / 2, 0, HALL_W - def.w)
    const y = clamp(e.point.z - def.d / 2, 0, HALL_D - def.d)
    updateEquipment(dragId.current, { x, y })
  }

  const endDrag = () => {
    dragId.current = null
    if (controls.current) controls.current.enabled = true
  }

  useEffect(() => {
    window.addEventListener('pointerup', endDrag)
    return () => window.removeEventListener('pointerup', endDrag)
  }, [])

  return (
    <>
      <SceneCapture threeRef={threeRef} />
      <OrthographicCamera makeDefault position={[55, 45, 55]} zoom={17} near={-200} far={500} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[30, 50, 20]} intensity={1.1} castShadow />
      <directionalLight position={[-20, 30, -15]} intensity={0.35} />
      <HallFloor onPointerDown={placeOrDeselect} onPointerMove={moveDrag} onPointerUp={endDrag} />
      <SportLinesRenderer sportLines={sportLines} />
      <Items equipment={equipment} selectedId={selectedId} onItemDown={onItemDown} onItemMove={moveDrag} />
      <OrbitControls ref={controls} target={[HALL_W / 2, 0, HALL_D / 2]} makeDefault onPointerUp={endDrag} />
    </>
  )
}

export default function View3D({ threeRef }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        style={{ width: '100%', height: '100%', background: '#dce4ec' }}
        gl={{ preserveDrawingBuffer: true }}
        onPointerUp={() => { /* safety: handled in Scene */ }}
      >
        <Scene threeRef={threeRef} />
      </Canvas>
      <div className="hint-info">
        Gerät wählen + auf Boden klicken zum Platzieren · Objekt ziehen zum Verschieben · Rechte Maustaste: Ansicht drehen
      </div>
    </div>
  )
}
