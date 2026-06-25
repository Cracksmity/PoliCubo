/**
 * App.jsx
 * Componente raíz de PoliCubo.
 *
 * Gestiona:
 * - Estado global: búsqueda, filtro Z, nodos activos, tooltip
 * - Canvas de React Three Fiber (r3f)
 * - Overlay de UI: Header, FilterPanel, TooltipOverlay, Legend, Controls hint
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

import PoliticalCube   from './components/PoliticalCube';
import FilterPanel     from './components/FilterPanel';
import TooltipOverlay  from './components/TooltipOverlay';
import SceneController from './components/SceneController';
import ConversationalTestModal from './components/ConversationalTestModal';
import { IDEOLOGIES }  from './data/ideologies';

export default function App() {
  // ── Estado del filtro panel ────────────────────────────────
  const [panelOpen, setPanelOpen]   = useState(true);
  const [search, setSearch]         = useState('');
  const [zThreshold, setZThreshold] = useState(-1); // mostrar todos por defecto
  const [activeIds, setActiveIds]   = useState([]);

  // ── Estado del tooltip ────────────────────────────────────
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos]   = useState(null);

  // ── Estado del Easter Egg ─────────────────────────────────
  const [easterEggActive, setEasterEggActive] = useState(false);
  const easterEggTimeoutRef = useRef(null);

  // ── Estado del Usuario (Test Político) ────────────────────
  const [userNodeData, setUserNodeData] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const handleAddUserNode = (e) => {
      const data = e.detail;
      // Calcular las dos ideologías más cercanas para generar conexiones
      const distances = IDEOLOGIES.map(id => {
        const dist = Math.sqrt(
          Math.pow(id.coords.x - data.coordenadas.x, 2) +
          Math.pow(id.coords.y - data.coordenadas.y, 2) +
          Math.pow(id.coords.z - data.coordenadas.z, 2)
        );
        return { id: id.id, dist };
      });
      distances.sort((a, b) => a.dist - b.dist);
      // Tomamos las 2 más cercanas (asegurándonos de que haya al menos 2)
      const closestConnections = distances.slice(0, 2).map(d => d.id);

      setUserNodeData({
        id: 'user-node',
        name: data.nombre_ideologia,
        description: data.descripcion_personalizada,
        coords: data.coordenadas,
        color: data.color_hex || '#ffffff', // Color asignado por la IA o fallback
        connections: closestConnections
      });
    };
    window.addEventListener('addUserNode', handleAddUserNode);
    return () => window.removeEventListener('addUserNode', handleAddUserNode);
  }, []);

  const displayIdeologies = userNodeData ? [...IDEOLOGIES, userNodeData] : IDEOLOGIES;

  // ── Handlers ──────────────────────────────────────────────
  const handleSubtitleClick = useCallback(() => {
    if (easterEggActive) {
      setEasterEggActive(false);
      if (easterEggTimeoutRef.current) clearTimeout(easterEggTimeoutRef.current);
    } else {
      setEasterEggActive(true);
      easterEggTimeoutRef.current = setTimeout(() => {
        setEasterEggActive(false);
      }, 4000);
    }
  }, [easterEggActive]);

  const handleNodeHover = useCallback((ideology, screenPos) => {
    setHoveredNode(ideology);
    setTooltipPos(screenPos);
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipPos(null);
  }, []);

  const handleToggleNode = useCallback((id) => {
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">⬡</div>
          <div>
            <div className="app-title">PoliCubo</div>
            <div 
              className="app-subtitle"
              onClick={handleSubtitleClick}
              style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
              title="Haz clic para revelar... o no"
            >
              {easterEggActive 
                ? "UNA MEZCOLANZA DE COSAS QUE NI YO ENTIENDO, PERO LARPEO QUE SÍ"
                : "Espacio Ideológico Multidimensional"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Canvas 3D ── */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [2.8, 1.8, 2.8], fov: 50, near: 0.1, far: 50 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          shadows={false}
          style={{
            background: 'radial-gradient(ellipse at center, #0d1428 0%, #050810 70%)',
          }}
          onPointerMissed={(e) => {
            handleNodeLeave();
            // Detectar doble clic manual en el fondo (evita bug al clickear nodos)
            const now = Date.now();
            if (now - (window.lastCanvasClick || 0) < 300) {
              window.dispatchEvent(new Event('resetCamera'));
              window.lastCanvasClick = 0;
            } else {
              window.lastCanvasClick = now;
            }
          }}
        >
          <PerformanceMonitor>
            {/*
              SceneController: vive dentro del Canvas para acceder a camera/renderer
              y proyectar posiciones 3D a coordenadas de pantalla.
            */}
            <SceneController
              ideologies={displayIdeologies}
              activeIds={activeIds}
              zThreshold={zThreshold}
              onNodeHover={handleNodeHover}
              onNodeLeave={handleNodeLeave}
              hoveredId={hoveredNode?.id}
            />
          </PerformanceMonitor>
        </Canvas>
      </div>

      {/* ── Tooltip ── */}
      {hoveredNode && tooltipPos && (
        <TooltipOverlay node={hoveredNode} screenPos={tooltipPos} />
      )}

      {/* ── Panel de filtros ── */}
      <FilterPanel
        ideologies={displayIdeologies}
        search={search}
        onSearchChange={setSearch}
        zThreshold={zThreshold}
        onZThresholdChange={setZThreshold}
        activeIds={activeIds}
        onToggleNode={handleToggleNode}
        isOpen={panelOpen}
        onTogglePanelOpen={() => setPanelOpen((v) => !v)}
        onOpenTest={() => setIsTesting(true)}
      />

      {/* ── Leyenda de ejes ── */}
      <div className="legend-panel" aria-label="Leyenda de ejes">
        <div className="legend-item">
          <div className="legend-axis-bar" style={{ background: '#f43f5e' }} />
          <span className="legend-text">
            <strong>Eje X</strong> — Económico
          </span>
        </div>
        <div className="legend-item">
          <div className="legend-axis-bar" style={{ background: '#22d3ee' }} />
          <span className="legend-text">
            <strong>Eje Y</strong> — Social / Político
          </span>
        </div>
        <div className="legend-item">
          <div className="legend-axis-bar" style={{ background: '#a78bfa' }} />
          <span className="legend-text">
            <strong>Eje Z</strong> — Pluralidad / Inclusión
          </span>
        </div>

        {/* Botón de reset visible */}
        <button
          id="reset-camera-btn"
          className="reset-btn"
          onClick={() => {
            // Disparar evento personalizado que captura SceneController
            window.dispatchEvent(new CustomEvent('resetCamera'));
          }}
          title="Volver a la vista inicial"
        >
          ↺ Centrar vista
        </button>
      </div>

      {/* ── Sugerencias de controles ── */}
      <div className="controls-hint" aria-label="Controles de navegación">
        <div className="hint-item">
          <span className="hint-key">Arrastrar</span>
          <span>Rotar</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">Scroll</span>
          <span>Zoom</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">Clic der.</span>
          <span>Paneo</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">Hover</span>
          <span>Info del nodo</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">Doble clic</span>
          <span>Centrar vista</span>
        </div>
      </div>

      {/* ── Test Conversacional Modal ── */}
      <ConversationalTestModal isOpen={isTesting} onClose={() => setIsTesting(false)} />
    </div>
  );
}
