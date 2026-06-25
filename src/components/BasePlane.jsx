/**
 * BasePlane.jsx
 * Plano base del cubo con los 4 cuadrantes del plano político clásico.
 *
 * Cuadrantes (vistos desde arriba):
 *   Rojo    (Autoritario-Izquierda)  → -X, +Z respecto al suelo
 *   Azul    (Autoritario-Derecha)    → +X, +Z
 *   Verde   (Libertario-Izquierda)   → -X, -Z
 *   Amarillo(Libertario-Derecha)     → +X, -Z
 *
 * IMPORTANTE: El eje Y del cubo es vertical, por lo que el plano base
 * se ubica en Y=-1 y se divide en 4 porciones en el plano XZ.
 */
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

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#2a3a60" transparent opacity={0.25} />
    </lineSegments>
  );
}

export default function BasePlane() {
  return (
    <group>
      {/* Rojo: Autoritario-Izquierda (X<0, Z>0 en plano XZ) */}
      <Quadrant position={[-0.5, -1, 0.5]} color="#dc2626" />

      {/* Azul: Autoritario-Derecha (X>0, Z>0) */}
      <Quadrant position={[0.5, -1, 0.5]} color="#2563eb" />

      {/* Verde: Libertario-Izquierda (X<0, Z<0) */}
      <Quadrant position={[-0.5, -1, -0.5]} color="#16a34a" />

      {/* Amarillo: Libertario-Derecha (X>0, Z<0) */}
      <Quadrant position={[0.5, -1, -0.5]} color="#ca8a04" />

      {/* Cuadrícula de referencia */}
      <GridLines />

      {/* Línea central X */}
      <line>
        <bufferGeometry
          setFromPoints={[
            new THREE.Vector3(-1, -1, 0),
            new THREE.Vector3(1, -1, 0),
          ]}
        />
        <lineBasicMaterial color="#4f8ef7" transparent opacity={0.5} />
      </line>

      {/* Línea central Z */}
      <line>
        <bufferGeometry
          setFromPoints={[
            new THREE.Vector3(0, -1, -1),
            new THREE.Vector3(0, -1, 1),
          ]}
        />
        <lineBasicMaterial color="#4f8ef7" transparent opacity={0.5} />
      </line>
    </group>
  );
}
