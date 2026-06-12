import React, { useRef } from 'react'
import useStore from './store.js'
import Sidebar from './components/Sidebar.jsx'
import View2D from './components/View2D.jsx'
import View3D from './components/View3D.jsx'

export default function App() {
  const view = useStore((s) => s.view)
  const canvasRef = useRef(null)
  const threeRef = useRef(null)

  return (
    <div className="app">
      <Sidebar canvasRef={canvasRef} threeRef={threeRef} />
      <div className="main-area">
        {view === '2d' ? (
          <View2D canvasRef={canvasRef} />
        ) : (
          <View3D threeRef={threeRef} />
        )}
      </div>
    </div>
  )
}
