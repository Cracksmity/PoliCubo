/**
 * App.jsx
 * Componente raíz de PoliCubo.
 *
 * Monta la interfaz (header, panel, leyenda, tooltip, avisos) y carga en
 * diferido las partes pesadas: la escena 3D (Three.js) y el test.
 * El estado global vive en store.js.
 */
import { lazy, Suspense, useEffect, useState } from 'react';

import Header from './components/Header';
import SidePanel from './components/panel/SidePanel';
import TooltipOverlay from './components/TooltipOverlay';
import LegendBar, { ControlsHint } from './components/LegendBar';
import WelcomeOverlay from './components/WelcomeOverlay';
import Toast from './components/Toast';
import { useStore, MOBILE_QUERY } from './store';
import { parseSharedPoints, clearSharedParam } from './lib/share';

const Scene = lazy(() => import('./components/scene/Scene'));
const TestModal = lazy(() => import('./components/test/TestModal'));

export default function App() {
  const isTesting = useStore((s) => s.isTesting);
  const welcomeOpen = useStore((s) => s.welcomeOpen);

  // El test se descarga la primera vez que se abre y después se queda montado
  const [testLoaded, setTestLoaded] = useState(false);
  useEffect(() => {
    if (isTesting) setTestLoaded(true);
  }, [isTesting]);

  // Mantener isMobile al día al girar o redimensionar
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      const { setIsMobile, setPanelOpen } = useStore.getState();
      setIsMobile(e.matches);
      // Al pasar a móvil, la hoja empieza cerrada para que se vea el cubo
      if (e.matches) setPanelOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Resultados compartidos por enlace (?p=Nombre:x,y,z): se añaden a la comparación
  useEffect(() => {
    const points = parseSharedPoints();
    if (!points.length) return;
    clearSharedParam();
    const state = useStore.getState();
    state.addComparePoints(points);
    state.closeWelcome();
    const first = points[0];
    const match = useStore
      .getState()
      .compare.find((p) => p.name === first.name && p.coords.x === first.coords.x && p.coords.y === first.coords.y && p.coords.z === first.coords.z);
    if (match) state.select(match.id);
    state.showToast(
      points.length === 1
        ? `Añadido a la comparación: ${first.name}`
        : `Añadidos ${points.length} resultados a la comparación`
    );
  }, []);

  return (
    <div className="app-container">
      <Header />

      {/* ── Canvas 3D (chunk aparte) ── */}
      <div className="canvas-container">
        <Suspense fallback={<div className="scene-loading">Cargando el cubo…</div>}>
          <Scene />
        </Suspense>
      </div>

      <TooltipOverlay />
      <SidePanel />
      <LegendBar />
      <ControlsHint />

      {testLoaded && (
        <Suspense fallback={null}>
          <TestModal open={isTesting} />
        </Suspense>
      )}

      {welcomeOpen && <WelcomeOverlay />}
      <Toast />
    </div>
  );
}
