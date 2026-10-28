/**
 * IdeologyNode.jsx
 * Nodo esférico del cubo 3D. Variantes según `node.kind`:
 *   - ideology: corriente de referencia (etiqueta solo en hover o selección)
 *   - user:     tu resultado («Tú»), más grande y con pulso
 *   - compare:  punto de comparación (resultado compartido por otra persona)
 *   - live:     tu posición provisional mientras haces el test; se desliza
 *               suavemente hacia cada nueva posición
 *
 * Features:
 * - Esfera con material emissive coloreado (el bloom de la escena le da brillo)
 * - Anillo orbital animado y partículas de aura en hover/selección
 * - Etiquetas tipo billboard: siempre miran a la cámara
 * - Zona de interacción invisible más grande que la esfera (para el dedo)
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';

import { useStore } from '../../store';

/** Radio de la zona de interacción: mayor con dedo (pointer: coarse) que con ratón */
const HIT_RADIUS = window.matchMedia('(pointer: coarse)').matches ? 0.16 : 0.1;

const VARIANTS = {
  ideology: { radius: 0.055, emissive: 0.35, alwaysLabel: false, labelSize: 0.06 },
  user:     { radius: 0.085, emissive: 0.9,  alwaysLabel: true,  labelSize: 0.08 },
  compare:  { radius: 0.06,  emissive: 0.6,  alwaysLabel: true,  labelSize: 0.055 },
  live:     { radius: 0.075, emissive: 1.0,  alwaysLabel: true,  labelSize: 0.065 },
};

// Formas con caras planas: se sombrean por caras para que se lean bien siendo tan pequeñas
const FLAT_SHAPES = new Set(['box', 'octahedron', 'tetrahedron', 'icosahedron', 'cone']);

/**
 * Geometría del nodo según la forma de su familia, escalada para que todas
 * ocupen más o menos lo mismo que una esfera de radio `r`.
 */
function ShapeGeometry({ shape, r }) {
  switch (shape) {
    case 'box':         return <boxGeometry args={[r * 1.55, r * 1.55, r * 1.55]} />;
    case 'octahedron':  return <octahedronGeometry args={[r * 1.35]} />;
    case 'tetrahedron': return <tetrahedronGeometry args={[r * 1.55]} />;
    case 'icosahedron': return <icosahedronGeometry args={[r * 1.15]} />;
    case 'cylinder':    return <cylinderGeometry args={[r * 1.05, r * 1.05, r * 0.8, 20]} />;
    case 'capsule':     return <capsuleGeometry args={[r * 0.6, r * 1.1, 6, 14]} />;
    case 'cone':        return <coneGeometry args={[r * 1.0, r * 2.0, 16]} />;
    case 'torusKnot':   return <torusKnotGeometry args={[r * 0.75, r * 0.24, 64, 8]} />;
    default:            return <sphereGeometry args={[r, 20, 20]} />;
  }
}

/** Anillo orbital decorativo alrededor del nodo */
function OrbitRing({ radius, color, speed = 0.8, phase = 0, pulse = false }) {
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime() * speed + phase;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;
      ringRef.current.rotation.y = t;
      if (pulse) ringRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.15);
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

