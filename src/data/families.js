/**
 * families.js
 * Familias ideológicas. Cada familia tiene un color y una forma propios:
 * la forma permite distinguirlas aunque no se distingan bien los colores
 * (p. ej. socialismo rojo y ecologismo verde).
 */
export const FAMILIES = {
  socialismo:      { label: 'Socialismo y comunismo',       color: '#ef4444', shape: 'octahedron' },
  anarquismo:      { label: 'Anarquismo',                   color: '#f472b6', shape: 'tetrahedron' },
  ecologismo:      { label: 'Ecologismo',                   color: '#22c55e', shape: 'icosahedron' },
  reformismo:      { label: 'Centro y reformismo',          color: '#f97316', shape: 'cylinder' },
  liberalismo:     { label: 'Liberalismo',                  color: '#38bdf8', shape: 'sphere' },
  libertarismo:    { label: 'Libertarismo de derecha',      color: '#facc15', shape: 'capsule' },
  conservadurismo: { label: 'Conservadurismo',              color: '#818cf8', shape: 'box' },
  autoritarismo:   { label: 'Autoritarismo y nacionalismo', color: '#94a3b8', shape: 'cone' },
  autor:           { label: 'Propuesta del autor',          color: '#00e5ff', shape: 'torusKnot' },
};

export const FAMILY_IDS = Object.keys(FAMILIES);
