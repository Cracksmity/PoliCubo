/**
 * LegendBar.jsx
 * Barra inferior izquierda: leyenda de ejes, vistas predefinidas y centrar vista.
 * En móvil añade el botón del test (el panel empieza cerrado) y una pista táctil.
 * Las pistas de controles se desvanecen solas a los pocos segundos;
 * siempre se pueden volver a ver en la ayuda (?).
 */
import { Brain, RotateCcw } from 'lucide-react';

import { useStore } from '../store';
import { AXES, AXIS_KEYS } from '../data/axes';

const VIEWS = [
  { id: 'iso', label: '3D',  title: 'Vista 3D' },
  { id: 'xy',  label: 'X–Y', title: 'Frontal: Económico × Social (la brújula política clásica)' },
  { id: 'xz',  label: 'X–Z', title: 'Planta: Económico × Pluralidad' },
  { id: 'yz',  label: 'Y–Z', title: 'Lateral: Pluralidad × Social' },
];

export function ControlsHint() {
  return (
    <div className="controls-hint" aria-label="Controles de navegación">
      <div className="hint-item"><span className="hint-key">Arrastrar</span><span>Rotar</span></div>
      <div className="hint-item"><span className="hint-key">Scroll</span><span>Zoom</span></div>
      <div className="hint-item"><span className="hint-key">Clic der.</span><span>Paneo</span></div>
      <div className="hint-item"><span className="hint-key">Clic</span><span>Ficha del nodo</span></div>
      <div className="hint-item"><span className="hint-key">Doble clic</span><span>Centrar vista</span></div>
    </div>
  );
}

export default function LegendBar() {
  const openTest = useStore((s) => s.openTest);
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const resetCamera = useStore((s) => s.resetCamera);

  return (
    <div className="legend-panel" aria-label="Leyenda de ejes y vistas">
      {/* Solo móvil: con el panel cerrado, el test necesita su propio botón */}
      <button className="mobile-test-btn" onClick={openTest}>
        <Brain size={18} aria-hidden="true" /> Descubre tu posición: haz el test
      </button>

      {/* Solo pantallas táctiles: sustituye a las pistas de ratón */}
      <div className="touch-hint">Arrastra para rotar · Pellizca para zoom · Toca un nodo</div>

      {AXIS_KEYS.map((k) => (
        <div className="legend-item" key={k}>
          <div className="legend-axis-bar" style={{ background: AXES[k].color }} />
          <span className="legend-text">
            <strong><span className="legend-eje">Eje </span>{k.toUpperCase()}</strong> — {AXES[k].name}
          </span>
        </div>
      ))}

      <div className="legend-actions">
        <div className="view-switch" role="group" aria-label="Vista de la cámara">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`view-btn ${activeView === v.id ? 'active' : ''}`}
              onClick={() => setView(v.id)}
              title={v.title}
              aria-pressed={activeView === v.id}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          id="reset-camera-btn"
          className="reset-btn"
          onClick={resetCamera}
          title="Volver a la vista inicial"
          aria-label="Centrar vista"
        >
          <RotateCcw size={14} aria-hidden="true" /><span className="reset-btn-label"> Centrar</span>
        </button>
      </div>
    </div>
  );
}
