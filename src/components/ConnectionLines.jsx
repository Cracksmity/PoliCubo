/**
 * ConnectionLines.jsx
 * Dibuja líneas de influencia entre nodos ideológicos conectados.
 * Cada línea tiene opacidad tenue y un color interpolado entre los dos nodos.
 */
import { useMemo } from 'react';
import * as THREE from 'three';

/** Línea entre dos puntos 3D con degradado simulado */
function ConnectionLine({ from, to, colorA, colorB, opacity = 0.18 }) {
  const points = useMemo(
    () => [
      new THREE.Vector3(from.x, from.y, from.z),
      new THREE.Vector3(to.x, to.y, to.z),
    ],
    [from, to]
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  // Color promedio de los dos nodos
  const blendedColor = useMemo(() => {
    const cA = new THREE.Color(colorA);
    const cB = new THREE.Color(colorB);
    return cA.lerp(cB, 0.5);
  }, [colorA, colorB]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={blendedColor}
        transparent
        opacity={opacity}
        linewidth={1}
        depthWrite={false}
      />
    </line>
  );
}

export default function ConnectionLines({ ideologies, activeIds = [] }) {
  // Construir un mapa id → ideología para lookups rápidos
  const ideologyMap = useMemo(() => {
    const map = {};
    ideologies.forEach((id) => { map[id.id] = id; });
    return map;
  }, [ideologies]);

  // Construir el conjunto de pares únicos a dibujar
  const pairs = useMemo(() => {
    const seen = new Set();
    const result = [];

    ideologies.forEach((ideol) => {
      ideol.connections?.forEach((targetId) => {
        const key = [ideol.id, targetId].sort().join('--');
        if (!seen.has(key) && ideologyMap[targetId]) {
          seen.add(key);
          result.push({ from: ideol, to: ideologyMap[targetId] });
        }
      });
    });

    return result;
  }, [ideologies, ideologyMap]);

  return (
    <group>
      {pairs.map(({ from, to }) => {
        // Si hay nodos activos/resaltados, resaltar sus conexiones
        const isActive =
          activeIds.length === 0 ||
          activeIds.includes(from.id) ||
          activeIds.includes(to.id);

        return (
          <ConnectionLine
            key={`${from.id}--${to.id}`}
            from={from.coords}
            to={to.coords}
            colorA={from.color}
            colorB={to.color}
            opacity={isActive ? 0.35 : 0.06}
          />
        );
      })}
    </group>
  );
}
