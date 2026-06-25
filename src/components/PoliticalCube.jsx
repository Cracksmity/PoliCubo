/**
 * PoliticalCube.jsx
 * Escena 3D principal de PoliCubo.
 * Ensambla todos los sub-componentes 3D dentro del Canvas de React Three Fiber.
 *
 * Props:
 *   - ideologies: array de corrientes ideológicas
 *   - activeIds: array de IDs resaltados desde el FilterPanel
 *   - zThreshold: umbral mínimo del eje Z (Pluralidad)
 *   - onNodeHover: callback cuando el cursor entra a un nodo
 *   - onNodeLeave: callback cuando el cursor sale de un nodo
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

import CubeWireframe   from './CubeWireframe';
import BasePlane       from './BasePlane';
import AxisArrows      from './AxisArrows';
import IdeologyNode    from './IdeologyNode';
import ConnectionLines from './ConnectionLines';
import AmbientParticles from './AmbientParticles';

/** Rotación lenta auto cuando no hay interacción */
function AutoRotate({ enabled }) {
  const { scene } = useThree();
  const groupRef = useRef();

  // Referencia al grupo principal de la escena (via context)
  useFrame(({ clock }) => {
    // La rotación automática la maneja OrbitControls con autoRotate
  });

  return null;
}

/** Proyecta un punto 3D del mundo a coordenadas de pantalla 2D */
export function projectToScreen(camera, renderer, worldPos) {
  const vec = worldPos.clone().project(camera);
  const canvas = renderer.domElement;
  return {
    x: (vec.x * 0.5 + 0.5) * canvas.clientWidth,
    y: (-vec.y * 0.5 + 0.5) * canvas.clientHeight,
  };
}

