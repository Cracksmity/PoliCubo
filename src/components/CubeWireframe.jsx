/**
 * CubeWireframe.jsx
 * Dibuja la estructura de alambre de PoliCubo con efecto glow sutil.
 * El cubo tiene dimensiones de 2x2x2 (de -1 a +1 en cada eje).
 */
import { useRef } from 'react';
import * as THREE from 'three';

export default function CubeWireframe() {
  const edges = useRef();

  return (
    <group>
      {/* Cubo wireframe principal */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial
          color="#4f8ef7"
          transparent
          opacity={0.35}
          linewidth={1}
        />
      </lineSegments>

      {/* Cubo interior más suave para dar profundidad */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.004, 2.004, 2.004)]} />
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.12}
          linewidth={1}
        />
      </lineSegments>

      {/* Caras translúcidas del cubo */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#1a2744"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
