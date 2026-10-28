/**
 * SceneController.jsx
 * Componente que vive DENTRO del Canvas de React Three Fiber.
 * Su único propósito es acceder a `camera` y `gl` (renderer)
 * para proyectar posiciones 3D a coordenadas de pantalla 2D,
 * y delegar ese dato al callback `onNodeHover` del padre.
 *
 * Además, mientras hay un nodo en hover, reposiciona el tooltip en cada
 * frame (vía ref, sin re-renderizar React) para que siga al nodo aunque
 * la cámara esté rotando.
 *
 * Esto es necesario porque `useThree()` solo puede usarse
 * en componentes hijos del <Canvas>.
 */
import { useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import PoliticalCube from './PoliticalCube';

// Ajuste vertical para que el tooltip quede encima del nodo
const TOOLTIP_OFFSET_Y = 24;

const tmpVec = new THREE.Vector3();

/**
 * Proyecta un punto del espacio 3D a coordenadas CSS de pantalla.
 * @param {THREE.Camera} camera
 * @param {THREE.WebGLRenderer} gl
 * @param {THREE.Vector3} worldPos
 * @returns {{ x: number, y: number }}
 */
function projectToScreen(camera, gl, worldPos) {
  const vec = tmpVec.copy(worldPos).project(camera);
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
  search,
  onNodeHover,
  onNodeLeave,
  hoveredId,
  tooltipRef,
}) {
  const { camera, gl } = useThree();

  const hoveredNode = useMemo(
    () => (hoveredId ? ideologies.find((id) => id.id === hoveredId) : null),
    [ideologies, hoveredId]
  );
  const hoveredPos = useMemo(
    () => hoveredNode && new THREE.Vector3(hoveredNode.coords.x, hoveredNode.coords.y, hoveredNode.coords.z),
    [hoveredNode]
  );

  useFrame(() => {
    const el = tooltipRef?.current;
    if (!el || !hoveredPos) return;
    const { x, y } = projectToScreen(camera, gl, hoveredPos);
    el.style.left = `${x}px`;
    el.style.top = `${y - TOOLTIP_OFFSET_Y}px`;
  });

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
      onNodeHover(ideology, { x: screenPos.x, y: screenPos.y - TOOLTIP_OFFSET_Y });
    },
    [camera, gl, onNodeHover]
  );

  return (
    <PoliticalCube
      ideologies={ideologies}
      activeIds={activeIds}
      zThreshold={zThreshold}
      search={search}
      onNodeHover={handleHover}
      onNodeLeave={onNodeLeave}
      hoveredId={hoveredId}
    />
  );
}
