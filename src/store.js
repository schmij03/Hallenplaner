import { create } from 'zustand'
import { persist } from 'zustand/middleware'

let nextId = 1

const useStore = create(
  persist(
    (set, get) => ({
      view: '2d',
      selectedTool: 'select',
      equipment: [],
      selectedId: null,
      sportLines: {
        volleyball: false,
        basketball: false,
        handball: false,
        badminton: false,
        football: false,
      },

      setView: (view) => set({ view }),
      setSelectedTool: (tool) => set({ selectedTool: tool, selectedId: null }),

      addEquipment: (type, x, y) => {
        const id = String(nextId++)
        set((state) => ({
          equipment: [...state.equipment, { id, type, x, y, rotation: 0 }],
          selectedId: id,
        }))
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipment: state.equipment.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }))
      },

      removeEquipment: (id) => {
        set((state) => ({
          equipment: state.equipment.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }))
      },

      setSelectedId: (id) => set({ selectedId: id }),

      toggleSportLine: (sport) => {
        set((state) => ({
          sportLines: {
            ...state.sportLines,
            [sport]: !state.sportLines[sport],
          },
        }))
      },

      clearAll: () => set({ equipment: [], selectedId: null }),

      // Drawing annotations
      drawings: [],
      drawColor: '#ef4444',
      drawLineWidth: 0.12,
      setDrawColor: (c) => set({ drawColor: c }),
      setDrawLineWidth: (w) => set({ drawLineWidth: w }),
      addDrawing: (d) => {
        const id = String(nextId++)
        set((s) => ({ drawings: [...s.drawings, { ...d, id }] }))
      },
      undoLastDrawing: () => set((s) => ({ drawings: s.drawings.slice(0, -1) })),
      clearDrawings: () => set({ drawings: [] }),
    }),
    {
      name: 'hallenplaner',
      partialize: (state) => ({
        equipment: state.equipment,
        sportLines: state.sportLines,
        drawings: state.drawings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.equipment?.length > 0) {
          const maxId = state.equipment.reduce((max, item) => {
            const num = parseInt(item.id, 10)
            return isNaN(num) ? max : Math.max(max, num)
          }, 0)
          nextId = maxId + 1
        }
      },
    }
  )
)

export default useStore