export default function PoliticalCube({
  ideologies,
  activeIds,
  zThreshold,
  onNodeHover,
  onNodeLeave,
  hoveredId,
}) {
  const controlsRef = useRef();
  const { camera } = useThree();

  const [animatingToNode, setAnimatingToNode] = useState(false);
  const [nodeTargetPos, setNodeTargetPos] = useState(null);
  const prevTargetId = useRef(null);

  // Posición inicial de cámara para reset
  const INITIAL_CAM_POS = new THREE.Vector3(2.8, 1.8, 2.8);

  const userNode = ideologies.find(id => id.id === 'user-node');
  
  // Determinar a qué nodo apuntar (último seleccionado o el nodo del usuario)
  const targetNodeId = activeIds.length > 0 ? activeIds[activeIds.length - 1] : (userNode ? userNode.id : null);
  const targetNode = targetNodeId ? ideologies.find(id => id.id === targetNodeId) : null;

  useEffect(() => {
    if (targetNode) {
      if (prevTargetId.current !== targetNode.id) {
        setAnimatingToNode(true);
        setNodeTargetPos(new THREE.Vector3(targetNode.coords.x, targetNode.coords.y, targetNode.coords.z));
        if (controlsRef.current) {
          controlsRef.current.autoRotate = false;
        }
        prevTargetId.current = targetNode.id;
      }
    } else {
      prevTargetId.current = null;
    }
  }, [targetNode]);

  useFrame((state, delta) => {
    if (animatingToNode && nodeTargetPos && controlsRef.current) {
      const pos = nodeTargetPos.clone();
      // Prevención de vectores en cero que causan NaN
      if (pos.lengthSq() === 0) pos.set(0.01, 0, 0);

      const dir = pos.clone().normalize();
      // Ubicar la cámara manteniendo una distancia superior al minDistance (2.0) de OrbitControls
      const targetCamPos = pos.clone().add(dir.multiplyScalar(2.5));
      
      state.camera.position.lerp(targetCamPos, delta * 2.5);
      controlsRef.current.target.lerp(nodeTargetPos, delta * 2.5);
      controlsRef.current.update();

      // Relajar el umbral para asegurar que la animación se detenga
      if (state.camera.position.distanceTo(targetCamPos) < 0.1) {
        setAnimatingToNode(false);
      }
    }
  });

  // Guardar estado inicial de OrbitControls cuando esté listo
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.saveState();
    }
  }, []);

  /** Resetea la cámara a posición inicial — llamado desde doble clic o botón */
  const handleReset = useCallback(() => {
    if (!controlsRef.current) return;
    camera.position.set(2.8, 1.8, 2.8);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    controlsRef.current.autoRotate = true;
  }, [camera]);

  // Escuchar evento global de reset (disparado por botón HTML fuera del Canvas)
  useEffect(() => {
    window.addEventListener('resetCamera', handleReset);
    return () => window.removeEventListener('resetCamera', handleReset);
  }, [handleReset]);

  /** Determina si un nodo es "dimmed" según filtros activos */
  const isNodeDimmed = useCallback(
    (ideology) => {
      const failsZ = ideology.coords.z < zThreshold;
      const failsActive = activeIds.length > 0 && !activeIds.includes(ideology.id);
      return failsZ || failsActive;
    },
    [zThreshold, activeIds]
  );

  const isNodeHighlighted = useCallback(
    (ideology) => activeIds.includes(ideology.id),
    [activeIds]
  );

  return (
    <>
      {/* ── Luces ── */}
      <ambientLight intensity={0.3} color="#1a2744" />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.8}
        color="#4f8ef7"
        castShadow={false}
      />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[3, 2, -3]} intensity={0.4} color="#22d3ee" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />

      {/* ── Estrellas de fondo ── */}
      <Stars
        radius={8}
        depth={4}
        count={800}
        factor={1}
        saturation={0.5}
        fade
        speed={0.3}
      />

      {/* ── Escena principal ── */}
      <group>
        {/* Plano base con cuadrantes de colores */}
        <BasePlane />

        {/* Estructura de alambre del cubo */}
        <CubeWireframe />

        {/* Ejes con flechas y etiquetas */}
        <AxisArrows />

        {/* Partículas ambientales */}
        <AmbientParticles />

        {/* Líneas de conexión entre nodos */}
        <ConnectionLines
          ideologies={ideologies}
          activeIds={activeIds}
        />

        {/* Nodos ideológicos */}
        {ideologies.map((ideology) => (
          <IdeologyNode
            key={ideology.id}
            ideology={ideology}
            onHover={onNodeHover}
            onLeave={onNodeLeave}
            isHighlighted={isNodeHighlighted(ideology)}
            isDimmed={isNodeDimmed(ideology)}
            isActive={hoveredId === ideology.id}
          />
        ))}

        {/* Vector brillante directo al usuario */}
        {userNode && (
          <Line
            points={[[0, 0, 0], [userNode.coords.x, userNode.coords.y, userNode.coords.z]]}
            color="#22d3ee"
            lineWidth={3}
            transparent
            opacity={0.8}
            dashed={false}
          />
        )}
      </group>

      {/* ── Controles de cámara ── */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2.0}
        maxDistance={5.5}
        autoRotate={true}
        autoRotateSpeed={0.4}
        // ── Límites verticales ESTRICTOS: evitan mirar al vacío ──
        // Rango: entre 30° y 120° desde el polo norte (zona "cómoda")
        minPolarAngle={Math.PI * 0.18}   // ~32° — nunca mirar desde arriba completamente
        maxPolarAngle={Math.PI * 0.72}   // ~130° — nunca voltear la vista al revés
        // Paneo más lento para no sacar el cubo de la vista
        panSpeed={0.4}
        // Detener autorotación o animación al interactuar, reanudar autorotación 3s después
        onStart={() => {
          setAnimatingToNode(false);
          if (controlsRef.current) controlsRef.current.autoRotate = false;
        }}
        onEnd={() => {
          setTimeout(() => {
            if (controlsRef.current) controlsRef.current.autoRotate = true;
          }, 3000);
        }}
        dampingFactor={0.06}
        enableDamping={true}
        target={[0, 0, 0]}
      />
    </>
  );
}
