/**
 * SidePanel.jsx
 * Panel lateral (en móvil, hoja inferior) con dos vistas:
 * exploración (filtros y lista) o la ficha del nodo seleccionado.
 */
import { useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

import ExplorePanel from './ExplorePanel';
import NodeDetail from './NodeDetail';
import { useStore } from '../../store';

export default function SidePanel() {
  const panelOpen = useStore((s) => s.panelOpen);
  const togglePanel = useStore((s) => s.togglePanel);
  const selectedId = useStore((s) => s.selectedId);
  const asideRef = useRef(null);

  // Al cambiar de vista (lista ↔ ficha) volver arriba del panel
  useEffect(() => {
    if (asideRef.current) asideRef.current.scrollTop = 0;
  }, [selectedId]);

  return (
    <>
      <button
        id="panel-toggle-btn"
        className={`panel-toggle ${panelOpen ? 'open' : ''}`}
        onClick={togglePanel}
        title={panelOpen ? 'Cerrar panel' : 'Explorar ideologías'}
        aria-label={panelOpen ? 'Cerrar panel' : 'Abrir panel de exploración'}
        aria-expanded={panelOpen}
        aria-controls="side-panel"
      >
        {panelOpen ? <X size={18} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
      </button>

      <aside
        id="side-panel"
        ref={asideRef}
        className={`side-panel ${panelOpen ? '' : 'collapsed'}`}
        aria-label="Panel de exploración"
        aria-hidden={!panelOpen}
        inert={!panelOpen ? true : undefined}
      >
        {selectedId ? <NodeDetail id={selectedId} /> : <ExplorePanel />}
      </aside>
    </>
  );
}
