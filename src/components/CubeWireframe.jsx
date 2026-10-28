/**
 * CubeWireframe.jsx
 * Dibuja la estructura de alambre de PoliCubo con efecto glow sutil.
 * El cubo tiene dimensiones de 2x2x2 (de -1 a +1 en cada eje).
 */
import { memo, useMemo } from 'react';
import * as THREE from 'three';

function CubeWireframe() {
  // Geometrías creadas una sola vez (antes se recreaban en cada render sin liberarse)
  const outerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), []);
  const innerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.004, 2.004, 2.004)), []);

  return (
    <group>
      {/* Cubo wireframe principal */}
      <lineSegments geometry={outerEdges}>
        <lineBasicMaterial
          color="#4f8ef7"
          transparent
          opacity={0.35}
          linewidth={1}
        />
      </lineSegments>

      {/* Cubo interior más suave para dar profundidad */}
      <lineSegments geometry={innerEdges}>
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

// Sin props: no necesita re-renderizarse cuando cambia el estado de la app
export default memo(CubeWireframe);
