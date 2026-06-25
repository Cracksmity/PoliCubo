/**
 * ideologies.js
 * Datos de las corrientes ideológicas para PoliCubo.
 *
 * Coordenadas en el rango [-1, 1] para cada eje:
 *   X: -1 = Izquierda (Colectivismo Económico) ↔ +1 = Derecha (Libre Mercado)
 *   Y: -1 = Libertario (Mínimo Estado)        ↔ +1 = Autoritario (Máximo Estado)
 *   Z: -1 = Monismo/Exclusión                 ↔ +1 = Pluralismo/Inclusión
 */

export const IDEOLOGIES = [
  {
    id: 'ecosoc-lib',
    name: 'Ecosocialismo Libertario e Inclusivo',
    coords: { x: -0.72, y: -0.55, z: 0.82 },
    color: '#10b981',
    description: 'Combina economía colectiva, mínimo Estado y máxima diversidad cultural. Énfasis en ecología y derechos de minorías.',
    connections: ['anarco-com', 'soc-plural'],
  },
  {
    id: 'anarco-com',
    name: 'Anarcocomunismo Descentralizado',
    coords: { x: -0.88, y: -0.82, z: 0.65 },
    color: '#f43f5e',
    description: 'Abolición del Estado y del capital. Autogestión comunitaria con énfasis en identidades diversas y redes horizontales.',
    connections: ['ecosoc-lib', 'lib-mkt'],
  },
  {
    id: 'soc-plural',
    name: 'Socialdemocracia Pluralista',
    coords: { x: -0.38, y: 0.25, z: 0.52 },
    color: '#f97316',
    description: 'Economía mixta regulada, Estado de bienestar robusto y políticas activas de inclusión multicultural.',
    connections: ['ecosoc-lib', 'com-prog', 'stakeholder'],
  },
  {
    id: 'com-prog',
    name: 'Comunitarismo Progresista',
    coords: { x: -0.28, y: 0.35, z: 0.42 },
    color: '#eab308',
    description: 'Comunidades fuertes con identidad compartida pero abierta al diálogo intercultural. Subsidiaridad estatal.',
    connections: ['soc-plural', 'lib-social'],
  },
  {
    id: 'lib-social',
    name: 'Liberalismo Social',
    coords: { x: 0.22, y: -0.15, z: 0.38 },
    color: '#22d3ee',
    description: 'Mercado libre con correcciones redistributivas y derechos civiles amplios. Centro-liberal pluralista.',
    connections: ['com-prog', 'stakeholder'],
  },
  {
    id: 'stakeholder',
    name: 'Capitalismo de Stakeholders',
    coords: { x: 0.55, y: 0.12, z: 0.30 },
    color: '#4f8ef7',
    description: 'Empresa libre pero accountable con empleados, comunidad y medioambiente. ESG y responsabilidad corporativa.',
    connections: ['soc-plural', 'lib-social', 'lib-clasico'],
  },
  {
    id: 'lib-clasico',
    name: 'Liberalismo Clásico',
    coords: { x: 0.65, y: -0.42, z: 0.18 },
    color: '#a78bfa',
    description: 'Libertades individuales y mercado libre con gobierno limitado. Derechos naturales, Locke, Smith.',
    connections: ['stakeholder', 'lib-mkt'],
  },
  {
    id: 'lib-mkt',
    name: 'Libertarismo de Mercado',
    coords: { x: 0.82, y: -0.72, z: 0.08 },
    color: '#fbbf24',
    description: 'Mínimo gobierno posible, libre mercado radical. Individualismo extremo. Hayek, Nozick.',
    connections: ['lib-clasico', 'anarco-com'],
  },
  {
    id: 'neocon',
    name: 'Neoconservadurismo Nacional',
    coords: { x: 0.68, y: 0.72, z: -0.52 },
    color: '#ef4444',
    description: 'Mercado libre con Estado fuerte, valores culturales tradicionales y política exterior intervencionista.',
    connections: ['teocracia', 'nation-soc'],
  },
  {
    id: 'teocracia',
    name: 'Teocracia Autoritaria',
    coords: { x: 0.18, y: 0.92, z: -0.82 },
    color: '#7c3aed',
    description: 'Gobierno fundamentado en ley religiosa. Estado máximo que impone doctrina única y asimilación cultural.',
    connections: ['neocon', 'nation-soc'],
  },
  {
    id: 'nation-soc',
    name: 'Colectivismo Autoritario Excluyente',
    coords: { x: -0.32, y: 0.88, z: -0.90 },
    color: '#6b7280',
    description: 'Economía controlada por el Estado, poder político centralizado y homogeneización cultural forzada.',
    connections: ['teocracia', 'neocon'],
  },
  {
    id: 'ego-anarch',
    name: 'Anarquismo Egoísta (Stirner)',
    coords: { x: -0.75, y: -0.95, z: -0.85 },
    color: '#8b5cf6',
    description: 'Rechazo absoluto del Estado, el capitalismo y todo "fantasma" moral o social (ideologías, religión). Máximo individualismo monista centrado en el Yo.',
    connections: ['anarco-com', 'lib-mkt', 'salamanca-lib'],
  },

  // ── Nodo personalizado ─────────────────────────────────────────────────────
  // Eje X  =  0.3   →  Centro-Derecha
  // Eje Y  = -0.95  →  Extremo Libertario/Anárquico
  // Eje Z  =  0.35  →  Pluralismo moderado (fe por caridad y libre albedrío, no por obligación)
  // Color  = Cian eléctrico
  {
    id: 'salamanca-lib',
    name: 'Neo-Salamanquismo Tecno-Estóico (Anarquía Aceleracionista)',
    coords: { x: 0.3, y: -0.95, z: 0.35 },
    color: '#00e5ff',
    description:
      'Neo-Salamanquismo Tecno-Estóico (Anarquía Aceleracionista). Síntesis filosófica que une el pensamiento anti-industrial y la soberanía popular radical con el aceleracionismo tecnológico y la teología de la Escuela de Salamanca. Defiende un ideal moral católico tradicional pero bajo un estricto principio de no coacción: la fe debe llegar por caridad y libre albedrío, nunca por obligación estatal. Rechaza por completo el sistema industrial y los estados totalitarios (como el nazismo), adoptando una postura estóica ante el avance de la Inteligencia Artificial, viéndola como un catalizador inevitable que disolverá las estructuras de control moderno para devolver el orden a comunidades orgánicas y descentralizadas.',
    connections: ['lib-clasico', 'lib-mkt'],
  },
];

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