/** Partículas de aura alrededor del nodo (solo se montan cuando se ven) */
function AuraParticles({ color }) {
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
      mesh.material.opacity = 0.7 + Math.sin(t * 2 + i) * 0.3;
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
function DropLines({ coords, color }) {
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

export default function IdeologyNode({ node, isSelected, isDimmed, isHovered }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const setHover = useStore((s) => s.setHover);
  const clearHover = useStore((s) => s.clearHover);
  const select = useStore((s) => s.select);

  const { coords, color, kind } = node;
  const shape = node.shape || 'sphere';
  const variant = VARIANTS[kind] || VARIANTS.ideology;
  const interactive = kind !== 'live';
  const focused = isHovered || isSelected;

  // Tamaño base del nodo
  const baseScale = isDimmed ? 0.6 : 1;
  const targetScale = focused ? 1.5 * baseScale : baseScale;

  // El nodo provisional se desliza hacia su nueva posición; el resto se coloca directamente
  const targetPos = useRef(new THREE.Vector3());
  targetPos.current.set(coords.x, coords.y, coords.z);

  useFrame(({ clock }, delta) => {
    if (kind === 'live' && groupRef.current) {
      groupRef.current.position.lerp(targetPos.current, Math.min(1, delta * 2.5));
    }
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Animación de flotación suave (relativa al grupo padre)
    meshRef.current.position.y = Math.sin(t * 0.7 + coords.x * 5) * 0.015;

    // Escala suave con interpolación (el nodo provisional además late)
    const pulse = kind === 'live' ? 1 + Math.sin(t * 4) * 0.12 : 1;
    const currentScale = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale * pulse, 0.12));

    // Rotación lenta del nodo
    meshRef.current.rotation.y = t * 0.3;

    // Emissive intensity dinámica
    const emTarget = focused ? 1.1 : variant.emissive;
    const emCurrent = meshRef.current.material.emissiveIntensity;
    meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(emCurrent, emTarget, 0.1);

    // Opacidad en nodos dimmed
    const opTarget = isDimmed ? 0.25 : kind === 'live' ? 0.85 : 1;
    const opCurrent = meshRef.current.material.opacity;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(opCurrent, opTarget, 0.1);
  });

  const showLabel = variant.alwaysLabel || focused;
  const label = kind === 'user' ? 'Tú' : node.name;

  return (
    <group ref={groupRef} position={kind === 'live' ? undefined : [coords.x, coords.y, coords.z]}>
      {/* Zona de interacción invisible, más grande que la esfera para acertar con el dedo */}
      {interactive && (
        <mesh
          onPointerEnter={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            setHover(node.id, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY - 24 });
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'default';
            clearHover();
          }}
          // Clic o toque: abre la ficha del nodo en el panel
          onClick={(e) => {
            e.stopPropagation();
            select(node.id);
          }}
        >
          <sphereGeometry args={[Math.max(HIT_RADIUS, variant.radius * 1.6), 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      )}

      {/* Cuerpo principal: forma de su familia (inclinada para que se lea en 3D) */}
      <mesh ref={meshRef} rotation-x={shape === 'sphere' ? 0 : 0.45}>
        <ShapeGeometry shape={shape} r={variant.radius} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={variant.emissive}
          metalness={0.3}
          roughness={0.4}
          flatShading={FLAT_SHAPES.has(shape)}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Halo exterior */}
      <mesh>
        <sphereGeometry args={[variant.radius * 1.3, 16, 16]} />
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

      {/* Anillo orbital: solo al enfocar el nodo y siempre en el tuyo (que además late).
          Con 50 nodos, anillos fijos en todos eran ruido visual */}
      {!isDimmed && (focused || kind === 'user' || kind === 'live') && (
        <OrbitRing
          radius={variant.radius * 1.8}
          color={color}
          speed={0.6 + Math.abs(coords.x) * 0.4}
          phase={coords.z * 3}
          pulse={kind === 'user' || kind === 'live'}
        />
      )}

      {/* Partículas de aura */}
      {focused && <AuraParticles color={color} />}

      {/* Líneas guía (Drop-lines) hacia los planos cartesianos */}
      {(focused || kind === 'user') && kind !== 'live' && <DropLines coords={coords} color={color} />}

      {/* Etiqueta flotante: siempre de cara a la cámara */}
      {showLabel && (
        <Billboard position={[0, variant.radius + 0.09, 0]}>
          <Text
            fontSize={variant.labelSize}
            color={kind === 'compare' ? '#e8edf8' : color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.006}
            outlineColor="#050810"
            maxWidth={0.9}
            textAlign="center"
            fillOpacity={isDimmed ? 0.4 : 1}
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
