/**
 * BasePlane.jsx
 * Plano base del cubo (suelo en Y=-1).
 *
 * El suelo es el plano X–Z: eje Económico × eje de Pluralidad.
 * (No es la brújula política clásica, que sería X–Y.)
 *
 * Cuadrantes (vistos desde arriba):
 *   Violeta (Izquierda-Pluralista) → -X, +Z
 *   Índigo  (Derecha-Pluralista)   → +X, +Z
 *   Pizarra (Izquierda-Monista)    → -X, -Z
 *   Pizarra oscuro (Derecha-Monista) → +X, -Z
 *
 * La mitad pluralista usa los tonos del eje Z; la mitad monista, tonos neutros.
 */
import { memo, useMemo } from 'react';
import * as THREE from 'three';

/** Crea un PlaneGeometry de 1x1 desplazado a un cuadrante */
function Quadrant({ position, color }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.18}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Cuadrícula de referencia sutil en el plano base */
function GridLines() {
  const geometry = useMemo(() => {
    const points = [];

    // Líneas paralelas al eje X
    for (let z = -1; z <= 1; z += 0.25) {
      points.push(new THREE.Vector3(-1, -1, z));
      points.push(new THREE.Vector3(1, -1, z));
    }
    // Líneas paralelas al eje Z
    for (let x = -1; x <= 1; x += 0.25) {
      points.push(new THREE.Vector3(x, -1, -1));
      points.push(new THREE.Vector3(x, -1, 1));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#2a3a60" transparent opacity={0.25} />
    </lineSegments>
  );
}

/** Líneas centrales X y Z del suelo */
function CenterLines() {
  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, -1, -1),
        new THREE.Vector3(0, -1, 1),
      ]),
    []
  );

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#4f8ef7" transparent opacity={0.5} />
    </lineSegments>
  );
}

function BasePlane() {
  return (
    <group>
      {/* Violeta: Izquierda-Pluralista (X<0, Z>0) */}
      <Quadrant position={[-0.5, -1, 0.5]} color="#8b5cf6" />

      {/* Índigo: Derecha-Pluralista (X>0, Z>0) */}
      <Quadrant position={[0.5, -1, 0.5]} color="#6366f1" />

      {/* Pizarra: Izquierda-Monista (X<0, Z<0) */}
      <Quadrant position={[-0.5, -1, -0.5]} color="#64748b" />

      {/* Pizarra oscuro: Derecha-Monista (X>0, Z<0) */}
      <Quadrant position={[0.5, -1, -0.5]} color="#475569" />

      {/* Cuadrícula de referencia */}
      <GridLines />

      {/* Líneas centrales X y Z */}
      <CenterLines />
    </group>
  );
}

// Sin props: no necesita re-renderizarse cuando cambia el estado de la app
export default memo(BasePlane);
