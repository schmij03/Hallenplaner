import { PEOPLE } from './people.js'

export const EQUIPMENT_TYPES = [
  { type: 'matte',              label: 'Matte',              color: '#1e88e5', w: 2.0,  d: 1.2,  h: 0.1,  category: 'Boden'         },
  { type: 'dicke-matte',        label: 'Dicke Matte',        color: '#1565c0', w: 2.0,  d: 1.2,  h: 0.3,  category: 'Boden'         },
  { type: '16er-matte',         label: '16er Matte',         color: '#2196f3', w: 2.0,  d: 1.6,  h: 0.08, category: 'Boden'         },
  { type: 'kleine-matte',       label: 'Kleine Matte',       color: '#64b5f6', w: 1.2,  d: 0.8,  h: 0.05, category: 'Boden'         },
  { type: 'weichbodenmatte',    label: 'Weichbodenmatte',    color: '#0d47a1', w: 2.0,  d: 1.6,  h: 0.4,  category: 'Boden'         },
  { type: 'bank',               label: 'Bank',               color: '#8bc34a', w: 3.5,  d: 0.25, h: 0.5,  category: 'Boden'         },
  { type: 'tisch',              label: 'Tisch',              color: '#795548', w: 1.6,  d: 0.8,  h: 0.75, category: 'Boden'         },
  { type: 'barren',             label: 'Barren',             color: '#9c27b0', w: 3.5,  d: 1.6,  h: 1.7,  category: 'Turnen'        },
  { type: 'reck',               label: 'Reck',               color: '#e91e63', w: 2.4,  d: 1.5,  h: 2.5,  category: 'Turnen'        },
  { type: 'kasten',             label: 'Kasten',             color: '#ff5722', w: 1.2,  d: 1.0,  h: 1.2,  category: 'Turnen'        },
  { type: 'schwedenkasten',     label: 'Schwedenkasten',     color: '#f57c00', w: 1.5,  d: 1.2,  h: 1.2,  category: 'Turnen'        },
  { type: 'schwedenkasten-teil',label: 'Schwedenkasten Teil',color: '#fb8c00', w: 1.5,  d: 1.2,  h: 0.3,  category: 'Turnen'        },
  { type: 'sprungbock',         label: 'Sprungbock',         color: '#6d4c41', w: 0.35, d: 1.1,  h: 1.1,  category: 'Turnen'        },
  { type: 'pferd',              label: 'Pferd',              color: '#9c27b0', w: 1.6,  d: 0.35, h: 1.2,  category: 'Turnen'        },
  { type: 'trampolin',          label: 'Trampolin',          color: '#00bcd4', w: 5.0,  d: 3.0,  h: 1.0,  category: 'Turnen'        },
  { type: 'schwebebalken',      label: 'Schwebebalken',      color: '#f48fb1', w: 5.0,  d: 0.3,  h: 1.2,  category: 'Turnen'        },
  { type: 'ringe',              label: 'Ringe',              color: '#ab47bc', w: 2.0,  d: 1.5,  h: 2.6,  category: 'Turnen'        },
  { type: 'tor',                label: 'Tor',                color: '#f44336', w: 3.0,  d: 1.0,  h: 2.0,  category: 'Ballsport'     },
  { type: 'kleines-tor',        label: 'Kleines Tor',        color: '#ff9800', w: 1.5,  d: 0.8,  h: 1.2,  category: 'Ballsport'     },
  { type: 'unihockeytor',       label: 'Unihockeytor',       color: '#ef5350', w: 1.15, d: 0.65, h: 1.15, category: 'Ballsport'     },
  { type: 'basketball',         label: 'Basketballkorb',     color: '#ffc107', w: 0.45, d: 0.45, h: 3.05, category: 'Ballsport'     },
  { type: 'volleyball-netz',    label: 'Volleyball Netz',    color: '#e0e0e0', w: 9.0,  d: 0.15, h: 2.43, category: 'Ballsport'     },
  { type: 'badminton-netz',     label: 'Badminton Netz',     color: '#e0e0e0', w: 6.1,  d: 0.15, h: 1.55, category: 'Ballsport'     },
  { type: 'hochsprung',         label: 'Hochsprunganlage',   color: '#29b6f6', w: 5.0,  d: 3.0,  h: 2.0,  category: 'Leichtathletik'},
  { type: 'huetchen',           label: 'Hütchen',            color: '#ffeb3b', w: 0.3,  d: 0.3,  h: 0.3,  category: 'Sonstiges'     },
  { type: 'huerde',             label: 'Hürde',              color: '#ff9800', w: 1.06, d: 0.5,  h: 0.8,  category: 'Sonstiges'     },
  { type: 'reifen',             label: 'Reifen',             color: '#f44336', w: 0.9,  d: 0.9,  h: 0.02, category: 'Sonstiges'     },
  { type: 'malstab',            label: 'Malstab',            color: '#ffd600', w: 0.25, d: 0.25, h: 1.5,  category: 'Sonstiges'     },
  { type: 'toeggel',            label: 'Töggel',             color: '#26c6da', w: 1.4,  d: 0.75, h: 0.9,  category: 'Sonstiges'     },
]

// All placeable items: equipment + people.
export const ALL_ITEMS = [...EQUIPMENT_TYPES, ...PEOPLE]

const ITEM_MAP = new Map(ALL_ITEMS.map((i) => [i.type, i]))

export function getEquipmentDef(type) {
  return ITEM_MAP.get(type) || null
}
