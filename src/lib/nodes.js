/**
 * nodes.js
 * Construye la lista de nodos del cubo: corrientes de referencia + tu resultado
 * + puntos de comparación + tu posición provisional durante el test.
 */
import { useMemo } from 'react';
import { useStore } from '../store';
import { IDEOLOGIES, matchesSearch } from '../data/ideologies';
import { AXIS_KEYS } from '../data/axes';
import { nearestIdeologies } from './political';

export const USER_NODE_ID = 'user-node';
export const LIVE_NODE_ID = 'live-node';
export const COMPARE_COLOR = '#e2e8f0';

export function buildUserNode(result) {
  return {
    id: USER_NODE_ID,
    kind: 'user',
    name: result.name,
    description: result.description,
    coords: result.coords,
    color: result.color || '#ffffff',
    // Se conecta con las dos corrientes más cercanas
    connections: nearestIdeologies(result.coords, 2).map((n) => n.ideology.id),
  };
}

export function useSceneNodes() {
  const userResult = useStore((s) => s.userResult);
  const compare = useStore((s) => s.compare);
  const liveCoords = useStore((s) => s.liveCoords);
  const isTesting = useStore((s) => s.isTesting);

  return useMemo(() => {
    const nodes = [...IDEOLOGIES];
    if (userResult) nodes.push(buildUserNode(userResult));
    for (const p of compare) {
      nodes.push({
        id: p.id,
        kind: 'compare',
        name: p.name,
        coords: p.coords,
        color: COMPARE_COLOR,
        connections: userResult ? [USER_NODE_ID] : [],
      });
    }
    if (isTesting && liveCoords) {
      nodes.push({
        id: LIVE_NODE_ID,
        kind: 'live',
        name: 'Tú (provisional)',
        coords: liveCoords,
        color: '#ffffff',
        connections: [],
      });
    }
    return nodes;
  }, [userResult, compare, liveCoords, isTesting]);
}

/** ¿Pasa el nodo los filtros del panel? (Los puntos personales solo se filtran por nombre) */
export function passesFilters(node, { search, ranges, families }) {
  if (node.kind === 'live') return true;
  if (!matchesSearch(node, search)) return false;
  if (node.kind !== 'ideology') return true;
  if (families.length && !families.includes(node.family)) return false;
  return AXIS_KEYS.every((k) => node.coords[k] >= ranges[k][0] - 1e-9 && node.coords[k] <= ranges[k][1] + 1e-9);
}

export function useFilters() {
  const search = useStore((s) => s.search);
  const ranges = useStore((s) => s.ranges);
  const families = useStore((s) => s.families);
  return useMemo(() => ({ search, ranges, families }), [search, ranges, families]);
}
