/**
 * ConnectionLines.jsx
 * Dibuja líneas de influencia entre nodos ideológicos conectados.
 * Cada línea tiene opacidad tenue y un color interpolado entre los dos nodos.
 * Con un nodo seleccionado, se resaltan sus conexiones y se apagan las demás.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/** Línea entre dos puntos 3D con degradado simulado */
function ConnectionLine({ from, to, colorA, colorB, opacity }) {
  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(to.x, to.y, to.z),
      ]),
    [from, to]
  );

  // Liberar la geometría anterior al cambiar o desmontar
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Color promedio de los dos nodos
  const blendedColor = useMemo(() => new THREE.Color(colorA).lerp(new THREE.Color(colorB), 0.5), [colorA, colorB]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={blendedColor} transparent opacity={opacity} depthWrite={false} />
    </line>
  );
}

export default function ConnectionLines({ nodes, selectedId, dimmedIds }) {
  // Pares únicos a dibujar (cada enlace basta con declararlo en un extremo)
  const pairs = useMemo(() => {
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const seen = new Set();
    const result = [];
    for (const node of nodes) {
      for (const targetId of node.connections || []) {
        const key = [node.id, targetId].sort().join('--');
        if (!seen.has(key) && byId[targetId]) {
          seen.add(key);
          result.push({ key, from: node, to: byId[targetId] });
        }
      }
    }
    return result;
  }, [nodes]);

  return (
    <group>
      {pairs.map(({ key, from, to }) => {
        let opacity;
        if (selectedId) {
          opacity = from.id === selectedId || to.id === selectedId ? 0.6 : 0.04;
        } else {
          opacity = dimmedIds.has(from.id) || dimmedIds.has(to.id) ? 0.04 : 0.16;
        }
        return (
          <ConnectionLine
            key={key}
            from={from.coords}
            to={to.coords}
            colorA={from.color}
            colorB={to.color}
            opacity={opacity}
          />
        );
      })}
    </group>
  );
}
