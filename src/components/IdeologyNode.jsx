/**
 * IdeologyNode.jsx
 * Nodo esférico que representa una corriente ideológica dentro del cubo 3D.
 *
 * Features:
 * - Esfera con material emissive coloreado
 * - Anillo orbital animado alrededor del nodo
 * - Glow al hacer hover (escala + emissiveIntensity)
 * - Callback onHover para mostrar tooltip desde el padre
 * - Filtrado por umbral del eje Z (pluralidad)
 */
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

/** Anillo orbital decorativo alrededor del nodo */
function OrbitRing({ radius, color, speed = 0.8, phase = 0 }) {
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime() * speed + phase;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;
      ringRef.current.rotation.y = t;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.006, 8, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

/** Partículas de aura alrededor del nodo (solo cuando hover) */
function AuraParticles({ color, visible }) {
  const COUNT = 8;
  const refs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / COUNT) * Math.PI * 2 + t * 0.6;
      const r = 0.18 + Math.sin(t * 1.5 + i) * 0.04;
      mesh.position.set(
        Math.cos(angle) * r,
        Math.sin(t * 0.8 + i * 0.8) * 0.08,
        Math.sin(angle) * r
      );
      mesh.material.opacity = visible ? 0.7 + Math.sin(t * 2 + i) * 0.3 : 0;
    });
  });

  return (
    <>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}

/** Líneas guía (Drop-lines) hacia los planos cartesianos */
function DropLines({ coords, color, visible }) {
  if (!visible) return null;

  const lineProps = {
    color: color,
    lineWidth: 1.5,
    transparent: true,
    opacity: 0.4,
    dashed: true,
    dashScale: 1,
    dashSize: 0.05,
    gapSize: 0.05,
    depthWrite: false,
  };

  return (
    <group>
      {/* Línea Eje X: Hacia el plano YZ (X=0) */}
      <Line points={[[0, 0, 0], [-coords.x, 0, 0]]} {...lineProps} />
      {/* Línea Eje Y: Hacia el plano XZ (Y=0) (suelo) */}
      <Line points={[[0, 0, 0], [0, -coords.y, 0]]} {...lineProps} />
      {/* Línea Eje Z: Hacia el plano XY (Z=0) (fondo) */}
      <Line points={[[0, 0, 0], [0, 0, -coords.z]]} {...lineProps} />
    </group>
  );
}

export default function IdeologyNode({
  ideology,
  onHover,
  onLeave,
  isHighlighted,
  isDimmed,
  isActive,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { coords, color, name } = ideology;

  // Tamaño base del nodo
  const baseScale = isDimmed ? 0.6 : 1;
  const targetScale = (hovered || isHighlighted || isActive) ? 1.5 * baseScale : baseScale;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Animación de flotación suave (relativa al grupo padre)
    const floatY = Math.sin(t * 0.7 + coords.x * 5) * 0.015;
    meshRef.current.position.y = floatY;

    // Escala suave con interpolación
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
    meshRef.current.scale.setScalar(newScale);

    // Rotación lenta del nodo
    meshRef.current.rotation.y = t * 0.3;

    // Emissive intensity dinámica
    const emTarget = (hovered || isHighlighted || isActive) ? 0.9 : 0.35;
    const emCurrent = meshRef.current.material.emissiveIntensity;
    meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(emCurrent, emTarget, 0.1);

    // Opacidad en nodos dimmed
    const opTarget = isDimmed ? 0.25 : 1;
    const opCurrent = meshRef.current.material.opacity;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(opCurrent, opTarget, 0.1);
  });

  const showLabel = hovered || isHighlighted || isActive;

  return (
    <group position={[coords.x, coords.y, coords.z]}>
      {/* Esfera principal */}
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover && onHover(ideology, e);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
          onLeave && onLeave();
        }}
      >
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Halo exterior */}
      <mesh>
        <sphereGeometry args={[0.072, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={isDimmed ? 0.05 : 0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Anillo orbital */}
      {!isDimmed && (
        <OrbitRing
          radius={0.1}
          color={color}
          speed={0.6 + Math.abs(coords.x) * 0.4}
          phase={coords.z * 3}
        />
      )}

      {/* Partículas de aura */}
      <AuraParticles color={color} visible={hovered || isActive} />

      {/* Líneas guía (Drop-lines) hacia los planos cartesianos */}
      <DropLines coords={coords} color={color} visible={hovered || isActive} />

      {/* Etiqueta flotante en hover */}
      {showLabel && (
        <Text
          position={[0, 0.14, 0]}
          fontSize={0.06}
          color={color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.006}
          outlineColor="#050810"
          maxWidth={0.8}
          textAlign="center"
        >
          {name}
        </Text>
      )}
    </group>
  );
}
