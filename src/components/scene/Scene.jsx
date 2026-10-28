/**
 * Scene.jsx
 * Canvas 3D de PoliCubo. Se carga en diferido (React.lazy) para que la
 * interfaz aparezca antes de descargar Three.js.
 *
 * - PerformanceMonitor baja la resolución y apaga el bloom si va lento.
 * - preserveDrawingBuffer permite capturar el cubo para la tarjeta de compartir.
 */
import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

import PoliticalCube from './PoliticalCube';
import CameraRig from './CameraRig';
import { useStore } from '../../store';
import { useSceneNodes } from '../../lib/nodes';
import { tooltipElRef } from '../../lib/refs';

// Ajuste vertical para que el tooltip quede encima del nodo
const TOOLTIP_OFFSET_Y = 24;
const tmpVec = new THREE.Vector3();

/** Mueve el tooltip del nodo en hover en cada frame, para que lo siga mientras rota */
function TooltipTracker({ nodes }) {
  const hoveredId = useStore((s) => s.hoveredId);
  const { camera, size } = useThree();

  const target = useMemo(() => {
    const node = hoveredId && nodes.find((n) => n.id === hoveredId);
    return node ? new THREE.Vector3(node.coords.x, node.coords.y, node.coords.z) : null;
  }, [hoveredId, nodes]);

  useFrame(() => {
    const el = tooltipElRef.current;
    if (!el || !target) return;
    tmpVec.copy(target).project(camera);
    el.style.left = `${Math.round((tmpVec.x * 0.5 + 0.5) * size.width)}px`;
    el.style.top = `${Math.round((-tmpVec.y * 0.5 + 0.5) * size.height) - TOOLTIP_OFFSET_Y}px`;
  });

  return null;
}

export default function Scene() {
  const nodes = useSceneNodes();
  const [highQuality, setHighQuality] = useState(true);
  const lastMissRef = useRef(0);

  const handlePointerMissed = () => {
    const state = useStore.getState();
    state.clearHover();
    if (state.selectedId) state.clearSelection();
    else if (state.isMobile && state.panelOpen) state.setPanelOpen(false);

    // Doble clic / doble toque en el fondo: centrar vista
    const now = Date.now();
    if (now - lastMissRef.current < 300) {
      state.resetCamera();
      lastMissRef.current = 0;
    } else {
      lastMissRef.current = now;
    }
  };

  return (
    <Canvas
      camera={{ position: [2.8, 1.8, 2.8], fov: 50, near: 0.1, far: 60 }}
      dpr={highQuality ? [1, 2] : 1}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      }}
      style={{ background: 'radial-gradient(ellipse at center, #0d1428 0%, #050810 70%)' }}
      onPointerMissed={handlePointerMissed}
    >
      <color attach="background" args={['#050810']} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setHighQuality(false)}
        onIncline={() => setHighQuality(true)}
        onFallback={() => setHighQuality(false)}
      >
        <PoliticalCube nodes={nodes} />
        <CameraRig nodes={nodes} />
        <TooltipTracker nodes={nodes} />
        {highQuality && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.2} luminanceSmoothing={0.35} />
          </EffectComposer>
        )}
      </PerformanceMonitor>
    </Canvas>
  );
}
