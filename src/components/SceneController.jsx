/**
 * SceneController.jsx
 * Componente que vive DENTRO del Canvas de React Three Fiber.
 * Su único propósito es acceder a `camera` y `gl` (renderer)
 * para proyectar posiciones 3D a coordenadas de pantalla 2D,
 * y delegar ese dato al callback `onNodeHover` del padre.
 *
 * Esto es necesario porque `useThree()` solo puede usarse
 * en componentes hijos del <Canvas>.
 */
import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import PoliticalCube from './PoliticalCube';

/**
 * Proyecta un punto del espacio 3D a coordenadas CSS de pantalla.
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} gl
 * @param {THREE.Vector3} worldPos
 * @returns {{ x: number, y: number }}
 */
function projectToScreen(camera, gl, worldPos) {
  const vec = worldPos.clone().project(camera);
  const canvas = gl.domElement;
  return {
    x: Math.round((vec.x * 0.5 + 0.5) * canvas.clientWidth),
    y: Math.round((-vec.y * 0.5 + 0.5) * canvas.clientHeight),
  };
}

export default function SceneController({
  ideologies,
  activeIds,
  zThreshold,
  onNodeHover,
  onNodeLeave,
  hoveredId,
}) {
  const { camera, gl } = useThree();

  /**
   * Recibe la corriente y el evento de Three.js,
   * calcula la posición en pantalla y llama al callback del padre.
   */
  const handleHover = useCallback(
    (ideology, _threeEvent) => {
      const worldPos = new THREE.Vector3(
        ideology.coords.x,
        ideology.coords.y,
        ideology.coords.z
      );
      const screenPos = projectToScreen(camera, gl, worldPos);
      // Ajuste vertical para que el tooltip quede encima del nodo
      onNodeHover(ideology, { x: screenPos.x, y: screenPos.y - 24 });
    },
    [camera, gl, onNodeHover]
  );

  return (
    <PoliticalCube
      ideologies={ideologies}
      activeIds={activeIds}
      zThreshold={zThreshold}
      onNodeHover={handleHover}
      onNodeLeave={onNodeLeave}
      hoveredId={hoveredId}
    />
  );
}
