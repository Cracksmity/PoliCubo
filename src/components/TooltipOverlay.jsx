/**
 * TooltipOverlay.jsx
 * Tooltip HTML que se posiciona sobre el canvas al hacer hover en un nodo.
 * Es un resumen: la información completa está en la ficha (clic en el nodo).
 * La escena lo reposiciona en cada frame a través de `tooltipElRef`.
 */
import { useStore } from '../store';
import { useSceneNodes } from '../lib/nodes';
import { tooltipElRef } from '../lib/refs';
import ShapeIcon from './shared/ShapeIcon';
import { AXES, AXIS_KEYS } from '../data/axes';
import { FAMILIES } from '../data/families';

const KIND_LABELS = {
  user: 'Tu resultado',
  compare: 'Comparación',
};

export default function TooltipOverlay() {
  const hoveredId = useStore((s) => s.hoveredId);
  const hoverPos = useStore((s) => s.hoverPos);
  const nodes = useSceneNodes();

  const node = hoveredId && nodes.find((n) => n.id === hoveredId);
  if (!node || !hoverPos) return null;

  const { name, coords, color } = node;
  const kicker = KIND_LABELS[node.kind] || FAMILIES[node.family]?.label;

  return (
    <div
      ref={(el) => (tooltipElRef.current = el)}
      className="tooltip-overlay"
      role="tooltip"
      style={{ left: hoverPos.x, top: hoverPos.y }}
    >
      <div className="tooltip-card">
        {/* Forma y color de la familia */}
        <div className="tooltip-head">
          <ShapeIcon shape={node.shape} color={color} size={14} className="tooltip-shape" />
          <div>
            {kicker && <div className="tooltip-kicker">{kicker}</div>}
            <div className="tooltip-name">{name}</div>
          </div>
        </div>

        {/* Coordenadas */}
        <div className="tooltip-coords">
          {AXIS_KEYS.map((k) => (
            <div className="tooltip-coord" key={k}>
              <span className={`tooltip-axis-badge badge-${k}`}>{k.toUpperCase()}</span>
              <span className="tooltip-coord-label">{AXES[k].label(coords[k])}</span>
              <span className="tooltip-coord-value">{coords[k].toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="tooltip-hint">Clic para ver la ficha</div>
      </div>

      {/* Flecha del tooltip */}
      <div className="tooltip-arrow" />
    </div>
  );
}
