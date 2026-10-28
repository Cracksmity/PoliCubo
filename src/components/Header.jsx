/**
 * Header.jsx
 * Logo, acceso directo al test (lo principal de la app) y ayuda.
 */
import { useState, useRef, useCallback } from 'react';
import { Brain, CircleHelp } from 'lucide-react';

import { useStore } from '../store';

export default function Header() {
  const openTest = useStore((s) => s.openTest);
  const openWelcome = useStore((s) => s.openWelcome);

  // ── Easter Egg del subtítulo ──────────────────────────────
  const [easterEggActive, setEasterEggActive] = useState(false);
  const easterEggTimeoutRef = useRef(null);

  const handleSubtitleClick = useCallback(() => {
    clearTimeout(easterEggTimeoutRef.current);
    if (easterEggActive) {
      setEasterEggActive(false);
    } else {
      setEasterEggActive(true);
      easterEggTimeoutRef.current = setTimeout(() => setEasterEggActive(false), 4000);
    }
  }, [easterEggActive]);

  return (
    <header className="app-header">
      <div className="app-logo">
        <img className="app-logo-icon" src="/cube-icon.svg" alt="" width="36" height="36" />
        <div>
          <h1 className="app-title">PoliCubo</h1>
          <div
            className="app-subtitle"
            onClick={handleSubtitleClick}
            title="Haz clic para revelar... o no"
          >
            {easterEggActive
              ? 'UNA MEZCOLANZA DE COSAS QUE NI YO ENTIENDO, PERO LARPEO QUE SÍ'
              : 'Espacio Ideológico Multidimensional'}
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button className="header-test-btn" onClick={openTest}>
          <Brain size={16} aria-hidden="true" /> Descubre tu posición
        </button>
        <button className="icon-btn" onClick={openWelcome} aria-label="Ayuda: qué es PoliCubo y cómo moverse" title="Ayuda">
          <CircleHelp size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
