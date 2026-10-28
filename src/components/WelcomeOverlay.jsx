/**
 * WelcomeOverlay.jsx
 * Bienvenida de la primera visita (y ayuda desde el botón ?):
 * qué es PoliCubo, qué mide cada eje y cómo moverse.
 */
import { useRef } from 'react';
import { Brain, Telescope, X } from 'lucide-react';

import { useStore } from '../store';
import { useDialog } from '../lib/useDialog';
import { AXES, AXIS_KEYS } from '../data/axes';

const hasHover = window.matchMedia('(hover: hover)').matches;

export default function WelcomeOverlay() {
  const closeWelcome = useStore((s) => s.closeWelcome);
  const openTest = useStore((s) => s.openTest);
  const ref = useRef(null);
  useDialog(ref, closeWelcome);

  return (
    <div className="welcome-overlay" onClick={(e) => e.target === e.currentTarget && closeWelcome()}>
      <div className="welcome-card" ref={ref} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <button className="icon-btn welcome-close" onClick={closeWelcome} aria-label="Cerrar">
          <X size={18} aria-hidden="true" />
        </button>

        <img src="/cube-icon.svg" alt="" width="52" height="52" />
        <h2 id="welcome-title">Bienvenido a PoliCubo</h2>
        <p className="welcome-lead">
          Un mapa en 3D de las ideas políticas. Cada punto es una corriente, colocada según tres ejes:
        </p>

        <ul className="welcome-axes">
          {AXIS_KEYS.map((k) => (
            <li key={k}>
              <span className="welcome-axis-dot" style={{ background: AXES[k].color }} />
              <strong>{AXES[k].name}</strong>
              <span>{AXES[k].min} ↔ {AXES[k].max}</span>
            </li>
          ))}
        </ul>

        <p className="welcome-controls">
          {hasHover
            ? 'Arrastra para rotar, usa la rueda para acercarte y haz clic en un punto para ver su ficha.'
            : 'Arrastra para rotar, pellizca para acercarte y toca un punto para ver su ficha.'}
        </p>

        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={openTest} data-autofocus>
            <Brain size={18} aria-hidden="true" /> Descubre tu posición
          </button>
          <button className="btn btn-secondary" onClick={closeWelcome}>
            <Telescope size={18} aria-hidden="true" /> Explorar el cubo
          </button>
        </div>

        <p className="welcome-version">PoliCubo v{__APP_VERSION__}</p>
      </div>
    </div>
  );
}
