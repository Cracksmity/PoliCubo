/**
 * AmbientParticles.jsx
 * Partículas flotantes de fondo para dar profundidad y ambiente al espacio 3D.
 * Usa instanced rendering para eficiencia.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 80;

export default function AmbientParticles() {
  const mesh = useRef();

  // Posiciones y velocidades aleatorias iniciales
  const { positions, speeds, phases } = useMemo(() => {
    const positions = [];
    const speeds = [];
    const phases = [];

    for (let i = 0; i < COUNT; i++) {
      positions.push(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4
      );
      speeds.push(0.2 + Math.random() * 0.4);
      phases.push(Math.random() * Math.PI * 2);
    }

    return { positions, speeds, phases };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const s = speeds[i];
      const p = phases[i];

      dummy.position.set(
        positions[ix] + Math.sin(t * s * 0.5 + p) * 0.05,
        positions[ix + 1] + Math.cos(t * s * 0.7 + p) * 0.08,
        positions[ix + 2] + Math.sin(t * s * 0.3 + p + 1) * 0.05
      );

      const scale = 0.5 + Math.sin(t * s + p) * 0.3;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      mesh.current.setMatrixAt(i, dummy.matrix);
    }

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, COUNT]}>
      <sphereGeometry args={[0.007, 4, 4]} />
      <meshStandardMaterial
        color="#4f8ef7"
        emissive="#4f8ef7"
        emissiveIntensity={0.8}
        transparent
        opacity={0.25}
      />
    </instancedMesh>
  );
}
