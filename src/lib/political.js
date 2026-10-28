/**
 * political.js
 * Cálculos sobre posiciones en el cubo: distancias, afinidad, vecinos
 * y agregación de puntuaciones del test (todo determinista y explicable).
 */
import { AXES, AXIS_KEYS } from '../data/axes';
import { IDEOLOGIES } from '../data/ideologies';
import { CLASSIC_QUESTIONS } from '../data/classicTest';

export const clamp1 = (v) => Math.max(-1, Math.min(1, v));

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Afinidad 0–100 % entre dos posiciones.
 * 100 % = mismo punto; baja de forma lineal y llega a 0 % a 2,5 unidades
 * (más o menos la distancia entre extremos opuestos de dos ejes).
 */
export function affinity(a, b) {
  return Math.round(Math.max(0, 1 - distance(a, b) / 2.5) * 100);
}

/** Las `n` corrientes de referencia más cercanas a una posición */
export function nearestIdeologies(coords, n = 3, excludeId = null) {
  return IDEOLOGIES
    .filter((i) => i.id !== excludeId)
    .map((i) => ({ ideology: i, distance: distance(coords, i.coords), affinity: affinity(coords, i.coords) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

/** "Centro-derecha · Civil-liberal · Pluralista" */
export function describePosition(coords) {
  return AXIS_KEYS.map((k) => AXES[k].label(coords[k])).join(' · ');
}

/**
 * Agrega las puntuaciones por respuesta del test con IA.
 * Cada puntuación trae x/y/z (o null si la respuesta no dice nada de ese eje)
 * y una confianza 0–1. Por eje: media ponderada por confianza.
 * Un eje sin datos queda en 0 (centro).
 */
export function aggregateScores(scores) {
  const result = { x: 0, y: 0, z: 0 };
  let answered = 0;
  for (const axis of AXIS_KEYS) {
    let sum = 0;
    let weight = 0;
    for (const s of scores) {
      if (!s || typeof s[axis] !== 'number') continue;
      const w = typeof s.confianza === 'number' ? Math.max(0.05, s.confianza) : 0.5;
      sum += s[axis] * w;
      weight += w;
    }
    result[axis] = weight > 0 ? clamp1(sum / weight) : 0;
  }
  answered = scores.filter(Boolean).length;
  return { ...roundCoords(result), n: answered };
}

/**
 * Puntúa el test clásico: por eje, media de (acuerdo × dirección) de las
 * afirmaciones respondidas. `answers` = { [questionId]: valor en [-1, 1] }
 */
export function scoreClassic(answers) {
  const sums = { x: 0, y: 0, z: 0 };
  const counts = { x: 0, y: 0, z: 0 };
  for (const q of CLASSIC_QUESTIONS) {
    const v = answers[q.id];
    if (typeof v !== 'number') continue;
    sums[q.axis] += v * q.dir;
    counts[q.axis] += 1;
  }
  const coords = {};
  for (const axis of AXIS_KEYS) {
    coords[axis] = counts[axis] ? clamp1(sums[axis] / counts[axis]) : 0;
  }
  return { ...roundCoords(coords), n: Object.keys(answers).length };
}

export function roundCoords(c) {
  const r = (v) => Math.round(v * 100) / 100;
  return { x: r(c.x), y: r(c.y), z: r(c.z) };
}
