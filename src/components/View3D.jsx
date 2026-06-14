import React, { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store.js'
import { getEquipmentDef } from '../constants/equipment.js'
import { SPORT_LINES } from '../constants/sportLines.js'

const HALL_W = 40
const HALL_D = 20
const WALL_H = 8

function HallFloor() {
  return (
    <mesh position={[HALL_W / 2, 0, HALL_D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[HALL_W, HALL_D]} />
      <meshStandardMaterial color="#d4a96a" roughness={0.8} />
    </mesh>
  )
}

function HallWalls() {
  const wallMat = (
    <meshStandardMaterial color="#8899aa" transparent opacity={0.25} side={THREE.DoubleSide} />
  )
  return (
    <>
      {/* Front wall z=0 */}
      <mesh position={[HALL_W / 2, WALL_H / 2, 0]}>
        <planeGeometry args={[HALL_W, WALL_H]} />
        <meshStandardMaterial color="#8899aa" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Back wall z=HALL_D */}
      <mesh position={[HALL_W / 2, WALL_H / 2, HALL_D]}>
        <planeGeometry args={[HALL_W, WALL_H]} />
        <meshStandardMaterial color="#8899aa" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall x=0 */}
      <mesh position={[0, WALL_H / 2, HALL_D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL_D, WALL_H]} />
        <meshStandardMaterial color="#8899aa" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall x=HALL_W */}
      <mesh position={[HALL_W, WALL_H / 2, HALL_D / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL_D, WALL_H]} />
        <meshStandardMaterial color="#8899aa" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </>
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
            <lineBasicMaterial color={sport.color} linewidth={2} />
          </lineSegments>
        )
      })}
    </>
  )
}

function Person3D({ def }) {
  const h = def.h
  return (
    <group>
      {/* legs / pants */}
      <mesh position={[0, h * 0.2, 0]}>
        <cylinderGeometry args={[h * 0.12, h * 0.1, h * 0.4, 12]} />
        <meshStandardMaterial color={def.pants} roughness={0.8} />
      </mesh>
      {/* torso / shirt */}
      <mesh position={[0, h * 0.55, 0]}>
        <cylinderGeometry args={[h * 0.16, h * 0.14, h * 0.4, 12]} />
        <meshStandardMaterial color={def.shirt} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, h * 0.88, 0]}>
        <sphereGeometry args={[h * 0.13, 16, 16]} />
        <meshStandardMaterial color={def.skin} roughness={0.6} />
      </mesh>
      {/* hair cap */}
      <mesh position={[0, h * 0.93, 0]}>
        <sphereGeometry args={[h * 0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={def.hair} roughness={0.7} />
      </mesh>
    </group>
  )
}

function EquipmentItems({ equipment }) {
  return (
    <>
      {equipment.map((item) => {
        const def = getEquipmentDef(item.type)
        if (!def) return null
        const rotY = -((item.rotation || 0) * Math.PI) / 180

        if (def.isPerson) {
          return (
            <group
              key={item.id}
              position={[item.x + def.w / 2, 0, item.y + def.d / 2]}
              rotation={[0, rotY, 0]}
            >
              <Person3D def={def} />
            </group>
          )
        }

        return (
          <group
            key={item.id}
            position={[item.x + def.w / 2, def.h / 2, item.y + def.d / 2]}
            rotation={[0, rotY, 0]}
          >
            <mesh>
              <boxGeometry args={[def.w, def.h, def.d]} />
              <meshStandardMaterial color={def.color} roughness={0.6} />
            </mesh>
            <Text
              position={[0, def.h / 2 + 0.3, 0]}
              fontSize={0.4}
              color="#222"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.025}
              outlineColor="white"
            >
              {def.label}
            </Text>
          </group>
        )
      })}
    </>
  )
}

function SceneCapture({ threeRef }) {
  const { gl } = useThree()
  useEffect(() => {
    if (threeRef) threeRef.current = gl
  }, [gl, threeRef])
  return null
}

export default function View3D({ threeRef }) {
  const { equipment, sportLines } = useStore()

  return (
    <Canvas
      camera={{ position: [20, 25, 40], fov: 50, near: 0.1, far: 500 }}
      style={{ width: '100%', height: '100%', background: '#dce4ec' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <SceneCapture threeRef={threeRef} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 20]} intensity={1.0} castShadow />
      <directionalLight position={[-10, 20, -10]} intensity={0.3} />
      <HallFloor />
      <HallWalls />
      <SportLinesRenderer sportLines={sportLines} />
      <EquipmentItems equipment={equipment} />
      <OrbitControls target={[HALL_W / 2, 0, HALL_D / 2]} />
    </Canvas>
  )
}
