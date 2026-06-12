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
    }),
    {
      name: 'hallenplaner',
      partialize: (state) => ({
        equipment: state.equipment,
        sportLines: state.sportLines,
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
