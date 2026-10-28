/**
 * axes.js
 * Metadatos de los tres ejes de PoliCubo y etiquetas descriptivas por tramo.
 *
 * Coordenadas en el rango [-1, 1]:
 *   X: -1 = Izquierda (Colectivismo Económico) ↔ +1 = Derecha (Libre Mercado)
 *   Y: -1 = Libertario (Mínimo Estado)        ↔ +1 = Autoritario (Máximo Estado)
 *   Z: -1 = Monismo/Exclusión                 ↔ +1 = Pluralismo/Inclusión
 */

/**
 * Mapea un valor de [-1, 1] a una etiqueta descriptiva del eje X
 */
export function labelX(v) {
  if (v <= -0.6) return 'Izquierda profunda';
  if (v <= -0.2) return 'Centro-izquierda';
  if (v <=  0.2) return 'Centro';
  if (v <=  0.6) return 'Centro-derecha';
  return 'Derecha profunda';
}

/**
 * Mapea un valor de [-1, 1] a una etiqueta descriptiva del eje Y
 */
export function labelY(v) {
  if (v <= -0.6) return 'Libertario';
  if (v <= -0.2) return 'Civil-liberal';
  if (v <=  0.2) return 'Moderado';
  if (v <=  0.6) return 'Estatalista';
  return 'Autoritario';
}

/**
 * Mapea un valor de [-1, 1] a una etiqueta descriptiva del eje Z
 */
export function labelZ(v) {
  if (v <= -0.6) return 'Monismo / Exclusión';
  if (v <= -0.2) return 'Asimilacionismo';
  if (v <=  0.2) return 'Neutral';
  if (v <=  0.6) return 'Pluralista';
  return 'Pluralismo / Inclusión plena';
}

export const AXES = {
  x: { key: 'x', name: 'Económico',         min: 'Izquierda',  max: 'Derecha',     color: '#f43f5e', label: labelX },
  y: { key: 'y', name: 'Social / Político', min: 'Libertario', max: 'Autoritario', color: '#22d3ee', label: labelY },
  z: { key: 'z', name: 'Pluralidad',        min: 'Monismo',    max: 'Pluralismo',  color: '#a78bfa', label: labelZ },
};

export const AXIS_KEYS = ['x', 'y', 'z'];
