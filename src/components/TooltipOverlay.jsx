/**
 * TooltipOverlay.jsx
 * Tooltip HTML que se posiciona sobre el canvas al hacer hover en un nodo.
 * Se muestra en coordenadas de pantalla proyectadas desde Three.js.
 */
import { labelX, labelY, labelZ } from '../data/ideologies';

export default function TooltipOverlay({ node, screenPos }) {
  if (!node || !screenPos) return null;

  const { name, coords, color, description } = node;

  return (
    <div
      className="tooltip-overlay"
      role="tooltip"
      style={{ left: screenPos.x, top: screenPos.y }}
    >
      <div className="tooltip-card">
        {/* Indicador de color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}`,
              flexShrink: 0,
            }}
          />
          <div className="tooltip-name">{name}</div>
        </div>

        {/* Descripción breve */}
        {description && (
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '12px',
              borderBottom: '1px solid var(--border-glass)',
              paddingBottom: '10px',
            }}
          >
            {description}
          </p>
        )}

        {/* Coordenadas */}
        <div className="tooltip-coords">
          <div className="tooltip-coord">
            <span className="tooltip-axis-badge badge-x">X</span>
            <span className="tooltip-coord-label">{labelX(coords.x)}</span>
            <span className="tooltip-coord-value">{coords.x.toFixed(2)}</span>
          </div>
          <div className="tooltip-coord">
            <span className="tooltip-axis-badge badge-y">Y</span>
            <span className="tooltip-coord-label">{labelY(coords.y)}</span>
            <span className="tooltip-coord-value">{coords.y.toFixed(2)}</span>
          </div>
          <div className="tooltip-coord">
            <span className="tooltip-axis-badge badge-z">Z</span>
            <span className="tooltip-coord-label">{labelZ(coords.z)}</span>
            <span className="tooltip-coord-value">{coords.z.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Flecha del tooltip */}
      <div className="tooltip-arrow" />
    </div>
  );
}
