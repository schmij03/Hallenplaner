// Cartoon people/figures that can be placed like equipment.
// Each has isPerson flag so the renderers draw a figure instead of a box.
// w/d = floor footprint (m), h = standing height (m).

export const PEOPLE = [
  { type: 'kind-rot',    label: 'Kind rot',    isPerson: true, pose: 'stand', shirt: '#e53935', pants: '#37474f', skin: '#f1c27d', hair: '#3e2723', color: '#e53935', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-blau',   label: 'Kind blau',   isPerson: true, pose: 'stand', shirt: '#1e88e5', pants: '#37474f', skin: '#ffdbac', hair: '#5d4037', color: '#1e88e5', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-gruen',  label: 'Kind grün',   isPerson: true, pose: 'stand', shirt: '#43a047', pants: '#455a64', skin: '#8d5524', hair: '#1b1b1b', color: '#43a047', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-gelb',   label: 'Kind gelb',   isPerson: true, pose: 'stand', shirt: '#fdd835', pants: '#37474f', skin: '#c68642', hair: '#3e2723', color: '#fdd835', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-lila',   label: 'Kind lila',   isPerson: true, pose: 'stand', shirt: '#8e24aa', pants: '#455a64', skin: '#ffdbac', hair: '#6d4c41', color: '#8e24aa', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-orange', label: 'Kind orange', isPerson: true, pose: 'stand', shirt: '#fb8c00', pants: '#37474f', skin: '#f1c27d', hair: '#212121', color: '#fb8c00', w: 0.6, d: 0.6, h: 1.3,  category: 'Personen' },
  { type: 'kind-sitzend',label: 'Kind sitzend',isPerson: true, pose: 'sit',   shirt: '#00897b', pants: '#37474f', skin: '#ffdbac', hair: '#4e342e', color: '#00897b', w: 0.7, d: 0.7, h: 0.8,  category: 'Personen' },
  { type: 'lehrer',      label: 'Lehrperson',  isPerson: true, pose: 'teacher',shirt: '#263238', pants: '#1c2429', skin: '#f1c27d', hair: '#212121', color: '#263238', w: 0.65,d: 0.65,h: 1.75, category: 'Personen' },
]

export function getPersonDef(type) {
  return PEOPLE.find((p) => p.type === type) || null
}
