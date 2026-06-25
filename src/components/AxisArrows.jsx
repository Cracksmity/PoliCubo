/**
 * AxisArrows.jsx
 * Dibuja los tres ejes de PoliCubo con flechas y etiquetas Billboard.
 *
 * Eje X (Rojo)    : Izquierda ←→ Derecha (Económico)
 * Eje Y (Cian)    : Libertario ←→ Autoritario (Social/Político)
 * Eje Z (Violeta) : Monismo ←→ Pluralismo (Pluralidad)
 *
 * Las etiquetas usan <Html> de @react-three/drei para mantenerse
 * siempre de cara a la cámara (Billboard effect).
 */
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/** Cabeza de flecha como cono pequeño */
function ArrowHead({ position, rotation, color }) {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[0.04, 0.12, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

/** Línea del eje */
function AxisLine({ start, end, color }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.8} linewidth={2} />
    </line>
  );
}

/** Etiqueta de extremo de eje */
function AxisLabel({ position, text, color, align = 'center' }) {
  return (
    <Html
      position={position}
      center
      zIndexRange={[10, 0]}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          background: 'rgba(5, 8, 16, 0.85)',
          border: `1px solid ${color}44`,
          borderRadius: '6px',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 600,
          color: color,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '0.03em',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}33`,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </Html>
  );
}

/** Etiqueta central del eje (nombre del eje) */
function AxisCenterLabel({ position, text, color }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <div
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: color,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.6,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </Html>
  );
}

export default function AxisArrows() {
  const AXIS_LENGTH = 1.0; // radio desde el centro al borde del cubo
  const LABEL_OFFSET = 1.22; // offset para etiquetas de extremos

  return (
    <group>
      {/* ── EJE X: Económico (Izquierda ↔ Derecha) ── */}
      {/* Línea completa */}
      <AxisLine start={[-AXIS_LENGTH, 0, 0]} end={[AXIS_LENGTH, 0, 0]} color="#f43f5e" />

      {/* Flechas */}
      <ArrowHead
        position={[AXIS_LENGTH + 0.06, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        color="#f43f5e"
      />
      <ArrowHead
        position={[-AXIS_LENGTH - 0.06, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="#f43f5e"
      />

      {/* Etiquetas extremos X */}
      <AxisLabel position={[LABEL_OFFSET, 0, 0]} text="Derecha →" color="#f43f5e" />
      <AxisLabel position={[-LABEL_OFFSET, 0, 0]} text="← Izquierda" color="#f43f5e" />
      <AxisCenterLabel position={[0, 0.08, 0]} text="Económico" color="#f43f5e" />

      {/* ── EJE Y: Social (Libertario ↔ Autoritario) ── */}
      <AxisLine start={[0, -AXIS_LENGTH, 0]} end={[0, AXIS_LENGTH, 0]} color="#22d3ee" />

      <ArrowHead position={[0, AXIS_LENGTH + 0.06, 0]} rotation={[0, 0, 0]} color="#22d3ee" />
      <ArrowHead
        position={[0, -AXIS_LENGTH - 0.06, 0]}
        rotation={[0, 0, Math.PI]}
        color="#22d3ee"
      />

      <AxisLabel position={[0, LABEL_OFFSET, 0]} text="↑ Autoritario" color="#22d3ee" />
      <AxisLabel position={[0, -LABEL_OFFSET, 0]} text="↓ Libertario" color="#22d3ee" />
      <AxisCenterLabel position={[0.08, 0, 0]} text="Social/Político" color="#22d3ee" />

      {/* ── EJE Z: Pluralidad (Monismo ↔ Pluralismo) ── */}
      <AxisLine start={[0, 0, -AXIS_LENGTH]} end={[0, 0, AXIS_LENGTH]} color="#a78bfa" />

      <ArrowHead
        position={[0, 0, AXIS_LENGTH + 0.06]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#a78bfa"
      />
      <ArrowHead
        position={[0, 0, -AXIS_LENGTH - 0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#a78bfa"
      />

      <AxisLabel position={[0, 0, LABEL_OFFSET]} text="Pluralismo / Inclusión →" color="#a78bfa" />
      <AxisLabel position={[0, 0, -LABEL_OFFSET]} text="← Monismo / Exclusión" color="#a78bfa" />
      <AxisCenterLabel position={[0.08, 0, 0.5]} text="Pluralidad" color="#a78bfa" />

      {/* Punto central – origen */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
