/**
 * PoliticalCube.jsx
 * Contenido 3D principal de PoliCubo: luces, cubo, ejes, conexiones y nodos.
 * La cámara vive en CameraRig.
 *
 * Props:
 *   - nodes: corrientes de referencia + nodos personales (ver lib/nodes.js)
 */
import { useMemo } from 'react';
import { Stars, Line } from '@react-three/drei';

import CubeWireframe    from './CubeWireframe';
import BasePlane        from './BasePlane';
import AxisArrows       from './AxisArrows';
import IdeologyNode     from './IdeologyNode';
import ConnectionLines  from './ConnectionLines';
import AmbientParticles from './AmbientParticles';
import { useStore } from '../../store';
import { passesFilters, useFilters, USER_NODE_ID } from '../../lib/nodes';

export default function PoliticalCube({ nodes }) {
  const selectedId = useStore((s) => s.selectedId);
  const hoveredId = useStore((s) => s.hoveredId);
  const filters = useFilters();

  // Vecinos del nodo seleccionado (conexiones en cualquier sentido): no se atenúan
  const neighborIds = useMemo(() => {
    const ids = new Set();
    if (!selectedId) return ids;
    for (const n of nodes) {
      if (n.id === selectedId) n.connections?.forEach((c) => ids.add(c));
      if (n.connections?.includes(selectedId)) ids.add(n.id);
    }
    return ids;
  }, [nodes, selectedId]);

  /** Nodos atenuados: no pasan los filtros, o hay otro nodo seleccionado y no son vecinos */
  const dimmedIds = useMemo(() => {
    const ids = new Set();
    for (const n of nodes) {
      const filtered = !passesFilters(n, filters);
      const outOfFocus = selectedId && n.kind === 'ideology' && n.id !== selectedId && !neighborIds.has(n.id);
      if (filtered || outOfFocus) ids.add(n.id);
    }
    return ids;
  }, [nodes, filters, selectedId, neighborIds]);

  const userNode = nodes.find((n) => n.id === USER_NODE_ID);

  return (
    <>
      {/* ── Luces ── */}
      <ambientLight intensity={0.3} color="#1a2744" />
      <directionalLight position={[3, 4, 2]} intensity={0.8} color="#4f8ef7" />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[3, 2, -3]} intensity={0.4} color="#22d3ee" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />

      {/* ── Estrellas de fondo ── */}
      <Stars radius={10} depth={6} count={800} factor={1} saturation={0.5} fade speed={0.3} />

      {/* ── Escena principal ── */}
      <group>
        <BasePlane />
        <CubeWireframe />
        <AxisArrows />
        <AmbientParticles />

        <ConnectionLines nodes={nodes} selectedId={selectedId} dimmedIds={dimmedIds} />

        {nodes.map((node) => (
          <IdeologyNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedId}
            isDimmed={dimmedIds.has(node.id)}
            isHovered={hoveredId === node.id}
          />
        ))}

        {/* Vector brillante desde el centro hasta tu resultado */}
        {userNode && (
          <Line
            points={[[0, 0, 0], [userNode.coords.x, userNode.coords.y, userNode.coords.z]]}
            color={userNode.color}
            lineWidth={3}
            transparent
            opacity={0.8}
          />
        )}
      </group>
    </>
  );
}
