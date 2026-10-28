/**
 * AxisBars.jsx
 * Posición en los tres ejes como barras de -1 a 1 con un marcador.
 * `compact` muestra una versión mínima (para el progreso del test).
 */
import { AXES, AXIS_KEYS } from '../../data/axes';

export default function AxisBars({ coords, compact = false }) {
  return (
    <div className={`axis-bars ${compact ? 'compact' : ''}`}>
      {AXIS_KEYS.map((k) => {
        const axis = AXES[k];
        const v = coords[k];
        return (
          <div className="axis-bar" key={k}>
            <div className="axis-bar-head">
              <span className="axis-bar-name" style={{ color: axis.color }}>{axis.name}</span>
              <span className="axis-bar-value">
                {axis.label(v)} <strong>{v.toFixed(2)}</strong>
              </span>
            </div>
            <div
              className="axis-bar-track"
              role="meter"
              aria-label={axis.name}
              aria-valuemin={-1}
              aria-valuemax={1}
              aria-valuenow={v}
              aria-valuetext={`${axis.label(v)} (${v.toFixed(2)})`}
            >
              <span className="axis-bar-center" />
              <span
                className="axis-bar-marker"
                style={{ left: `${((v + 1) / 2) * 100}%`, background: axis.color, boxShadow: `0 0 8px ${axis.color}` }}
              />
            </div>
            {!compact && (
              <div className="axis-bar-ends">
                <span>{axis.min}</span>
                <span>{axis.max}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
